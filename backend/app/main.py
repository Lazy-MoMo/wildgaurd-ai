from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import connect_db, close_db
from .api import animals, predictions, alerts, geofences, stats, websocket

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(
    title="WildGuard AI",
    description="Predictive wildlife conflict prevention system",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST routers
app.include_router(animals.router,     prefix="/api/animals",     tags=["Animals"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(alerts.router,      prefix="/api/alerts",      tags=["Alerts"])
app.include_router(geofences.router,   prefix="/api/geofences",   tags=["Geofences"])
app.include_router(stats.router,       prefix="/api/stats",       tags=["Stats"])

# WebSocket
app.include_router(websocket.router, tags=["WebSocket"])

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "WildGuard AI"}
