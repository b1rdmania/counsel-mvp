"""Letter Drafting router — template-based legal letter generation."""

import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..agents.base import BaseAgent
from ..database import get_db

router = APIRouter(prefix="/api/drafting", tags=["drafting"])


TEMPLATES = {
    "lba": {
        "name": "Letter Before Action",
        "description": "Pre-action correspondence per the Pre-Action Protocol",
        "structure": "Date, Your Ref, Our Ref, Dear [Name], Re: [Matter]. "
                     "Outline of claim, factual background, legal basis, "
                     "proposed resolution, deadline for response (typically 14 days), "
                     "consequences of non-response. Professional sign-off.",
    },
    "response": {
        "name": "Response to Claim",
        "description": "Formal response to a claim or letter before action",
        "structure": "Acknowledge receipt, address each allegation point by point, "
                     "state position on liability, any counterclaim, "
                     "propose next steps. Professional and measured tone.",
    },
    "part36": {
        "name": "Part 36 Offer",
        "description": "Settlement offer under CPR Part 36",
        "structure": "Clearly state this is an offer under Part 36 CPR, "
                     "specify the amount or terms, state the relevant period "
                     "(minimum 21 days), specify which claims it relates to, "
                     "costs consequences. Must comply with CPR 36.5.",
    },
    "without_prejudice": {
        "name": "Without Prejudice Correspondence",
        "description": "Privileged settlement discussion",
        "structure": "Prominently mark 'WITHOUT PREJUDICE'. "
                     "State intention to settle, outline proposed terms, "
                     "reasoning for settlement, deadline for response. "
                     "Note that this letter is not admissible in court.",
    },
    "general": {
        "name": "General Correspondence",
        "description": "Standard professional legal correspondence",
        "structure": "Clear subject line, professional greeting, "
                     "body addressing the matter at hand, "
                     "next steps or actions required, professional closing.",
    },
}


class DraftRequest(BaseModel):
    template: str
    recipient: str = ""
    client: str = ""
    matter_ref: str = ""
    re_line: str = ""
    context: str = ""
    additional_instructions: str = ""


class LetterDraftAgent(BaseAgent):
    agent_id = "letter_drafter"
    model = "claude-sonnet-4-20250514"
    timeout = 60
    max_tokens = 4096

    def build_system_prompt(self):
        return """You are a senior solicitor at an English law firm drafting professional legal correspondence.

Rules:
- Use formal English legal style (not American)
- Reference CPR (Civil Procedure Rules) where relevant
- Be precise with legal terminology
- Include appropriate caveats and disclaimers
- Date format: DD Month YYYY (e.g., 15 April 2026)
- Use "Dear [Name]" and "Yours faithfully/sincerely" as appropriate
- Include "We are instructed by [client]" where relevant
- For Part 36 offers, ensure strict compliance with CPR 36.5 requirements
- For without prejudice letters, prominently mark as such

Return the complete letter text, ready to print on firm letterhead.
Do NOT wrap in JSON — return the letter as plain text."""

    def build_user_prompt(self, input_data: dict) -> str:
        template = TEMPLATES.get(input_data["template"], TEMPLATES["general"])

        prompt = f"""Draft a {template['name']}.

Template structure: {template['structure']}

Details:
- Recipient: {input_data.get('recipient', '[To be completed]')}
- Client: {input_data.get('client', '[Client name]')}
- Matter Reference: {input_data.get('matter_ref', '[Ref]')}
- Re: {input_data.get('re_line', '[Subject]')}

Context and background:
{input_data.get('context', 'No additional context provided.')}

{input_data.get('additional_instructions', '')}

Draft the complete letter now."""

        return prompt

    def parse_response(self, text: str) -> dict:
        """Override — letter drafts are plain text, not JSON."""
        return {"letter_text": text.strip()}


@router.get("/templates")
async def list_templates():
    """List available letter templates."""
    return {
        "templates": [
            {"id": k, "name": v["name"], "description": v["description"]}
            for k, v in TEMPLATES.items()
        ]
    }


@router.post("/generate")
async def generate_letter(body: DraftRequest):
    """Generate a letter draft using AI."""
    if body.template not in TEMPLATES:
        raise HTTPException(400, f"Unknown template: {body.template}")

    agent = LetterDraftAgent()
    result = await agent.execute(
        {
            "template": body.template,
            "recipient": body.recipient,
            "client": body.client,
            "matter_ref": body.matter_ref,
            "re_line": body.re_line,
            "context": body.context,
            "additional_instructions": body.additional_instructions,
        },
        document_id=f"letter-{uuid.uuid4()}",
    )

    letter_text = result.data.get("letter_text", "")

    # Store in DB
    letter_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    db = await get_db()
    await db.execute(
        """INSERT INTO letters (id, template, recipient, client, matter_ref, re_line, context, generated_text, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (letter_id, body.template, body.recipient, body.client,
         body.matter_ref, body.re_line, body.context, letter_text, now),
    )
    await db.commit()
    await db.close()

    return {
        "id": letter_id,
        "template": body.template,
        "letter_text": letter_text,
        "created_at": now,
    }


@router.get("/letters")
async def list_letters():
    """List previously generated letters."""
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT id, template, recipient, client, matter_ref, re_line, created_at FROM letters ORDER BY created_at DESC"
    )
    await db.close()
    return {"letters": [dict(r) for r in rows]}


@router.get("/letters/{letter_id}")
async def get_letter(letter_id: str):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM letters WHERE id = ?", (letter_id,))
    if not rows:
        await db.close()
        raise HTTPException(404, "Letter not found")
    await db.close()
    return dict(rows[0])
