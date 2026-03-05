import os
import smtplib
import ssl
from email.message import EmailMessage
from datetime import datetime
from api.database import get_db
from dotenv import load_dotenv

load_dotenv()

DEFAULT_ORG = "00000000-0000-0000-0000-000000000001"
DEFAULT_EMP = "00000000-0000-0000-0000-000000000001"

STRESS_HISTORY = {}
STRESS_THRESHOLD = 3.5

def safe_id(val):
    if not val or str(val) in ("default", ""):
        return DEFAULT_EMP
    return str(val)

def save_emotion_log(data: dict):
    try:
        db = get_db()
        result = db.table("emotion_logs").insert(data).execute()

        emp_id = data.get("employee_id", DEFAULT_EMP)
        emotion = data.get("emotion", "Neutral")
        confidence = data.get("confidence", 0.5)

        _update_stress(emp_id, emotion, confidence, data.get("organization_id", DEFAULT_ORG), data.get("source", "TEXT"))

        return result.data
    except Exception as e:
        print(f"❌ DB Error: {e}")
        return None

def _update_stress(emp_id, emotion, confidence, org_id, source):
    if emp_id not in STRESS_HISTORY:
        STRESS_HISTORY[emp_id] = []

    if emotion in ["Stress", "Sad", "Angry", "Fear"]:
        confidence = max(confidence, 0.7)

    STRESS_HISTORY[emp_id].append((emotion, confidence))

    if len(STRESS_HISTORY[emp_id]) > 10:
        STRESS_HISTORY[emp_id].pop(0)

    score = sum(c for e, c in STRESS_HISTORY[emp_id] if e in ["Stress", "Sad", "Angry", "Fear"])

    print(f"Stress Score for {emp_id}: {score}")

    if score >= STRESS_THRESHOLD:
        _create_stress_alert(emp_id, org_id, emotion, score, source)
        STRESS_HISTORY[emp_id] = []

def _create_stress_alert(emp_id, org_id, emotion, score, source):
    try:
        db = get_db()
        alert = {
            "employee_id": safe_id(emp_id),
            "organization_id": safe_id(org_id),
            "dominant_emotion": emotion,
            "severity_score": round(score, 2),
            "stress_score": round(score, 2),
            "status": "pending",
            "message": f"Employee stress detected via {source}. Score: {score:.1f}"
        }
        db.table("stress_alerts").insert(alert).execute()
        print(f"🚨 Stress alert created for {emp_id}")
        _send_hr_email(emp_id, emotion, score, source)
    except Exception as e:
        print(f"❌ Alert creation error: {e}")

def _send_hr_email(emp_id, emotion, score, source):
    try:
        email = os.getenv("SMTP_EMAIL")
        password = os.getenv("SMTP_PASSWORD")
        hr_email = os.getenv("HR_EMAIL")

        if not all([email, password, hr_email]):
            print("⚠️ Email config missing — skipping HR email")
            return

        msg = EmailMessage()
        msg["From"] = email
        msg["To"] = hr_email
        msg["Subject"] = f"🚨 STRESS ALERT | Employee {emp_id[:8]}"
        msg.set_content(f"""
AMDOX AI — EMPLOYEE STRESS ALERT

Employee ID : {emp_id}
Source      : {source}
Emotion     : {emotion}
Stress Score: {score:.1f}
Time        : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Action Required:
• Immediate HR check-in with employee
• Review current workload and deadlines
• Provide mental health / wellness support

— Amdox AI Emotion Intelligence System
""")
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(email, password)
            server.send_message(msg)
        print("✅ HR Email Sent")
    except Exception as e:
        print(f"❌ Email error: {e}")


# ✅ Public wrapper — analytics.py ke liye (EOD email)
def send_hr_email(emp_id, emotion, score, source):
    """Public wrapper for _send_hr_email — for external imports"""
    _send_hr_email(emp_id, emotion, score, source)