# Bird Legal

**Matter-first legal AI for UK law firms. Runs on your own models. Lives inside your office — not on servers in San Francisco.**

Bird Legal is a private-cloud legal AI platform built for boutique and mid-size UK firms. It replaces the growing patchwork of AI tools a firm might use — ChatGPT for letters, Westlaw for case law, a contract-review SaaS, a research plugin — with one coherent workspace organised around the unit that actually matters: the matter.

---

## Why this exists

Two things happened in early 2026 that reframed legal AI:

1. **Heppner v. US (SDNY, February 2026)** confirmed that using consumer AI tools (ChatGPT, consumer Claude) with client documents waives attorney-client privilege. Every firm that's been quietly using ChatGPT now has a problem.
2. **Anthropic launched a legal plugin for Claude** (April 2026) bringing enterprise AI directly into the hands of lawyers — but requiring each firm to configure MCPs, write skills, and stitch workflows themselves.

Neither path works for a 15-lawyer commercial firm: consumer AI destroys privilege, enterprise AI either costs £200K+/year (Harvey, Legora, Eudia) or requires a technical lift most firms don't have. Bird Legal is the third option — a packaged, matter-first product that can be configured for a firm in a week and run entirely on their own infrastructure.

---

## Positioning

- **Privilege-preserving by design.** Architecture supports self-hosted open-source models (Gemma 3, Llama 3, Mistral, Hermes) so client documents never touch a third-party cloud. Every agent call is audit-logged with input/output hashes. Also supports Claude API with Zero Data Retention for firms that prefer a managed model.
- **Matter-first, not prompt-first.** Every module works inside a matter and sees what every other module knows. Add a party once, it flows into the Letter Before Action. Save a case, strategy analysis cites it. A persistent AI assistant lives inside each matter with full context.
- **UK law as default.** Live integration with The National Archives' Find Case Law API. CPR-aware letter templates. Part 36 compliance built in. DD Month YYYY dates. UK English throughout. Jurisdiction packs architected but not yet built for Scotland, NI, Ireland, Singapore, HK, EU.

---

## What's in the product

Five modules, one matter workspace, one AI assistant that sees everything:

| Module | What it does |
|---|---|
| **Case Law Research** | Search 4,700+ UK judgments from the National Archives. AI summarises ratio decidendi, distinguishes authorities, saves relevant cases to the current matter. |
| **Litigation Advisor** | Structure a matter. Run Nash-equilibrium settlement analysis. SWOT, risk assessment, recommended strategy, key cases to research. |
| **Timeline Builder** | Upload disclosure bundles. AI extracts every date, ranks by significance, builds the chronology. |
| **Letter Drafting** | Letter Before Action, Part 36 Offer, Without Prejudice, Response to Claim, General. Pre-filled from the matter. Claude-generated, CPR-compliant. |
| **Contract Scanner** | Four-agent pipeline: Parser → Analyst → Redliner → Summariser. Parses clauses, flags risks, generates redlines, writes the executive summary. |

Every module is accessible inside a matter workspace (`/case/:matterId`) where they share context through a persistent matter assistant. They're also available standalone (`/library`, `/scanner`, etc.) for one-off work.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend: React 19 + Vite + React Router (Vercel)           │
└──────────────────────────┬──────────────────────────────────┘
                           │ fetch /api/*
┌──────────────────────────▼──────────────────────────────────┐
│  Backend: FastAPI + aiosqlite + async Anthropic SDK          │
│  (Render — portable to any Docker host)                      │
│                                                               │
│  Routers                                                     │
│    /api/advisor      matters, strategy, Nash equilibrium     │
│    /api/research     National Archives Atom feed + AI        │
│    /api/timeline     date extraction from documents          │
│    /api/drafting     CPR-compliant letter generation         │
│    /api/documents    contract scanner 4-agent pipeline       │
│                                                               │
│  Agents (all model-agnostic via BaseAgent wrapper)           │
│    StrategyAnalyst · MatterAssistantAgent · LitigationChat   │
│    ParserAgent · AnalystAgent · RedlinerAgent · Summariser   │
│    CaseSummaryAgent · TimelineExtractAgent · LetterDrafter   │
└─────────────────────────────────────────────────────────────┘
```

**Model-agnostic by design.** The `BaseAgent` wrapper can be pointed at Claude API, Claude via Bedrock, self-hosted Gemma/Llama/Mistral via Ollama or vLLM, or a hybrid setup (local model for document parsing, cloud model for strategy analysis). Model strings are env-configurable per agent.

**Database.** SQLite in dev and on Render free tier (ephemeral — re-seeds on restart). Postgres-ready for production.

**Deployment.** Frontend auto-deploys to Vercel from `main`. Backend auto-deploys to Render from `main`.

---

## Tech stack

**Frontend**
- React 19, Vite 8, React Router 7
- Dark design system, inline styles, no CSS modules
- Zero external UI libraries — all components custom to preserve Variant-exported design intent

**Backend**
- FastAPI + uvicorn
- Async Anthropic SDK
- aiosqlite (Postgres-ready)
- PyMuPDF + python-docx for document extraction
- httpx for National Archives integration

---

## Running locally

```bash
# Frontend
npm install
npm run dev            # http://localhost:5173

# Backend (separate terminal)
cd backend
pip install -r requirements.txt
ANTHROPIC_API_KEY=sk-ant-... uvicorn app.main:app --reload --port 8000
```

The Vite dev server proxies `/api/*` to `http://localhost:8000`.

On first startup, the backend seeds 4 realistic demo matters with full cached analyses:
- Wellington Holdings v Sterling Bank — breach of covenant waiver (£12M commercial loan)
- Mercer IP v TechCorp USA — patent infringement, parallel proceedings
- Foxbridge Partners — Equality Act tribunal response
- Kensington Trust — commercial lease renewal under LTA 1954

---

## Demo mode

`src/config.js` contains a `DEMO_MODE` flag. When `true` (the default), New Matter creation is hidden across the UI — visitors can only interact with the 4 seeded matters. Flip to `false` for real use.

---

## Project structure

```
counsel-mvp/
├── src/
│   ├── App.jsx                        Sidebar + routing + AppShell
│   ├── config.js                      Feature flags (DEMO_MODE)
│   ├── pages/
│   │   ├── SplashPage.jsx             Pitch / landing page
│   │   ├── HomePage.jsx               Workspace dashboard
│   │   ├── CaseWorkspacePage.jsx      Matter workspace with tabs
│   │   ├── CaseLawPage.jsx            Research
│   │   ├── LitigationAdvisorPage.jsx  Strategy + Nash equilibrium
│   │   ├── TimelinePage.jsx           Date extraction
│   │   ├── LetterDraftingPage.jsx     CPR-compliant letters
│   │   ├── ContractScannerPage.jsx    4-agent pipeline UI
│   │   └── SettingsPage.jsx
│   └── components/
│       └── MatterAssistant.jsx        Persistent matter-aware chat
├── backend/
│   ├── app/
│   │   ├── main.py                    FastAPI + lifespan seed
│   │   ├── config.py                  Model + timeout env vars
│   │   ├── database.py                SQLite schema
│   │   ├── routers/                   advisor, research, timeline,
│   │   │                              drafting, documents
│   │   ├── agents/                    BaseAgent + pipeline agents
│   │   └── services/
│   │       ├── pipeline.py            Contract scanner orchestration
│   │       ├── parser.py              PDF/DOCX extraction
│   │       └── seed.py                Demo matter seeding
│   └── requirements.txt
└── IMPLEMENTATION_PLAN.md
```

---

## Roadmap

**Short-term**
- Local-model testing (Gemma 3, Hermes) via Ollama integration
- Scottish / Northern Irish jurisdiction packs
- DOCX export from Letter Drafting with track changes
- Document scanner properly matter-scoped

**Medium-term**
- pgvector-backed institutional memory per firm
- Playbook editor (firm-specific NDA / MSA clause libraries)
- iManage / NetDocuments connectors
- SOC 2 Type II certification
- Responsive mobile / tablet UI (currently desktop-only)

---

## Related repos

**[counsel-demo](https://github.com/b1rdmania/counsel-demo)** — pure clickthrough UI prototype with no backend. Hardcoded mock data. Useful if you want to walk through the UX without spinning up the LLM dependency. The functional version you probably want is *this* repo.

**[courtless](https://github.com/b1rdmania/courtless)** — sister product **Courtless** (live at [courtless.xyz](https://courtless.xyz)). A consumer-facing AI dispute audit for SMEs and individuals — the pre-legal Judge Judy layer, below the price point where a law firm makes sense. Bird Legal is for the firms; Courtless is for everyone else. Shares the `BaseAgent` wrapper and design language.

---

## Status

Pre-alpha demo. Open to partnership conversations with UK law firms and legal consultancies interested in piloting or white-labelling.
