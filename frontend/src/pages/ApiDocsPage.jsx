import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function useInView(threshold = 0.1) {
  const ref = useRef()
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, vis]
}

function Reveal({ children, delay = 0 }) {
  const [ref, vis] = useInView()
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(24px)', transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s` }}>
      {children}
    </div>
  )
}

const METHODS = {
  GET: { bg: 'rgba(0,245,255,0.12)', color: '#00F5FF', border: 'rgba(0,245,255,0.3)' },
  POST: { bg: 'rgba(74,222,128,0.12)', color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
  PUT: { bg: 'rgba(255,209,102,0.12)', color: '#ffd166', border: 'rgba(255,209,102,0.3)' },
  DELETE: { bg: 'rgba(255,107,107,0.12)', color: '#ff6b6b', border: 'rgba(255,107,107,0.3)' },
}

function MethodBadge({ m }) {
  const s = METHODS[m] || METHODS.GET
  return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, fontFamily: 'monospace', flexShrink: 0 }}>{m}</span>
}

function Code({ children, lang = 'json' }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div style={{ position: 'relative', background: '#0a0f1e', borderRadius: 12, border: '1px solid rgba(0,245,255,0.1)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)' }}>
        <span style={{ color: '#8899aa', fontSize: 11, letterSpacing: 1 }}>{lang}</span>
        <button onClick={copy} style={{ background: 'none', border: 'none', color: copied ? '#4ade80' : '#8899aa', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', padding: '2px 8px' }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '16px 20px', color: '#e2e8f0', fontSize: 13, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", overflowX: 'auto', lineHeight: 1.7 }}>{children}</pre>
    </div>
  )
}

function EndpointCard({ method, path, title, desc, auth, params, body, response, errors }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', background: open ? 'rgba(0,245,255,0.05)' : 'rgba(255,255,255,0.02)', border: 'none', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', borderBottom: open ? '1px solid rgba(0,245,255,0.1)' : 'none' }}>
        <MethodBadge m={method}/>
        <code style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: 14, flex: 1 }}>{path}</code>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }} className="ep-title">{title}</span>
        {auth && <span style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>🔒 AUTH</span>}
        <span style={{ color: open ? '#00F5FF' : '#8899aa', fontSize: 18, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: '24px 28px', background: 'rgba(0,0,0,0.2)' }}>
          <p style={{ color: '#8899aa', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{desc}</p>
          {params && (
            <div style={{ marginBottom: 24 }}>
              <div style={S.epSectionTitle}>Query Parameters</div>
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                {params.map((p, i) => (
                  <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '180px 100px 1fr', gap: 0, borderBottom: i < params.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ padding: '12px 16px', color: '#00F5FF', fontFamily: 'monospace', fontSize: 13, borderRight: '1px solid rgba(255,255,255,0.04)' }}>{p.name}</div>
                    <div style={{ padding: '12px 16px', color: '#ffd166', fontFamily: 'monospace', fontSize: 12, borderRight: '1px solid rgba(255,255,255,0.04)' }}>{p.type}</div>
                    <div style={{ padding: '12px 16px', color: '#8899aa', fontSize: 13 }}>{p.desc}{p.required && <span style={{ color: '#ff6b6b', marginLeft: 6 }}>*required</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {body && (
            <div style={{ marginBottom: 24 }}>
              <div style={S.epSectionTitle}>Request Body</div>
              <Code lang="json">{body}</Code>
            </div>
          )}
          <div style={{ marginBottom: errors ? 24 : 0 }}>
            <div style={S.epSectionTitle}>Response 200</div>
            <Code lang="json">{response}</Code>
          </div>
          {errors && (
            <div>
              <div style={S.epSectionTitle}>Error Codes</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {errors.map(([code, msg]) => (
                  <div key={code} style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 8, padding: '6px 14px', display: 'flex', gap: 10 }}>
                    <span style={{ color: '#ff6b6b', fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>{code}</span>
                    <span style={{ color: '#8899aa', fontSize: 12 }}>{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InternshipCreditsBanner() {
  const [ref, vis] = useInView(0.05)
  const MEMBERS = ['Nernay Kumar', 'Avinash Kumar', 'Manthan Soni', 'Divyani Singh']

  return (
    <div ref={ref} style={{
      margin: '0 48px 60px',
      border: '1px solid rgba(255,193,7,0.3)',
      borderRadius: 20,
      padding: '36px 40px',
      background: 'rgba(255,193,7,0.02)',
      boxShadow: '0 0 60px rgba(255,193,7,0.05), inset 0 0 40px rgba(255,193,7,0.02)',
      position: 'relative', overflow: 'hidden',
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : 'translateY(30px)',
      transition: 'opacity 0.8s ease, transform 0.8s ease',
    }}>
      {/* corner accents */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTop: '2px solid rgba(255,193,7,0.5)', borderLeft: '2px solid rgba(255,193,7,0.5)', borderRadius: '20px 0 0 0' }}/>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTop: '2px solid rgba(255,193,7,0.5)', borderRight: '2px solid rgba(255,193,7,0.5)', borderRadius: '0 20px 0 0' }}/>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottom: '2px solid rgba(255,193,7,0.5)', borderLeft: '2px solid rgba(255,193,7,0.5)', borderRadius: '0 0 0 20px' }}/>
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottom: '2px solid rgba(255,193,7,0.5)', borderRight: '2px solid rgba(255,193,7,0.5)', borderRadius: '0 0 20px 0' }}/>

      <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <svg width="36" height="36" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" fill="#050B18"/>
            <polygon points="50,18 74,32 74,68 50,82 26,68 26,32" fill="none" stroke="#FFC107" strokeWidth="3"/>
            <path d="M35,50 C33,41 38,33 44,36 C43,28 49,24 50,27 L50,73 C49,76 43,72 44,64 C38,67 33,59 35,50Z" fill="#FFC107"/>
            <path d="M65,50 C67,41 62,33 56,36 C57,28 51,24 50,27 L50,73 C51,76 57,72 56,64 C62,67 67,59 65,50Z" fill="#FFC107"/>
          </svg>
          <div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>Amdox<span style={{ color: '#FFC107' }}>AI</span></div>
            <div style={{ color: 'rgba(255,193,7,0.6)', fontSize: 9, letterSpacing: 2, fontWeight: 600 }}>TECHNOLOGIES</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 48, background: 'rgba(255,193,7,0.2)', flexShrink: 0 }} className="credDivider"/>

        {/* Group + Year */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ color: '#FFC107', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Group Number 3 &nbsp;|&nbsp; Batch 4.2</div>
          <div style={{ color: 'rgba(255,193,7,0.5)', fontSize: 11, letterSpacing: 2, fontWeight: 600 }}>INTERNSHIP PROJECT 2026 · THREE MONTHS</div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 48, background: 'rgba(255,193,7,0.2)', flexShrink: 0 }} className="credDivider"/>

        {/* Names */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: 1 }}>
          {MEMBERS.map((name, i) => (
            <div key={name} style={{
              background: 'rgba(255,193,7,0.07)',
              border: '1px solid rgba(255,193,7,0.18)',
              borderRadius: 8, padding: '6px 14px',
              color: '#fff', fontSize: 13, fontWeight: 600,
              opacity: vis ? 1 : 0,
              transform: vis ? 'none' : 'translateY(10px)',
              transition: `opacity 0.5s ease ${0.3 + i * 0.12}s, transform 0.5s ease ${0.3 + i * 0.12}s`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFC107', display: 'inline-block', boxShadow: '0 0 6px rgba(255,193,7,0.8)' }}/>
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ApiDocsPage() {
  const nav = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const goto = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setActiveSection(id) }

  const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'auth', label: 'Authentication' },
    { id: 'emotion', label: 'Emotion Analysis' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'employees', label: 'Employees' },
    { id: 'organizations', label: 'Organizations' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'websocket', label: 'WebSocket' },
    { id: 'errors', label: 'Error Reference' },
    { id: 'sdks', label: 'SDKs & Examples' },
  ]

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {/* NAVBAR */}
      <nav style={{ ...S.nav, ...(scrolled ? S.navScrolled : {}) }}>
        <div style={S.navWrap}>
          <div style={S.logo} onClick={() => nav('/')}>
            <svg width="26" height="26" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" fill="#050B18"/>
              <polygon points="50,18 74,32 74,68 50,82 26,68 26,32" fill="none" stroke="#00F5FF" strokeWidth="3"/>
              <path d="M35,50 C33,41 38,33 44,36 C43,28 49,24 50,27 L50,73 C49,76 43,72 44,64 C38,67 33,59 35,50Z" fill="#00F5FF"/>
              <path d="M65,50 C67,41 62,33 56,36 C57,28 51,24 50,27 L50,73 C51,76 57,72 56,64 C62,67 67,59 65,50Z" fill="#00F5FF"/>
            </svg>
            <span style={S.logoTxt}>Amdox<span style={{ color: '#00F5FF' }}>AI</span></span>
            <span style={{ color: '#8899aa', fontSize: 13, marginLeft: 4 }}>/ API Docs</span>
          </div>
          <div style={{ flex: 1 }}/>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>v1.0.0</span>
            <button onClick={() => nav('/')} style={S.btnGhost}>← Home</button>
            <button onClick={() => nav('/sign-up')} style={S.btnCyan}>Get API Key →</button>
          </div>
        </div>
      </nav>

      <div style={S.layout}>
        {/* SIDEBAR */}
        <aside style={S.sidebar} className="sidebar">
          <div style={{ padding: '28px 20px 0' }}>
            <div style={{ color: '#00F5FF', fontSize: 10, letterSpacing: 3, fontWeight: 700, marginBottom: 16 }}>NAVIGATION</div>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => goto(s.id)}
                style={{ ...S.sideLink, ...(activeSection === s.id ? S.sideLinkActive : {}) }}>
                {s.label}
              </button>
            ))}
          </div>
          <div style={{ padding: '24px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 16 }}>
            <div style={{ color: '#00F5FF', fontSize: 10, letterSpacing: 3, fontWeight: 700, marginBottom: 12 }}>BASE URL</div>
            <code style={{ color: '#ffd166', fontSize: 11, background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: 6, display: 'block', wordBreak: 'break-all' }}>http://localhost:8000</code>
            <div style={{ color: '#00F5FF', fontSize: 10, letterSpacing: 3, fontWeight: 700, marginBottom: 12, marginTop: 20 }}>RESPONSE FORMAT</div>
            <code style={{ color: '#ffd166', fontSize: 11, background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: 6, display: 'block' }}>application/json</code>
          </div>
          {/* Sidebar internship badge */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 0 16px' }}>
            <div style={{ background: 'rgba(255,193,7,0.05)', border: '1px solid rgba(255,193,7,0.2)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ color: '#FFC107', fontSize: 9, letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>INTERNSHIP PROJECT</div>
              <div style={{ color: '#fff', fontSize: 11, fontWeight: 700, marginBottom: 2 }}>Group 3 · Batch 4.2</div>
              <div style={{ color: 'rgba(255,193,7,0.5)', fontSize: 10 }}>Amdox Technologies · 2026</div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={S.main}>

          {/* OVERVIEW */}
          <section id="overview" style={S.section}>
            <Reveal>
              <div style={S.pageHead}>
                <div style={S.tag}>REST API v1.0</div>
                <h1 style={S.h1}>AmdoxAI API Reference</h1>
                <p style={S.headSub}>Complete documentation for integrating AmdoxAI's emotion intelligence into your applications. All endpoints use JSON and return standardized responses.</p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 40 }}>
                {[['⚡','REST API','JSON over HTTPS'],['🔒','JWT Auth','Clerk-based tokens'],['📦','OpenAPI','Swagger UI at /docs'],['🔄','WebSocket','Real-time updates']].map(([i,t,d]) => (
                  <div key={t} style={S.overviewCard}>
                    <span style={{ fontSize: 24 }}>{i}</span>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{t}</div>
                    <div style={{ color: '#8899aa', fontSize: 12 }}>{d}</div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div style={{ marginBottom: 32 }}>
                <h3 style={S.h3}>Quick Start</h3>
                <Code lang="bash">{`# Install dependencies
pip install fastapi uvicorn supabase python-dotenv

# Start the server
uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload

# Interactive docs available at:
# http://127.0.0.1:8000/docs    ← Swagger UI
# http://127.0.0.1:8000/redoc  ← ReDoc`}</Code>
              </div>
            </Reveal>
          </section>

          <div style={S.divider}/>

          {/* AUTH */}
          <section id="auth" style={S.section}>
            <Reveal>
              <h2 style={S.h2}>Authentication</h2>
              <p style={S.sectionSub}>AmdoxAI uses Clerk JWT tokens for authentication. Include the Bearer token in all protected endpoint requests.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h3 style={S.h3}>Get Your Token</h3>
              <Code lang="javascript">{`// Frontend — get token from Clerk
import { useAuth } from '@clerk/clerk-react'

const { getToken } = useAuth()
const token = await getToken()

// Include in all API requests
const res = await fetch('/api/emotion/analyze', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ text: "I am feeling stressed" })
})`}</Code>
            </Reveal>
            <Reveal delay={0.15}>
              <h3 style={{ ...S.h3, marginTop: 28 }}>Token Payload Structure</h3>
              <Code lang="json">{`{
  "sub": "user_2abc123def456",
  "org_id": "org_xyz789",
  "role": "employee",           // "employee" | "hr" | "admin"
  "iat": 1712345678,
  "exp": 1712349278
}`}</Code>
            </Reveal>
          </section>

          <div style={S.divider}/>

          {/* EMOTION */}
          <section id="emotion" style={S.section}>
            <Reveal>
              <h2 style={S.h2}>Emotion Analysis</h2>
              <p style={S.sectionSub}>Core endpoints for analyzing emotions via text, voice, and facial data. All responses include a confidence score and cumulative stress status.</p>
            </Reveal>

            <Reveal delay={0.1}>
              <EndpointCard
                method="POST" path="/api/emotion/text" title="Analyze Text Emotion" auth
                desc="Analyze emotion from a text string. Supports English and Hinglish (Hindi-English mixed) input. Uses TextBlob sentiment analysis combined with a custom keyword detection model for 7 emotion categories."
                params={[
                  { name: 'employee_id', type: 'string', desc: 'UUID of the employee', required: true },
                  { name: 'org_id', type: 'string', desc: 'UUID of the organization', required: true },
                ]}
                body={`{
  "text": "Bahut zyada kaam hai aaj, deadline aa rahi hai aur mujhe samajh nahi aa raha",
  "employee_id": "550e8400-e29b-41d4-a716-446655440000",
  "org_id": "org_2abc123def456",
  "session_id": "session_xyz789"   // optional
}`}
                response={`{
  "status": "success",
  "emotion": "stress",
  "confidence": 0.87,
  "raw_scores": {
    "stress": 0.87, "neutral": 0.08, "sadness": 0.03,
    "anger": 0.01, "fear": 0.01
  },
  "stress_triggered": false,
  "cumulative_score": 2.8,
  "threshold": 3.5,
  "log_id": "log_abc123",
  "timestamp": "2025-03-05T10:28:00Z"
}`}
                errors={[['400','Missing required fields'],['401','Invalid or expired token'],['404','Employee not found'],['422','Text too short (min 3 chars)']]}
              />
            </Reveal>

            <Reveal delay={0.12}>
              <EndpointCard
                method="POST" path="/api/emotion/voice" title="Analyze Voice Emotion" auth
                desc="Upload an audio file (WAV, MP3, or WebM) for emotion analysis using the wav2vec2-base-superb-er transformer model. Audio is processed on the server and deleted after analysis. Max file size: 10MB."
                body={`// multipart/form-data
{
  "audio": <binary file>,         // WAV, MP3, WebM (max 10MB)
  "employee_id": "550e8400-...",
  "org_id": "org_2abc123..."
}`}
                response={`{
  "status": "success",
  "emotion": "neutral",
  "confidence": 0.74,
  "duration_seconds": 8.2,
  "model": "wav2vec2-base-superb-er",
  "stress_triggered": false,
  "cumulative_score": 3.1,
  "log_id": "log_def456",
  "timestamp": "2025-03-05T10:30:00Z"
}`}
                errors={[['400','Invalid audio format'],['413','File too large (max 10MB)'],['500','Audio processing failed']]}
              />
            </Reveal>

            <Reveal delay={0.14}>
              <EndpointCard
                method="POST" path="/api/emotion/face" title="Analyze Face Emotion" auth
                desc="Send a base64-encoded image (JPEG or PNG) for facial emotion analysis using DeepFace with RetinaFace detector. Detects 7 emotion categories from facial micro-expressions. Optimal for images with clear face visibility."
                body={`{
  "image_base64": "/9j/4AAQSkZJRgABAQEA...",  // base64 JPEG/PNG
  "employee_id": "550e8400-...",
  "org_id": "org_2abc123...",
  "source": "extension"    // "extension" | "dashboard"
}`}
                response={`{
  "status": "success",
  "emotion": "happy",
  "confidence": 0.92,
  "all_emotions": {
    "happy": 0.92, "neutral": 0.05, "surprise": 0.02,
    "sad": 0.01, "angry": 0.0, "fear": 0.0, "disgust": 0.0
  },
  "face_detected": true,
  "detector": "retinaface",
  "stress_triggered": false,
  "log_id": "log_ghi789",
  "timestamp": "2025-03-05T10:32:00Z"
}`}
                errors={[['400','No face detected in image'],['400','Image too small (min 48x48px)'],['422','Invalid base64 encoding']]}
              />
            </Reveal>

            <Reveal delay={0.16}>
              <EndpointCard
                method="GET" path="/api/emotion/logs" title="Get Emotion Logs" auth
                desc="Retrieve paginated emotion logs for an employee or organization. Supports date range filtering, emotion type filtering, and sorting."
                params={[
                  { name: 'employee_id', type: 'string', desc: 'Filter by employee UUID', required: false },
                  { name: 'org_id', type: 'string', desc: 'Organization UUID', required: true },
                  { name: 'start_date', type: 'string', desc: 'ISO 8601 date (e.g. 2025-03-01)', required: false },
                  { name: 'end_date', type: 'string', desc: 'ISO 8601 date', required: false },
                  { name: 'emotion', type: 'string', desc: 'Filter by emotion type', required: false },
                  { name: 'limit', type: 'integer', desc: 'Records per page (default: 50, max: 200)', required: false },
                  { name: 'offset', type: 'integer', desc: 'Pagination offset (default: 0)', required: false },
                ]}
                response={`{
  "status": "success",
  "total": 1248,
  "limit": 50,
  "offset": 0,
  "data": [
    {
      "id": "log_abc123",
      "employee_id": "550e8400-...",
      "emotion": "stress",
      "confidence": 0.87,
      "modality": "text",
      "stress_score": 3.5,
      "created_at": "2025-03-05T10:28:00Z"
    }
  ]
}`}
              />
            </Reveal>
          </section>

          <div style={S.divider}/>

          {/* ANALYTICS */}
          <section id="analytics" style={S.section}>
            <Reveal>
              <h2 style={S.h2}>Analytics</h2>
              <p style={S.sectionSub}>Aggregated emotion analytics, stress heatmaps, and trend data for HR dashboards.</p>
            </Reveal>

            <Reveal delay={0.1}>
              <EndpointCard
                method="GET" path="/api/analytics/mood" title="Organization Mood Overview" auth
                desc="Get aggregated emotion distribution, stress score trends, and high-risk employee count for the organization."
                params={[
                  { name: 'org_id', type: 'string', desc: 'Organization UUID', required: true },
                  { name: 'period', type: 'string', desc: '"7d" | "30d" | "90d" (default: 7d)', required: false },
                ]}
                response={`{
  "status": "success",
  "period": "7d",
  "summary": {
    "total_logs": 2840,
    "avg_stress_score": 2.3,
    "high_risk_employees": 4,
    "stress_alerts_sent": 7
  },
  "emotion_distribution": {
    "happy": 38.2, "neutral": 29.5, "stress": 18.4,
    "sad": 7.1, "angry": 3.8, "fear": 2.2, "surprise": 0.8
  },
  "daily_trend": [
    { "date": "2025-02-27", "avg_stress": 1.8, "logs": 320 },
    { "date": "2025-02-28", "avg_stress": 2.1, "logs": 410 }
  ]
}`}
              />
            </Reveal>

            <Reveal delay={0.12}>
              <EndpointCard
                method="GET" path="/api/analytics/heatmap" title="Hourly Stress Heatmap" auth
                desc="Returns a 7-day × 24-hour stress intensity matrix for visualizing when stress peaks occur during the workweek."
                params={[
                  { name: 'org_id', type: 'string', desc: 'Organization UUID', required: true },
                  { name: 'employee_id', type: 'string', desc: 'Filter to single employee', required: false },
                ]}
                response={`{
  "status": "success",
  "heatmap": {
    "Monday":    [0,0,0,0,0,0,0,0,1.2,1.8,2.4,3.1,2.8,2.2,1.9,2.5,3.2,2.1,1.4,0.8,0,0,0,0],
    "Tuesday":   [0,0,0,0,0,0,0,0,1.1,2.0,2.8,3.4,3.0,2.4,2.0,2.7,3.5,2.3,1.5,0.9,0,0,0,0],
    "Wednesday": [...]
  },
  "peak_hour": 16,
  "peak_day": "Tuesday",
  "avg_stress": 2.1
}`}
              />
            </Reveal>
          </section>

          <div style={S.divider}/>

          {/* EMPLOYEES */}
          <section id="employees" style={S.section}>
            <Reveal>
              <h2 style={S.h2}>Employees</h2>
              <p style={S.sectionSub}>CRUD operations for employee management within an organization.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <EndpointCard method="GET" path="/api/employees" title="List Employees" auth
                desc="Get all employees in an organization with their latest emotion status and stress score."
                params={[
                  { name: 'org_id', type: 'string', desc: 'Organization UUID', required: true },
                  { name: 'department', type: 'string', desc: 'Filter by department name', required: false },
                  { name: 'risk_level', type: 'string', desc: '"low" | "medium" | "high"', required: false },
                ]}
                response={`{
  "status": "success",
  "count": 128,
  "data": [
    {
      "id": "550e8400-...",
      "name": "Rahul Sharma",
      "email": "rahul@company.com",
      "department": "Engineering",
      "role": "employee",
      "latest_emotion": "stress",
      "stress_score": 3.2,
      "risk_level": "medium",
      "last_active": "2025-03-05T09:15:00Z"
    }
  ]
}`}
              />
            </Reveal>
            <Reveal delay={0.12}>
              <EndpointCard method="POST" path="/api/employees" title="Create Employee" auth
                desc="Add a new employee to the organization."
                body={`{
  "name": "Priya Mehta",
  "email": "priya@company.com",
  "department": "Marketing",
  "role": "employee",           // "employee" | "hr" | "admin"
  "org_id": "org_2abc123..."
}`}
                response={`{
  "status": "success",
  "employee": {
    "id": "550e8400-new-uuid",
    "name": "Priya Mehta",
    "email": "priya@company.com",
    "department": "Marketing",
    "created_at": "2025-03-05T11:00:00Z"
  }
}`}
                errors={[['409','Employee email already exists'],['403','Only admins can create employees']]}
              />
            </Reveal>
          </section>

          <div style={S.divider}/>

          {/* ALERTS */}
          <section id="alerts" style={S.section}>
            <Reveal>
              <h2 style={S.h2}>Alerts</h2>
              <p style={S.sectionSub}>Stress alert management — automatic and manual HR notifications.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <EndpointCard method="GET" path="/api/alerts" title="Get Active Alerts" auth
                desc="Retrieve all unresolved stress alerts for an organization, sorted by severity."
                params={[
                  { name: 'org_id', type: 'string', desc: 'Organization UUID', required: true },
                  { name: 'resolved', type: 'boolean', desc: 'Include resolved alerts (default: false)', required: false },
                ]}
                response={`{
  "status": "success",
  "count": 3,
  "data": [
    {
      "id": "alert_abc123",
      "employee_id": "550e8400-...",
      "employee_name": "Amit Kumar",
      "stress_score": 4.1,
      "trigger_emotion": "stress",
      "severity": "high",
      "email_sent": true,
      "resolved": false,
      "created_at": "2025-03-05T08:45:00Z"
    }
  ]
}`}
              />
            </Reveal>
            <Reveal delay={0.12}>
              <EndpointCard method="PUT" path="/api/alerts/{alert_id}/resolve" title="Resolve Alert" auth
                desc="Mark an alert as resolved after HR intervention."
                body={`{
  "resolution_note": "Spoke with employee. Arranged 2-day leave for recovery.",
  "resolved_by": "hr_user_id_123"
}`}
                response={`{
  "status": "success",
  "alert_id": "alert_abc123",
  "resolved": true,
  "resolved_at": "2025-03-05T14:30:00Z"
}`}
              />
            </Reveal>
          </section>

          <div style={S.divider}/>

          {/* WEBSOCKET */}
          <section id="websocket" style={S.section}>
            <Reveal>
              <h2 style={S.h2}>WebSocket</h2>
              <p style={S.sectionSub}>Real-time emotion event streaming for live HR dashboards.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={S.wsCard}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>WS</span>
                  <code style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: 14 }}>ws://localhost:8000/ws/{'{'}org_id{'}'}</code>
                  <span style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>🔒 AUTH</span>
                </div>
                <p style={{ color: '#8899aa', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                  Connect to receive real-time emotion events as they are logged. The connection is scoped to a single organization — HR managers only receive events for their employees.
                </p>
                <Code lang="javascript">{`// Connect to WebSocket
const ws = new WebSocket(
  \`ws://localhost:8000/ws/\${orgId}?token=\${jwtToken}\`
)

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  
  switch(data.type) {
    case 'EMOTION_LOG':
      // New emotion entry logged
      console.log(data.employee_id, data.emotion, data.confidence)
      break
      
    case 'STRESS_ALERT':
      // Employee crossed stress threshold
      console.log('🚨 Alert:', data.employee_name, data.stress_score)
      showNotification(data)
      break
      
    case 'PING':
      ws.send(JSON.stringify({ type: 'PONG' }))
      break
  }
}

// Message format for STRESS_ALERT:
// {
//   "type": "STRESS_ALERT",
//   "employee_id": "550e8400-...",
//   "employee_name": "Rahul Sharma",
//   "stress_score": 3.8,
//   "latest_emotion": "stress",
//   "alert_id": "alert_new123",
//   "timestamp": "2025-03-05T14:30:00Z"
// }`}</Code>
              </div>
            </Reveal>
          </section>

          <div style={S.divider}/>

          {/* ERROR REFERENCE */}
          <section id="errors" style={S.section}>
            <Reveal>
              <h2 style={S.h2}>Error Reference</h2>
              <p style={S.sectionSub}>All API errors follow a consistent JSON format with machine-readable error codes.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <Code lang="json">{`// Standard error response format
{
  "status": "error",
  "code": "EMPLOYEE_NOT_FOUND",
  "message": "No employee found with the given ID",
  "detail": "employee_id: 550e8400-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "timestamp": "2025-03-05T10:28:00Z"
}`}</Code>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(400px,1fr))', gap: 12, marginTop: 24 }}>
                {[
                  ['400','BAD_REQUEST','Missing or invalid request parameters'],
                  ['401','UNAUTHORIZED','Invalid, missing, or expired JWT token'],
                  ['403','FORBIDDEN','Insufficient role permissions for this action'],
                  ['404','NOT_FOUND','Requested resource does not exist'],
                  ['409','CONFLICT','Resource already exists (duplicate email etc.)'],
                  ['413','PAYLOAD_TOO_LARGE','File upload exceeds 10MB limit'],
                  ['422','UNPROCESSABLE','Valid JSON but semantically invalid data'],
                  ['429','RATE_LIMITED','Too many requests (100/min per org)'],
                  ['500','INTERNAL_ERROR','Server-side error — contact support'],
                  ['503','AI_UNAVAILABLE','AI model temporarily unavailable'],
                ].map(([code, name, desc]) => (
                  <div key={code} style={{ display: 'flex', gap: 16, padding: '14px 18px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: parseInt(code) >= 500 ? '#ff6b6b' : parseInt(code) >= 400 ? '#ffd166' : '#4ade80', fontFamily: 'monospace', fontWeight: 700, fontSize: 15, minWidth: 40 }}>{code}</span>
                    <div>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'monospace', marginBottom: 3 }}>{name}</div>
                      <div style={{ color: '#8899aa', fontSize: 12 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>

          <div style={S.divider}/>

          {/* SDKs */}
          <section id="sdks" style={S.section}>
            <Reveal>
              <h2 style={S.h2}>SDKs & Code Examples</h2>
              <p style={S.sectionSub}>Ready-to-use integration examples in multiple languages.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h3 style={S.h3}>Python SDK</h3>
              <Code lang="python">{`import requests

class AmdoxAI:
    def __init__(self, token: str, base_url: str = "http://localhost:8000"):
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        self.base = base_url
    
    def analyze_text(self, text: str, employee_id: str, org_id: str) -> dict:
        res = requests.post(f"{self.base}/api/emotion/text",
            headers=self.headers,
            json={"text": text, "employee_id": employee_id, "org_id": org_id}
        )
        return res.json()
    
    def get_analytics(self, org_id: str, period: str = "7d") -> dict:
        res = requests.get(f"{self.base}/api/analytics/mood",
            headers=self.headers,
            params={"org_id": org_id, "period": period}
        )
        return res.json()

# Usage
client = AmdoxAI(token="your_jwt_token")
result = client.analyze_text(
    text="Deadline pressure is getting too much",
    employee_id="550e8400-...",
    org_id="org_xyz..."
)
print(f"Emotion: {result['emotion']} ({result['confidence']:.0%})")`}</Code>
            </Reveal>
            <Reveal delay={0.12}>
              <h3 style={{ ...S.h3, marginTop: 28 }}>JavaScript / React</h3>
              <Code lang="javascript">{`// amdoxai.js — Simple fetch wrapper
const BASE = 'http://localhost:8000'

export const amdoxAPI = {
  analyzeText: async (text, employeeId, orgId, token) => {
    const res = await fetch(\`\${BASE}/api/emotion/text\`, {
      method: 'POST',
      headers: { Authorization: \`Bearer \${token}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, employee_id: employeeId, org_id: orgId })
    })
    if (!res.ok) throw new Error((await res.json()).message)
    return res.json()
  },

  getAnalytics: async (orgId, period = '7d', token) => {
    const res = await fetch(\`\${BASE}/api/analytics/mood?org_id=\${orgId}&period=\${period}\`, {
      headers: { Authorization: \`Bearer \${token}\` }
    })
    return res.json()
  },

  subscribeAlerts: (orgId, token, onAlert) => {
    const ws = new WebSocket(\`ws://localhost:8000/ws/\${orgId}?token=\${token}\`)
    ws.onmessage = e => { const d = JSON.parse(e.data); if (d.type === 'STRESS_ALERT') onAlert(d) }
    return () => ws.close()  // cleanup function
  }
}`}</Code>
            </Reveal>
            <Reveal delay={0.14}>
              <h3 style={{ ...S.h3, marginTop: 28 }}>cURL Examples</h3>
              <Code lang="bash">{`# Analyze text emotion
curl -X POST http://localhost:8000/api/emotion/text \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Bahut stress hai aaj, kuch samajh nahi aa raha",
    "employee_id": "550e8400-e29b-41d4-a716-446655440000",
    "org_id": "org_2abc123def456"
  }'

# Get organization analytics
curl http://localhost:8000/api/analytics/mood \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -G -d "org_id=org_2abc123def456" -d "period=30d"

# List active stress alerts
curl http://localhost:8000/api/alerts \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -G -d "org_id=org_2abc123def456"`}</Code>
            </Reveal>
          </section>

          {/* ===== INTERNSHIP CREDITS BANNER ===== */}
          <div style={S.divider} />
          <div style={{ padding: '48px 0 0' }}>
            <InternshipCreditsBanner />
          </div>

        </main>
      </div>
    </div>
  )
}

const S = {
  page: { background: '#050B18', minHeight: '100vh', fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: 'hidden' },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '12px 24px', transition: 'all 0.3s' },
  navScrolled: { background: 'rgba(5,11,24,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,245,255,0.08)' },
  navWrap: { maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 },
  logo: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
  logoTxt: { color: '#fff', fontWeight: 800, fontSize: 17 },
  btnGhost: { background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' },
  btnCyan: { background: 'linear-gradient(135deg,#00F5FF,#0080FF)', color: '#050B18', padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' },
  layout: { display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh', paddingTop: 58 },
  sidebar: { borderRight: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 58, height: 'calc(100vh - 58px)', overflowY: 'auto', background: 'rgba(0,0,0,0.2)' },
  sideLink: { display: 'block', width: '100%', background: 'none', border: 'none', color: '#8899aa', textAlign: 'left', padding: '9px 20px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', borderRadius: 8, transition: 'all 0.15s', marginBottom: 2 },
  sideLinkActive: { background: 'rgba(0,245,255,0.08)', color: '#00F5FF', fontWeight: 600 },
  main: { padding: '0 0 80px', maxWidth: 900 },
  section: { padding: '48px 48px 0' },
  pageHead: { marginBottom: 36 },
  tag: { color: '#00F5FF', fontSize: 10, letterSpacing: 3, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' },
  h1: { color: '#fff', fontSize: 'clamp(28px,3.5vw,48px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 16, lineHeight: 1.1 },
  h2: { color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 },
  h3: { color: '#fff', fontSize: 17, fontWeight: 700, marginBottom: 14 },
  headSub: { color: '#8899aa', fontSize: 16, lineHeight: 1.8, maxWidth: 640 },
  sectionSub: { color: '#8899aa', fontSize: 15, lineHeight: 1.7, marginBottom: 28 },
  divider: { margin: '0 48px', height: 1, background: 'rgba(255,255,255,0.05)' },
  overviewCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 8 },
  epSectionTitle: { color: '#8899aa', fontSize: 11, letterSpacing: 2, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' },
  wsCard: { background: 'rgba(74,222,128,0.03)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 16, padding: 28 },
}

const CSS = `
  .sidebar::-webkit-scrollbar{width:4px}
  .sidebar::-webkit-scrollbar-track{background:transparent}
  .sidebar::-webkit-scrollbar-thumb{background:rgba(0,245,255,0.15);border-radius:2px}
  button:hover{opacity:0.85}
  .ep-title{display:block}
  @media(max-width:900px){
    .ep-title{display:none}
    .sidebar{display:none}
    div[style*="grid-template-columns: 240px"]{grid-template-columns:1fr!important}
    .main{padding:0!important}
    section{padding:32px 20px 0!important}
    div[style*="margin: 0 48px"]{margin:0 20px!important}
    .credDivider{display:none!important}
  }
`