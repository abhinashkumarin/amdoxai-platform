from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import os, smtplib, ssl
from email.message import EmailMessage
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
router = APIRouter()

_sb = None

def get_sb():
    global _sb
    if _sb is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if url and key:
            _sb = create_client(url, key)
    return _sb

class EODReport(BaseModel):
    employee_id: str
    org_id: str
    summary: Dict[str, Any]

@router.post("/analytics/eod-report")
async def eod_report(report: EODReport):
    s = report.summary
    _save_to_db(report.employee_id, report.org_id, s)
    _send_eod_email(s)
    return {
        "status": "success",
        "message": "EOD report received",
        "needs_hr_attention": s.get("needs_hr_attention", False)
    }

def _save_to_db(employee_id, org_id, s):
    try:
        sb = get_sb()
        if not sb:
            print("Supabase not configured")
            return
        data = {
            "employee_id": employee_id,
            "org_id": org_id,
            "employee_name": s.get("employee_name", "Employee"),
            "work_hours": str(s.get("work_hours", "0")),
            "total_scans": int(s.get("total_scans", 0)),
            "face_scans": int(s.get("face_scans", 0)),
            "text_scans": int(s.get("text_scans", 0)),
            "dominant_emotion": s.get("dominant_emotion", "Neutral"),
            "avg_stress_pct": int(s.get("avg_stress_pct", 0)),
            "distribution_pct": s.get("distribution_pct", {}),
            "timeline": s.get("timeline", []),
            "needs_hr_attention": bool(s.get("needs_hr_attention", False)),
        }
        sb.table("eod_reports").insert(data).execute()
        print("✅ EOD report saved to DB")
    except Exception as e:
        print(f"❌ DB save error: {e}")

def _send_eod_email(s):
    email    = os.getenv("SMTP_EMAIL")
    password = os.getenv("SMTP_PASSWORD")
    hr_email = os.getenv("HR_EMAIL")
    if not all([email, password, hr_email]):
        print("⚠️ Email config missing")
        return
    dist_pct = s.get("distribution_pct", {})
    timeline_str = ""
    for t in s.get("timeline", []):
        timeline_str += f"  {t['hour']:02d}:00 → {t['dominant']}\n"
    needs_attention = s.get("needs_hr_attention", False)
    alert_flag = "REQUIRES ATTENTION" if needs_attention else "Normal Day"
    msg = EmailMessage()
    msg["From"]    = email
    msg["To"]      = hr_email
    msg["Subject"] = f"Daily Emotion Report | {s.get('employee_name','Employee')} | {s.get('date','Today')}"
    msg.set_content(f"""
AMDOX AI DAILY EMPLOYEE EMOTION REPORT

Employee   : {s.get('employee_name', 'Employee')}
Date       : {s.get('date', datetime.now().strftime('%Y-%m-%d'))}
Work Hours : {s.get('work_hours', 0)} hours
Status     : {alert_flag}

EMOTION SUMMARY
Dominant Mood : {s.get('dominant_emotion', 'Neutral')}
Avg Stress    : {s.get('avg_stress_pct', 0)}%
Total Scans   : {s.get('total_scans', 0)}
Face Scans    : {s.get('face_scans', 0)}
Text Scans    : {s.get('text_scans', 0)}

EMOTION BREAKDOWN
Happy    : {dist_pct.get('Happy', 0)}%
Stress   : {dist_pct.get('Stress', 0)}%
Neutral  : {dist_pct.get('Neutral', 0)}%
Sad      : {dist_pct.get('Sad', 0)}%
Angry    : {dist_pct.get('Angry', 0)}%
Fear     : {dist_pct.get('Fear', 0)}%
Surprise : {dist_pct.get('Surprise', 0)}%

HOURLY TIMELINE
{timeline_str if timeline_str else 'No timeline data'}

{'ACTION REQUIRED: Employee showed elevated stress.' if needs_attention else 'Employee had a normal working day.'}

Amdox AI Emotion Intelligence System
""")
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(email, password)
            server.send_message(msg)
        print("✅ EOD Email Sent to HR")
    except Exception as e:
        print(f"❌ Email failed: {e}")