"""Seed demo data — realistic matters for demos.

Runs on startup if DB has no matters. Idempotent: checks for existing
matters first and skips if found.
"""

import json
import uuid
from datetime import datetime, timezone, timedelta

from ..database import get_db


DEMO_MATTERS = [
    {
        "title": "Wellington Holdings v Sterling Bank — Breach of Defence",
        "summary": (
            "Our client Wellington Holdings Ltd entered into a commercial loan facility "
            "with Sterling Bank PLC in March 2024 for GBP 12M. Sterling called the loan in "
            "January 2026 citing a technical breach of financial covenants. Wellington "
            "disputes the breach and alleges Sterling failed to apply a negotiated covenant "
            "waiver agreed in correspondence dated 15 November 2025. High Court proceedings "
            "issued. Case management conference scheduled for 23 May 2026."
        ),
        "parties": [
            "Wellington Holdings Ltd (Claimant)",
            "Sterling Bank PLC (Defendant)",
            "Harrington & Co LLP (instructing solicitors)",
        ],
        "issues": [
            "Whether the 15 November 2025 correspondence constitutes a binding covenant waiver",
            "Quantification of consequential losses from premature loan call (estimate GBP 3.2M)",
            "Application for interim injunction preventing further enforcement action",
            "Counterclaim for breach of implied duty of good faith",
        ],
        "strengths": [
            "Clear documentary trail of the waiver negotiation (emails, meeting minutes)",
            "Sterling's own relationship manager acknowledged the waiver in writing",
            "Wellington has strong cashflow position undermining any 'default risk' argument",
            "Judicial appetite for good faith implied terms (Yam Seng, Al Nehayan)",
        ],
        "weaknesses": [
            "The waiver was informal — not executed as a formal variation",
            "Sterling's board minutes show internal concerns about Wellington's trajectory",
            "Costs of injunction application are substantial (estimate GBP 180K)",
        ],
        "opportunities": [
            "Sterling faces reputational risk — large institutional client dispute in public record",
            "Settlement window before CMC where Sterling's legal costs escalate sharply",
            "Potential Part 36 offer around 65% of quantum with costs consequences",
        ],
        "game_theory": {
            "likely_equilibrium_outcome": (
                "Settlement between GBP 2.1M and GBP 2.8M before trial, with "
                "Sterling absorbing 70% of Wellington's costs. Nash equilibrium sits "
                "where Sterling's litigation cost exposure exceeds settlement premium."
            ),
            "plaintiff_optimal_strategy": "Press for injunction early to force costs escalation",
            "defendant_optimal_strategy": "Drag to CMC to test Wellington's appetite for trial",
            "settlement_range": {
                "low": "GBP 1.8M — acceptance of breach, minimal consequentials",
                "high": "GBP 3.5M — full quantum plus injunction costs",
                "most_likely": "GBP 2.5M with 70% costs, pre-CMC settlement",
            },
        },
        "risk_assessment": {
            "litigation_risk": "medium",
            "cost_benefit": "Strong recovery prospects vs. GBP 400-600K total cost exposure",
            "time_estimate": "6-9 months to settlement or trial",
        },
        "timeline_events": [
            {"date": "2024-03-15", "description": "Commercial loan facility executed (GBP 12M, 3-year term)", "significance": "high"},
            {"date": "2025-09-20", "description": "Initial covenant concerns raised by Sterling's credit committee", "significance": "medium"},
            {"date": "2025-11-15", "description": "Waiver correspondence — Wellington CFO and Sterling relationship manager", "significance": "high"},
            {"date": "2025-12-02", "description": "Meeting minutes confirm waiver agreed in principle", "significance": "high"},
            {"date": "2026-01-14", "description": "Sterling calls loan citing financial covenant breach", "significance": "high"},
            {"date": "2026-02-03", "description": "Letter before action issued to Sterling", "significance": "high"},
            {"date": "2026-03-10", "description": "High Court claim issued", "significance": "high"},
            {"date": "2026-05-23", "description": "Case Management Conference — Commercial Court", "significance": "high"},
        ],
    },
    {
        "title": "Mercer IP Ltd v TechCorp USA — Patent Infringement",
        "summary": (
            "Mercer IP Ltd holds European patent EP3482910 covering battery thermal management "
            "technology for electric vehicles. TechCorp USA is importing EVs into the UK "
            "that Mercer believes infringe claims 1, 4, and 7. Claim issued in the Patents Court. "
            "TechCorp has counterclaimed for invalidity citing prior art. Trial listed for "
            "18 months from issue date."
        ),
        "parties": [
            "Mercer IP Ltd (Claimant)",
            "TechCorp USA Inc (Defendant)",
            "TechCorp Europe GmbH (Additional Defendant)",
        ],
        "issues": [
            "Construction of claim 1 — whether 'adaptive thermal regulator' covers passive systems",
            "Validity challenge based on JP2018-042185 (prior art cited in IPEC)",
            "Quantum: reasonable royalty vs. lost profits (potential GBP 8-15M)",
            "Application for cross-border preliminary injunction",
        ],
        "strengths": [
            "Clear documentary evidence of TechCorp's engineers accessing Mercer's published patent",
            "Strong expert evidence from Prof. Simons (Imperial) on technical scope",
            "European Patent Office granted patent despite third-party observations",
        ],
        "weaknesses": [
            "Japanese prior art raises genuine validity concern",
            "TechCorp has significantly deeper litigation budget",
            "Patents Court trial costs estimated at GBP 1.8M+",
        ],
        "opportunities": [
            "Parallel proceedings in Germany — coordinated settlement pressure",
            "TechCorp's IPO timeline creates settlement urgency",
            "Licence agreement could become revenue stream worth 10x damages",
        ],
        "game_theory": None,
        "risk_assessment": {
            "litigation_risk": "high",
            "cost_benefit": "High variance — GBP 8-15M upside vs. GBP 2M+ cost exposure",
            "time_estimate": "18-24 months to trial",
        },
        "timeline_events": [
            {"date": "2019-08-14", "description": "EP3482910 filed with European Patent Office", "significance": "high"},
            {"date": "2021-11-02", "description": "EP3482910 granted", "significance": "high"},
            {"date": "2024-06-10", "description": "TechCorp USA launches Model T7 in European market", "significance": "medium"},
            {"date": "2025-10-15", "description": "Mercer's technical review identifies potential infringement", "significance": "high"},
            {"date": "2025-12-08", "description": "Letter before action sent to TechCorp USA", "significance": "high"},
            {"date": "2026-02-20", "description": "High Court claim issued (Patents Court)", "significance": "high"},
            {"date": "2026-04-15", "description": "Defence and counterclaim filed — invalidity pleaded", "significance": "high"},
        ],
    },
    {
        "title": "Foxbridge Partners — Employment Tribunal Response",
        "summary": (
            "Former partner Dr Sarah Chen has filed a claim in the Employment Tribunal alleging "
            "sex discrimination, equal pay breaches, and unfair dismissal under the Equality Act "
            "2010. Foxbridge Partners denies all allegations. The claim stems from Dr Chen's "
            "exit from the partnership in September 2025 following a failed managing partner "
            "bid. Foxbridge maintains the exit was consensual and commercially driven."
        ),
        "parties": [
            "Dr Sarah Chen (Claimant)",
            "Foxbridge Partners LLP (Respondent)",
            "John Harrington KC (Respondent's counsel)",
        ],
        "issues": [
            "Applicability of Equality Act to LLP partners (Clyde & Co v Bates van Winkelhof)",
            "Equal pay comparators — male partners in equivalent roles",
            "Disclosure dispute over partnership remuneration data",
            "Whether managing partner election process was discriminatory",
        ],
        "strengths": [
            "Partnership agreement explicitly documents merit-based remuneration structure",
            "Independent consultancy review found no gender pay gap in 2023 audit",
            "Dr Chen received higher total compensation than 4 of 6 male comparators",
        ],
        "weaknesses": [
            "Only 3 female partners out of 24 — optically problematic",
            "Managing partner election committee was 7 men, 1 woman",
            "Some historical correspondence contains unfortunate language",
        ],
        "opportunities": [
            "Early settlement via ACAS conciliation before full disclosure",
            "Reputational risk management — firm has major client relationships",
            "Possibility of without prejudice settlement with NDA",
        ],
        "game_theory": None,
        "risk_assessment": {
            "litigation_risk": "medium",
            "cost_benefit": "Settlement likely preferable — tribunal costs + reputation",
            "time_estimate": "4-6 months to hearing",
        },
        "timeline_events": [
            {"date": "2015-04-01", "description": "Dr Chen made equity partner at Foxbridge", "significance": "medium"},
            {"date": "2024-01-15", "description": "Managing partner role announced as vacant", "significance": "high"},
            {"date": "2024-03-20", "description": "Dr Chen submits candidacy for managing partner", "significance": "high"},
            {"date": "2024-05-10", "description": "Partnership vote — Richard Hayes elected managing partner", "significance": "high"},
            {"date": "2025-06-15", "description": "Dr Chen raises grievance re: bonus allocation", "significance": "high"},
            {"date": "2025-09-30", "description": "Dr Chen exits partnership", "significance": "high"},
            {"date": "2026-01-12", "description": "Employment Tribunal claim (ET1) filed", "significance": "high"},
            {"date": "2026-03-05", "description": "Response (ET3) filed on behalf of Foxbridge", "significance": "high"},
            {"date": "2026-06-18", "description": "Preliminary hearing scheduled", "significance": "high"},
        ],
    },
    {
        "title": "Kensington Trust — Commercial Lease Renewal",
        "summary": (
            "Landlord Kensington Trust holding commercial property at 42 Great Russell Street, "
            "London WC1. Tenant's lease expires 30 June 2026. Tenant (a major retailer) has "
            "served notice under section 26 of the Landlord and Tenant Act 1954 requesting a "
            "new tenancy. Rent review dispute: tenant proposes GBP 185K/annum, landlord's "
            "expert values at GBP 245K/annum. Negotiating lease terms and rent level."
        ),
        "parties": [
            "Kensington Trust (Landlord)",
            "Thornberry Retail Group Ltd (Tenant)",
            "Knight Frank (Landlord's surveyors)",
            "CBRE (Tenant's surveyors)",
        ],
        "issues": [
            "Market rent determination for premises at 42 Great Russell Street",
            "Proposed user clause amendments — tenant wants broader retail use",
            "Service charge cap negotiation (tenant seeks 5% p.a. cap)",
            "Break clause at year 5 — tenant requesting, landlord resisting",
        ],
        "strengths": [
            "Strong comparable evidence from similar premises in the area",
            "Long and stable tenant with excellent covenant strength",
            "Current lease terms commercially favourable to landlord",
        ],
        "weaknesses": [
            "Evidence of softening retail market in Bloomsbury",
            "Vacancy costs if tenant walks away (estimated 6-month void)",
        ],
        "opportunities": [
            "Deal on broader user clause in exchange for higher rent",
            "Mutually acceptable rent at GBP 215K split the difference",
            "Extended term (10 years) with rent review at year 5",
        ],
        "game_theory": None,
        "risk_assessment": {
            "litigation_risk": "low",
            "cost_benefit": "Negotiation preferable to court — PACT if needed",
            "time_estimate": "2-3 months to agreement",
        },
        "timeline_events": [
            {"date": "2016-06-30", "description": "Current lease commenced (10-year term)", "significance": "medium"},
            {"date": "2025-12-15", "description": "Section 26 notice served by tenant", "significance": "high"},
            {"date": "2026-01-30", "description": "Landlord counter-notice served", "significance": "high"},
            {"date": "2026-02-20", "description": "Knight Frank valuation report received", "significance": "medium"},
            {"date": "2026-04-10", "description": "First negotiation meeting", "significance": "medium"},
            {"date": "2026-06-30", "description": "Current lease expires", "significance": "high"},
        ],
    },
]


DEMO_LETTERS = [
    {
        "template": "lba",
        "recipient": "Sterling Bank PLC, 30 St Mary Axe, London EC3A 8EP",
        "client": "Wellington Holdings Ltd",
        "matter_ref": "WH-0492",
        "re_line": "Wellington Holdings Ltd / Commercial Loan Facility — Breach of Waiver Agreement",
        "context": "Sterling Bank called a GBP 12M loan in January 2026 despite a negotiated waiver in November 2025.",
    },
    {
        "template": "part36",
        "recipient": "TechCorp USA Inc, c/o Bristows LLP, 100 Victoria Embankment, London EC4Y 0DH",
        "client": "Mercer IP Ltd",
        "matter_ref": "MIP-2026-003",
        "re_line": "Mercer IP Ltd v TechCorp USA Inc — Patent Infringement",
        "context": "Part 36 offer to settle at GBP 5.5M plus costs in relation to EP3482910.",
    },
]


async def seed_demo_data():
    """Seed the database with realistic demo matters if none exist."""
    db = await get_db()

    # Check if we already have matters
    rows = await db.execute_fetchall("SELECT COUNT(*) as c FROM matters")
    count = dict(rows[0])["c"]

    if count > 0:
        print(f"[SEED] DB already has {count} matters, skipping seed")
        await db.close()
        return

    print(f"[SEED] Seeding {len(DEMO_MATTERS)} demo matters...")

    now = datetime.now(timezone.utc)

    for i, matter_data in enumerate(DEMO_MATTERS):
        matter_id = str(uuid.uuid4())
        # Stagger created dates so "last activity" varies
        created = (now - timedelta(days=30 - i * 6)).isoformat()

        analysis = {}
        if matter_data.get("game_theory"):
            analysis["game_theory"] = matter_data["game_theory"]
        if matter_data.get("risk_assessment"):
            analysis["risk_assessment"] = matter_data["risk_assessment"]

        await db.execute(
            """INSERT INTO matters (id, title, summary, parties_json, issues_json,
               strengths_json, weaknesses_json, opportunities_json, analysis_json,
               created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                matter_id,
                matter_data["title"],
                matter_data["summary"],
                json.dumps(matter_data["parties"]),
                json.dumps(matter_data["issues"]),
                json.dumps(matter_data.get("strengths", [])),
                json.dumps(matter_data.get("weaknesses", [])),
                json.dumps(matter_data.get("opportunities", [])),
                json.dumps(analysis),
                created,
                created,
            ),
        )

        # Seed timeline events for this matter
        for event in matter_data.get("timeline_events", []):
            event_id = str(uuid.uuid4())
            await db.execute(
                """INSERT INTO timeline_events (id, matter_id, date, description,
                   source_document, significance, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    event_id,
                    matter_id,
                    event["date"],
                    event["description"],
                    "Seeded data",
                    event["significance"],
                    created,
                ),
            )

    # Seed a couple of demo letters
    for letter_data in DEMO_LETTERS:
        letter_id = str(uuid.uuid4())
        await db.execute(
            """INSERT INTO letters (id, template, recipient, client, matter_ref,
               re_line, context, generated_text, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                letter_id,
                letter_data["template"],
                letter_data["recipient"],
                letter_data["client"],
                letter_data["matter_ref"],
                letter_data["re_line"],
                letter_data["context"],
                "[Draft pending — click to generate]",
                now.isoformat(),
            ),
        )

    await db.commit()
    await db.close()
    print(f"[SEED] Seeded {len(DEMO_MATTERS)} matters with timelines and {len(DEMO_LETTERS)} letter drafts")
