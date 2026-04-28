"""Document upload and retrieval endpoints."""

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ..config import MAX_UPLOAD_BYTES, UPLOAD_DIR
from ..database import db_connection
from ..models.schemas import (
    AnalysisOut,
    AuditEntry,
    ClauseOut,
    DocumentDetail,
    DocumentOut,
    RedlineOut,
    ReviewRequest,
    SummaryOut,
)
from ..services.parser import extract_text

router = APIRouter(prefix="/api/documents", tags=["documents"])
logger = logging.getLogger(__name__)

CHUNK_SIZE = 1 * 1024 * 1024  # 1 MB


async def _read_capped(upload: UploadFile, max_bytes: int) -> bytes:
    """Read upload to memory but reject anything past max_bytes."""
    buf = bytearray()
    while True:
        chunk = await upload.read(CHUNK_SIZE)
        if not chunk:
            break
        buf.extend(chunk)
        if len(buf) > max_bytes:
            raise HTTPException(
                413,
                f"File too large. Maximum upload size is {max_bytes // (1024 * 1024)} MB.",
            )
    return bytes(buf)


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

    content = await _read_capped(file, MAX_UPLOAD_BYTES)
    file_path = UPLOAD_DIR / f"{doc_id}{suffix}"
    file_path.write_bytes(content)

    try:
        raw_text = extract_text(file_path)
    except Exception as e:
        file_path.unlink(missing_ok=True)
        raise HTTPException(422, f"Failed to extract text: {e}")

    async with db_connection() as db:
        await db.execute(
            """INSERT INTO documents (id, filename, file_path, status, analysis_type, posture, raw_text, created_at, updated_at)
               VALUES (?, ?, ?, 'queued', ?, ?, ?, ?, ?)""",
            (doc_id, file.filename, str(file_path), analysis_type, posture, raw_text, now, now),
        )
        await db.commit()

    # Kick off pipeline in background.
    from ..services.pipeline import run_pipeline

    task = asyncio.create_task(run_pipeline(doc_id))
    # Re-raise unhandled exceptions in the task into the logger.
    task.add_done_callback(
        lambda t: t.exception() and logger.error("Pipeline task crashed", exc_info=t.exception())
    )

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
    async with db_connection() as db:
        row = await db.execute_fetchall("SELECT * FROM documents WHERE id = ?", (doc_id,))
        if not row:
            raise HTTPException(404, "Document not found")
        doc = dict(row[0])

        clause_rows = await db.execute_fetchall(
            "SELECT * FROM clauses WHERE document_id = ? ORDER BY section", (doc_id,)
        )
        clauses = []
        for c in clause_rows:
            c = dict(c)
            meta = json.loads(c.get("metadata_json") or "{}")
            clauses.append(ClauseOut(
                id=c["id"],
                section=c["section"],
                title=c["title"],
                type=c["type"],
                text=c["text"],
                defined_terms_used=meta.get("defined_terms_used", []),
                cross_references=meta.get("cross_references", []),
            ))

        analysis_rows = await db.execute_fetchall(
            """SELECT a.*, c.section, c.title, c.text
               FROM analyses a JOIN clauses c ON a.clause_id = c.id
               WHERE c.document_id = ? ORDER BY a.risk_score DESC""",
            (doc_id,),
        )
        analyses = [
            AnalysisOut(
                clause_id=a["clause_id"],
                section=a["section"],
                title=a["title"],
                text=a["text"],
                risk_score=a["risk_score"],
                confidence=a["confidence"],
                rationale=a["rationale"],
                benchmark=a["benchmark"],
                position=a["position"],
                flags=json.loads(a["flags_json"] or "[]"),
            )
            for a in (dict(r) for r in analysis_rows)
        ]

        redline_rows = await db.execute_fetchall(
            """SELECT r.*, c.section,
               (SELECT rv.decision FROM reviews rv WHERE rv.redline_id = r.id ORDER BY rv.timestamp DESC LIMIT 1) as review_decision
               FROM redlines r JOIN clauses c ON r.clause_id = c.id
               WHERE c.document_id = ? ORDER BY r.risk_score DESC""",
            (doc_id,),
        )
        redlines = [
            RedlineOut(
                id=r["id"],
                clause_id=r["clause_id"],
                section=r["section"],
                original_text=r["original_text"],
                suggested_text=r["suggested_text"],
                explanation=r["explanation"],
                priority=r["priority"],
                risk_score=r["risk_score"],
                review_decision=r.get("review_decision"),
            )
            for r in (dict(r) for r in redline_rows)
        ]

        summary_row = await db.execute_fetchall(
            "SELECT * FROM summaries WHERE document_id = ?", (doc_id,)
        )
        summary = None
        if summary_row:
            s = dict(summary_row[0])
            summary = SummaryOut(
                executive_summary=s["executive_summary"],
                key_terms=json.loads(s["key_terms_json"] or "[]"),
                risk_overview=json.loads(s["risk_overview_json"] or "{}"),
            )

        audit_rows = await db.execute_fetchall(
            "SELECT * FROM audit_log WHERE document_id = ? ORDER BY timestamp", (doc_id,)
        )
        audit_log = [
            AuditEntry(
                id=a["id"],
                agent_id=a["agent_id"],
                action=a["action"],
                model=a["model"] or "",
                tokens_in=a["tokens_in"] or 0,
                tokens_out=a["tokens_out"] or 0,
                duration_ms=a["duration_ms"] or 0,
                status=a["status"],
                timestamp=a["timestamp"],
            )
            for a in (dict(r) for r in audit_rows)
        ]

    high = sum(1 for a in analyses if a.risk_score >= 4)
    medium = sum(1 for a in analyses if a.risk_score == 3)
    low = sum(1 for a in analyses if a.risk_score <= 2)

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
    async with db_connection() as db:
        rows = await db.execute_fetchall(
            """SELECT r.id FROM redlines r JOIN clauses c ON r.clause_id = c.id
               WHERE r.id = ? AND c.document_id = ?""",
            (redline_id, doc_id),
        )
        if not rows:
            raise HTTPException(404, "Redline not found")

        review_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        await db.execute(
            """INSERT INTO reviews (id, redline_id, decision, modified_text, reviewer, timestamp)
               VALUES (?, ?, ?, ?, 'lawyer', ?)""",
            (review_id, redline_id, body.decision.value, body.modified_text, now),
        )
        await db.execute(
            """INSERT INTO audit_log (id, document_id, agent_id, action, status, timestamp)
               VALUES (?, ?, 'human', ?, 'success', ?)""",
            (str(uuid.uuid4()), doc_id, f"review_{body.decision.value}_{redline_id}", now),
        )
        await db.commit()

    return {"status": "ok", "review_id": review_id}
