<div align="center">

<img src="https://img.shields.io/badge/AmdoxAI-Emotion%20Intelligence-00F5FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiMwNTBCMTgiLz48L3N2Zz4=" />

# 🧠 AmdoxAI — Emotion Intelligence Platform

### *AI-Powered HR Stress Monitoring & Employee Wellbeing SaaS*

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-amdoxai--platform.vercel.app-00F5FF?style=for-the-badge)](https://amdoxai-platform.vercel.app)
[![Backend](https://img.shields.io/badge/🔧_Backend_API-amdox--backend.onrender.com-4ade80?style=for-the-badge)](https://amdox-backend.onrender.com/docs)
[![API Docs](https://img.shields.io/badge/📖_API_Docs-Swagger_UI-ffd166?style=for-the-badge)](https://amdox-backend.onrender.com/docs)

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15-FF6F00?style=flat-square&logo=tensorflow)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)

---

**Three Month Internship Project · Amdox Technologies · 2026**

*Group 3 | Batch 4.2*

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Problem Statement](#-problem-statement)
3. [Solution Architecture](#-solution-architecture)
4. [Features](#-features)
5. [System Flow Diagram](#-system-flow-diagram)
6. [Tech Stack (Detailed)](#-tech-stack-detailed)
7. [AI Models & How They Work](#-ai-models--how-they-work)
8. [Project Structure](#-project-structure)
9. [Setup & Installation](#-setup--installation)
10. [Environment Variables](#-environment-variables)
11. [API Reference & Testing](#-api-reference--testing)
12. [Chrome Extension](#-chrome-extension)
13. [LinkedIn Post](#-linkedin-post)
14. [Team](#-team)

---

## 🌟 Project Overview

**AmdoxAI** is a full-stack, production-grade, multi-tenant SaaS platform that uses **tri-modal AI** (text + voice + face) to detect employee emotional states in real time and alert HR managers before stress escalates into burnout, resignation, or mental health crises.

Built natively for **Indian workplaces**, AmdoxAI understands **Hinglish** (Hindi-English mixed language), works passively via a **Chrome Extension**, and provides HR teams with a **live analytics dashboard** with stress heatmaps, alerts, and end-of-day reports.

> "76% of Indian employees experience workplace burnout. HR teams have no early warning system. AmdoxAI changes that."

---

## 🔴 Problem Statement

| Metric | Reality |
|--------|---------|
| Employee burnout rate | **76%** in Indian corporate sector |
| Productivity loss | **₹1.8 Lakh Crore** annually |
| HR teams detecting stress early | Only **17%** |
| Average time HR reacts to crisis | **After** resignation or breakdown |

**Core Problem:** HR managers rely on gut feeling and exit interviews — both too late. No tool exists that passively monitors emotional wellbeing using AI in Indian workplace contexts (Hinglish NLP, cultural work patterns).

---

## 💡 Solution Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMPLOYEE LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ Chrome Ext.  │  │  Web Dashboard│  │   Mobile (PWA)     │    │
│  │ (Passive)    │  │  (Active)     │  │   (Future)         │    │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬──────────┘    │
└─────────┼─────────────────┼───────────────────-─┼───────────────┘
          │                 │                      │
          ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND (Python)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐    │
│  │ /emotion/   │  │ /analytics/ │  │   /api/auth/         │    │
│  │ text|voice  │  │ mood|heatmap│  │   Clerk JWT           │    │
│  │ |face       │  │ |logs|alerts│  │   Validation          │    │
│  └──────┬──────┘  └──────┬──────┘  └──────────────────────┘    │
│         │                │                                       │
│  ┌──────▼──────────────────────────────────────────────────┐    │
│  │              TRI-MODAL AI FUSION ENGINE                  │    │
│  │  ┌──────────┐  ┌────────────┐  ┌──────────────────────┐ │    │
│  │  │ TextBlob │  │ wav2vec2   │  │ DeepFace+RetinaFace   │ │    │
│  │  │ NLP      │  │ Transformer│  │ Facial Analysis       │ │    │
│  │  └──────────┘  └────────────┘  └──────────────────────┘ │    │
│  │           Weighted Confidence Fusion (0.0–1.0)           │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌───────────┐  ┌──────────────┐
   │  Supabase   │ │  Redis    │  │  SMTP Email  │
   │ PostgreSQL  │ │ Pub/Sub   │  │  HR Alerts   │
   │  (Multi-    │ │ WebSocket │  │  (aiosmtplib)│
   │   tenant)   │ │  Alerts   │  └──────────────┘
   └─────────────┘ └───────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HR DASHBOARD                                │
│  Live Stress Feed · Heatmaps · Alerts · EOD Reports             │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 👤 Employee Features
- **Text Emotion Check-In** — Type how you feel; AI detects emotion from text (supports Hinglish)
- **Voice Emotion Analysis** — Record voice; wav2vec2 transformer classifies emotional tone
- **Face Emotion Scan** — Webcam capture; DeepFace analyzes micro-expressions
- **Chrome Extension** — Passive face scan every 30 seconds during work sessions
- **Session Tracking** — Work timer, break reminders, end-of-day summary

### 👔 HR Manager Features
- **Real-Time Dashboard** — Live emotion feed via WebSocket
- **Stress Heatmap** — 7-day × 24-hour stress intensity grid
- **Risk Alerts** — Automatic email when employee crosses stress threshold (3.5/5.0)
- **EOD Reports** — Daily summary sent to HR inbox automatically
- **Alert Resolution** — Mark alerts resolved with intervention notes
- **Analytics** — Mood distribution, trend graphs, department-level filtering

### 🏢 Admin Features
- **Multi-Tenant Isolation** — Organizations fully separated via Supabase RLS
- **RBAC** — Role-based access: `employee` / `hr` / `admin`
- **Employee Management** — Add, update, view employees per organization

---

## 🔄 System Flow Diagram

```
EMPLOYEE SUBMITS EMOTION CHECK-IN
         │
         ▼
┌─────────────────────┐
│  Input Modality?    │
└─────────────────────┘
    │         │         │
    ▼         ▼         ▼
  TEXT      VOICE      FACE
    │         │         │
    ▼         ▼         ▼
TextBlob   wav2vec2  DeepFace
  NLP     Transform  +Retina
    │         │         │
    └────┬────┘─────────┘
         ▼
  CONFIDENCE FUSION
  (Weighted Average)
         │
         ▼
  EMOTION DETECTED
  (stress/happy/neutral
   /sad/angry/fear)
         │
         ▼
  STORE IN SUPABASE
  emotion_logs table
         │
         ▼
  UPDATE CUMULATIVE
  STRESS SCORE
         │
    ┌────┴────┐
    ▼         ▼
Score      Score
< 3.5      ≥ 3.5
    │         │
    ▼         ▼
 Normal   TRIGGER ALERT
 Return   ────────────────►  Email HR Manager
            │                WebSocket Push
            ▼                Store in alerts table
       HR Dashboard
       shows 🚨 Alert
```

---

## 🛠 Tech Stack (Detailed)

### 🐍 Backend

| Package | Version | Why Used | How It Works |
|---------|---------|----------|--------------|
| **FastAPI** | 0.111.0 | High-performance async Python web framework | Auto-generates OpenAPI docs, handles concurrent requests via async/await, dependency injection for DB/auth |
| **Uvicorn** | 0.29.0 | ASGI server | Runs FastAPI with WebSocket support, handles `$PORT` from Render |
| **Supabase** | 2.4.6 | PostgreSQL + Auth + Storage | Multi-tenant DB with Row Level Security — each org sees only its data |
| **TensorFlow** | 2.15.0 | Deep learning runtime | Required by DeepFace for facial emotion model inference |
| **DeepFace** | 0.0.93 | Facial emotion analysis | Analyzes 7 emotions from face images using VGG-Face architecture |
| **retina-face** | 0.0.17 | Face detector | Detects face bounding box in image before DeepFace analysis |
| **transformers** | 4.40.0 | Hugging Face model hub | Loads wav2vec2 model for voice emotion classification |
| **torch** | 2.2.2 | PyTorch deep learning | Runtime for wav2vec2 transformer model inference |
| **torchaudio** | 2.2.2 | Audio processing for PyTorch | Resamples audio to 16kHz required by wav2vec2 |
| **TextBlob** | 0.18.0 | NLP sentiment analysis | Extracts polarity/subjectivity from text; combined with keyword dict for Hinglish |
| **librosa** | 0.10.1 | Audio feature extraction | Loads and preprocesses WAV/MP3/WebM audio files |
| **pydub** | 0.25.1 | Audio format conversion | Converts WebM/MP3 to WAV for wav2vec2 processing |
| **soundfile** | 0.12.1 | Audio file I/O | Reads WAV files into numpy arrays |
| **httpx** | 0.27.0 | Async HTTP client | Keep-alive ping to prevent Render free tier sleep |
| **aiosmtplib** | 3.0.1 | Async SMTP email | Sends HR alert emails without blocking API responses |
| **opencv-python-headless** | 4.8.0.76 | Computer vision | Image preprocessing for face analysis (no GUI required on server) |
| **numpy** | 1.26.4 | Numerical computing | Array operations for audio/image processing pipelines |
| **Pillow** | 10.3.0 | Image processing | Base64 image decoding and format conversion |
| **pydantic** | 2.7.0 | Data validation | Request/response schema validation in FastAPI |
| **imagio-ffmpeg** | 0.4.9 | FFmpeg bindings | Audio/video format handling for voice analysis |
| **python-dotenv** | — | Environment variables | Loads `.env` file for local development |

### ⚛️ Frontend

| Package | Why Used |
|---------|----------|
| **React 18** | Concurrent rendering, hooks architecture |
| **Vite 5** | Lightning-fast HMR, optimized production builds |
| **React Router v6** | Client-side routing for SPA |
| **Clerk** | JWT authentication, social login, organization management |
| **Recharts** | Analytics charts and trend graphs |

### 🗄️ Infrastructure

| Service | Purpose |
|---------|---------|
| **Supabase** | PostgreSQL database, Row Level Security, real-time subscriptions |
| **Render.com** | Backend hosting (Python, free tier) |
| **Vercel** | Frontend hosting (React/Vite, CDN) |
| **Redis** | WebSocket pub/sub for real-time alert broadcasting |

---

## 🤖 AI Models & How They Work

### 1. Text Analysis — TextBlob + Keyword Engine
```
Input: "Bahut zyada kaam hai, deadline ka pressure hai"
         │
         ▼
    TextBlob NLP
    polarity: -0.6 (negative)
    subjectivity: 0.8 (subjective)
         │
         ▼
    Hinglish Keyword Dict
    ["deadline", "pressure", "zyada kaam"] → stress keywords found
         │
         ▼
    Weighted Fusion
    Output: { emotion: "stress", confidence: 0.87 }
```

**Supported emotions:** stress, neutral, happy, sad, angry, fear, surprise

**Hinglish keywords supported:** zyada kaam, pressure, deadline, thak gaya, pareshan, upset, bahut mushkil, tension, ...and 50+ more

### 2. Voice Analysis — wav2vec2-base-superb-er
```
Input: Audio file (WAV/MP3/WebM)
         │
         ▼
    pydub → convert to WAV
    librosa → load, resample to 16kHz
         │
         ▼
    facebook/wav2vec2-base-superb-er
    (Hugging Face transformer model)
    Trained on SUPERB Emotion Recognition benchmark
         │
         ▼
    Softmax over 4 classes:
    neutral / happy / angry / sad
         │
         ▼
    Map to 7-class schema + confidence score
```

### 3. Face Analysis — DeepFace + RetinaFace
```
Input: Base64 JPEG/PNG image
         │
         ▼
    Base64 decode → numpy array
         │
         ▼
    RetinaFace detector
    Finds face bounding box
         │
         ▼
    DeepFace (VGG-Face backend)
    Analyzes 7 emotions:
    happy/sad/angry/fear/disgust/surprise/neutral
         │
         ▼
    Returns dominant emotion + all scores
```

### 4. Cumulative Stress Score
```
Every emotion log updates employee's running score:
  stress   → +1.0
  angry    → +0.8
  sad      → +0.6
  fear     → +0.5
  neutral  → +0.0
  surprise → -0.1
  happy    → -0.3

Score decays 10% every hour (time-weighted)
Threshold: 3.5 / 5.0 → triggers HR alert
```

---

## 📁 Project Structure

```
amdoxai-platform/
│
├── 📁 backend/                    # FastAPI Python backend
│   ├── api/
│   │   ├── main.py                # App entry, CORS, routers, keep-alive
│   │   ├── database.py            # Supabase client setup
│   │   ├── auth.py                # Clerk JWT verification
│   │   └── routers/
│   │       ├── emotion.py         # /api/emotion/text|voice|face|logs
│   │       ├── analytics.py       # /api/analytics/mood|heatmap|logs|alerts
│   │       ├── users.py           # /api/auth/sync|me, /api/users/
│   │       └── eod.py             # /api/analytics/eod-report
│   ├── requirements.txt           # All Python dependencies
│   └── .env                       # Backend environment variables
│
├── 📁 frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx       # Landing page
│   │   │   ├── AboutPage.jsx      # About + team credits
│   │   │   ├── ApiDocsPage.jsx    # API documentation
│   │   │   ├── EmployeePage.jsx   # Employee emotion check-in
│   │   │   └── HRDashboard.jsx    # HR analytics dashboard
│   │   ├── components/            # Reusable UI components
│   │   ├── App.jsx                # Router setup
│   │   └── main.jsx               # Entry point
│   ├── .env                       # Frontend environment variables
│   └── vite.config.js
│
└── 📁 amdox-extension/            # Chrome Extension (MV3)
    ├── manifest.json              # Extension manifest
    ├── background.js              # Service worker, session tracking
    ├── content.js                 # Page injection
    ├── popup/
    │   ├── popup.html
    │   └── popup.js               # Extension UI logic
    └── icons/
```

---

## ⚙️ Setup & Installation

### Prerequisites
```bash
Node.js >= 18
Python >= 3.10
Git
```

### 1. Clone Repository
```bash
git clone https://github.com/abhinashkumarin/amdoxai-platform.git
cd amdoxai-platform
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Copy and fill environment variables
cp .env.example .env
# Edit .env with your keys (see Environment Variables section)

# Run backend
uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be available at: `http://127.0.0.1:8000`
Swagger UI: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy and fill environment variables
cp .env.example .env
# Edit .env with your keys

# Run frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### 4. Chrome Extension Setup
```bash
# In Chrome browser:
1. Open chrome://extensions/
2. Enable "Developer Mode" (top right toggle)
3. Click "Load unpacked"
4. Select the amdox-extension/ folder
5. Extension icon appears in toolbar
```

---

## 🔐 Environment Variables

### Backend `.env`
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key

# Clerk Authentication
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# Email Alerts (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
HR_EMAIL=hr@yourcompany.com

# Keep-alive (Render deployment)
BACKEND_URL=https://amdox-backend.onrender.com

# Frontend URL (CORS)
FRONTEND_URL=https://amdoxai-platform.vercel.app

# Hugging Face (wav2vec2 model)
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxx
```

### Frontend `.env`
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
VITE_API_BASE_URL=https://amdox-backend.onrender.com
VITE_WS_URL=wss://amdox-backend.onrender.com
VITE_SUPABASE_KEY=your_supabase_anon_key
```

---

## 📡 API Reference & Testing

> **Base URL (Production):** `https://amdox-backend.onrender.com`
> **Base URL (Local):** `http://127.0.0.1:8000`
> **Interactive Docs:** `https://amdox-backend.onrender.com/docs`

All protected endpoints require:
```
Authorization: Bearer <clerk_jwt_token>
```

---

### 🟢 GET `/health`
Health check — wake backend from sleep.

**Request:**
```bash
curl https://amdox-backend.onrender.com/health
```

**Response 200:**
```json
{
  "status": "ok",
  "service": "amdox-backend"
}
```

---

### 🟢 GET `/`
Root endpoint.

**Response 200:**
```json
{
  "status": "online",
  "message": "Amdox AI Emotion Intelligence API is running",
  "docs": "/docs",
  "version": "2.0.0"
}
```

---

### 🔵 POST `/api/auth/sync`
Sync Clerk user to Supabase on first login.

**Request Body:**
```json
{
  "clerk_id": "user_2abc123def456",
  "email": "avinash@company.com",
  "name": "Avinash Kumar",
  "org_id": "org_xyz789"
}
```

**Response 200:**
```json
{
  "status": "success",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "clerk_id": "user_2abc123def456",
    "email": "avinash@company.com",
    "name": "Avinash Kumar",
    "role": "employee",
    "org_id": "org_xyz789",
    "created_at": "2026-03-05T10:00:00Z"
  }
}
```

---

### 🟢 GET `/api/auth/me`
Get current logged-in user profile.

**Request:**
```bash
curl https://amdox-backend.onrender.com/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "clerk_id": "user_2abc123def456",
  "name": "Avinash Kumar",
  "email": "avinash@company.com",
  "role": "employee",
  "org_id": "org_xyz789"
}
```

---

### 🔵 POST `/api/emotion/text`
Analyze emotion from text (supports Hinglish).

**Request:**
```bash
curl -X POST https://amdox-backend.onrender.com/api/emotion/text \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bahut zyada kaam hai aaj, deadline aa rahi hai aur mujhe samajh nahi aa raha",
    "employee_id": "550e8400-e29b-41d4-a716-446655440000",
    "org_id": "org_xyz789"
  }'
```

**Response 200:**
```json
{
  "status": "success",
  "emotion": "stress",
  "confidence": 0.87,
  "raw_scores": {
    "stress": 0.87,
    "neutral": 0.08,
    "sadness": 0.03,
    "anger": 0.01,
    "fear": 0.01
  },
  "stress_triggered": false,
  "cumulative_score": 2.8,
  "threshold": 3.5,
  "log_id": "log_abc123",
  "timestamp": "2026-03-05T10:28:00Z"
}
```

**Error Responses:**
```json
{ "status": "error", "code": "VALIDATION_ERROR", "message": "Text too short (min 3 chars)" }  // 422
{ "status": "error", "code": "UNAUTHORIZED", "message": "Invalid token" }  // 401
```

---

### 🔵 POST `/api/emotion/voice`
Analyze emotion from audio file.

**Request:**
```bash
curl -X POST https://amdox-backend.onrender.com/api/emotion/voice \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "audio=@recording.wav" \
  -F "employee_id=550e8400-e29b-41d4-a716-446655440000" \
  -F "org_id=org_xyz789"
```

**Response 200:**
```json
{
  "status": "success",
  "emotion": "neutral",
  "confidence": 0.74,
  "duration_seconds": 8.2,
  "model": "wav2vec2-base-superb-er",
  "stress_triggered": false,
  "cumulative_score": 3.1,
  "log_id": "log_def456",
  "timestamp": "2026-03-05T10:30:00Z"
}
```

**Error Responses:**
```json
{ "code": "INVALID_FORMAT", "message": "Invalid audio format. Use WAV, MP3, or WebM" }  // 400
{ "code": "PAYLOAD_TOO_LARGE", "message": "File exceeds 10MB limit" }  // 413
```

---

### 🔵 POST `/api/emotion/face`
Analyze emotion from base64 face image.

**Request:**
```bash
curl -X POST https://amdox-backend.onrender.com/api/emotion/face \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": "/9j/4AAQSkZJRgABAQEA...",
    "employee_id": "550e8400-e29b-41d4-a716-446655440000",
    "org_id": "org_xyz789",
    "source": "dashboard"
  }'
```

**Response 200:**
```json
{
  "status": "success",
  "emotion": "happy",
  "confidence": 0.92,
  "all_emotions": {
    "happy": 0.92,
    "neutral": 0.05,
    "surprise": 0.02,
    "sad": 0.01,
    "angry": 0.0,
    "fear": 0.0,
    "disgust": 0.0
  },
  "face_detected": true,
  "detector": "retinaface",
  "stress_triggered": false,
  "log_id": "log_ghi789",
  "timestamp": "2026-03-05T10:32:00Z"
}
```

**Error Responses:**
```json
{ "code": "NO_FACE", "message": "No face detected in image" }  // 400
{ "code": "IMAGE_TOO_SMALL", "message": "Image must be at least 48x48px" }  // 400
```

---

### 🟢 GET `/api/emotion/logs`
Get paginated emotion logs.

**Request:**
```bash
curl "https://amdox-backend.onrender.com/api/emotion/logs?org_id=org_xyz789&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| org_id | string | ✅ | Organization UUID |
| employee_id | string | ❌ | Filter by employee |
| start_date | string | ❌ | ISO 8601 (2026-03-01) |
| end_date | string | ❌ | ISO 8601 |
| emotion | string | ❌ | Filter by emotion type |
| limit | integer | ❌ | Max 200, default 50 |
| offset | integer | ❌ | Pagination offset |

**Response 200:**
```json
{
  "status": "success",
  "total": 1248,
  "limit": 10,
  "offset": 0,
  "data": [
    {
      "id": "log_abc123",
      "employee_id": "550e8400-...",
      "employee_name": "Avinash Kumar",
      "emotion": "stress",
      "confidence": 0.87,
      "modality": "text",
      "stress_score": 3.5,
      "created_at": "2026-03-05T10:28:00Z"
    }
  ]
}
```

---

### 🟢 GET `/api/analytics/mood`
Organization mood overview.

**Request:**
```bash
curl "https://amdox-backend.onrender.com/api/analytics/mood?org_id=org_xyz789&period=7d" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "period": "7d",
  "summary": {
    "total_logs": 2840,
    "avg_stress_score": 2.3,
    "high_risk_employees": 4,
    "stress_alerts_sent": 7
  },
  "emotion_distribution": {
    "happy": 38.2,
    "neutral": 29.5,
    "stress": 18.4,
    "sad": 7.1,
    "angry": 3.8,
    "fear": 2.2,
    "surprise": 0.8
  },
  "daily_trend": [
    { "date": "2026-02-27", "avg_stress": 1.8, "logs": 320 },
    { "date": "2026-02-28", "avg_stress": 2.1, "logs": 410 },
    { "date": "2026-03-01", "avg_stress": 2.6, "logs": 380 }
  ]
}
```

---

### 🟢 GET `/api/analytics/heatmap`
Hourly stress heatmap (7-day × 24-hour matrix).

**Request:**
```bash
curl "https://amdox-backend.onrender.com/api/analytics/heatmap?org_id=org_xyz789" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "heatmap": {
    "Monday":    [0,0,0,0,0,0,0,0,1.2,1.8,2.4,3.1,2.8,2.2,1.9,2.5,3.2,2.1,1.4,0.8,0,0,0,0],
    "Tuesday":   [0,0,0,0,0,0,0,0,1.1,2.0,2.8,3.4,3.0,2.4,2.0,2.7,3.5,2.3,1.5,0.9,0,0,0,0],
    "Wednesday": [0,0,0,0,0,0,0,0,0.9,1.7,2.2,2.9,2.5,2.0,1.8,2.3,3.0,2.0,1.2,0.7,0,0,0,0],
    "Thursday":  [0,0,0,0,0,0,0,0,1.3,2.1,2.9,3.3,3.1,2.5,2.1,2.8,3.6,2.4,1.6,1.0,0,0,0,0],
    "Friday":    [0,0,0,0,0,0,0,0,1.0,1.8,2.5,3.0,2.7,2.1,1.7,2.2,2.8,1.9,1.1,0.6,0,0,0,0]
  },
  "peak_hour": 16,
  "peak_day": "Thursday",
  "avg_stress": 2.1
}
```

---

### 🟢 GET `/api/analytics/stress-alerts`
Get active stress alerts.

**Request:**
```bash
curl "https://amdox-backend.onrender.com/api/analytics/stress-alerts?org_id=org_xyz789" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 3,
  "data": [
    {
      "id": "alert_abc123",
      "employee_id": "550e8400-...",
      "employee_name": "Rahul Sharma",
      "stress_score": 4.1,
      "trigger_emotion": "stress",
      "severity": "high",
      "email_sent": true,
      "resolved": false,
      "created_at": "2026-03-05T08:45:00Z"
    }
  ]
}
```

---

### 🟡 PATCH `/api/analytics/stress-alerts/{alert_id}`
Resolve a stress alert.

**Request:**
```bash
curl -X PATCH \
  "https://amdox-backend.onrender.com/api/analytics/stress-alerts/alert_abc123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resolved": true,
    "resolution_note": "Spoke with employee. Arranged 2-day leave."
  }'
```

**Response 200:**
```json
{
  "status": "success",
  "alert_id": "alert_abc123",
  "resolved": true,
  "resolved_at": "2026-03-05T14:30:00Z"
}
```

---

### 🔵 POST `/api/analytics/eod-report`
Generate and email end-of-day report.

**Request:**
```bash
curl -X POST https://amdox-backend.onrender.com/api/analytics/eod-report \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "org_xyz789",
    "date": "2026-03-05"
  }'
```

**Response 200:**
```json
{
  "status": "success",
  "report_sent": true,
  "recipients": ["hr@company.com"],
  "summary": {
    "total_checkins": 47,
    "avg_stress": 2.3,
    "alerts_triggered": 2,
    "top_emotion": "neutral"
  }
}
```

---

### WebSocket `/ws/alerts`

Real-time stress alert streaming.

```javascript
const ws = new WebSocket(
  `wss://amdox-backend.onrender.com/ws/alerts?org_id=org_xyz789&token=YOUR_JWT`
)

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)

  if (data.type === 'STRESS_ALERT') {
    // data.employee_name → "Rahul Sharma"
    // data.stress_score  → 4.1
    // data.alert_id      → "alert_abc123"
    showNotification(data)
  }

  if (data.type === 'PING') {
    ws.send(JSON.stringify({ type: 'PONG' }))
  }
}
```

---

## 🔌 Chrome Extension

The **AmdoxAI Chrome Extension** (Manifest V3) provides passive emotion monitoring during work sessions.

### How It Works
```
1. Employee logs in via popup (Clerk auth)
2. Session timer starts automatically
3. Every 30 seconds → background service worker captures webcam frame
4. Frame sent to /api/emotion/face endpoint
5. Result stored in Supabase + HR dashboard updated via WebSocket
6. End of day → EOD report generated automatically
```

### Extension Files

| File | Purpose |
|------|---------|
| `manifest.json` | MV3 manifest, permissions declaration |
| `background.js` | Service worker: timer, auto face scan, offline queue |
| `popup/popup.html` | Extension UI (login, status, session controls) |
| `popup/popup.js` | UI logic, Clerk auth, API calls |
| `content.js` | Injected into pages for DOM interaction |

### Permissions Required
```json
"permissions": ["activeTab", "storage", "alarms", "notifications"],
"host_permissions": ["https://amdox-backend.onrender.com/*"]
```

### Load Extension Locally
```
1. chrome://extensions/
2. Enable Developer Mode
3. Load unpacked → select amdox-extension/ folder
4. Click extension icon → Login with your Amdox account
5. Start Work Session → monitoring begins
```

---

## 💼 LinkedIn Post

> Copy and use this to share your project on LinkedIn:

---

🚀 **Excited to share AmdoxAI — my 3-month internship project at Amdox Technologies!**

Over the past three months, our team built a full-stack AI-powered HR Stress Monitoring Platform from scratch. Here's what we built:

🧠 **Tri-Modal Emotion AI**
— Text analysis with Hinglish NLP (TextBlob + custom keyword engine)
— Voice analysis using Facebook's wav2vec2 transformer
— Facial analysis using DeepFace + RetinaFace detector

🏢 **Production SaaS Platform**
— Multi-tenant architecture with Supabase Row Level Security
— Real-time HR dashboard with WebSocket alerts
— Chrome Extension for passive monitoring (face scan every 30s)
— Automatic email alerts when stress threshold crossed
— End-of-day reports sent to HR inbox

⚡ **Tech Stack:** Python · FastAPI · React 18 · TensorFlow · PyTorch · Supabase · Clerk · Vercel · Render

🔗 **Live Demo:** https://amdoxai-platform.vercel.app
📖 **API Docs:** https://amdox-backend.onrender.com/docs
💻 **GitHub:** https://github.com/abhinashkumarin/amdoxai-platform

This project tackles a real problem — 76% of Indian employees face workplace burnout, and HR teams have no early warning system. We built one.

Huge thanks to **Amdox Technologies** for this incredible opportunity, and to my amazing team:
- **Abhinash Kumar** (Founder & Lead Engineer)
- **Nirnay Kumar**
- **Divyani Singh**
- **Avinash Kumar**
- **Sunny/Sonu**

Group 3 | Batch 4.2 | Internship 2026 🎓

#AI #MachineLearning #Python #React #Internship #AmdoxTechnologies #HRTech #DeepLearning #FastAPI #FullStack

---

## 👥 Team

<div align="center">

| Name | Role | LinkedIn |
|------|------|----------|
| **Abhinash Kumar** | Founder & Lead Full-Stack AI Engineer | [linkedin.com/in/abhinash-kumar-833b82331](https://www.linkedin.com/in/abhinash-kumar-833b82331/) |
| **Nirnay Kumar** | Full Stack Development | — |
| **Avinash Kumar** | AI / ML Integration | — |
| **Divyani Singh** | Frontend & UI/UX | — |
| **Sunny / Sonu** | Backend & Testing | — |

**Group 3 | Batch 4.2 | Amdox Technologies | Three Month Internship 2026**

</div>

---

## 📄 License

This project was built as part of a three-month internship program at **Amdox Technologies**.

---

<div align="center">

Built with ❤️ by **Group 3, Batch 4.2** at **Amdox Technologies**

*Internship Project 2026*

</div>
