import uvicorn
import httpx
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from api.database import get_db
from api.routers import emotion, analytics, users, eod
import os

app = FastAPI(
    title="Amdox AI — Emotion Intelligence API",
    description="Multi-tenant SaaS HR Stress Monitoring Platform",
    version="2.0.0"
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://amdoxai-platform.vercel.app",
        "https://*.vercel.app",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ROUTERS ───────────────────────────────────────────────────────────────────
app.include_router(emotion.router,   prefix="/api", tags=["Emotion"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(users.router,     prefix="/api", tags=["Users"])
app.include_router(eod.router,       prefix="/api", tags=["EOD"])

# ── ANALYTICS SHORTCUT ────────────────────────────────────────────────────────
@app.get("/api/analytics")
async def get_analytics_inline(db=Depends(get_db)):
    try:
        result = db.table("emotion_logs").select("*").order("created_at", desc=True).limit(50).execute()
        return result.data
    except Exception as e:
        print(f"Database Error: {e}")
        return []

# ── WEBSOCKET ─────────────────────────────────────────────────────────────────
connected_clients = []

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket, org_id: str = "default", token: str = ""):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in connected_clients:
            connected_clients.remove(websocket)

async def broadcast_alert(alert_data: dict):
    dead = []
    for ws in connected_clients:
        try:
            await ws.send_json(alert_data)
        except Exception:
            dead.append(ws)
    for ws in dead:
        connected_clients.remove(ws)

# ── ROOT ──────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Amdox AI Emotion Intelligence API is running",
        "docs": "/docs",
        "version": "2.0.0"
    }

# ── HEALTH CHECK ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "amdox-backend"}

# ── KEEP-ALIVE SCHEDULER ──────────────────────────────────────────────────────
BACKEND_URL = os.getenv("BACKEND_URL", "https://amdox-backend.onrender.com")

async def keep_alive_ping():
    await asyncio.sleep(30)
    async with httpx.AsyncClient(timeout=10) as client:
        while True:
            try:
                r = await client.get(f"{BACKEND_URL}/health")
                print(f"[keep-alive] ping → {r.status_code}")
            except Exception as e:
                print(f"[keep-alive] ping failed: {e}")
            await asyncio.sleep(600)

# ── PRELOAD VOICE MODEL AT STARTUP ───────────────────────────────────────────
async def preload_voice_model():
    """
    Server start hone ke 10 second baad voice model load karo.
    Taaki pehli user request pe delay na ho.
    """
    await asyncio.sleep(10)
    try:
        print("⏳ Pre-loading voice model at startup...")
        from api.services.emotion_service import load_voice_model
        await asyncio.get_event_loop().run_in_executor(None, load_voice_model)
        print("✅ Voice model pre-loaded successfully!")
    except Exception as e:
        print(f"⚠️  Voice model preload failed (will load on first request): {e}")

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(keep_alive_ping())
    asyncio.create_task(preload_voice_model())  # ← NEW: preload voice model

# ── ENTRY POINT ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True)