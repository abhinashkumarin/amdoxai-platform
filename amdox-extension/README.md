# Amdox AI Chrome Extension — Setup Guide

## Folder Structure
```
amdox-extension/
├── manifest.json              ← Extension config
├── background/
│   └── service_worker.js      ← Main brain (all-day monitoring)
├── content/
│   └── content.js             ← Runs in every webpage
├── popup/
│   ├── popup.html             ← Extension popup UI
│   └── popup.js               ← Popup logic
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Step 1 — Backend mein EOD Router Add Karo

`D:\amdox-project\backend\api\routers\` mein `eod.py` banao
(eod_router.py ka content paste karo)

`D:\amdox-project\backend\api\main.py` mein add karo:
```python
from api.routers import eod
app.include_router(eod.router, prefix="/api", tags=["EOD"])
```

## Step 2 — Icons Banao

`icons/` folder mein 3 PNG files chahiye.
Online: https://favicon.io/ pe "AI" text se generate karo
Save as: icon16.png, icon48.png, icon128.png

## Step 3 — Chrome mein Load Karo

1. Chrome browser open karo
2. URL bar mein type karo: chrome://extensions
3. Top-right mein "Developer mode" ON karo
4. "Load unpacked" button click karo
5. `amdox-extension/` folder select karo
6. Extension load ho jayega ✅

## Step 4 — Backend Start Karo

```powershell
cd D:\amdox-project\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
```

## Step 5 — Extension Use Karo

1. Chrome mein extension icon click karo (top-right)
2. "▶ START MONITORING" click karo
3. Camera permission → Allow
4. Kaam karo — extension silently monitor karega

## How It Works

```
Employee kaam karta hai
        ↓
Every 30 seconds → Face scan (3 frames → accurate result)
        ↓
Jab bhi text type kare → 8 sec baad analyze
        ↓
Sab data Supabase mein save
        ↓
Sham 6 baje OR "Send Report" click → HR ko Gmail
```

## EOD Email Example

```
Subject: 📊 Daily Emotion Report | Avinash Kumar | Saturday, 28 Feb 2026

AMDOX AI — DAILY EMPLOYEE EMOTION REPORT

Employee  : Avinash Kumar
Date      : Saturday, 28 Feb 2026
Work Hours: 8.5 hours
Status    : ✅ Normal Day

EMOTION SUMMARY
  Dominant Mood : Neutral
  Avg Stress    : 25%
  Total Scans   : 96

EMOTION BREAKDOWN
  😊 Happy    : 30%
  😐 Neutral  : 45%
  😤 Stress   : 15%
  😢 Sad      : 5%
  😠 Angry    : 5%

HOURLY TIMELINE
  09:00 → Happy
  10:00 → Neutral
  11:00 → Stress
  12:00 → Neutral
  ...
```
