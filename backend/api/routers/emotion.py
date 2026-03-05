from deepface import DeepFace
import base64
from fastapi import APIRouter, Body, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from api.services.emotion_service import analyze_text, analyze_face, analyze_voice
from api.services.db_service import save_emotion_log, safe_id

router = APIRouter()

DEFAULT_ID = "00000000-0000-0000-0000-000000000001"

class TextRequest(BaseModel):
    text: str
    employee_id: Optional[str] = DEFAULT_ID
    org_id: Optional[str] = DEFAULT_ID
    stress_level: Optional[float] = 0.0

@router.post("/emotion/text")
async def emotion_text(req: TextRequest):
    try:
        result = analyze_text(req.text)
        log = {
            "employee_id": safe_id(req.employee_id),
            "organization_id": safe_id(req.org_id),
            "emotion": result["emotion"],
            "confidence": result["confidence"],
            "stress_level": result["stress_level"],
            "source": "TEXT",
            "metadata": {"text_preview": req.text[:100]}
        }
        save_emotion_log(log)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/emotion/face")
async def emotion_face(data: dict = Body(...)):
    try:
        image = data.get("image", "")
        if not image:
            raise HTTPException(status_code=400, detail="Image missing")

        result = analyze_face(image)
        log = {
            "employee_id": safe_id(data.get("employee_id")),
            "organization_id": safe_id(data.get("org_id")),
            "emotion": result["emotion"],
            "confidence": result["confidence"],
            "stress_level": result["stress_level"],
            "source": "FACE",
            "metadata": {}
        }
        save_emotion_log(log)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/emotion/voice")
async def emotion_voice(
    audio: UploadFile = File(...),
    employee_id: Optional[str] = Form(DEFAULT_ID),
    org_id: Optional[str] = Form(DEFAULT_ID)
):
    try:
        audio_bytes = await audio.read()
        result = analyze_voice(audio_bytes)
        log = {
            "employee_id": safe_id(employee_id),
            "organization_id": safe_id(org_id),
            "emotion": result["emotion"],
            "confidence": result["confidence"],
            "stress_level": result["stress_level"],
            "source": "VOICE",
            "metadata": {"filename": audio.filename}
        }
        save_emotion_log(log)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
