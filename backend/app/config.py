import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

DB_PATH = BASE_DIR / "counsel.db"

# Claude API
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# Model config — swappable via env vars
PARSER_MODEL = os.environ.get("COUNSEL_PARSER_MODEL", "claude-sonnet-4-20250514")
ANALYST_MODEL = os.environ.get("COUNSEL_ANALYST_MODEL", "claude-sonnet-4-20250514")
REDLINER_MODEL = os.environ.get("COUNSEL_REDLINER_MODEL", "claude-sonnet-4-20250514")
SUMMARISER_MODEL = os.environ.get("COUNSEL_SUMMARISER_MODEL", "claude-sonnet-4-20250514")

# Timeouts (seconds)
PARSER_TIMEOUT = int(os.environ.get("COUNSEL_PARSER_TIMEOUT", "60"))
ANALYST_TIMEOUT = int(os.environ.get("COUNSEL_ANALYST_TIMEOUT", "120"))
REDLINER_TIMEOUT = int(os.environ.get("COUNSEL_REDLINER_TIMEOUT", "60"))
SUMMARISER_TIMEOUT = int(os.environ.get("COUNSEL_SUMMARISER_TIMEOUT", "45"))

# CORS
FRONTEND_URL = os.environ.get("COUNSEL_FRONTEND_URL", "http://localhost:5173")
