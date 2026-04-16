"""Timeline Builder router — extract dates from documents, manage events."""

import json
import os
import tempfile
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from ..agents.base import BaseAgent
from ..database import get_db
from ..services.parser import extract_text

router = APIRouter(prefix="/api/timeline", tags=["timeline"])


class EventCreate(BaseModel):
    date: str
    description: str
    source_document: str = ""
    significance: str = "medium"
    matter_id: str | None = None


class TimelineExtractAgent(BaseAgent):
    agent_id = "timeline_extractor"
    model = "claude-sonnet-4-20250514"
    timeout = 60
    max_tokens = 4096

    def build_system_prompt(self):
        return """You are a legal chronology specialist. Given document text, extract ALL dates and events
mentioned in the document and organize them chronologically.

Return ONLY valid JSON with this structure:
{
  "events": [
    {
      "date": "YYYY-MM-DD",
      "description": "What happened on this date",
      "significance": "high|medium|low",
      "source_quote": "Brief quote from document supporting this event"
    }
  ]
}

Rules:
- Extract EVERY date mentioned, including dates in headers, signature blocks, and schedules
- If only a month/year is given, use the 1st of the month (e.g., "March 2024" → "2024-03-01")
- If only a year is given, use January 1st
- Significance levels: high = key deadlines, breach dates, contract dates; medium = correspondence, meetings; low = general references
- Sort chronologically
- Include the source_quote so lawyers can verify"""

    def build_user_prompt(self, input_data: dict) -> str:
        return f"""Document: {input_data.get('filename', 'Unknown')}

Extract all dates and events from this document text:

{input_data['text'][:8000]}"""


@router.post("/extract")
async def extract_timeline(
    file: UploadFile = File(...),
    matter_id: str = Form(""),
):
    """Upload a document and extract timeline events via AI."""
    if not file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
        raise HTTPException(400, "Only PDF and Word documents supported")

    # Save temp file and extract text
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        from pathlib import Path
        raw_text = extract_text(Path(tmp_path))
    finally:
        os.unlink(tmp_path)

    if not raw_text or len(raw_text.strip()) < 50:
        raise HTTPException(400, "Could not extract text from document")

    # Run AI extraction
    agent = TimelineExtractAgent()
    result = await agent.execute(
        {"text": raw_text, "filename": file.filename},
        document_id=f"timeline-{uuid.uuid4()}",
    )

    events = result.data.get("events", [])

    # Store events in DB
    db = await get_db()
    stored_events = []
    for evt in events:
        event_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        await db.execute(
            """INSERT INTO timeline_events (id, matter_id, date, description, source_document, significance, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                event_id,
                matter_id or None,
                evt.get("date", ""),
                evt.get("description", ""),
                file.filename,
                evt.get("significance", "medium"),
                now,
            ),
        )
        stored_events.append({
            "id": event_id,
            "date": evt.get("date", ""),
            "description": evt.get("description", ""),
            "source_document": file.filename,
            "significance": evt.get("significance", "medium"),
            "source_quote": evt.get("source_quote", ""),
        })

    await db.commit()
    await db.close()

    return {
        "filename": file.filename,
        "events_extracted": len(stored_events),
        "events": stored_events,
    }


@router.get("/events")
async def list_events(matter_id: str = ""):
    """List all timeline events, optionally filtered by matter."""
    db = await get_db()
    if matter_id:
        rows = await db.execute_fetchall(
            "SELECT * FROM timeline_events WHERE matter_id = ? ORDER BY date",
            (matter_id,),
        )
    else:
        rows = await db.execute_fetchall(
            "SELECT * FROM timeline_events ORDER BY date"
        )
    await db.close()
    return {"events": [dict(r) for r in rows]}


@router.post("/events")
async def add_event(body: EventCreate):
    """Manually add a timeline event."""
    event_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    db = await get_db()
    await db.execute(
        """INSERT INTO timeline_events (id, matter_id, date, description, source_document, significance, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (event_id, body.matter_id, body.date, body.description,
         body.source_document, body.significance, now),
    )
    await db.commit()
    await db.close()
    return {"id": event_id, "date": body.date, "description": body.description}


@router.delete("/events/{event_id}")
async def delete_event(event_id: str):
    db = await get_db()
    await db.execute("DELETE FROM timeline_events WHERE id = ?", (event_id,))
    await db.commit()
    await db.close()
    return {"status": "ok"}
