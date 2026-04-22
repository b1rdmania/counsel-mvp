"""Litigation Advisor router — matter management, strategy analysis, game theory, AI chat."""

import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..agents.base import BaseAgent
from ..database import get_db

router = APIRouter(prefix="/api/advisor", tags=["advisor"])


# --- Pydantic models ---

class MatterCreate(BaseModel):
    title: str
    summary: str = ""
    parties: list[str] = []
    issues: list[str] = []

class MatterUpdate(BaseModel):
    title: str | None = None
    summary: str | None = None
    parties: list[str] | None = None
    issues: list[str] | None = None
    strengths: list[str] | None = None
    weaknesses: list[str] | None = None
    opportunities: list[str] | None = None

class AnalyzeRequest(BaseModel):
    matter_id: str
    force: bool = False  # set true to re-run analysis even if cached result exists

class ChatMessage(BaseModel):
    matter_id: str
    message: str


class MatterAssistantRequest(BaseModel):
    matter_id: str
    message: str
    tab_context: str = ""


class SavedCase(BaseModel):
    case_id: str
    case_name: str = ""
    citation: str = ""
    court: str = ""
    date: str = ""
    url: str = ""
    notes: str = ""


# --- AI Agents ---

class StrategyAnalyst(BaseAgent):
    agent_id = "strategy_analyst"
    model = "claude-sonnet-4-20250514"
    timeout = 90
    max_tokens = 4096

    def build_system_prompt(self):
        return """You are a litigation strategy analyst with expertise in English civil and commercial law.
Given a case summary, parties, issues, and initial SWO assessment, produce a comprehensive strategic analysis.

Return ONLY valid JSON with these fields:
{
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "opportunities": ["...", "..."],
  "nash_equilibrium": {
    "description": "Analysis of the strategic equilibrium between parties",
    "plaintiff_optimal_strategy": "...",
    "defendant_optimal_strategy": "...",
    "likely_equilibrium_outcome": "...",
    "settlement_range": {
      "low": "Description of low-end settlement",
      "high": "Description of high-end settlement",
      "most_likely": "Most likely settlement point and reasoning"
    }
  },
  "risk_assessment": {
    "litigation_risk": "low|medium|high",
    "cost_benefit": "Analysis of costs vs potential recovery",
    "time_estimate": "Estimated timeline to resolution"
  },
  "recommended_strategy": "2-3 paragraphs of strategic advice",
  "key_cases_to_research": ["Case or legal principle to look into", "..."]
}"""

    def build_user_prompt(self, input_data: dict) -> str:
        return f"""Matter: {input_data['title']}

Summary: {input_data['summary']}

Parties: {', '.join(input_data.get('parties', []))}

Key Issues:
{chr(10).join(f'- {i}' for i in input_data.get('issues', []))}

Current Strengths: {', '.join(input_data.get('strengths', [])) or 'Not yet assessed'}
Current Weaknesses: {', '.join(input_data.get('weaknesses', [])) or 'Not yet assessed'}
Current Opportunities: {', '.join(input_data.get('opportunities', [])) or 'Not yet assessed'}

Provide a full strategic analysis including game theory / Nash equilibrium assessment for settlement negotiations."""


class LitigationChatAgent(BaseAgent):
    agent_id = "litigation_chat"
    model = "claude-sonnet-4-20250514"
    timeout = 30
    max_tokens = 2048

    def build_system_prompt(self):
        return """You are a senior litigation advisor at an English law firm. You provide strategic, practical advice on litigation matters.
You reference relevant English case law and procedure (CPR) where appropriate.
Be concise but thorough. If you cite a case, include the neutral citation where possible.
Always consider both sides of the argument and flag risks."""

    def build_user_prompt(self, input_data: dict) -> str:
        context = f"Matter: {input_data['title']}\nSummary: {input_data['summary']}\n"
        if input_data.get('issues'):
            context += f"Key Issues: {', '.join(input_data['issues'])}\n"

        history = ""
        for msg in input_data.get('history', [])[-10:]:  # last 10 messages
            role = "User" if msg['role'] == 'user' else "Advisor"
            history += f"{role}: {msg['content']}\n"

        return f"""{context}
Conversation history:
{history}

User question: {input_data['message']}

Provide a helpful, practical response."""

    def parse_response(self, text: str) -> dict:
        return {"response": text.strip()}


class MatterAssistantAgent(BaseAgent):
    agent_id = "matter_assistant"
    model = "claude-sonnet-4-20250514"
    timeout = 45
    max_tokens = 2048

    def build_system_prompt(self):
        return (
            "You are the matter assistant for this legal case. You have complete context about "
            "the parties, issues, strategy, chronology, saved case law, and correspondence. "
            "Be concise, practical, and cite specific facts from the matter when relevant. "
            "If asked to draft something, do it inline. If asked for strategy, ground it in "
            "the saved cases and chronology."
        )

    def build_user_prompt(self, input_data: dict) -> str:
        analysis = input_data.get("analysis") or {}
        analysis_summary = ""
        if analysis:
            if isinstance(analysis, dict):
                rec = analysis.get("recommended_strategy", "")
                nash = analysis.get("nash_equilibrium", {})
                if rec:
                    analysis_summary += f"Recommended strategy: {rec}\n"
                if isinstance(nash, dict) and nash.get("description"):
                    analysis_summary += f"Nash equilibrium: {nash.get('description')}\n"

        strengths = input_data.get("strengths") or []
        weaknesses = input_data.get("weaknesses") or []
        opportunities = input_data.get("opportunities") or []
        swo = ""
        if strengths:
            swo += "Strengths: " + "; ".join(strengths) + "\n"
        if weaknesses:
            swo += "Weaknesses: " + "; ".join(weaknesses) + "\n"
        if opportunities:
            swo += "Opportunities: " + "; ".join(opportunities) + "\n"

        events = input_data.get("events") or []
        event_lines = "\n".join(
            f"  - {e.get('date', '')} — {e.get('description', '')}" for e in events[:30]
        ) or "  (none)"

        cases = input_data.get("cases") or []
        case_lines = "\n".join(
            f"  - {c.get('citation') or c.get('case_id', '')} — {c.get('case_name', '')}"
            for c in cases[:30]
        ) or "  (none)"

        letters = input_data.get("letters") or []
        letter_lines = "\n".join(
            f"  - {l.get('template', '')} — {l.get('re_line', '') or l.get('matter_ref', '')}"
            for l in letters[:30]
        ) or "  (none)"

        parties = ", ".join(input_data.get("parties", []) or []) or "(none recorded)"
        issues = "\n".join(f"  - {i}" for i in input_data.get("issues", []) or []) or "  (none)"

        tab_context = input_data.get("tab_context", "") or "unknown"

        return (
            f"Matter: {input_data.get('title', '')}\n"
            f"Summary: {input_data.get('summary', '') or '(none)'}\n"
            f"Parties: {parties}\n"
            f"Issues:\n{issues}\n\n"
            f"Strategy analysis:\n{swo}{analysis_summary}".rstrip() + "\n\n"
            f"Chronology ({len(events)} events):\n{event_lines}\n\n"
            f"Saved case law ({len(cases)} cases):\n{case_lines}\n\n"
            f"Letters drafted ({len(letters)} letters):\n{letter_lines}\n\n"
            f"Current view: {tab_context}\n\n"
            f"User question: {input_data['message']}"
        )

    def parse_response(self, text: str) -> dict:
        return {"response": text.strip()}


# --- Routes ---

@router.get("/matters")
async def list_matters():
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT id, title, summary, created_at, updated_at FROM matters ORDER BY updated_at DESC"
    )
    await db.close()
    return {"matters": [dict(r) for r in rows]}


@router.post("/matters")
async def create_matter(body: MatterCreate):
    matter_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    db = await get_db()
    await db.execute(
        """INSERT INTO matters (id, title, summary, parties_json, issues_json, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (matter_id, body.title, body.summary, json.dumps(body.parties),
         json.dumps(body.issues), now, now),
    )
    await db.commit()
    await db.close()
    return {"id": matter_id, "title": body.title, "created_at": now}


@router.get("/matters/{matter_id}")
async def get_matter(matter_id: str):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM matters WHERE id = ?", (matter_id,))
    if not rows:
        await db.close()
        raise HTTPException(404, "Matter not found")

    matter = dict(rows[0])
    matter["parties"] = json.loads(matter.pop("parties_json", "[]"))
    matter["issues"] = json.loads(matter.pop("issues_json", "[]"))
    matter["strengths"] = json.loads(matter.pop("strengths_json", "[]"))
    matter["weaknesses"] = json.loads(matter.pop("weaknesses_json", "[]"))
    matter["opportunities"] = json.loads(matter.pop("opportunities_json", "[]"))
    matter["analysis"] = json.loads(matter.pop("analysis_json", "{}"))

    # Get chat history
    msgs = await db.execute_fetchall(
        "SELECT role, content, timestamp FROM matter_messages WHERE matter_id = ? ORDER BY timestamp",
        (matter_id,),
    )
    matter["messages"] = [dict(m) for m in msgs]
    await db.close()
    return matter


@router.put("/matters/{matter_id}")
async def update_matter(matter_id: str, body: MatterUpdate):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT id FROM matters WHERE id = ?", (matter_id,))
    if not rows:
        await db.close()
        raise HTTPException(404, "Matter not found")

    updates = []
    params = []
    if body.title is not None:
        updates.append("title = ?")
        params.append(body.title)
    if body.summary is not None:
        updates.append("summary = ?")
        params.append(body.summary)
    if body.parties is not None:
        updates.append("parties_json = ?")
        params.append(json.dumps(body.parties))
    if body.issues is not None:
        updates.append("issues_json = ?")
        params.append(json.dumps(body.issues))
    if body.strengths is not None:
        updates.append("strengths_json = ?")
        params.append(json.dumps(body.strengths))
    if body.weaknesses is not None:
        updates.append("weaknesses_json = ?")
        params.append(json.dumps(body.weaknesses))
    if body.opportunities is not None:
        updates.append("opportunities_json = ?")
        params.append(json.dumps(body.opportunities))

    if updates:
        updates.append("updated_at = ?")
        params.append(datetime.now(timezone.utc).isoformat())
        params.append(matter_id)
        await db.execute(
            f"UPDATE matters SET {', '.join(updates)} WHERE id = ?", params
        )
        await db.commit()

    await db.close()
    return {"status": "ok"}


@router.post("/analyze")
async def analyze_strategy(body: AnalyzeRequest):
    """Run full AI strategy analysis including Nash equilibrium.

    Fast-path: if the matter already has a cached analysis (strengths/weaknesses/
    opportunities + nash_equilibrium or game_theory), return it instantly.
    Pass force=true to force a fresh run.
    """
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM matters WHERE id = ?", (body.matter_id,))
    if not rows:
        await db.close()
        raise HTTPException(404, "Matter not found")

    matter = dict(rows[0])
    await db.close()

    # Fast-path: if we already have a full cached analysis, return it (unless force=true)
    if not body.force:
        try:
            existing_analysis = json.loads(matter.get("analysis_json", "{}"))
        except json.JSONDecodeError:
            existing_analysis = {}
        has_game_theory = bool(existing_analysis.get("nash_equilibrium") or existing_analysis.get("game_theory"))
        existing_strengths = json.loads(matter.get("strengths_json", "[]"))
        existing_weaknesses = json.loads(matter.get("weaknesses_json", "[]"))
        existing_opportunities = json.loads(matter.get("opportunities_json", "[]"))
        if has_game_theory and existing_strengths and existing_weaknesses:
            # Merge the SWO arrays back into the analysis shape the frontend expects
            cached = {
                **existing_analysis,
                "strengths": existing_strengths,
                "weaknesses": existing_weaknesses,
                "opportunities": existing_opportunities,
                "_cached": True,
            }
            return {"matter_id": body.matter_id, "analysis": cached}

    agent = StrategyAnalyst()
    result = await agent.execute(
        {
            "title": matter["title"],
            "summary": matter["summary"],
            "parties": json.loads(matter.get("parties_json", "[]")),
            "issues": json.loads(matter.get("issues_json", "[]")),
            "strengths": json.loads(matter.get("strengths_json", "[]")),
            "weaknesses": json.loads(matter.get("weaknesses_json", "[]")),
            "opportunities": json.loads(matter.get("opportunities_json", "[]")),
        },
        document_id=f"matter-{body.matter_id}",
    )

    analysis = result.data

    # Store analysis and update SWO from AI
    db = await get_db()
    await db.execute(
        """UPDATE matters SET
            analysis_json = ?,
            strengths_json = ?,
            weaknesses_json = ?,
            opportunities_json = ?,
            updated_at = ?
           WHERE id = ?""",
        (
            json.dumps(analysis),
            json.dumps(analysis.get("strengths", [])),
            json.dumps(analysis.get("weaknesses", [])),
            json.dumps(analysis.get("opportunities", [])),
            datetime.now(timezone.utc).isoformat(),
            body.matter_id,
        ),
    )
    await db.commit()
    await db.close()

    return {"matter_id": body.matter_id, "analysis": analysis}


@router.post("/chat")
async def chat_with_advisor(body: ChatMessage):
    """Real-time AI chat about a specific matter."""
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM matters WHERE id = ?", (body.matter_id,))
    if not rows:
        await db.close()
        raise HTTPException(404, "Matter not found")

    matter = dict(rows[0])

    # Get chat history
    msgs = await db.execute_fetchall(
        "SELECT role, content FROM matter_messages WHERE matter_id = ? ORDER BY timestamp",
        (body.matter_id,),
    )
    history = [dict(m) for m in msgs]

    # Save user message
    now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        "INSERT INTO matter_messages (id, matter_id, role, content, timestamp) VALUES (?, ?, 'user', ?, ?)",
        (str(uuid.uuid4()), body.matter_id, body.message, now),
    )
    await db.commit()
    await db.close()

    # Get AI response
    agent = LitigationChatAgent()
    result = await agent.execute(
        {
            "title": matter["title"],
            "summary": matter["summary"],
            "issues": json.loads(matter.get("issues_json", "[]")),
            "history": history,
            "message": body.message,
        },
        document_id=f"matter-{body.matter_id}",
    )

    # The agent returns {"response": "..."} — fall back defensively.
    if isinstance(result.data, str):
        ai_response = result.data
    else:
        ai_response = result.data.get("response") or json.dumps(result.data)

    # Save AI response
    db = await get_db()
    ai_now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        "INSERT INTO matter_messages (id, matter_id, role, content, timestamp) VALUES (?, ?, 'assistant', ?, ?)",
        (str(uuid.uuid4()), body.matter_id, ai_response, ai_now),
    )
    await db.commit()
    await db.close()

    return {"response": ai_response, "timestamp": ai_now}


# --- Matter Assistant: context-aware chat across the whole matter workspace ---

@router.post("/matter-assistant")
async def matter_assistant(body: MatterAssistantRequest):
    """Chat with an assistant that has full context of the matter: summary,
    parties, issues, strategy, chronology, saved cases, and letters."""
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM matters WHERE id = ?", (body.matter_id,))
    if not rows:
        await db.close()
        raise HTTPException(404, "Matter not found")

    matter = dict(rows[0])

    # Linked context
    events = await db.execute_fetchall(
        "SELECT date, description, significance FROM timeline_events WHERE matter_id = ? ORDER BY date",
        (body.matter_id,),
    )
    events_list = [dict(e) for e in events]

    cases = await db.execute_fetchall(
        "SELECT case_id, case_name, citation, court, date FROM matter_cases WHERE matter_id = ? ORDER BY saved_at DESC",
        (body.matter_id,),
    )
    cases_list = [dict(c) for c in cases]

    letters = await db.execute_fetchall(
        "SELECT template, recipient, re_line, matter_ref, created_at FROM letters WHERE matter_id = ? ORDER BY created_at DESC",
        (body.matter_id,),
    )
    letters_list = [dict(l) for l in letters]

    # Save user message
    now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        "INSERT INTO matter_messages (id, matter_id, role, content, timestamp) VALUES (?, ?, 'user', ?, ?)",
        (str(uuid.uuid4()), body.matter_id, body.message, now),
    )
    await db.commit()
    await db.close()

    agent = MatterAssistantAgent()
    try:
        result = await agent.execute(
            {
                "title": matter.get("title", ""),
                "summary": matter.get("summary", ""),
                "parties": json.loads(matter.get("parties_json", "[]")),
                "issues": json.loads(matter.get("issues_json", "[]")),
                "strengths": json.loads(matter.get("strengths_json", "[]")),
                "weaknesses": json.loads(matter.get("weaknesses_json", "[]")),
                "opportunities": json.loads(matter.get("opportunities_json", "[]")),
                "analysis": json.loads(matter.get("analysis_json", "{}")),
                "events": events_list,
                "cases": cases_list,
                "letters": letters_list,
                "tab_context": body.tab_context,
                "message": body.message,
            },
            document_id=f"matter-assistant-{body.matter_id}",
        )
    except RuntimeError as exc:
        raise HTTPException(500, f"Assistant error: {exc}")

    if isinstance(result.data, str):
        ai_response = result.data
    else:
        ai_response = result.data.get("response") or json.dumps(result.data)

    db = await get_db()
    ai_now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        "INSERT INTO matter_messages (id, matter_id, role, content, timestamp) VALUES (?, ?, 'assistant', ?, ?)",
        (str(uuid.uuid4()), body.matter_id, ai_response, ai_now),
    )
    await db.commit()
    await db.close()

    return {"response": ai_response, "timestamp": ai_now}


# --- Saved cases ---

@router.get("/matters/{matter_id}/cases")
async def list_saved_cases(matter_id: str):
    """List case law saved to this matter."""
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT * FROM matter_cases WHERE matter_id = ? ORDER BY saved_at DESC",
        (matter_id,),
    )
    await db.close()
    return {"cases": [dict(r) for r in rows]}


@router.post("/matters/{matter_id}/cases")
async def save_case_to_matter(matter_id: str, body: SavedCase):
    """Save a case law result to this matter."""
    db = await get_db()
    rows = await db.execute_fetchall("SELECT id FROM matters WHERE id = ?", (matter_id,))
    if not rows:
        await db.close()
        raise HTTPException(404, "Matter not found")

    # De-dupe by (matter_id, case_id)
    existing = await db.execute_fetchall(
        "SELECT id FROM matter_cases WHERE matter_id = ? AND case_id = ?",
        (matter_id, body.case_id),
    )
    if existing:
        await db.close()
        return {"id": dict(existing[0])["id"], "status": "already_saved"}

    saved_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        """INSERT INTO matter_cases
           (id, matter_id, case_id, case_name, citation, court, date, url, notes, saved_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (saved_id, matter_id, body.case_id, body.case_name, body.citation,
         body.court, body.date, body.url, body.notes, now),
    )
    await db.commit()
    await db.close()
    return {"id": saved_id, "status": "saved", "saved_at": now}


@router.delete("/matters/{matter_id}/cases/{saved_id}")
async def delete_saved_case(matter_id: str, saved_id: str):
    db = await get_db()
    await db.execute(
        "DELETE FROM matter_cases WHERE id = ? AND matter_id = ?",
        (saved_id, matter_id),
    )
    await db.commit()
    await db.close()
    return {"status": "ok"}
