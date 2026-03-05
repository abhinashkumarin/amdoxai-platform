# 🧠 AmdoxAI — Emotion Intelligence for Modern HR

> AI-powered multi-tenant SaaS platform that detects employee emotional states through **text, voice, and facial analysis** — giving HR teams proactive insights before burnout happens.

![AmdoxAI Banner](./image.png)

---

## 🚀 Live Demo

| Interface | URL |
|---|---|
| Web App | `http://localhost:5173` |
| API Docs | `http://127.0.0.1:8000/docs` |
| Chrome Extension | Load unpacked from `amdox-extension/` |

---

## 🏗 Project Structure

```
amdox-project/
├── backend/                        # FastAPI Python backend
│   ├── .env                        # Environment variables
│   ├── requirements.txt
│   ├── venv/
│   └── api/
│       ├── main.py                 # FastAPI app + CORS + WebSocket
│       ├── database.py             # Supabase client
│       ├── routers/
│       │   ├── emotion.py          # POST /api/emotion/text|voice|face
│       │   ├── analytics.py        # GET /api/analytics/* + EOD report
│       │   └── users.py            # Clerk auth sync
│       └── services/
│           ├── emotion_service.py  # AI: TextBlob + DeepFace + wav2vec2
│           └── db_service.py       # Supabase saves + stress monitoring + Gmail
│
├── frontend/                       # React 18 + Vite frontend
│   ├── .env
│   ├── public/
│   │   ├── logo.svg                # ← Place amdox-logo.svg here
│   │   ├── icon-192.png            # ← PWA icon 192x192
│   │   ├── icon-512.png            # ← PWA icon 512x512
│   │   └── manifest.json           # ← PWA manifest
│   └── src/
│       ├── main.jsx                # ClerkProvider + BrowserRouter
│       ├── App.jsx                 # Routes: /sign-in /sign-up /employee /analytics /admin
│       ├── index.css
│       ├── pages/
│       │   ├── LandingPage.jsx     # ← Main landing page (this file)
│       │   ├── EmotionInput.jsx    # Employee dashboard (4 tabs)
│       │   ├── Analytics.jsx       # HR dashboard
│       │   ├── AdminDashboard.jsx
│       │   └── Login.jsx
│       ├── components/
│       │   ├── CameraCapture.jsx   # All-day face monitoring
│       │   ├── DailyReport.jsx     # HR heatmap + alerts
│       │   ├── EmotionResult.jsx
│       │   ├── VoiceRecorder.jsx
│       │   └── Layout.jsx
│       └── api/
│           └── client.js
│
├── amdox-extension/                # Chrome Extension
│   ├── manifest.json
│   ├── background/
│   │   └── service_worker.js       # Auto face scan + EOD report
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── content/
│   │   └── content.js
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
│
├── supabase_schema.sql             # Database schema
├── SETUP.md
└── README.md
```

---

## 🧠 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   USER INTERFACES                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  Web App     │  │  HR Dashboard│  │  Chrome   │ │
│  │  (Employee)  │  │  (Analytics) │  │ Extension │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
└─────────┼─────────────────┼────────────────┼────────┘
          │                 │                │
          └─────────────────▼────────────────┘
                    FastAPI Backend :8000
                  ┌─────────────────────┐
                  │  /api/emotion/text  │ ← TextBlob + Keywords
                  │  /api/emotion/voice │ ← wav2vec2 HuggingFace
                  │  /api/emotion/face  │ ← DeepFace
                  │  /api/analytics/*   │ ← Mood + Alerts + EOD
                  │  WebSocket /ws/*    │ ← Real-time HR alerts
                  └──────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │  Supabase PostgreSQL │
                  │  ┌───────────────┐  │
                  │  │ organizations │  │
                  │  │ employees     │  │
                  │  │ emotion_logs  │  │
                  │  │ stress_alerts │  │
                  │  │ eod_reports   │  │
                  │  └───────────────┘  │
                  └─────────────────────┘
```

---

## 🔌 Chrome Extension Flow

```
Install Extension
      ↓
Login via Clerk (opens localhost:5173/sign-in)
      ↓
Start Work Session (set name, designation, duration)
      ↓
Auto Face Scan every 30 seconds (background)
      ↓
AI detects emotion → saves to Supabase
      ↓
Stress threshold crossed? → Browser notification + HR email
      ↓
6 PM → EOD report auto-sent to HR
      ↓
Offline? → Queue locally → Sync when backend online
```

---

## 🤖 AI Models Used

| Modality | Model | Library |
|---|---|---|
| Text | Custom Keyword + TextBlob | `textblob` |
| Voice | `superb/wav2vec2-base-superb-er` | `transformers` |
| Face | DeepFace (RetinaFace detection) | `deepface` |

---

## 🗄 Database Schema

```sql
organizations  → id, name, plan_type
employees      → id, organization_id, name, email, department, role
users          → id, clerk_user_id, email, role, organization_id
emotion_logs   → id, employee_id, organization_id, emotion, confidence, stress_level, source, metadata
stress_alerts  → id, employee_id, organization_id, dominant_emotion, stress_score, status
eod_reports    → id, employee_id, organization_id, report_date, dominant_emotion, avg_stress_pct, raw_summary
```

---

## ⚡ Quick Start

### Backend
```powershell
cd D:\amdox-project\backend
.\venv\Scripts\Activate.ps1
pip install tf-keras  # if needed
python -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend
```powershell
cd D:\amdox-project\frontend
npm install
npm run dev
# → http://localhost:5173
```

### Chrome Extension
```
chrome://extensions → Developer mode ON
→ Load unpacked → Select amdox-extension/ folder
→ Click extension icon → Login → Start Monitoring
```

---

## 🔐 Environment Variables

### Backend `.env`
```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your_service_role_key
SMTP_EMAIL=your@gmail.com
SMTP_PASSWORD=16-char-app-password
HR_EMAIL=hr@company.com
```

### Frontend `.env`
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_WS_URL=ws://127.0.0.1:8000
```

---

## 📱 Add to Home Screen (PWA)

1. Open `http://localhost:5173` on mobile Chrome
2. Tap 3-dot menu → **Add to Home Screen**
3. App icon appears on home screen
4. Opens like native app with splash screen

For the icon to show:
- Place `amdox-logo.svg` → `frontend/public/logo.svg`
- Place `icon-192.png` and `icon-512.png` → `frontend/public/`
- Ensure `frontend/public/manifest.json` is configured

---

## 👨‍💻 Built By

**Abhinash Kumar**
- 🌐 Portfolio: [your-portfolio.com](https://your-portfolio.com)
- 💼 LinkedIn: [linkedin.com/in/your-profile](https://linkedin.com/in/your-profile)
- 🐱 GitHub: [github.com/your-username](https://github.com/your-username)
- 📸 Instagram: [@your-handle](https://instagram.com/your-handle)

---

## 📄 License

MIT © 2025 Abhinash Kumar