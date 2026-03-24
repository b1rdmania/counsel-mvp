"""Pipeline orchestrator — sequential agent chain with status updates."""

import json
import uuid
from datetime import datetime, timezone

from ..database import get_db
from ..agents.parser import ParserAgent
from ..agents.analyst import AnalystAgent
from ..agents.redliner import RedlinerAgent
from ..agents.summariser import SummariserAgent


async def _update_status(doc_id: str, status: str):
    db = await get_db()
    await db.execute(
        "UPDATE documents SET status = ?, updated_at = ? WHERE id = ?",
        (status, datetime.now(timezone.utc).isoformat(), doc_id),
    )
    await db.commit()
    await db.close()


async def run_pipeline(document_id: str):
    """Run the full 4-agent pipeline on a document."""

    # Fetch document
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT raw_text, analysis_type, posture FROM documents WHERE id = ?",
        (document_id,),
    )
    if not rows:
        await db.close()
        return
    doc = dict(rows[0])
    await db.close()

    raw_text = doc["raw_text"]
    posture = doc["posture"]
    analysis_type = doc["analysis_type"]

    try:
        # --- Agent 1: Parse ---
        await _update_status(document_id, "parsing")
        parser = ParserAgent()
        print(f"[PIPELINE] Starting parser for {document_id}")
        parse_result = await parser.execute({"raw_text": raw_text}, document_id)
        parsed = parse_result.data
        print(f"[PIPELINE] Parser returned {len(parsed.get('clauses', []))} clauses")

        # Store clauses
        db = await get_db()
        clauses = parsed.get("clauses", [])
        for clause in clauses:
            clause_id = clause.get("id", str(uuid.uuid4()))
            clause["id"] = clause_id  # ensure ID is set for downstream
            await db.execute(
                """INSERT INTO clauses (id, document_id, section, title, type, text, metadata_json)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    clause_id,
                    document_id,
                    clause.get("section", ""),
                    clause.get("title", ""),
                    clause.get("type", "unknown"),
                    clause.get("text", ""),
                    json.dumps({
                        "defined_terms_used": clause.get("defined_terms_used", []),
                        "cross_references": clause.get("cross_references", []),
                    }),
                ),
            )
        await db.commit()
        await db.close()
        print(f"[PIPELINE] Stored {len(clauses)} clauses, moving to analysis")

        # --- Agent 2: Analyse ---
        await _update_status(document_id, "analysing")
        analyst = AnalystAgent()
        analysis_result = await analyst.execute(
            {
                "clauses": clauses,
                "posture": posture,
                "document_type": analysis_type,
            },
            document_id,
        )
        analysis = analysis_result.data

        # Store analyses
        db = await get_db()
        clause_analyses = analysis.get("clause_analyses", [])
        for ca in clause_analyses:
            await db.execute(
                """INSERT INTO analyses (id, clause_id, risk_score, confidence, rationale, benchmark, position, flags_json)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    str(uuid.uuid4()),
                    ca["clause_id"],
                    ca.get("risk_score", 1),
                    ca.get("confidence", "medium"),
                    ca.get("rationale", ""),
                    ca.get("benchmark", ""),
                    ca.get("position", "neutral"),
                    json.dumps(ca.get("flags", [])),
                ),
            )
        await db.commit()
        await db.close()

        # --- Agent 3: Redline ---
        await _update_status(document_id, "redlining")

        # Build flagged clauses input (risk_score >= 3)
        flagged = []
        analysis_map = {ca["clause_id"]: ca for ca in clause_analyses}
        for clause in clauses:
            ca = analysis_map.get(clause["id"])
            if ca and ca.get("risk_score", 1) >= 3:
                flagged.append({
                    "clause_id": clause["id"],
                    "section": clause.get("section", ""),
                    "text": clause.get("text", ""),
                    "risk_score": ca["risk_score"],
                    "rationale": ca.get("rationale", ""),
                    "position": ca.get("position", "neutral"),
                })

        redlines_data = []
        if flagged:
            redliner = RedlinerAgent()
            redline_result = await redliner.execute(
                {"flagged_clauses": flagged, "posture": posture},
                document_id,
            )
            redlines_data = redline_result.data.get("redlines", [])

            # Store redlines
            db = await get_db()
            for rl in redlines_data:
                await db.execute(
                    """INSERT INTO redlines (id, clause_id, original_text, suggested_text, explanation, priority, risk_score)
                       VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (
                        str(uuid.uuid4()),
                        rl["clause_id"],
                        rl.get("original_text", ""),
                        rl.get("suggested_text", ""),
                        rl.get("explanation", ""),
                        rl.get("priority", "suggested"),
                        rl.get("risk_score", 3),
                    ),
                )
            await db.commit()
            await db.close()

        # --- Agent 4: Summarise ---
        await _update_status(document_id, "summarising")
        summariser = SummariserAgent()
        summary_result = await summariser.execute(
            {
                "title": parsed.get("title", "Unknown"),
                "parties": parsed.get("parties", []),
                "document_type": parsed.get("document_type", analysis_type),
                "analyses": clause_analyses,
                "redlines": redlines_data,
            },
            document_id,
        )
        summary = summary_result.data

        # Store summary
        db = await get_db()
        await db.execute(
            """INSERT INTO summaries (id, document_id, executive_summary, key_terms_json, risk_overview_json)
               VALUES (?, ?, ?, ?, ?)""",
            (
                str(uuid.uuid4()),
                document_id,
                summary.get("executive_summary", ""),
                json.dumps(summary.get("key_terms", [])),
                json.dumps(summary.get("risk_overview", {})),
            ),
        )
        await db.commit()
        await db.close()

        # Done
        await _update_status(document_id, "review_pending")

    except Exception as e:
        import traceback
        print(f"[PIPELINE] ERROR: {e}")
        traceback.print_exc()
        # Mark as failed but keep any partial results
        await _update_status(document_id, "failed")
        # Log the failure
        db = await get_db()
        await db.execute(
            """INSERT INTO audit_log (id, document_id, agent_id, action, status, error_msg, timestamp)
               VALUES (?, ?, 'pipeline', 'pipeline_failure', 'failed', ?, ?)""",
            (str(uuid.uuid4()), document_id, str(e), datetime.now(timezone.utc).isoformat()),
        )
        await db.commit()
        await db.close()
