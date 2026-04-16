"""Case Law Research router — searches National Archives Atom feed + AI summary."""

import json
import uuid
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Query

from ..agents.base import BaseAgent

router = APIRouter(prefix="/api/research", tags=["research"])

ATOM_URL = "https://caselaw.nationalarchives.gov.uk/atom.xml"

# XML namespaces
NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "tna": "https://caselaw.nationalarchives.gov.uk",
}


class CaseSummaryAgent(BaseAgent):
    agent_id = "case_summariser"
    model = "claude-sonnet-4-20250514"
    timeout = 30
    max_tokens = 2048

    def build_system_prompt(self):
        return (
            "You are a legal research assistant specialising in English & Welsh case law. "
            "Given a judgment excerpt, produce a concise JSON summary with fields: "
            "key_principle (1-2 sentences), ratio_decidendi, obiter_dicta (if any), "
            "relevance_to_query (1-2 sentences explaining why this case matters for the search query), "
            "and practical_impact (how this affects legal practice). "
            "Return ONLY valid JSON, no markdown."
        )

    def build_user_prompt(self, input_data: dict) -> str:
        return (
            f"Search query: {input_data['query']}\n\n"
            f"Case: {input_data['case_name']}\n"
            f"Court: {input_data['court']}\n"
            f"Date: {input_data['date']}\n\n"
            f"Judgment excerpt (first 3000 chars):\n{input_data['excerpt'][:3000]}"
        )


def _parse_atom_feed(xml_text: str) -> list[dict]:
    """Parse Atom XML feed into case result dicts."""
    results = []
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return results

    for entry in root.findall("atom:entry", NS):
        title = entry.findtext("atom:title", "", NS)
        court = ""
        author_el = entry.find("atom:author", NS)
        if author_el is not None:
            court = author_el.findtext("atom:name", "", NS)

        published = entry.findtext("atom:published", "", NS)[:10]  # YYYY-MM-DD

        # Get URL from link
        url = ""
        for link in entry.findall("atom:link", NS):
            rel = link.get("rel", "")
            link_type = link.get("type", "")
            if rel == "alternate" and not link_type:
                url = link.get("href", "")
                break

        # Get citation from tna:identifier
        citation = ""
        for ident in entry.findall("tna:identifier", NS):
            if ident.get("type") == "ukncn":
                citation = ident.text or ""
                break

        # Extract slug for case_id
        case_id = ""
        if url:
            case_id = url.replace("https://caselaw.nationalarchives.gov.uk/", "")

        summary = entry.findtext("atom:summary", "", NS) or ""

        results.append({
            "id": case_id,
            "case_name": title,
            "citation": citation,
            "court": court,
            "date": published,
            "url": url,
            "snippet": summary[:200] if summary else "",
        })

    return results


@router.get("/search")
async def search_cases(
    q: str = Query(..., min_length=2),
    court: str = Query("", description="Filter by court"),
    from_year: int = Query(0, description="From year"),
    to_year: int = Query(0, description="To year"),
    area: str = Query("", description="Area of law"),
    page: int = Query(1, ge=1),
):
    """Search English case law via National Archives Atom feed."""
    params = {
        "query": q,
        "page": page,
        "per_page": 20,
    }
    if court:
        params["court"] = court
    if from_year:
        params["from"] = f"{from_year}-01-01"
    if to_year:
        params["to"] = f"{to_year}-12-31"

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        try:
            resp = await client.get(ATOM_URL, params=params)
            resp.raise_for_status()
            results = _parse_atom_feed(resp.text)
        except Exception as e:
            print(f"[RESEARCH] Search error: {e}")
            results = []

    return {
        "query": q,
        "total": len(results),
        "page": page,
        "results": results,
    }


@router.get("/case/{case_id:path}")
async def get_case_detail(case_id: str, q: str = Query("", description="Original search query")):
    """Fetch a specific case judgment and optionally summarise with AI."""
    # Fetch the AKN XML (full judgment text)
    data_url = f"https://caselaw.nationalarchives.gov.uk/{case_id}/data.xml"

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        try:
            resp = await client.get(data_url)
            resp.raise_for_status()
            # Strip XML tags to get plain text
            root = ET.fromstring(resp.text)
            body_text = ET.tostring(root, encoding="unicode", method="text")
        except Exception:
            body_text = ""

    # Also fetch metadata from the page
    meta_url = f"https://caselaw.nationalarchives.gov.uk/{case_id}"
    case_name = case_id
    court = ""
    date = ""
    citation = ""

    # Try atom feed for just this case
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        try:
            resp = await client.get(ATOM_URL, params={"query": case_id.split("/")[-1], "per_page": 5})
            if resp.status_code == 200:
                entries = _parse_atom_feed(resp.text)
                for e in entries:
                    if case_id in e.get("id", ""):
                        case_name = e["case_name"]
                        court = e["court"]
                        date = e["date"]
                        citation = e["citation"]
                        break
        except Exception:
            pass

    result = {
        "case_id": case_id,
        "case_name": case_name,
        "citation": citation,
        "court": court,
        "date": date,
        "url": meta_url,
        "body_excerpt": body_text[:5000] if body_text else "",
        "ai_summary": None,
    }

    # Generate AI summary if we have body text and a query
    if body_text and q:
        try:
            agent = CaseSummaryAgent()
            summary_result = await agent.execute(
                {
                    "query": q,
                    "case_name": case_name,
                    "court": court,
                    "date": date,
                    "excerpt": body_text,
                },
                document_id=f"research-{case_id.replace('/', '-')}",
            )
            result["ai_summary"] = summary_result.data
        except Exception as e:
            result["ai_summary"] = {"error": str(e)}

    return result
