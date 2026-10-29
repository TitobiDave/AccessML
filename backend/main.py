"""App entry point: wires settings, DB, CORS and routers together. Run: uvicorn main:app --reload"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models  # noqa: F401  (registers tables on Base)
from config import settings
from database import Base, SessionLocal, engine
from routers import certificates, lessons, progress, quizzes, tutor, users,lab
from seed_data import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed(db)
    yield


app = FastAPI(title="AccessML API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (users, lessons, quizzes, progress, certificates, tutor,lab):
    app.include_router(r.router)


@app.get("/api/health", tags=["meta"])
def health():
    return {"status": "ok"}