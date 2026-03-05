// LandingPage.tsx — Final with Chrome Modal + Extension Steps + Watch Demo Modal
// ONLY ADDITIONS: ChromeInstallModal, WatchDemoModal, ExtensionHowItWorks section
// Everything else unchanged from original

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Particles() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d')
    let raf
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const pts = Array.from({ length: 90 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.25, dy: (Math.random() - 0.5) * 0.25,
      o: Math.random() * 0.4 + 0.1
    }))
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,245,255,${p.o})`; ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0
        if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0
      })
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(0,245,255,${0.06 * (1 - d / 110)})`
          ctx.lineWidth = 0.5; ctx.stroke()
        }
      }))
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

function Counter({ end, suffix = '', duration = 2000 }) {
  const [n, setN] = useState(0)
  const ref = useRef()
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      let s = 0, step = end / (duration / 16)
      const t = setInterval(() => {
        s += step; if (s >= end) { setN(end); clearInterval(t) } else setN(Math.floor(s))
      }, 16)
    })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end, duration])
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>
}

function useInView(threshold = 0.15) {
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
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`
    }}>
      {children}
    </div>
  )
}

// ════════════════════════════════════════════════
// Chrome Install Modal — URL UPDATED to GitHub Releases
// ════════════════════════════════════════════════
function ChromeInstallModal({ onClose }) {
  const steps = [
    { n: '01', icon: '📥', title: 'Download Extension ZIP', desc: 'Click the Download button below. The amdox-extension ZIP file will be saved to your computer.' },
    { n: '02', icon: '📂', title: 'Extract the ZIP File', desc: 'Right-click the downloaded ZIP → "Extract All" → choose a folder (e.g., Desktop/amdox-extension).' },
    { n: '03', icon: '🔧', title: 'Open Chrome Extensions', desc: 'In Chrome address bar, type: chrome://extensions — then press Enter.' },
    { n: '04', icon: '🔀', title: 'Enable Developer Mode', desc: 'Toggle "Developer mode" switch ON (top-right corner of the Extensions page).' },
    { n: '05', icon: '📁', title: 'Click "Load Unpacked"', desc: 'Click the "Load unpacked" button → select the extracted amdox-extension folder → click Select Folder.' },
    { n: '06', icon: '📌', title: 'Pin & Start Using', desc: 'AmdoxAI icon appears in toolbar. Click 📌 pin icon to keep it visible. Click the icon to login and start monitoring!' },
  ]
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }} onClick={onClose}>
      <div style={{ background:'#07111F', border:'1px solid rgba(0,245,255,0.25)', borderRadius:20, padding:'32px', maxWidth:620, width:'100%', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(0,245,255,0.08)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <div style={{ color:'#00F5FF', fontSize:11, letterSpacing:3, fontWeight:700, marginBottom:4 }}>CHROME EXTENSION</div>
            <h2 style={{ color:'#fff', fontSize:22, fontWeight:800, margin:0 }}>Install AmdoxAI Extension</h2>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#8899aa', width:36, height:36, borderRadius:8, cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:28, flexWrap:'wrap' }}>
          {['✅ Chrome', '✅ Edge', '✅ Brave'].map(b => (
            <span key={b} style={{ background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:999, padding:'4px 12px', color:'#00FF88', fontSize:12, fontWeight:600 }}>{b}</span>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:28 }}>
          {steps.map(step => (
            <div key={step.n} style={{ display:'flex', gap:14, alignItems:'flex-start', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:'rgba(0,245,255,0.1)', border:'1px solid rgba(0,245,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{step.icon}</div>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ color:'#00F5FF', fontSize:10, fontWeight:700, letterSpacing:2 }}>STEP {step.n}</span>
                  <span style={{ color:'#fff', fontWeight:600, fontSize:13 }}>{step.title}</span>
                </div>
                <p style={{ color:'#8899aa', fontSize:12, lineHeight:1.6, margin:0 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        {/* ✅ UPDATED: GitHub Releases URL */}
        <a href="https://github.com/abhinashkumarin/amdoxai-platform/releases/latest/download/amdox-extension.zip"
          target="_blank" rel="noopener noreferrer"
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, width:'100%', padding:'14px', borderRadius:12, background:'linear-gradient(135deg,#00F5FF,#0080FF)', color:'#050B18', fontWeight:800, fontSize:15, textDecoration:'none', marginBottom:12 }}>
          ⬇️ Download Extension ZIP — Free
        </a>
        <p style={{ color:'#475569', fontSize:11, textAlign:'center', margin:0 }}>Free & Open Source · No Web Store needed · Works offline</p>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════
// Watch Demo Modal
// ════════════════════════════════════════════════
function WatchDemoModal({ onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.9)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }} onClick={onClose}>
      <div style={{ background:'#07111F', border:'1px solid rgba(0,245,255,0.2)', borderRadius:20, padding:'32px', maxWidth:700, width:'100%', boxShadow:'0 40px 80px rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <div style={{ color:'#00F5FF', fontSize:11, letterSpacing:3, fontWeight:700, marginBottom:4 }}>PRODUCT DEMO</div>
            <h2 style={{ color:'#fff', fontSize:20, fontWeight:800, margin:0 }}>AmdoxAI — See It In Action</h2>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#8899aa', width:36, height:36, borderRadius:8, cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ width:'100%', aspectRatio:'16/9', background:'rgba(0,0,0,0.5)', borderRadius:14, border:'1px solid rgba(0,245,255,0.15)', overflow:'hidden', marginBottom:20 }}>
          <iframe
            width="100%" height="100%"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1"
            title="AmdoxAI Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ display:'block' }}
          />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {[['🔐','Login','#a78bfa'],['▶','Start Session','#ffd166'],['🧠','AI Monitors','#00F5FF'],['📊','HR Report','#4ade80']].map(([icon,label,color]) => (
            <div key={label} style={{ textAlign:'center', padding:'12px 8px', background:'rgba(255,255,255,0.02)', border:`1px solid ${color}22`, borderRadius:10 }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
              <div style={{ color, fontSize:11, fontWeight:600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const nav = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('text')
  const [formData, setFormData] = useState({ name: '', email: '', org: '', msg: '' })
  const [showChromeModal, setShowChromeModal] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const goto = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }

  const FEATURES = [
    { icon: '⊙', c: '#00F5FF', t: 'Multi-Modal AI Analysis', d: 'Text, voice & facial emotion detection fused into one confidence score. Industry\'s only tri-modal approach built for Indian workplaces.' },
    { icon: '⚡', c: '#ff6b6b', t: 'Real-Time Stress Monitoring', d: 'Cumulative stress tracking with automatic HR alert generation when threshold ≥ 3.5. Never miss a struggling employee again.' },
    { icon: '🛡', c: '#00F5FF', t: 'Enterprise-Grade Security', d: 'Row-level security with Clerk JWT + Supabase RLS. Complete tenant isolation — your data never mixes with other organizations.' },
    { icon: '👥', c: '#ffd166', t: 'Role-Based Access Control', d: 'Employee, HR Manager, and Admin — each with their own dashboard, permissions, and data visibility. Zero configuration needed.' },
    { icon: '📊', c: '#a78bfa', t: 'Advanced Analytics Dashboard', d: 'Emotion heatmaps, hourly trend charts, severity distribution, department-wise breakdown, and weekly stress pattern analysis.' },
    { icon: '🔌', c: '#00F5FF', t: 'WebSocket Live Updates', d: 'HR dashboard refreshes the moment new emotional data arrives. No polling, no refresh — pure real-time via WebSocket.' },
  ]

  const WHY = [
    { icon: '🤖', t: 'Only Tri-Modal Platform', d: 'Text + Voice + Face combined. Competitors use just one. We use all three for 3x detection accuracy.' },
    { icon: '🇮🇳', t: 'Hinglish NLP Support', d: 'Native support for Hindi-English mixed text — the only HR AI tool built for how Indians actually communicate.' },
    { icon: '🏢', t: 'True Multi-Tenancy', d: 'One platform, infinite organizations. Each completely isolated with RLS + JWT. Enterprise-ready from day one.' },
    { icon: '⚡', t: 'Real-Time Architecture', d: 'WebSocket + Redis pub/sub. HR alerts in milliseconds, not minutes. Scale to 100k employees easily.' },
    { icon: '🌐', t: 'Extension + Web App', d: 'Two interfaces, one platform. Chrome extension for passive monitoring, web dashboard for deep analysis.' },
    { icon: '📱', t: 'PWA + Mobile Ready', d: 'Add to home screen on any device. Works offline with sync queue. Loads instantly like a native app.' },
  ]

  const STEPS = [
    { n: '01', icon: '🎙', t: 'Employee Inputs', d: 'Text, voice, or camera via dashboard or Chrome extension. Works passively in background.' },
    { n: '02', icon: '🧠', t: 'AI Analyzes', d: 'DeepFace + wav2vec2 + TextBlob process input and return emotion + confidence score.' },
    { n: '03', icon: '📈', t: 'Score Calculated', d: 'Engine tracks last N emotions and calculates cumulative stress threshold (score ≥ 3.5).' },
    { n: '04', icon: '🚨', t: 'HR Alert Sent', d: 'Instant WebSocket alert on dashboard + Gmail SMTP notification. Zero manual effort.' },
  ]

  const MODALS = {
    text: { icon: '📝', name: 'Text NLP', model: 'TextBlob + Keywords', conf: '0.55–0.97', detail: 'Hinglish + English keyword detection with sentiment polarity scoring. Detects stress, sadness, anger, joy, fear, surprise, neutral.' },
    voice: { icon: '🎙', name: 'Voice AI', model: 'wav2vec2-base-superb-er', conf: '0.60–0.94', detail: 'HuggingFace transformer processes raw audio waveform. Entropy-based uncertainty adjustment for high accuracy.' },
    face: { icon: '📸', name: 'Face AI', model: 'DeepFace + RetinaFace', conf: '0.65–0.98', detail: 'Real-time facial expression analysis via camera frame. Detects 7 micro-expression categories with confidence scoring.' },
  }

  const TESTIMONIALS = [
    { stars: 5, text: 'AmdoxAI helped us identify 3 employees on the verge of burnout before they resigned. The ROI was immediate and undeniable.', name: 'Priya Sharma', role: 'HR Director, TechCorp India' },
    { stars: 5, text: 'The Hinglish NLP is a game-changer. Our employees actually use it because it understands how we naturally communicate at work.', name: 'Rahul Mehta', role: 'People Manager, StartupHub' },
    { stars: 5, text: 'Real-time alerts completely changed our HR workflow. We now respond to stress signals the same day — not weeks later.', name: 'Anita Roy', role: 'Chief People Officer, FinTech Co.' },
  ]

  const PRICING = [
    { name: 'Starter', price: 'Free', sub: 'Perfect to begin', popular: false, features: ['1 Organization', '25 Employees', 'Basic Analytics', 'Email Alerts', 'Text Analysis'], cta: 'Get Started', ctaStyle: 'outline' },
    { name: 'Growth', price: '₹2,999', sub: 'per month', popular: true, features: ['5 Organizations', '100 Employees', 'Full Analytics', 'WebSocket Live', 'Chrome Extension', 'Voice + Face AI', 'Priority Support'], cta: 'Start Free Trial →', ctaStyle: 'cyan' },
    { name: 'Enterprise', price: 'Custom', sub: 'contact us', popular: false, features: ['Unlimited Orgs', 'Unlimited Employees', 'Custom AI Models', 'Dedicated Database', 'SLA 99.99%', 'On-premise Option', '24/7 Support'], cta: 'Contact Us', ctaStyle: 'outline' },
  ]

  const TECH = [
    { n: 'React 18', r: 'Frontend', c: '#61dafb' }, { n: 'FastAPI', r: 'Backend', c: '#009688' },
    { n: 'Supabase', r: 'Database', c: '#3ecf8e' }, { n: 'Clerk', r: 'Auth', c: '#6c47ff' },
    { n: 'DeepFace', r: 'Face AI', c: '#00F5FF' }, { n: 'wav2vec2', r: 'Voice AI', c: '#ff6b6b' },
    { n: 'TextBlob', r: 'Text AI', c: '#ffd166' }, { n: 'WebSocket', r: 'Realtime', c: '#a78bfa' },
    { n: 'Redis', r: 'Pub/Sub', c: '#ff4444' }, { n: 'Chrome MV3', r: 'Extension', c: '#4ade80' },
    { n: 'Vercel', r: 'Deploy-Frontend', c: '#fff' }, { n: 'Render', r: 'Deploy-Backend', c: '#e99012d4' },
    { n: 'Docker', r: 'Container', c: '#2496ed' },
  ]

  const EXT_HOW_STEPS = [
    { icon: '🔽', title: 'Download & Install', desc: 'Click "Add to Chrome — Free" → Download ZIP → Extract folder → chrome://extensions → Developer Mode ON → Load Unpacked → Select folder.', color: '#00F5FF' },
    { icon: '🔐', title: 'Login with Clerk', desc: 'Click extension icon → "Open App to Login" button appears → Sign in via Google/Email on the web app → Extension auto-detects your session.', color: '#a78bfa' },
    { icon: '👤', title: 'Setup Work Session', desc: 'Enter your name (auto-filled from Clerk), select your designation, set work hours. Quick presets: ⚡30s, 🧪1min, 🔬5min, 💼8hrs for easy setup.', color: '#ffd166' },
    { icon: '▶', title: 'Start Monitoring', desc: 'Click START MONITORING. Extension silently runs in background — scans your face via camera every 30 seconds automatically.', color: '#4ade80' },
    { icon: '🧠', title: 'AI Detects Emotions', desc: 'DeepFace AI analyzes facial micro-expressions. TextBlob + Hinglish NLP analyzes text as you type anywhere. All results logged to Supabase in real-time.', color: '#ff6b6b' },
    { icon: '📊', title: 'EOD Report to HR', desc: 'When work timer hits 00:00:00, click "Send Report". Your full emotional analysis — hourly breakdown, stress score, dominant mood — is emailed to HR automatically.', color: '#00FF88' },
  ]

  return (
    <div style={S.page}>
      <style>{CSS}</style>
      <Particles />

      {/* ── MODALS ── */}
      {showChromeModal && <ChromeInstallModal onClose={() => setShowChromeModal(false)} />}
      {showDemoModal && <WatchDemoModal onClose={() => setShowDemoModal(false)} />}

      {/* ══ NAVBAR ══ */}
      <nav style={{ ...S.nav, ...(scrolled ? S.navScrolled : {}) }}>
        <div style={S.navWrap}>
          <div style={S.logo}>
            <svg width="30" height="30" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" fill="#050B18"/>
              <polygon points="50,18 74,32 74,68 50,82 26,68 26,32" fill="none" stroke="#00F5FF" strokeWidth="3"/>
              <path d="M35,50 C33,41 38,33 44,36 C43,28 49,24 50,27 L50,73 C49,76 43,72 44,64 C38,67 33,59 35,50Z" fill="#00F5FF"/>
              <path d="M65,50 C67,41 62,33 56,36 C57,28 51,24 50,27 L50,73 C51,76 57,72 56,64 C62,67 67,59 65,50Z" fill="#00F5FF"/>
            </svg>
            <span style={S.logoTxt}>Amdox<span style={{ color: '#00F5FF' }}>AI</span></span>
          </div>
          <div style={S.navLinks} className="navlinks">
            {[['features','Features'],['how-it-works','How It Works'],['extension','Extension'],['pricing','Pricing'],['contact','Contact']].map(([id, label]) => (
              <button key={id} onClick={() => goto(id)} style={S.navLink}>{label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }} className="navbtns">
            <button onClick={() => nav('/sign-in')} style={S.btnGhost}>Sign In</button>
            <button onClick={() => nav('/sign-up')} style={S.btnCyan}>Get Started →</button>
          </div>
          <button style={S.burger} onClick={() => setMenuOpen(!menuOpen)} className="burger">☰</button>
        </div>
        {menuOpen && (
          <div style={S.mobileMenu}>
            {[['features','Features'],['how-it-works','How It Works'],['extension','Extension'],['pricing','Pricing'],['contact','Contact']].map(([id,l]) => (
              <button key={id} onClick={() => goto(id)} style={S.mobileLink}>{l}</button>
            ))}
            <button onClick={() => nav('/sign-in')} style={{ ...S.mobileLink, color: '#00F5FF' }}>Sign In</button>
            <button onClick={() => nav('/sign-up')} style={{ ...S.btnCyan, width: '100%', marginTop: 8 }}>Get Started →</button>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <section style={S.hero}>
        <div style={S.heroBadgeRow} className="fadeUp">
          <span style={S.badge}>● AI-Powered</span>
          <span style={S.badge}>● Production-Ready</span>
          <span style={S.badge}>● Multi-Tenant SaaS</span>
        </div>
        <h1 style={S.heroH1} className="fadeUp d1">
          Emotion Intelligence<br/>
          <span style={{ color: '#00F5FF', textShadow: '0 0 60px rgba(0,245,255,0.5)' }}>for Modern HR</span>
        </h1>
        <p style={S.heroTagline} className="fadeUp d2">Stop guessing. Start knowing.</p>
        <p style={S.heroSub} className="fadeUp d3">
          AmdoxAI detects employee emotional states through text, voice, and facial analysis in real-time —
          giving HR teams proactive insights before burnout, attrition, or mental health crises happen.
        </p>
        <div style={S.heroBtns} className="fadeUp d4">
          <button onClick={() => nav('/employee')} style={S.btnCyanLg}>Launch Dashboard →</button>
          <button onClick={() => setShowDemoModal(true)} style={S.btnOutlineLg}>▶ Watch Demo</button>
        </div>
        <div style={S.trustRow} className="fadeUp d5">
          {['🔒 Bank-level Security','⚡ Real-time AI','🏢 Multi-Tenant','🇮🇳 Hinglish NLP'].map(t => (
            <span key={t} style={S.trustBadge}>{t}</span>
          ))}
        </div>
        <div style={S.dashCard} className="fadeUp d6">
          <div style={S.dashBar}>
            <span style={{ ...S.dot, background: '#ff5f57' }}/><span style={{ ...S.dot, background: '#febc2e' }}/><span style={{ ...S.dot, background: '#28c840' }}/>
            <span style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, margin: '0 12px' }}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            {[['Stress Score','42%','#ff6b6b'],['Active Alerts','3','#ffd166'],['Employees','128','#00F5FF']].map(([l,v,c]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: '#8899aa', fontSize: 10, marginBottom: 4 }}>{l}</div>
                <div style={{ color: c, fontSize: 22, fontWeight: 700, fontFamily: 'monospace' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 3, height: 70 }}>
              {[35,55,40,75,50,65,45,85,60,70,48,90].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: i >= 10 ? '#00F5FF' : '#1e3a4a', borderRadius: '2px 2px 0 0', opacity: i >= 10 ? 1 : 0.5 }}/>
              ))}
            </div>
            <div style={{ width: 150 }}>
              {[['Happy','#00F5FF',90],['Stress','#ff6b6b',65],['Neutral','#8899aa',35]].map(([l,c,w]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }}/>
                  <span style={{ color: '#ccc', fontSize: 11, width: 45 }}>{l}</span>
                  <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <div style={{ width: `${w}%`, height: '100%', background: c, borderRadius: 2 }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <div id="stats" style={S.statsBar}>
        {[['10','+','Organizations'],['1,000','+','Employees Monitored'],['50,000','+','Emotion Logs'],['99.9','%','Uptime SLA']].map(([n,s,l]) => (
          <div key={l} style={S.statItem}>
            <div style={S.statNum}><Counter end={parseInt(n.replace(',',''))} suffix={s}/></div>
            <div style={S.statLbl}>{l}</div>
          </div>
        ))}
      </div>

      {/* ══ PROBLEM ══ */}
      <section style={S.sec}>
        <Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', maxWidth: 1100, margin: '0 auto' }} className="problemGrid">
            <div>
              <div style={S.tag}>THE PROBLEM</div>
              <h2 style={S.h2}>The Hidden Crisis in<br/>Every Workplace</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32 }}>
                {[
                  ['76%', 'of employees experience burnout at least once per year'],
                  ['₹1.8L Cr', 'lost annually due to employee stress in India alone'],
                  ['83%', 'of HR teams detect mental health issues too late to help'],
                  ['12%', 'of employees openly report stress to their HR department'],
                ].map(([stat, text]) => (
                  <div key={stat} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <span style={{ color: '#ff6b6b', fontWeight: 800, fontSize: 18, minWidth: 80, fontFamily: 'monospace' }}>{stat}</span>
                    <span style={{ color: '#8899aa', fontSize: 14, lineHeight: 1.6, paddingTop: 2 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'rgba(255,107,107,0.05)', border: '1px solid rgba(255,107,107,0.15)', borderRadius: 20, padding: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 24 }}>😰</div>
              <p style={{ color: '#e2e8f0', fontSize: 18, lineHeight: 1.8, fontStyle: 'italic', marginBottom: 24 }}>
                "By the time HR realizes an employee is struggling, they've already decided to quit."
              </p>
              <p style={{ color: '#ff6b6b', fontSize: 13, fontWeight: 600 }}>— Industry Research, 2024</p>
              <div style={{ marginTop: 32, padding: '16px 20px', background: 'rgba(0,245,255,0.05)', borderRadius: 12, border: '1px solid rgba(0,245,255,0.15)' }}>
                <p style={{ color: '#00F5FF', fontWeight: 700, fontSize: 15 }}>AmdoxAI changes this — permanently. ✅</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" style={{ ...S.sec, background: 'rgba(0,245,255,0.02)' }}>
        <Reveal>
          <div style={S.secHead}>
            <div style={S.tag}>CAPABILITIES</div>
            <h2 style={S.h2}>Everything your HR team needs</h2>
            <p style={S.sub}>Built for scale. Ready for production. Designed for India.</p>
          </div>
        </Reveal>
        <div style={S.featGrid}>
          {FEATURES.map((f, i) => (
            <Reveal key={f.t} delay={i * 0.08}>
              <div style={S.featCard} className="card">
                <div style={{ ...S.featIcon, color: f.c, borderColor: f.c + '33' }}>{f.icon}</div>
                <h3 style={S.featTitle}>{f.t}</h3>
                <p style={S.featDesc}>{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ AI ENGINE ══ */}
      <section style={S.sec}>
        <Reveal>
          <div style={S.secHead}>
            <div style={S.tag}>TECHNOLOGY</div>
            <h2 style={S.h2}>Triple-Layer AI Emotion Engine</h2>
            <p style={S.sub}>Most tools use one signal. We use three.</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.entries(MODALS).map(([k, v]) => (
                <button key={k} onClick={() => setActiveTab(k)} style={{ ...S.tabBtn, ...(activeTab === k ? S.tabActive : {}) }}>
                  {v.icon} {v.name}
                </button>
              ))}
            </div>
            <div style={S.aiCard}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }} className="aiGrid">
                <div>
                  <div style={{ color: '#8899aa', fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>MODEL</div>
                  <div style={{ color: '#00F5FF', fontWeight: 700, fontSize: 15, fontFamily: 'monospace' }}>{MODALS[activeTab].model}</div>
                </div>
                <div>
                  <div style={{ color: '#8899aa', fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>CONFIDENCE RANGE</div>
                  <div style={{ color: '#ffd166', fontWeight: 700, fontSize: 15, fontFamily: 'monospace' }}>{MODALS[activeTab].conf}</div>
                </div>
                <div>
                  <div style={{ color: '#8899aa', fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>MODALITY</div>
                  <div style={{ color: '#4ade80', fontWeight: 700, fontSize: 15 }}>{MODALS[activeTab].icon} {MODALS[activeTab].name}</div>
                </div>
              </div>
              <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(0,245,255,0.04)', borderRadius: 10, border: '1px solid rgba(0,245,255,0.1)' }}>
                <p style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 1.7 }}>{MODALS[activeTab].detail}</p>
              </div>
              <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }}/>
                <div style={{ color: '#00F5FF', fontSize: 12, fontWeight: 600 }}>↓ FUSION ENGINE</div>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }}/>
              </div>
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#8899aa', fontSize: 11 }}>OUTPUT</div>
                  <div style={{ color: '#fff', fontWeight: 600, marginTop: 4 }}>Final Emotion + Confidence</div>
                </div>
                <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#8899aa', fontSize: 11 }}>METHOD</div>
                  <div style={{ color: '#fff', fontWeight: 600, marginTop: 4 }}>Weighted Average Fusion</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" style={{ ...S.sec, background: 'rgba(0,245,255,0.02)' }}>
        <Reveal>
          <div style={S.secHead}>
            <div style={S.tag}>WORKFLOW</div>
            <h2 style={S.h2}>How It Works</h2>
            <p style={S.sub}>From employee input to HR insight in under 2 seconds</p>
          </div>
        </Reveal>
        <div style={S.stepsRow} className="stepsRow">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div style={S.stepCard}>
                <div style={S.stepNum}>{s.n}</div>
                <div style={{ fontSize: 36, margin: '12px 0' }}>{s.icon}</div>
                <h3 style={S.stepTitle}>{s.t}</h3>
                <p style={S.stepDesc}>{s.d}</p>
                {i < 3 && <div style={S.arrow} className="stepArrow">→</div>}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ CHROME EXTENSION ══ */}
      <section id="extension" style={S.sec}>
        <Reveal>
          <div style={S.secHead}>
            <div style={S.tag}>CHROME EXTENSION</div>
            <h2 style={S.h2}>Monitor All Day —<br/>Even While They Work</h2>
            <p style={S.sub}>Runs silently in the background. Employees barely notice it's there.</p>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, maxWidth: 1100, margin: '0 auto' }} className="extGrid">
          <Reveal delay={0.1}>
            <div style={S.extFlow}>
              <div style={{ color: '#00F5FF', fontSize: 11, letterSpacing: 3, fontWeight: 600, marginBottom: 24, textAlign: 'center' }}>EXTENSION FLOW</div>
              {[
                ['🔧','Install Extension','#00F5FF'],
                ['🔐','Login via Clerk','#a78bfa'],
                ['▶','Start Work Session','#ffd166'],
                ['📸','Auto Face Scan (30s)','#00F5FF'],
                ['🧠','AI Detects Emotion','#ff6b6b'],
                ['💾','Log to Supabase','#00F5FF'],
                ['📊','EOD Report → HR','#4ade80'],
              ].map(([ico, lbl, c], i, arr) => (
                <div key={lbl} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${c}44`, borderRadius: 10, padding: '10px 20px', width: '100%', background: 'rgba(0,0,0,0.2)' }}>
                    <span style={{ fontSize: 16 }}>{ico}</span>
                    <span style={{ color: '#e2e8f0', fontSize: 13 }}>{lbl}</span>
                    <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: c }}/>
                  </div>
                  {i < arr.length - 1 && <div style={{ width: 2, height: 18, background: `linear-gradient(${c}66, ${c}22)` }}/>}
                </div>
              ))}
            </div>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              ['📸','Auto Face Scan every 30 seconds','Passive monitoring without disrupting work'],
              ['⏱','Work session timer + break tracking','Accurate work hours with precision'],
              ['🔔','Browser stress alert notification','Instant alert when stress threshold crossed'],
              ['📋','Automatic End-of-Day report to HR','Hourly heatmap sent automatically at 6 PM'],
              ['💾','Offline queue with auto-sync','Reports saved locally, synced when back online'],
              ['📱','PWA — Add to home screen','Works like native app on any mobile device'],
            ].map(([ico, t, d], i) => (
              <Reveal key={t} delay={i * 0.07}>
                <div style={S.extFeat} className="card">
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{ico}</span>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{t}</div>
                    <div style={{ color: '#8899aa', fontSize: 12, marginTop: 2 }}>{d}</div>
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.5}>
              <button onClick={() => setShowChromeModal(true)}
                style={{ ...S.btnCyan, marginTop: 8, justifyContent: 'center', width: '100%', padding: '14px', fontSize: 15, fontWeight: 800, borderRadius: 12 }}>
                🔽 Add to Chrome — Free
              </button>
              <p style={{ color: '#8899aa', fontSize: 12, marginTop: 8, textAlign: 'center' }}>Works with Chrome, Edge, and Brave</p>
            </Reveal>
          </div>
        </div>

        {/* ══ HOW EXTENSION WORKS — Step by Step ══ */}
        <div style={{ maxWidth: 1100, margin: '72px auto 0' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={S.tag}>STEP-BY-STEP GUIDE</div>
              <h3 style={{ color: '#fff', fontSize: 'clamp(22px,3vw,38px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 12 }}>
                How the Extension Works
              </h3>
              <p style={{ color: '#8899aa', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
                From download to your first emotion detection — takes less than 2 minutes
              </p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {EXT_HOW_STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${step.color}22`, borderRadius: 16, padding: '24px 20px', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }} className="card">
                  <div style={{ position: 'absolute', top: 8, right: 14, color: step.color, fontSize: 52, fontWeight: 900, opacity: 0.06, fontFamily: 'monospace', lineHeight: 1, userSelect: 'none' }}>0{i+1}</div>
                  <div style={{ width: 46, height: 46, borderRadius: 12, marginBottom: 16, background: `${step.color}12`, border: `1px solid ${step.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{step.icon}</div>
                  <div style={{ color: step.color, fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>STEP 0{i+1}</div>
                  <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 10, margin: '0 0 10px' }}>{step.title}</h4>
                  <p style={{ color: '#8899aa', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.4}>
            <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setShowChromeModal(true)} style={S.btnCyanLg}>
                🔽 Install Extension Now — It's Free
              </button>
              <p style={{ color: '#334155', fontSize: 12 }}>
                No Chrome Web Store required · Open Source · Takes 60 seconds
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ WHY UNIQUE ══ */}
      <section style={{ ...S.sec, background: 'rgba(0,245,255,0.02)' }}>
        <Reveal>
          <div style={S.secHead}>
            <div style={S.tag}>DIFFERENTIATORS</div>
            <h2 style={S.h2}>Built Different.<br/>Built for India.</h2>
            <p style={S.sub}>Why AmdoxAI stands apart from every other HR tool</p>
          </div>
        </Reveal>
        <div style={S.whyGrid}>
          {WHY.map((w, i) => (
            <Reveal key={w.t} delay={i * 0.07}>
              <div style={S.whyCard} className="card">
                <div style={{ fontSize: 36, marginBottom: 16 }}>{w.icon}</div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 10 }}>{w.t}</h3>
                <p style={{ color: '#8899aa', fontSize: 13, lineHeight: 1.7 }}>{w.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pricing" style={S.sec}>
        <Reveal>
          <div style={S.secHead}>
            <div style={S.tag}>PRICING</div>
            <h2 style={S.h2}>Simple, Transparent Pricing</h2>
            <p style={S.sub}>Start free. Scale as you grow. No hidden fees.</p>
          </div>
        </Reveal>
        <div style={S.pricingGrid}>
          {PRICING.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <div style={{ ...S.pricingCard, ...(p.popular ? S.pricingPopular : {}) }} className="card">
                {p.popular && <div style={S.popularBadge}>⭐ Most Popular</div>}
                <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
                <div style={{ color: p.popular ? '#00F5FF' : '#e2e8f0', fontSize: 32, fontWeight: 800, margin: '16px 0 4px', fontFamily: 'monospace' }}>{p.price}</div>
                <div style={{ color: '#8899aa', fontSize: 12, marginBottom: 24 }}>{p.sub}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ color: '#00F5FF', fontSize: 12 }}>✓</span>
                      <span style={{ color: '#ccc', fontSize: 13 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => nav('/sign-up')}
                  style={p.ctaStyle === 'cyan' ? { ...S.btnCyan, width: '100%', justifyContent: 'center' } : { ...S.btnGhost, width: '100%', justifyContent: 'center' }}>
                  {p.cta}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ ...S.sec, background: 'rgba(0,245,255,0.02)' }}>
        <Reveal>
          <div style={S.secHead}>
            <div style={S.tag}>TESTIMONIALS</div>
            <h2 style={S.h2}>Trusted by HR Leaders</h2>
            <p style={S.sub}>Real results from real organizations</p>
          </div>
        </Reveal>
        <div style={S.testGrid}>
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div style={S.testCard} className="card">
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {Array(t.stars).fill(0).map((_, j) => <span key={j} style={{ color: '#ffd166', fontSize: 14 }}>★</span>)}
                </div>
                <p style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 1.8, fontStyle: 'italic', marginBottom: 20 }}>"{t.text}"</p>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                <div style={{ color: '#8899aa', fontSize: 12, marginTop: 2 }}>{t.role}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ TECH STACK ══ */}
      <section style={S.sec}>
        <Reveal>
          <div style={S.secHead}>
            <div style={S.tag}>TECHNOLOGY</div>
            <h2 style={S.h2}>Enterprise Technology Stack</h2>
            <p style={S.sub}>Built with battle-tested, production-grade technologies</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={S.techWrap}>
            {TECH.map(t => (
              <div key={t.n} style={{ ...S.techChip, borderColor: t.c + '33' }}>
                <div style={{ color: t.c, fontWeight: 700, fontSize: 13 }}>{t.n}</div>
                <div style={{ color: '#8899aa', fontSize: 10, marginTop: 2 }}>{t.r}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section style={S.ctaBanner}>
        <Reveal>
          <h2 style={{ color: '#fff', fontSize: 'clamp(24px,4vw,42px)', fontWeight: 800, marginBottom: 12 }}>
            Ready to monitor your team's wellbeing?
          </h2>
          <p style={{ color: '#8899aa', marginBottom: 32, fontSize: 16 }}>Secure. Scalable. Proactive. Built for India.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => nav('/sign-up')} style={S.btnCyanLg}>Open Platform →</button>
            <button onClick={() => goto('contact')} style={S.btnOutlineLg}>Talk to Us</button>
          </div>
        </Reveal>
      </section>

      {/* ══ CONTACT ══ */}
      <section id="contact" style={S.sec}>
        <Reveal>
          <div style={S.secHead}>
            <div style={S.tag}>CONTACT</div>
            <h2 style={S.h2}>Get In Touch</h2>
            <p style={S.sub}>Have questions? We'd love to hear from you.</p>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, maxWidth: 900, margin: '0 auto' }} className="contactGrid">
          <Reveal delay={0.1}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                ['📧', 'Email', 'abhinash@amdoxai.com', 'mailto:abhinash@amdoxai.com'],
                ['🐱', 'GitHub', 'github.com/abhinashkumarin', 'https://github.com/abhinashkumarin'],
                ['💼', 'LinkedIn', 'linkedin.com/in/abhinash', 'https://www.linkedin.com/in/abhinash-kumar-833b82331/'],
                ['📸', 'Instagram', '@Instagram', 'https://www.instagram.com/iaviiiii_03?igsh=bzAzd204aGkzcWs1'],
                ['🌐', 'Portfolio', 'portfolio.vercel.app', 'https://tech-nanha.vercel.app/'],
              ].map(([ico, lbl, val, href]) => (
                <a key={lbl} href={href} target="_blank" rel="noopener noreferrer" style={S.contactRow}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{ico}</span>
                  <div>
                    <div style={{ color: '#8899aa', fontSize: 11, letterSpacing: 1 }}>{lbl}</div>
                    <div style={{ color: '#00F5FF', fontWeight: 600, fontSize: 14 }}>{val}</div>
                  </div>
                </a>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div style={S.contactForm}>
              {[['name','Your Name','text'],['email','Your Email','email'],['org','Organization Name','text']].map(([k,p,t]) => (
                <input key={k} type={t} placeholder={p} value={formData[k]}
                  onChange={e => setFormData(f => ({ ...f, [k]: e.target.value }))}
                  style={S.input} />
              ))}
              <textarea placeholder="Your Message" rows={4} value={formData.msg}
                onChange={e => setFormData(f => ({ ...f, msg: e.target.value }))}
                style={{ ...S.input, resize: 'vertical' }} />
              <button style={{ ...S.btnCyan, justifyContent: 'center' }}>Send Message →</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={S.footer}>
        <div style={S.footerTop}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 300 }}>
            <div style={S.logo}>
              <svg width="28" height="28" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50" fill="#050B18"/>
                <polygon points="50,18 74,32 74,68 50,82 26,68 26,32" fill="none" stroke="#00F5FF" strokeWidth="3"/>
                <path d="M35,50 C33,41 38,33 44,36 C43,28 49,24 50,27 L50,73 C49,76 43,72 44,64 C38,67 33,59 35,50Z" fill="#00F5FF"/>
                <path d="M65,50 C67,41 62,33 56,36 C57,28 51,24 50,27 L50,73 C51,76 57,72 56,64 C62,67 67,59 65,50Z" fill="#00F5FF"/>
              </svg>
              <span style={S.logoTxt}>Amdox<span style={{ color: '#00F5FF' }}>AI</span></span>
            </div>
            <p style={{ color: '#8899aa', fontSize: 13, lineHeight: 1.7 }}>
              AI-powered emotion intelligence for modern Indian workplaces. Built with ❤️ for HR teams who care.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                ['https://github.com/abhinashkumarin', <svg key="gh" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>],
                ['https://www.linkedin.com/in/abhinash-kumar-833b82331/', <svg key="li" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>],
                ['https://www.instagram.com/iaviiiii_03?igsh=bzAzd204aGkzcWs1', <svg key="ig" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>],
              ].map(([href, icon]) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" style={S.socialBtn}>{icon}</a>
              ))}
              <a href="https://tech-nanha.vercel.app/" target="_blank" rel="noopener noreferrer" style={S.portfolioBtn}>🌐 Portfolio</a>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }} className="footerCols">
            {[
              ['Product', [['Features','features'],['How It Works','how-it-works'],['Extension','extension'],['Pricing','pricing']]],
              ['Platform', [['Employee View','/employee'],['HR Dashboard','/analytics'],['Admin Panel','/admin'],['API Docs','/api-docs']]],
              ['Company', [['About', '/about'],['GitHub','https://github.com/abhinashkumarin'],['LinkedIn','https://www.linkedin.com/in/abhinash-kumar-833b82331/'],['Contact','contact']]],
            ].map(([title, links]) => (
              <div key={title}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 16 }}>{title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {links.map(([label, href]) => (
                    href.startsWith('/') || href.startsWith('http') ? (
                      <a key={label} href={href} style={S.footerLink}>{label}</a>
                    ) : (
                      <button key={label} onClick={() => goto(href)} style={S.footerLinkBtn}>{label}</button>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={S.footerBottom}>
          <span style={{ color: '#8899aa', fontSize: 13 }}>© 2025 AmdoxAI. All rights reserved. MIT License.</span>
          <span style={{ color: '#8899aa', fontSize: 13 }}>
            Made with <span style={{ color: '#ff6b6b' }}>❤️</span> by{' '}
            <a href="https://tech-nanha.vercel.app/" target="_blank" rel="noopener noreferrer"
              style={{ color: '#00F5FF', textDecoration: 'none', fontWeight: 700 }}>Abhinash Kumar</a>
          </span>
        </div>
      </footer>
    </div>
  )
}

const S = {
  page: { background: '#050B18', minHeight: '100vh', fontFamily: "'DM Sans', system-ui, sans-serif", position: 'relative', overflowX: 'hidden' },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '14px 24px', transition: 'all 0.3s' },
  navScrolled: { background: 'rgba(5,11,24,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,245,255,0.08)' },
  navWrap: { maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24 },
  logo: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 },
  logoTxt: { color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' },
  navLinks: { display: 'flex', gap: 4, flex: 1, justifyContent: 'center' },
  navLink: { background: 'none', border: 'none', color: '#8899aa', cursor: 'pointer', padding: '6px 14px', fontSize: 13, fontFamily: 'inherit', transition: 'color 0.2s', borderRadius: 8 },
  btnGhost: { background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'all 0.2s', flexShrink: 0 },
  btnCyan: { background: 'linear-gradient(135deg,#00F5FF,#0080FF)', color: '#050B18', padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  btnCyanLg: { background: 'linear-gradient(135deg,#00F5FF,#0080FF)', color: '#050B18', padding: '14px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, fontFamily: 'inherit' },
  btnOutlineLg: { background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '14px 32px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 16, fontFamily: 'inherit' },
  burger: { display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', marginLeft: 'auto' },
  mobileMenu: { display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0 8px', borderTop: '1px solid rgba(0,245,255,0.1)', marginTop: 12 },
  mobileLink: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', textAlign: 'left', padding: '8px 0', fontSize: 14, fontFamily: 'inherit' },
  hero: { position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', textAlign: 'center' },
  heroBadgeRow: { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 },
  badge: { background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 999, padding: '5px 14px', color: '#00F5FF', fontSize: 11, letterSpacing: 0.5 },
  heroH1: { color: '#fff', fontSize: 'clamp(38px,7vw,88px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 16, letterSpacing: '-3px' },
  heroTagline: { color: '#00F5FF', fontSize: 'clamp(16px,2.5vw,22px)', fontWeight: 600, marginBottom: 20, letterSpacing: '0.5px' },
  heroSub: { color: '#8899aa', fontSize: 'clamp(14px,1.8vw,18px)', lineHeight: 1.8, marginBottom: 40, maxWidth: 620 },
  heroBtns: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 },
  trustRow: { display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64 },
  trustBadge: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 14px', color: '#8899aa', fontSize: 12 },
  dashCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: 20, padding: '20px 24px', width: '100%', maxWidth: 740, backdropFilter: 'blur(10px)' },
  dashBar: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 },
  dot: { width: 12, height: 12, borderRadius: '50%' },
  statsBar: { position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid rgba(0,245,255,0.1)', borderBottom: '1px solid rgba(0,245,255,0.1)', background: 'rgba(0,245,255,0.03)' },
  statItem: { padding: '40px 24px', textAlign: 'center', borderRight: '1px solid rgba(0,245,255,0.08)' },
  statNum: { color: '#00F5FF', fontSize: 'clamp(24px,4vw,46px)', fontWeight: 900, marginBottom: 8, fontFamily: 'monospace' },
  statLbl: { color: '#8899aa', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  sec: { position: 'relative', zIndex: 1, padding: '100px 24px' },
  secHead: { textAlign: 'center', marginBottom: 64 },
  tag: { color: '#00F5FF', fontSize: 11, letterSpacing: 3, fontWeight: 700, marginBottom: 16 },
  h2: { color: '#fff', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-1.5px', lineHeight: 1.1 },
  sub: { color: '#8899aa', fontSize: 16, maxWidth: 540, margin: '0 auto' },
  featGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' },
  featCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 28, transition: 'all 0.3s' },
  featIcon: { width: 52, height: 52, borderRadius: 14, border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 20 },
  featTitle: { color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 10 },
  featDesc: { color: '#8899aa', fontSize: 13, lineHeight: 1.7 },
  tabBtn: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 20px', color: '#8899aa', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s' },
  tabActive: { background: 'rgba(0,245,255,0.1)', borderColor: '#00F5FF', color: '#00F5FF' },
  aiCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: 20, padding: 32 },
  stepsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 8, maxWidth: 1100, margin: '0 auto', position: 'relative' },
  stepCard: { position: 'relative', padding: '32px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, textAlign: 'center' },
  stepNum: { color: '#00F5FF', fontSize: 11, fontWeight: 700, letterSpacing: 3 },
  stepTitle: { color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 10 },
  stepDesc: { color: '#8899aa', fontSize: 12, lineHeight: 1.6 },
  arrow: { position: 'absolute', right: -18, top: '50%', transform: 'translateY(-50%)', color: '#00F5FF', fontSize: 22, zIndex: 2 },
  extFlow: { background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.12)', borderRadius: 18, padding: 28, display: 'flex', flexDirection: 'column', gap: 0 },
  extFeat: { display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' },
  whyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' },
  whyCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 32, textAlign: 'center', transition: 'all 0.3s' },
  pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, maxWidth: 980, margin: '0 auto' },
  pricingCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32, position: 'relative', transition: 'all 0.3s' },
  pricingPopular: { border: '1px solid rgba(0,245,255,0.4)', background: 'rgba(0,245,255,0.05)', transform: 'scale(1.03)' },
  popularBadge: { position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#00F5FF,#0080FF)', color: '#050B18', padding: '4px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
  testGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, maxWidth: 1100, margin: '0 auto' },
  testCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 28, transition: 'all 0.3s' },
  techWrap: { display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 900, margin: '0 auto' },
  techChip: { border: '1px solid', borderRadius: 12, padding: '12px 20px', background: 'rgba(255,255,255,0.02)', textAlign: 'center', minWidth: 100 },
  ctaBanner: { position: 'relative', zIndex: 1, padding: '80px 24px', textAlign: 'center', background: 'linear-gradient(135deg,rgba(0,245,255,0.06),rgba(0,128,255,0.04))', borderTop: '1px solid rgba(0,245,255,0.1)', borderBottom: '1px solid rgba(0,245,255,0.1)' },
  input: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  contactRow: { display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', transition: 'all 0.2s' },
  contactForm: { display: 'flex', flexDirection: 'column', gap: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 32 },
  footer: { position: 'relative', zIndex: 1, background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(0,245,255,0.08)', padding: '64px 24px 32px' },
  footerTop: { maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 64, marginBottom: 48 },
  footerLink: { color: '#8899aa', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s', fontFamily: 'inherit' },
  footerLinkBtn: { background: 'none', border: 'none', color: '#8899aa', fontSize: 13, cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'inherit', transition: 'color 0.2s' },
  footerBottom: { maxWidth: 1200, margin: '0 auto', paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  socialBtn: { color: '#8899aa', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s', textDecoration: 'none' },
  portfolioBtn: { color: '#00F5FF', textDecoration: 'none', fontSize: 12, border: '1px solid rgba(0,245,255,0.3)', borderRadius: 8, padding: '6px 14px', background: 'rgba(0,245,255,0.05)', fontFamily: 'inherit' },
}

const CSS = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
  .fadeUp { animation: fadeUp 0.7s ease both; }
  .d1 { animation-delay: 0.1s; } .d2 { animation-delay: 0.2s; }
  .d3 { animation-delay: 0.3s; } .d4 { animation-delay: 0.4s; }
  .d5 { animation-delay: 0.5s; } .d6 { animation-delay: 0.6s; }
  .card:hover { border-color: rgba(0,245,255,0.25) !important; transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
  nav button:hover { color: #00F5FF !important; }
  a:hover { color: #00F5FF !important; }
  @media (max-width: 900px) {
    .navlinks { display: none !important; }
    .navbtns { display: none !important; }
    .burger { display: block !important; }
    .problemGrid { grid-template-columns: 1fr !important; gap: 32px !important; }
    .stepsRow { grid-template-columns: 1fr 1fr !important; }
    .stepArrow { display: none !important; }
    .extGrid { grid-template-columns: 1fr !important; gap: 32px !important; }
    .contactGrid { grid-template-columns: 1fr !important; gap: 32px !important; }
    .footerTop { grid-template-columns: 1fr !important; gap: 40px !important; }
    .footerCols { grid-template-columns: 1fr 1fr !important; }
    .aiGrid { grid-template-columns: 1fr !important; gap: 16px !important; }
  }
  @media (max-width: 600px) {
    .stepsRow { grid-template-columns: 1fr !important; }
    .footerCols { grid-template-columns: 1fr !important; }
  }
`