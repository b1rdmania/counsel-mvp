"""Pipeline orchestrator — sequential agent chain with status updates."""

import json
import logging
import uuid
from datetime import datetime, timezone

from ..agents.analyst import AnalystAgent
from ..agents.parser import ParserAgent
from ..agents.redliner import RedlinerAgent
from ..agents.summariser import SummariserAgent
from ..database import db_connection


logger = logging.getLogger(__name__)


# Statuses that indicate the pipeline was running when the process died.
# On startup we mark these as failed so the UI doesn't show a forever-spinner.
NON_TERMINAL_STATUSES = ("queued", "parsing", "analysing", "redlining", "summarising")


async def _update_status(doc_id: str, status: str):
    async with db_connection() as db:
        await db.execute(
            "UPDATE documents SET status = ?, updated_at = ? WHERE id = ?",
            (status, datetime.now(timezone.utc).isoformat(), doc_id),
        )
        await db.commit()


async def sweep_stuck_documents():
    """On startup, mark any non-terminal pipeline runs as failed.

    Pipelines run as background asyncio tasks; if the dyno restarts mid-run
    they leave documents stuck in 'parsing'/'analysing'/etc. forever. This
    sweep flips them to 'failed' with a descriptive audit-log entry so the
    user sees a real error state instead of a forever-spinner.
    """
    placeholders = ",".join("?" for _ in NON_TERMINAL_STATUSES)
    now = datetime.now(timezone.utc).isoformat()
    async with db_connection() as db:
        rows = await db.execute_fetchall(
            f"SELECT id, status FROM documents WHERE status IN ({placeholders})",
            NON_TERMINAL_STATUSES,
        )
        if not rows:
            return
        stuck = [dict(r) for r in rows]
        for r in stuck:
            await db.execute(
                "UPDATE documents SET status = 'failed', updated_at = ? WHERE id = ?",
                (now, r["id"]),
            )
            await db.execute(
                """INSERT INTO audit_log
                   (id, document_id, agent_id, action, status, error_msg, timestamp)
                   VALUES (?, ?, 'pipeline', 'stuck_doc_sweep', 'failed', ?, ?)""",
                (
                    str(uuid.uuid4()),
                    r["id"],
                    f"Process restarted while document was in status '{r['status']}'.",
                    now,
                ),
            )
        await db.commit()
    logger.info("Marked %d stuck document(s) as failed on startup", len(stuck))


async def run_pipeline(document_id: str):
    """Run the full 4-agent pipeline on a document."""

    async with db_connection() as db:
        rows = await db.execute_fetchall(
            "SELECT raw_text, analysis_type, posture FROM documents WHERE id = ?",
            (document_id,),
        )
    if not rows:
        return

    doc = dict(rows[0])
    raw_text = doc["raw_text"]
    posture = doc["posture"]
    analysis_type = doc["analysis_type"]

    try:
        # --- Agent 1: Parse ---
        await _update_status(document_id, "parsing")
        parser = ParserAgent()
        logger.info("Pipeline %s: starting parser", document_id)
        parse_result = await parser.execute({"raw_text": raw_text}, document_id)
        parsed = parse_result.data
        clauses = parsed.get("clauses", [])
        logger.info("Pipeline %s: parser returned %d clauses", document_id, len(clauses))

        async with db_connection() as db:
            for clause in clauses:
                clause_id = clause.get("id") or str(uuid.uuid4())
                clause["id"] = clause_id
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
        clause_analyses = analysis_result.data.get("clause_analyses", [])

        async with db_connection() as db:
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

        # --- Agent 3: Redline ---
        await _update_status(document_id, "redlining")
        analysis_map = {ca["clause_id"]: ca for ca in clause_analyses}
        flagged = [
            {
                "clause_id": clause["id"],
                "section": clause.get("section", ""),
                "text": clause.get("text", ""),
                "risk_score": analysis_map[clause["id"]]["risk_score"],
                "rationale": analysis_map[clause["id"]].get("rationale", ""),
                "position": analysis_map[clause["id"]].get("position", "neutral"),
            }
            for clause in clauses
            if clause["id"] in analysis_map
            and analysis_map[clause["id"]].get("risk_score", 1) >= 3
        ]

        redlines_data = []
        if flagged:
            redliner = RedlinerAgent()
            redline_result = await redliner.execute(
                {"flagged_clauses": flagged, "posture": posture},
                document_id,
            )
            redlines_data = redline_result.data.get("redlines", [])

            async with db_connection() as db:
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

        async with db_connection() as db:
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

        await _update_status(document_id, "review_pending")
        logger.info("Pipeline %s: completed", document_id)

    except Exception as e:
        logger.exception("Pipeline %s failed", document_id)
        await _update_status(document_id, "failed")
        async with db_connection() as db:
            await db.execute(
                """INSERT INTO audit_log (id, document_id, agent_id, action, status, error_msg, timestamp)
                   VALUES (?, ?, 'pipeline', 'pipeline_failure', 'failed', ?, ?)""",
                (str(uuid.uuid4()), document_id, str(e), datetime.now(timezone.utc).isoformat()),
            )
            await db.commit()
