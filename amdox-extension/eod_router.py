from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os, smtplib, ssl
from email.message import EmailMessage
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

class EODReport(BaseModel):
    employee_id: str
    org_id: str
    summary: Dict[str, Any]

@router.post("/analytics/eod-report")
async def eod_report(report: EODReport):
    try:
        s = report.summary
        _send_eod_email(s)
        return {"status": "success", "message": "EOD report sent to HR"}
    except Exception as e:
        print(f"EOD Report Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def _send_eod_email(s: dict):
    email    = os.getenv("SMTP_EMAIL")
    password = os.getenv("SMTP_PASSWORD")
    hr_email = os.getenv("HR_EMAIL")

    if not all([email, password, hr_email]):
        print("⚠️ Email config missing")
        return

    dist_pct = s.get("distribution_pct", {})
    timeline = s.get("timeline", [])

    timeline_str = ""
    for t in timeline:
        timeline_str += f"  {t['hour']:02d}:00 → {t['dominant']}\n"

    needs_attention = s.get("needs_hr_attention", False)
    alert_flag = "🚨 REQUIRES ATTENTION" if needs_attention else "✅ Normal Day"

    msg = EmailMessage()
    msg["From"]    = email
    msg["To"]      = hr_email
    msg["Subject"] = f"📊 Daily Emotion Report | {s.get('employee_name','Employee')} | {s.get('date','Today')}"

    msg.set_content(f"""
╔══════════════════════════════════════════════════════════╗
   AMDOX AI — DAILY EMPLOYEE EMOTION REPORT
╚══════════════════════════════════════════════════════════╝

👤 Employee    : {s.get('employee_name', 'Employee')}
📅 Date        : {s.get('date', datetime.now().strftime('%Y-%m-%d'))}
⏱  Work Hours  : {s.get('work_hours', 0)} hours
🎯 Status      : {alert_flag}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 EMOTION SUMMARY
──────────────────
  Dominant Mood  : {s.get('dominant_emotion', 'Neutral')}
  Avg Stress     : {s.get('avg_stress_pct', 0)}%
  Total Scans    : {s.get('total_scans', 0)}
  • Face Scans   : {s.get('face_scans', 0)}
  • Text Scans   : {s.get('text_scans', 0)}
  • Voice Scans  : {s.get('voice_scans', 0)}

📈 EMOTION BREAKDOWN
────────────────────
  😊 Happy    : {dist_pct.get('Happy', 0)}%
  😤 Stress   : {dist_pct.get('Stress', 0)}%
  😐 Neutral  : {dist_pct.get('Neutral', 0)}%
  😢 Sad      : {dist_pct.get('Sad', 0)}%
  😠 Angry    : {dist_pct.get('Angry', 0)}%
  😨 Fear     : {dist_pct.get('Fear', 0)}%
  😲 Surprise : {dist_pct.get('Surprise', 0)}%

🕐 HOURLY TIMELINE
──────────────────
{timeline_str if timeline_str else '  No timeline data'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{'⚠️  ACTION REQUIRED: Employee showed elevated stress levels today.' if needs_attention else '✅ Employee had a normal working day.'}

— Amdox AI Emotion Intelligence System
  Automated Daily Report
""")

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(email, password)
        server.send_message(msg)
    print("✅ EOD Email Sent to HR")
