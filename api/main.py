from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router
from .database import init_db

app = FastAPI(
    title="Smart Home Inventory API",
    version="0.1.0",
    description="API-first IMS dla zarządzania przedmiotami w domu. Hybrydowe wyszukiwanie, QR kody, offline sync.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}
