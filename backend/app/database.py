"""SQLite database setup and helpers."""

import aiosqlite
from .config import DB_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    analysis_type TEXT NOT NULL DEFAULT 'general',
    posture TEXT NOT NULL DEFAULT 'balanced',
    raw_text TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clauses (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    section TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT 'unknown',
    text TEXT NOT NULL,
    metadata_json TEXT DEFAULT '{}',
    FOREIGN KEY (document_id) REFERENCES documents(id)
);

CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    clause_id TEXT NOT NULL,
    risk_score INTEGER NOT NULL,
    confidence TEXT NOT NULL DEFAULT 'medium',
    rationale TEXT NOT NULL DEFAULT '',
    benchmark TEXT NOT NULL DEFAULT '',
    position TEXT NOT NULL DEFAULT 'neutral',
    flags_json TEXT DEFAULT '[]',
    FOREIGN KEY (clause_id) REFERENCES clauses(id)
);

CREATE TABLE IF NOT EXISTS redlines (
    id TEXT PRIMARY KEY,
    clause_id TEXT NOT NULL,
    original_text TEXT NOT NULL,
    suggested_text TEXT NOT NULL,
    explanation TEXT NOT NULL DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'suggested',
    risk_score INTEGER NOT NULL DEFAULT 3,
    FOREIGN KEY (clause_id) REFERENCES clauses(id)
);

CREATE TABLE IF NOT EXISTS summaries (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL UNIQUE,
    executive_summary TEXT NOT NULL DEFAULT '',
    key_terms_json TEXT DEFAULT '[]',
    risk_overview_json TEXT DEFAULT '{}',
    FOREIGN KEY (document_id) REFERENCES documents(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    redline_id TEXT NOT NULL,
    decision TEXT NOT NULL,
    modified_text TEXT,
    reviewer TEXT NOT NULL DEFAULT 'lawyer',
    timestamp TEXT NOT NULL,
    FOREIGN KEY (redline_id) REFERENCES redlines(id)
);

CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    action TEXT NOT NULL,
    input_hash TEXT,
    output_hash TEXT,
    model TEXT,
    tokens_in INTEGER DEFAULT 0,
    tokens_out INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'success',
    error_msg TEXT,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id)
);
"""


async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(str(DB_PATH))
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    return db


async def init_db():
    db = await get_db()
    await db.executescript(SCHEMA)
    await db.commit()
    await db.close()
