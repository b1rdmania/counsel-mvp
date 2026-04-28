import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

DB_PATH = BASE_DIR / "counsel.db"

# Claude API
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# Default model for all agents. Override per-agent via the COUNSEL_*_MODEL env vars below.
DEFAULT_MODEL = os.environ.get("COUNSEL_DEFAULT_MODEL", "claude-sonnet-4-6")

# Model config — swappable via env vars, fall through to DEFAULT_MODEL.
PARSER_MODEL = os.environ.get("COUNSEL_PARSER_MODEL", DEFAULT_MODEL)
ANALYST_MODEL = os.environ.get("COUNSEL_ANALYST_MODEL", DEFAULT_MODEL)
REDLINER_MODEL = os.environ.get("COUNSEL_REDLINER_MODEL", DEFAULT_MODEL)
SUMMARISER_MODEL = os.environ.get("COUNSEL_SUMMARISER_MODEL", DEFAULT_MODEL)
RESEARCH_MODEL = os.environ.get("COUNSEL_RESEARCH_MODEL", DEFAULT_MODEL)
ADVISOR_MODEL = os.environ.get("COUNSEL_ADVISOR_MODEL", DEFAULT_MODEL)
TIMELINE_MODEL = os.environ.get("COUNSEL_TIMELINE_MODEL", DEFAULT_MODEL)
DRAFTING_MODEL = os.environ.get("COUNSEL_DRAFTING_MODEL", DEFAULT_MODEL)

# Timeouts (seconds)
PARSER_TIMEOUT = int(os.environ.get("COUNSEL_PARSER_TIMEOUT", "60"))
ANALYST_TIMEOUT = int(os.environ.get("COUNSEL_ANALYST_TIMEOUT", "120"))
REDLINER_TIMEOUT = int(os.environ.get("COUNSEL_REDLINER_TIMEOUT", "60"))
SUMMARISER_TIMEOUT = int(os.environ.get("COUNSEL_SUMMARISER_TIMEOUT", "45"))

# Upload limits
MAX_UPLOAD_BYTES = int(os.environ.get("COUNSEL_MAX_UPLOAD_BYTES", str(25 * 1024 * 1024)))  # 25 MB

# CORS — comma-separated list of allowed frontend origins.
# Default covers local dev; production must set COUNSEL_FRONTEND_ORIGINS.
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "COUNSEL_FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if o.strip()
]
