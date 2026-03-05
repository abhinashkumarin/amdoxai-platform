from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from api.database import get_db

router = APIRouter()

class AuthSyncRequest(BaseModel):
    clerk_user_id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = "employee"

class RoleUpdateRequest(BaseModel):
    role: str

@router.post("/auth/sync")
async def auth_sync(req: AuthSyncRequest):
    try:
        db = get_db()
        payload = {
            "clerk_user_id": req.clerk_user_id,
            "email": req.email or f"{req.clerk_user_id}@placeholder.com",
            "full_name": req.full_name,
            "role": req.role
        }
        result = db.table("users").upsert(payload, on_conflict="clerk_user_id").execute()
        return {"status": "success", "user": result.data[0] if result.data else payload}
    except Exception as e:
        print(f"❌ Auth Sync Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/auth/me")
async def get_me():
    return {"status": "ok", "role": "employee"}

@router.get("/users/me/{clerk_id}")
async def get_user(clerk_id: str):
    try:
        db = get_db()
        result = db.table("users").select("*").eq("clerk_user_id", clerk_id).single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/users/{clerk_id}/role")
async def update_role(clerk_id: str, req: RoleUpdateRequest):
    try:
        db = get_db()
        result = db.table("users").update({"role": req.role}).eq("clerk_user_id", clerk_id).execute()
        return {"message": "Role updated", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
