# Counsel MVP — Implementation Plan

## Current State
- Frontend: 6 screens deployed to Vercel, demo fallback mode working
- Backend: FastAPI + 4 Claude agents + SQLite — built but untested end-to-end
- Gap: Frontend ↔ Backend not tested as a unit, no real PDF run yet

## Phase 1 — Get End-to-End Working (Today)

### 1.1 Install backend dependencies & verify startup
- `pip3 install -r backend/requirements.txt`
- Set ANTHROPIC_API_KEY in environment
- Start uvicorn, confirm /api/health returns 200

### 1.2 Test PDF upload → pipeline round trip
- Upload a real contract PDF via the API
- Verify: text extraction (PyMuPDF) → clause parsing (Agent 1) → risk analysis (Agent 2) → redlines (Agent 3) → summary (Agent 4)
- Check SQLite has populated all tables
- Fix any JSON parsing errors from Claude responses

### 1.3 Wire frontend polling to real backend
- Start both dev servers (Vite on 5173, FastAPI on 8000)
- Upload via IntakePage → confirm ProcessingPage polls real status
- Verify WorkbenchPage renders real redlines
- Verify RiskSummaryPage renders real risk data
- Verify AuditRecordPage shows real agent execution logs

### 1.4 Fix data mapping issues
- Frontend expects specific JSON shapes — match to actual API responses
- ProcessingPage feed entries need to map from audit_log
- WorkbenchPage redline cards need clause text + suggested text
- RiskSummaryPage needs flagged clauses with severity mapping

## Phase 2 — Prompt Hardening (1-2 days)

### 2.1 Parser agent prompt tuning
- Test against: NDA, MSA, APA (three different doc types)
- Verify clause boundaries are sensible
- Verify defined terms extraction works
- Add fallback for poorly formatted PDFs

### 2.2 Analyst agent calibration
- Risk scores should be meaningful (not everything scored 4-5)
- Benchmark references should cite actual market standards
- Position detection (buyer/seller favourable) needs to be accurate
- Confidence scores should correlate with clause clarity

### 2.3 Redliner quality
- Suggested text must be legally defensible language
- Explanations should reference specific risk factors
- Priority ordering should match risk severity
- Conservative language — never over-reach

### 2.4 Summariser coherence
- Executive summary should be 3-5 paragraphs, plain English
- Key terms extraction should pull actual commercial values
- Risk overview should match individual clause analyses
- Overall risk rating should be calibrated

## Phase 3 — Demo Polish (2-3 days)

### 3.1 DOCX export
- Accept redlines → generate Word doc with track changes
- python-docx with revision markup
- Download button on WorkbenchPage

### 3.2 Error handling & edge cases
- Large PDFs (50+ pages) — chunking strategy
- Scanned PDFs — OCR fallback (already in parser.py)
- Malformed documents — graceful failure with user message
- API timeouts — retry logic with exponential backoff

### 3.3 Loading states & UX
- ProcessingPage: real-time agent status (not just %)
- Show which agent is currently running
- Display token usage / cost estimate
- Smooth transitions between stages

### 3.4 Multi-document support
- List view of previously uploaded documents
- Re-open completed analyses
- Delete documents

## Phase 4 — Demo-Ready Deployment

### 4.1 Backend hosting
- Railway / Render / Fly.io for FastAPI
- Persistent SQLite or migrate to Postgres
- Environment variables for API key

### 4.2 Connect Vercel frontend to hosted backend
- Set VITE_API_URL to hosted backend URL
- CORS configuration
- Test full flow on production URLs

### 4.3 Demo prep
- Pre-load 2-3 analysed contracts for instant demo
- Walkthrough script for Tyson call
- Fallback: if live demo fails, pre-recorded flow

## Out of Scope (Post-Demo)
- Authentication / multi-tenancy
- SOC 2 compliance implementation
- Institutional memory / RAG
- Multi-document cross-reference
- Regulatory change detection
- Production guardrails (prompt injection defence layers)
