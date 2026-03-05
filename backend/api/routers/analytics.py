from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from api.database import get_db

router = APIRouter()
DEFAULT_ORG = "00000000-0000-0000-0000-000000000001"


def safe_org(org_id):
    if not org_id or org_id == "default":
        return DEFAULT_ORG
    return org_id


@router.get("/analytics/mood")
async def get_mood(org_id: str = Query(DEFAULT_ORG)):
    try:
        db = get_db()
        oid = safe_org(org_id)

        logs = db.table("emotion_logs").select(
            "id, emotion, confidence, stress_level, source, created_at, employee_id"
        ).eq("organization_id", oid).order("created_at", desc=True).limit(50).execute()

        all_logs = db.table("emotion_logs").select(
            "emotion"
        ).eq("organization_id", oid).execute()

        distribution = {}
        for log in (all_logs.data or []):
            e = log.get("emotion", "Unknown")
            distribution[e] = distribution.get(e, 0) + 1

        alerts_result = db.table("stress_alerts").select(
            "id"
        ).eq("organization_id", oid).eq("status", "pending").execute()
        pending_count = len(alerts_result.data) if alerts_result.data else 0

        employees_result = db.table("employees").select(
            "id"
        ).eq("organization_id", oid).execute()
        employee_count = len(employees_result.data) if employees_result.data else 0

        return {
            "status": "success",
            "data": {
                "recent_entries": logs.data or [],
                "distribution": distribution,
                "total_pending_alerts": pending_count,
                "total_employees": employee_count,
            }
        }
    except Exception as e:
        print(f"❌ Analytics Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/logs")
async def get_logs(
    org_id: str = Query(DEFAULT_ORG),
    limit: int = Query(50)
):
    try:
        db = get_db()
        result = db.table("emotion_logs").select(
            "id, emotion, confidence, stress_level, source, created_at, employee_id"
        ).eq(
            "organization_id", safe_org(org_id)
        ).order("created_at", desc=True).limit(limit).execute()
        return {"logs": result.data or []}
    except Exception as e:
        print(f"❌ Logs Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/stress-alerts")
async def get_alerts(
    org_id: str = Query(DEFAULT_ORG),
    status: Optional[str] = Query(None)
):
    try:
        db = get_db()
        q = db.table("stress_alerts").select("*").eq(
            "organization_id", safe_org(org_id)
        ).order("created_at", desc=True)
        if status:
            q = q.eq("status", status)
        result = q.execute()
        return {"alerts": result.data or []}
    except Exception as e:
        print(f"❌ Alerts Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/analytics/stress-alerts/{alert_id}")
async def update_alert(alert_id: str, body: dict):
    try:
        db = get_db()
        status = body.get("status")
        if not status:
            raise HTTPException(status_code=400, detail="status required")
        result = db.table("stress_alerts").update(
            {"status": status}
        ).eq("id", alert_id).execute()
        return {"message": "Updated", "data": result.data}
    except Exception as e:
        print(f"❌ Update Alert Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ✅ EOD endpoint HATA DIYA — ab eod.py router handle karta hai