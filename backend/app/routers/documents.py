"""Document upload and retrieval endpoints."""

import asyncio
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from ..config import UPLOAD_DIR
from ..database import get_db
from ..models.schemas import (
    AnalysisType,
    ReviewPosture,
    DocumentOut,
    DocumentDetail,
    ClauseOut,
    AnalysisOut,
    RedlineOut,
    SummaryOut,
    AuditEntry,
    ReviewRequest,
)
from ..services.parser import extract_text

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("", response_model=DocumentOut)
async def upload_document(
    file: UploadFile = File(...),
    analysis_type: str = Form("general"),
    posture: str = Form("balanced"),
):
    if not file.filename:
        raise HTTPException(400, "No filename provided")

    suffix = Path(file.filename).suffix.lower()
    if suffix not in (".pdf", ".docx", ".doc"):
        raise HTTPException(400, f"Unsupported file type: {suffix}. Use PDF or DOCX.")

    doc_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    # Save file
    file_path = UPLOAD_DIR / f"{doc_id}{suffix}"
    content = await file.read()
    file_path.write_bytes(content)

    # Extract text
    try:
        raw_text = extract_text(file_path)
    except Exception as e:
        file_path.unlink(missing_ok=True)
        raise HTTPException(422, f"Failed to extract text: {e}")

    # Store in DB
    db = await get_db()
    await db.execute(
        """INSERT INTO documents (id, filename, file_path, status, analysis_type, posture, raw_text, created_at, updated_at)
           VALUES (?, ?, ?, 'queued', ?, ?, ?, ?, ?)""",
        (doc_id, file.filename, str(file_path), analysis_type, posture, raw_text, now, now),
    )
    await db.commit()
    await db.close()

    # Kick off pipeline in background
    from ..services.pipeline import run_pipeline
    asyncio.create_task(run_pipeline(doc_id))

    return DocumentOut(
        id=doc_id,
        filename=file.filename,
        status="queued",
        analysis_type=analysis_type,
        posture=posture,
        created_at=now,
    )


@router.get("/{doc_id}", response_model=DocumentDetail)
async def get_document(doc_id: str):
    db = await get_db()

    row = await db.execute_fetchall(
        "SELECT * FROM documents WHERE id = ?", (doc_id,)
    )
    if not row:
        await db.close()
        raise HTTPException(404, "Document not found")

    doc = dict(row[0])

    # Clauses
    clause_rows = await db.execute_fetchall(
        "SELECT * FROM clauses WHERE document_id = ? ORDER BY section", (doc_id,)
    )
    clauses = []
    for c in clause_rows:
        c = dict(c)
        meta = json.loads(c.get("metadata_json", "{}"))
        clauses.append(ClauseOut(
            id=c["id"],
            section=c["section"],
            title=c["title"],
            type=c["type"],
            text=c["text"],
            defined_terms_used=meta.get("defined_terms_used", []),
            cross_references=meta.get("cross_references", []),
        ))

    # Analyses
    analysis_rows = await db.execute_fetchall(
        """SELECT a.*, c.section, c.title, c.text
           FROM analyses a JOIN clauses c ON a.clause_id = c.id
           WHERE c.document_id = ? ORDER BY a.risk_score DESC""",
        (doc_id,),
    )
    analyses = []
    for a in analysis_rows:
        a = dict(a)
        analyses.append(AnalysisOut(
            clause_id=a["clause_id"],
            section=a["section"],
            title=a["title"],
            text=a["text"],
            risk_score=a["risk_score"],
            confidence=a["confidence"],
            rationale=a["rationale"],
            benchmark=a["benchmark"],
            position=a["position"],
            flags=json.loads(a.get("flags_json", "[]")),
        ))

    # Redlines
    redline_rows = await db.execute_fetchall(
        """SELECT r.*, c.section,
           (SELECT rv.decision FROM reviews rv WHERE rv.redline_id = r.id ORDER BY rv.timestamp DESC LIMIT 1) as review_decision
           FROM redlines r JOIN clauses c ON r.clause_id = c.id
           WHERE c.document_id = ? ORDER BY r.risk_score DESC""",
        (doc_id,),
    )
    redlines = []
    for r in redline_rows:
        r = dict(r)
        redlines.append(RedlineOut(
            id=r["id"],
            clause_id=r["clause_id"],
            section=r["section"],
            original_text=r["original_text"],
            suggested_text=r["suggested_text"],
            explanation=r["explanation"],
            priority=r["priority"],
            risk_score=r["risk_score"],
            review_decision=r.get("review_decision"),
        ))

    # Summary
    summary_row = await db.execute_fetchall(
        "SELECT * FROM summaries WHERE document_id = ?", (doc_id,)
    )
    summary = None
    if summary_row:
        s = dict(summary_row[0])
        summary = SummaryOut(
            executive_summary=s["executive_summary"],
            key_terms=json.loads(s.get("key_terms_json", "[]")),
            risk_overview=json.loads(s.get("risk_overview_json", "{}")),
        )

    # Audit log
    audit_rows = await db.execute_fetchall(
        "SELECT * FROM audit_log WHERE document_id = ? ORDER BY timestamp", (doc_id,)
    )
    audit_log = [
        AuditEntry(
            id=dict(a)["id"],
            agent_id=dict(a)["agent_id"],
            action=dict(a)["action"],
            model=dict(a).get("model", ""),
            tokens_in=dict(a).get("tokens_in", 0),
            tokens_out=dict(a).get("tokens_out", 0),
            duration_ms=dict(a).get("duration_ms", 0),
            status=dict(a)["status"],
            timestamp=dict(a)["timestamp"],
        )
        for a in audit_rows
    ]

    # Risk counts
    high = sum(1 for a in analyses if a.risk_score >= 4)
    medium = sum(1 for a in analyses if a.risk_score == 3)
    low = sum(1 for a in analyses if a.risk_score <= 2)

    await db.close()

    return DocumentDetail(
        id=doc["id"],
        filename=doc["filename"],
        status=doc["status"],
        analysis_type=doc["analysis_type"],
        posture=doc["posture"],
        created_at=doc["created_at"],
        total_clauses=len(clauses),
        high_risk=high,
        medium_risk=medium,
        low_risk=low,
        clauses=clauses,
        analyses=analyses,
        redlines=redlines,
        summary=summary,
        audit_log=audit_log,
    )


@router.post("/{doc_id}/reviews/{redline_id}")
async def submit_review(doc_id: str, redline_id: str, body: ReviewRequest):
    db = await get_db()

    # Verify redline exists and belongs to this document
    rows = await db.execute_fetchall(
        """SELECT r.id FROM redlines r JOIN clauses c ON r.clause_id = c.id
           WHERE r.id = ? AND c.document_id = ?""",
        (redline_id, doc_id),
    )
    if not rows:
        await db.close()
        raise HTTPException(404, "Redline not found")

    review_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    await db.execute(
        """INSERT INTO reviews (id, redline_id, decision, modified_text, reviewer, timestamp)
           VALUES (?, ?, ?, ?, 'lawyer', ?)""",
        (review_id, redline_id, body.decision.value, body.modified_text, now),
    )

    # Audit log
    await db.execute(
        """INSERT INTO audit_log (id, document_id, agent_id, action, status, timestamp)
           VALUES (?, ?, 'human', ?, 'success', ?)""",
        (str(uuid.uuid4()), doc_id, f"review_{body.decision.value}_{redline_id}", now),
    )

    await db.commit()
    await db.close()

    return {"status": "ok", "review_id": review_id}
