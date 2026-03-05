# AMDOX AI — COMPLETE SETUP GUIDE
# ============================================================

## FOLDER STRUCTURE

D:\FullStack\
├── backend\
│   ├── api\
│   │   ├── routers\
│   │   │   ├── emotion.py       ← Text/Face/Voice endpoints
│   │   │   ├── analytics.py     ← HR Dashboard data
│   │   │   └── users.py         ← Auth sync endpoints
│   │   ├── services\
│   │   │   ├── emotion_service.py  ← AI logic (text/face/voice)
│   │   │   └── db_service.py       ← Supabase + email alerts
│   │   ├── database.py          ← Supabase client
│   │   └── main.py              ← FastAPI app + CORS + WebSocket
│   ├── .env                     ← Backend secrets
│   └── requirements.txt
│
└── frontend\
    ├── src\
    │   ├── api\
    │   │   └── client.js        ← Axios API calls
    │   ├── components\
    │   │   ├── Layout.jsx       ← Sidebar + navigation
    │   │   ├── CameraCapture.jsx← Webcam + green grid overlay
    │   │   ├── VoiceRecorder.jsx← MediaRecorder audio
    │   │   └── EmotionResult.jsx← Result display card
    │   ├── pages\
    │   │   ├── EmotionInput.jsx ← Employee: Text/Voice/Face tabs
    │   │   ├── Analytics.jsx    ← HR: Charts + Alerts
    │   │   ├── AdminDashboard.jsx← Admin: All logs
    │   │   └── Login.jsx        ← Clerk sign in
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── package.json
    ├── vite.config.js
    └── index.html

## STEP 1 — SUPABASE SETUP
1. Go to https://supabase.com/dashboard
2. Open your project → SQL Editor → New Query
3. Paste entire supabase_schema.sql content → Run

## STEP 2 — BACKEND SETUP

cd D:\FullStack\backend
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install packages (in order)
pip install "numpy==1.26.4"
pip install "opencv-python==4.8.0.76"
pip install fastapi uvicorn python-multipart supabase python-dotenv
pip install textblob deepface transformers torch torchaudio
pip install librosa soundfile websockets httpx Pillow pydantic

# Download textblob data
python -m textblob.download_corpora

## STEP 3 — BACKEND .env FILE
# Edit D:\FullStack\backend\.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
SMTP_EMAIL=your-gmail@gmail.com
SMTP_PASSWORD=your-16-char-app-password
HR_EMAIL=hr@yourcompany.com

## STEP 4 — RUN BACKEND
cd D:\FullStack\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload

# Verify: http://127.0.0.1:8000/docs

## STEP 5 — FRONTEND SETUP

cd D:\FullStack\frontend
npm install axios framer-motion lucide-react recharts react-router-dom @clerk/clerk-react

## STEP 6 — FRONTEND .env FILE
# Edit D:\FullStack\frontend\.env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_WS_URL=ws://127.0.0.1:8000

## STEP 7 — RUN FRONTEND
cd D:\FullStack\frontend
npm run dev

# App opens at: http://localhost:5173

## GMAIL APP PASSWORD SETUP
1. Google Account → Security → 2-Step Verification ON
2. App passwords → Select app: Mail → Generate
3. Copy 16-char password → paste in SMTP_PASSWORD

## TEST ENDPOINTS (Swagger)
http://127.0.0.1:8000/docs

POST /api/emotion/text
{
  "text": "I am very stressed and overwhelmed",
  "employee_id": "00000000-0000-0000-0000-000000000001",
  "org_id": "00000000-0000-0000-0000-000000000001"
}

GET /api/analytics/mood?org_id=00000000-0000-0000-0000-000000000001
GET /api/analytics/stress-alerts?org_id=00000000-0000-0000-0000-000000000001

## FEATURES IMPLEMENTED
✅ Text emotion analysis (Hinglish + English)
✅ Voice emotion (wav2vec2 model)
✅ Face emotion (DeepFace)
✅ Real-time green grid camera overlay
✅ Auto-analyze face every 3 seconds
✅ Stress monitoring (threshold-based)
✅ HR email alerts (Gmail SMTP)
✅ Supabase multi-tenant database
✅ Clerk authentication
✅ WebSocket real-time alerts
✅ Emotion distribution charts (Recharts)
✅ Daily stress trend chart
✅ Alert status management (pending/reviewed/resolved)
✅ Task suggestion based on emotion

# 🚀 AMDOX AI — Complete Setup Guide

## Prerequisites Check

Before starting, make sure these are installed:

| Tool | Version | Check Command |
|---|---|---|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | Any | `git --version` |

---

## STEP 1 — Project Folder Structure

```
D:\amdox-project\
├── backend\
│   ├── venv\
│   ├── .env
│   ├── requirements.txt
│   └── api\
│       ├── main.py
│       ├── database.py
│       ├── routers\
│       │   ├── emotion.py
│       │   ├── analytics.py
│       │   └── users.py
│       └── services\
│           ├── emotion_service.py
│           └── db_service.py
│
├── frontend\
│   ├── public\
│   │   ├── logo.svg          ← amdox-logo.svg rename karke
│   │   ├── icon-16.png
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── manifest.json
│   ├── src\
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── pages\
│   │   │   ├── LandingPage.jsx
│   │   │   ├── EmotionInput.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── Login.jsx
│   │   ├── components\
│   │   │   ├── CameraCapture.jsx
│   │   │   ├── DailyReport.jsx
│   │   │   ├── EmotionResult.jsx
│   │   │   ├── VoiceRecorder.jsx
│   │   │   └── Layout.jsx
│   │   └── api\
│   │       └── client.js
│   ├── index.html
│   ├── .env
│   └── package.json
│
├── amdox-extension\
│   ├── manifest.json
│   ├── background\
│   │   └── service_worker.js
│   ├── popup\
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   └── icons\
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
│
├── supabase_schema.sql
└── README.md
```

---

## STEP 2 — Supabase Database Setup

### 2.1 Account Banao
1. `https://supabase.com` → Sign Up (GitHub se)
2. New Project banao → naam: `amdox-ai`
3. Database password note karo
4. Region: Southeast Asia (Singapore)
5. Wait 2 minutes for project to spin up

### 2.2 Schema Run Karo
1. Left sidebar → **SQL Editor**
2. `supabase_schema.sql` ka content paste karo
3. **Run** button click karo
4. Green checkmark aana chahiye ✅

### 2.3 Test Data Insert Karo
SQL Editor mein yeh run karo:
```sql
INSERT INTO organizations (id, name, plan_type)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Organization', 'free')
ON CONFLICT DO NOTHING;

INSERT INTO employees (id, organization_id, name, email, department, role)
VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
        'Test Employee', 'test@amdox.com', 'Engineering', 'employee')
ON CONFLICT DO NOTHING;
```

### 2.4 Keys Copy Karo
1. Left sidebar → **Settings** → **API**
2. Copy **Project URL** → `SUPABASE_URL`
3. Copy **service_role** key (scroll down) → `SUPABASE_KEY`

> ⚠️ `anon` key nahi — **service_role** key use karo

---

## STEP 3 — Clerk Authentication Setup

### 3.1 Account Banao
1. `https://clerk.com` → Sign Up
2. New Application → naam: `amdox-ai`
3. Enable: **Email**, **Google**, **GitHub** login

### 3.2 Keys Copy Karo
1. Dashboard → **API Keys**
2. Copy **Publishable Key** → `VITE_CLERK_PUBLISHABLE_KEY`
3. Copy **Secret Key** → `CLERK_SECRET_KEY`

### 3.3 Allowed URLs Set Karo
1. Dashboard → **Domains**
2. Add: `http://localhost:5173`
3. Add: `http://localhost:3000`

---

## STEP 4 — Gmail App Password Setup

### 4.1 Google 2FA Enable Karo
1. `https://myaccount.google.com`
2. Security → **2-Step Verification** → Turn On

### 4.2 App Password Generate Karo
1. Security → **App passwords** (search karo)
2. Select app: **Mail**
3. Select device: **Windows Computer**
4. **Generate** click karo
5. 16-character password copy karo (spaces hatao)

---

## STEP 5 — Backend Setup

### 5.1 Virtual Environment Banao
```powershell
cd D:\amdox-project\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 5.2 Dependencies Install Karo
```powershell
pip install fastapi uvicorn supabase python-dotenv
pip install deepface tf-keras
pip install textblob
pip install transformers torch --index-url https://download.pytorch.org/whl/cpu
pip install soundfile librosa
pip install numpy==1.23.5
pip install opencv-python==4.8.0.76
```

> ⚠️ Agar numpy/opencv error aaye:
> ```powershell
> pip uninstall numpy opencv-python -y
> pip install numpy==1.23.5
> pip install opencv-python==4.8.0.76
> ```

### 5.3 .env File Banao
`D:\amdox-project\backend\.env` file banao:
```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGci...your_service_role_key_here
SMTP_EMAIL=yourgmail@gmail.com
SMTP_PASSWORD=abcdabcdabcdabcd
HR_EMAIL=hr@yourcompany.com
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx
```

### 5.4 Backend Start Karo
```powershell
cd D:\amdox-project\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
```

Expected output:
```
✅ DeepFace loaded successfully
INFO: Uvicorn running on http://127.0.0.1:8000
INFO: Application startup complete.
```

### 5.5 Backend Test Karo
Browser mein kholo: `http://127.0.0.1:8000/docs`
Swagger UI dikhni chahiye ✅

---

## STEP 6 — Frontend Setup

### 6.1 Dependencies Install Karo
```powershell
cd D:\amdox-project\frontend
npm install
```

### 6.2 .env File Banao
`D:\amdox-project\frontend\.env` file banao:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_WS_URL=ws://127.0.0.1:8000
```

### 6.3 Public Files Place Karo
```
logo.svg      → D:\amdox-project\frontend\public\logo.svg
icon-16.png   → D:\amdox-project\frontend\public\icon-16.png
icon-192.png  → D:\amdox-project\frontend\public\icon-192.png
icon-512.png  → D:\amdox-project\frontend\public\icon-512.png
manifest.json → D:\amdox-project\frontend\public\manifest.json
```

### 6.4 index.html Replace Karo
```
index.html → D:\amdox-project\frontend\index.html
```

### 6.5 Frontend Start Karo
```powershell
cd D:\amdox-project\frontend
npm run dev
```

Expected output:
```
VITE v5.x  ready in 500ms
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

### 6.6 Browser mein kholo
```
http://localhost:5173
```
Landing Page dikhni chahiye ✅

---

## STEP 7 — Chrome Extension Setup

### 7.1 Icons Place Karo
```
icon-16.png  → D:\amdox-project\amdox-extension\icons\icon16.png
icon-192.png → D:\amdox-project\amdox-extension\icons\icon48.png  (rename)
icon-512.png → D:\amdox-project\amdox-extension\icons\icon128.png (rename)
```

### 7.2 Chrome mein Load Karo
1. Chrome mein kholo: `chrome://extensions`
2. Top right: **Developer mode** ON karo
3. **Load unpacked** click karo
4. Folder select karo: `D:\amdox-project\amdox-extension`
5. **AmdoxAI** extension list mein dikhega ✅

### 7.3 Extension Use Karo
1. Extension icon click karo (puzzle piece → pin AmdoxAI)
2. **"Open App to Login"** click karo
3. `localhost:5173/sign-in` tab khulega
4. Clerk se login karo (Google account)
5. Extension popup wapas kholo
6. Session setup karo → **START MONITORING**

---

## STEP 8 — Mobile PWA Setup

### 8.1 PC ka IP Pata Karo
```powershell
ipconfig
# Note: IPv4 Address (e.g., 192.168.1.5)
```

### 8.2 Frontend Network Pe Run Karo
```powershell
cd D:\amdox-project\frontend
npm run dev -- --host
```

### 8.3 Phone Pe Add Karo
1. Phone ke Chrome mein kholo: `http://192.168.1.5:5173`
2. 3-dot menu (⋮) → **Add to Home Screen**
3. Naam: **AmdoxAI** → **Add**
4. Home screen pe icon aayega ✅

---

## STEP 9 — Full System Test

### Backend Test (Swagger UI)
```
http://127.0.0.1:8000/docs
```

**Text emotion test:**
```json
POST /api/emotion/text
{
  "text": "Bahut zyada tension hai aaj, deadline aa rahi hai",
  "employee_id": "00000000-0000-0000-0000-000000000001",
  "org_id": "00000000-0000-0000-0000-000000000001"
}
```
Expected: `{"emotion": "Stress", "confidence": 0.85, ...}` ✅

**Analytics test:**
```
GET /api/analytics/mood?org_id=00000000-0000-0000-0000-000000000001
```
Expected: `{"status": "success", "data": {...}}` ✅

### Frontend Test
```
http://localhost:5173          → Landing Page ✅
http://localhost:5173/sign-in  → Clerk Login ✅
http://localhost:5173/employee → Employee Dashboard (after login) ✅
http://localhost:5173/analytics → HR Dashboard ✅
http://localhost:5173/admin    → Admin Panel ✅
```

### Stress Alert Test
Swagger mein 4 baar yeh send karo:
```json
POST /api/emotion/text
{"text": "I am very stressed and overwhelmed", "employee_id": "00000000-0000-0000-0000-000000000001", "org_id": "00000000-0000-0000-0000-000000000001"}
```
4th request ke baad backend log mein dikhega:
```
🚨 Stress alert created!
✅ HR Email Sent
```
---

## Common Errors & Fixes

| Error | Fix |
|---|---|
| `ModuleNotFoundError: tf_keras` | `pip install tf-keras` |
| `Invalid API key` | `.env` mein `service_role` key use karo, `anon` nahi |
| `employee_id not in table` | Supabase SQL Editor mein test data insert karo |
| `CORS error` | `api/main.py` mein frontend port add karo |
| `Gmail not sending` | 16-char App Password use karo (spaces hata ke) |
| `No routes matched /sign-in` | `App.jsx` mein `/sign-in/*` route add karo |
| Camera not working | Chrome → Settings → Privacy → Camera → Allow localhost |
| Supabase 525 error | Dashboard → "Restore Project" (free tier pause hoti hai) |

---

## Both Servers Ek Saath Start Karo

**Terminal 1 — Backend:**
```powershell
cd D:\amdox-project\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```powershell
cd D:\amdox-project\frontend
npm run dev
```

Then open: `http://localhost:5173` ✅

---

Made with ❤️ by **Abhinash Kumar**