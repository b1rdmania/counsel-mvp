from __future__ import annotations
from pydantic import BaseModel
from enum import Enum
from typing import Optional


class DocumentStatus(str, Enum):
    queued = "queued"
    parsing = "parsing"
    analysing = "analysing"
    redlining = "redlining"
    summarising = "summarising"
    review_pending = "review_pending"
    completed = "completed"
    failed = "failed"


class AnalysisType(str, Enum):
    ma = "ma"
    saas = "saas"
    nda = "nda"
    employment = "employment"
    general = "general"


class ReviewPosture(str, Enum):
    balanced = "balanced"
    aggressive = "aggressive"
    conservative = "conservative"


class Confidence(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class RiskPosition(str, Enum):
    buyer_favourable = "buyer_favourable"
    seller_favourable = "seller_favourable"
    seller_unfavourable = "seller_unfavourable"
    buyer_unfavourable = "buyer_unfavourable"
    balanced = "balanced"
    neutral = "neutral"


class RedlinePriority(str, Enum):
    critical = "critical"
    important = "important"
    suggested = "suggested"


class ReviewDecision(str, Enum):
    accepted = "accepted"
    declined = "declined"
    modified = "modified"


# --- Request schemas ---

class ReviewRequest(BaseModel):
    decision: ReviewDecision
    modified_text: Optional[str] = None


# --- Response schemas ---

class ClauseOut(BaseModel):
    id: str
    section: str
    title: str
    type: str
    text: str
    defined_terms_used: list[str] = []
    cross_references: list[str] = []


class AnalysisOut(BaseModel):
    clause_id: str
    section: str
    title: str
    text: str
    risk_score: int
    confidence: Confidence
    rationale: str
    benchmark: str
    position: RiskPosition
    flags: list[str] = []


class RedlineOut(BaseModel):
    id: str
    clause_id: str
    section: str
    original_text: str
    suggested_text: str
    explanation: str
    priority: RedlinePriority
    risk_score: int
    review_decision: Optional[ReviewDecision] = None


class SummaryOut(BaseModel):
    executive_summary: str
    key_terms: list[dict]
    risk_overview: dict


class AuditEntry(BaseModel):
    id: str
    agent_id: str
    action: str
    model: str
    tokens_in: int
    tokens_out: int
    duration_ms: int
    status: str
    timestamp: str


class DocumentOut(BaseModel):
    id: str
    filename: str
    status: DocumentStatus
    analysis_type: AnalysisType
    posture: ReviewPosture
    created_at: str
    total_clauses: Optional[int] = None
    high_risk: Optional[int] = None
    medium_risk: Optional[int] = None
    low_risk: Optional[int] = None


class DocumentDetail(DocumentOut):
    clauses: list[ClauseOut] = []
    analyses: list[AnalysisOut] = []
    redlines: list[RedlineOut] = []
    summary: Optional[SummaryOut] = None
    audit_log: list[AuditEntry] = []
