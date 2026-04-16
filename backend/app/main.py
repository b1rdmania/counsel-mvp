"""Counsel MVP — FastAPI backend."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import FRONTEND_URL
from .database import init_db
from .routers import documents, research, advisor, timeline, drafting


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Stella Counsel API",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router)
app.include_router(research.router)
app.include_router(advisor.router)
app.include_router(timeline.router)
app.include_router(drafting.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "counsel-mvp"}
