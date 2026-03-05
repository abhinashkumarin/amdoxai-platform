import uvicorn
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
        # ── Production URLs ──
        "https://amdoxai-platform.vercel.app",
        "https://*.vercel.app",                 # all Vercel preview deployments
        os.getenv("FRONTEND_URL", ""),          # custom domain via env var
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

# ── HEALTH CHECK (for keep-alive ping from frontend) ─────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "amdox-backend"}

if __name__ == "__main__":
    uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True)