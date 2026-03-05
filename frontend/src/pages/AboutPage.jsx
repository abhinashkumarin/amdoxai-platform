import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function useInView(threshold = 0.12) {
  const ref = useRef()
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, vis]
}

function Reveal({ children, delay = 0, direction = 'up' }) {
  const [ref, vis] = useInView()
  const transforms = { up: 'translateY(36px)', left: 'translateX(-36px)', right: 'translateX(36px)', scale: 'scale(0.92)' }
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : transforms[direction],
      transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.8s cubic-bezier(.16,1,.3,1) ${delay}s`
    }}>
      {children}
    </div>
  )
}

function Particles() {
  const ref = useRef()
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d')
    let raf
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.2 + 0.2, dx: (Math.random() - 0.5) * 0.2, dy: (Math.random() - 0.5) * 0.2,
      o: Math.random() * 0.3 + 0.05
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
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

function InternshipCredits() {
  const [ref, vis] = useInView(0.1)
  const MEMBERS = [
    { name: 'Nernay Kumar', role: 'Full Stack Development' },
    { name: 'Avinash Kumar', role: 'AI / ML Integration' },
    { name: 'Manthan Soni', role: 'Backend & API Design' },
    { name: 'Divyani Singh', role: 'Frontend & UI/UX' },
  ]

  return (
    <div ref={ref} style={{
      position: 'relative', zIndex: 1,
      padding: '100px 24px',
      background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,193,7,0.04) 0%, transparent 80%)',
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Gold bordered card */}
        <div style={{
          border: '1px solid rgba(255,193,7,0.35)',
          borderRadius: 28,
          padding: '48px 52px',
          background: 'rgba(255,193,7,0.03)',
          boxShadow: '0 0 80px rgba(255,193,7,0.06), inset 0 0 60px rgba(255,193,7,0.02)',
          opacity: vis ? 1 : 0,
          transform: vis ? 'none' : 'translateY(40px) scale(0.97)',
          transition: 'opacity 0.9s cubic-bezier(.16,1,.3,1), transform 0.9s cubic-bezier(.16,1,.3,1)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative corner accents */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 60, height: 60, borderTop: '2px solid rgba(255,193,7,0.5)', borderLeft: '2px solid rgba(255,193,7,0.5)', borderRadius: '28px 0 0 0' }}/>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, borderTop: '2px solid rgba(255,193,7,0.5)', borderRight: '2px solid rgba(255,193,7,0.5)', borderRadius: '0 28px 0 0' }}/>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: 60, height: 60, borderBottom: '2px solid rgba(255,193,7,0.5)', borderLeft: '2px solid rgba(255,193,7,0.5)', borderRadius: '0 0 0 28px' }}/>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 60, height: 60, borderBottom: '2px solid rgba(255,193,7,0.5)', borderRight: '2px solid rgba(255,193,7,0.5)', borderRadius: '0 0 28px 0' }}/>

          {/* Logo + Company */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <svg width="44" height="44" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50" fill="#050B18"/>
                <polygon points="50,18 74,32 74,68 50,82 26,68 26,32" fill="none" stroke="#FFC107" strokeWidth="3"/>
                <path d="M35,50 C33,41 38,33 44,36 C43,28 49,24 50,27 L50,73 C49,76 43,72 44,64 C38,67 33,59 35,50Z" fill="#FFC107"/>
                <path d="M65,50 C67,41 62,33 56,36 C57,28 51,24 50,27 L50,73 C51,76 57,72 56,64 C62,67 67,59 65,50Z" fill="#FFC107"/>
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px' }}>
                  Amdox<span style={{ color: '#FFC107' }}>AI</span>
                </div>
                <div style={{ color: 'rgba(255,193,7,0.7)', fontSize: 11, letterSpacing: 2, fontWeight: 600 }}>TECHNOLOGIES</div>
              </div>
            </div>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(255,193,7,0.15), rgba(255,193,7,0.05))',
              border: '1px solid rgba(255,193,7,0.3)',
              borderRadius: 10, padding: '6px 20px',
              color: '#FFC107', fontSize: 12, fontWeight: 700, letterSpacing: 2,
            }}>
              INTERNSHIP PROJECT 2026
            </div>
          </div>

          {/* Group badge */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(255,193,7,0.08)',
              border: '1px solid rgba(255,193,7,0.25)',
              borderRadius: 12, padding: '10px 28px',
              color: '#FFC107', fontWeight: 800, fontSize: 16, letterSpacing: 1,
            }}>
              By Group Number 3 &nbsp;|&nbsp; Batch 4.2
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,193,7,0.3), transparent)', marginBottom: 36 }}/>

          {/* Team members with staggered fade-in */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {MEMBERS.map((m, i) => (
              <div key={m.name} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 20px',
                background: 'rgba(255,193,7,0.04)',
                border: '1px solid rgba(255,193,7,0.12)',
                borderRadius: 12,
                opacity: vis ? 1 : 0,
                transform: vis ? 'none' : 'translateX(-20px)',
                transition: `opacity 0.6s ease ${0.3 + i * 0.15}s, transform 0.6s ease ${0.3 + i * 0.15}s`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,193,7,0.05))',
                  border: '1px solid rgba(255,193,7,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFC107', fontWeight: 800, fontSize: 13, fontFamily: 'monospace', flexShrink: 0,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{m.name}</div>
                  <div style={{ color: 'rgba(255,193,7,0.6)', fontSize: 12, marginTop: 2 }}>{m.role}</div>
                </div>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFC107', boxShadow: '0 0 8px rgba(255,193,7,0.8)' }}/>
              </div>
            ))}
          </div>

          {/* Duration badge */}
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <div style={{ color: 'rgba(255,193,7,0.5)', fontSize: 12, letterSpacing: 2, fontWeight: 600 }}>
              THREE MONTH INTERNSHIP PROGRAM
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AboutPage() {
  const nav = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const TIMELINE = [
    { year: '2024 Q1', t: 'Ideation & Research', d: 'Identified the gap in Indian HR tech — no tool understood Hinglish or multi-modal emotional signals. Research began on combining TextBlob, wav2vec2, and DeepFace.' },
    { year: '2024 Q2', t: 'Core AI Engine Built', d: 'Tri-modal emotion fusion engine completed. TextBlob NLP for text, wav2vec2 transformer for voice, DeepFace + RetinaFace for facial analysis. Confidence scoring system designed.' },
    { year: '2024 Q3', t: 'Platform Development', d: 'FastAPI backend, React dashboard, Supabase multi-tenant database, Clerk authentication, and WebSocket real-time infrastructure built and tested.' },
    { year: '2024 Q4', t: 'Chrome Extension Launch', d: 'Passive monitoring extension released. Auto face scan every 30s, session tracking, offline sync queue, and EOD automated reports to HR managers.' },
    { year: '2025 Q1', t: 'Production Ready', d: 'Full multi-tenant SaaS with RBAC, stress alert engine, email notifications, analytics dashboard, and PWA support launched. Beta users onboarded.' },
    { year: '2025+', t: 'Scale & Expand', d: 'Enterprise tier, custom AI models, on-premise deployment, integration APIs, and expansion to Southeast Asian markets with multilingual NLP support.' },
  ]

  const VALUES = [
    { icon: '🔒', t: 'Privacy First', d: 'Employee data is never sold, shared, or used for advertising. Every data point is encrypted, isolated, and accessible only to authorized HR personnel within the same organization.' },
    { icon: '🎯', t: 'Accuracy Over Speed', d: 'We prioritize detection accuracy over response latency. Triple-modal fusion with confidence scoring ensures HR acts on reliable signals, not noise.' },
    { icon: '🇮🇳', t: 'India-Native Design', d: 'Built from the ground up for Indian workplaces — Hinglish NLP, Indian work culture context, regional language expansion roadmap, and India-first pricing.' },
    { icon: '⚖️', t: 'Ethical AI', d: 'Monitoring is transparent. Employees know the system exists. Data is used exclusively for wellbeing — never for performance evaluation, termination, or surveillance.' },
    { icon: '🔓', t: 'Open Architecture', d: 'Public REST API, developer documentation, webhook support, and integration-ready design. AmdoxAI works with your existing HR stack — not against it.' },
    { icon: '♾️', t: 'Continuous Learning', d: 'AI models are fine-tuned quarterly on anonymized aggregate data. The system gets smarter with every organization that uses it, improving accuracy for everyone.' },
  ]

  const STACK_DEEP = [
    {
      layer: 'AI Layer', color: '#00F5FF', items: [
        { n: 'TextBlob', d: 'Sentiment + keyword NLP for Hinglish/English text analysis' },
        { n: 'wav2vec2', d: 'Facebook\'s transformer for raw audio emotion classification' },
        { n: 'DeepFace', d: 'Facial expression analysis with RetinaFace detector' },
        { n: 'Fusion Engine', d: 'Weighted confidence averaging across all 3 modalities' },
      ]
    },
    {
      layer: 'Backend Layer', color: '#a78bfa', items: [
        { n: 'FastAPI', d: 'High-performance async Python API with auto Swagger docs' },
        { n: 'Uvicorn', d: 'ASGI server with WebSocket support for real-time streams' },
        { n: 'Supabase', d: 'PostgreSQL with Row Level Security for multi-tenant isolation' },
        { n: 'Redis', d: 'Pub/sub message broker for instant cross-tenant notifications' },
      ]
    },
    {
      layer: 'Frontend Layer', color: '#ffd166', items: [
        { n: 'React 18', d: 'Concurrent rendering with hooks-based architecture' },
        { n: 'Vite 5', d: 'Lightning-fast HMR build tool with optimized chunking' },
        { n: 'Clerk Auth', d: 'JWT-based authentication with social login support' },
        { n: 'Chrome MV3', d: 'Manifest V3 extension with service worker background scanning' },
      ]
    },
  ]

  return (
    <div style={S.page}>
      <style>{CSS}</style>
      <Particles />

      {/* NAVBAR */}
      <nav style={{ ...S.nav, ...(scrolled ? S.navScrolled : {}) }}>
        <div style={S.navWrap}>
          <div style={S.logo} onClick={() => nav('/')}>
            <svg width="28" height="28" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" fill="#050B18"/>
              <polygon points="50,18 74,32 74,68 50,82 26,68 26,32" fill="none" stroke="#00F5FF" strokeWidth="3"/>
              <path d="M35,50 C33,41 38,33 44,36 C43,28 49,24 50,27 L50,73 C49,76 43,72 44,64 C38,67 33,59 35,50Z" fill="#00F5FF"/>
              <path d="M65,50 C67,41 62,33 56,36 C57,28 51,24 50,27 L50,73 C51,76 57,72 56,64 C62,67 67,59 65,50Z" fill="#00F5FF"/>
            </svg>
            <span style={S.logoTxt}>Amdox<span style={{ color: '#00F5FF' }}>AI</span></span>
          </div>
          <div style={{ flex: 1 }}/>
          <button onClick={() => nav('/')} style={S.btnGhost}>← Back to Home</button>
          <button onClick={() => nav('/sign-up')} style={S.btnCyan}>Get Started →</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={S.hero}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,245,255,0.06) 0%, transparent 70%)', zIndex: 0 }}/>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 820, margin: '0 auto' }}>
          <div style={S.heroTag} className="fadeUp">ABOUT AMDOXAI</div>
          <h1 style={S.heroH1} className="fadeUp d1">
            We Built the AI That<br/>
            <span style={{ color: '#00F5FF', textShadow: '0 0 60px rgba(0,245,255,0.4)' }}>Listens Before It's Too Late</span>
          </h1>
          <p style={S.heroSub} className="fadeUp d2">
            AmdoxAI was born from a simple frustration — HR teams were always reacting, never anticipating.
            We set out to change that with AI that detects emotional signals before they become crises.
          </p>
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', marginTop: 48 }} className="fadeUp d3">
            {[['India-First','Built natively for Indian workplaces'],['Open Platform','REST API + webhooks'],['Ethical AI','Transparent monitoring always']].map(([t,d]) => (
              <div key={t} style={{ textAlign: 'center' }}>
                <div style={{ color: '#00F5FF', fontWeight: 700, fontSize: 14 }}>{t}</div>
                <div style={{ color: '#8899aa', fontSize: 12, marginTop: 4 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section style={S.sec}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', maxWidth: 1100, margin: '0 auto' }} className="twoCol">
          <Reveal direction="left">
            <div>
              <div style={S.tag}>OUR MISSION</div>
              <h2 style={S.h2}>Prevent Burnout.<br/>Before It Happens.</h2>
              <p style={{ color: '#8899aa', fontSize: 15, lineHeight: 1.9, marginTop: 20 }}>
                Every resignation, every burnout, every mental health crisis at work leaves signals days or weeks before it escalates.
                The problem isn't that these signals don't exist — it's that no one was listening.
              </p>
              <p style={{ color: '#8899aa', fontSize: 15, lineHeight: 1.9, marginTop: 16 }}>
                AmdoxAI was built to listen — through the words employees type, the tone of their voice, and the expressions on their face.
                We give HR teams the ability to act on data, not gut feeling.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 36 }}>
                {[['2-3 weeks','Early signal detection before crisis'],['3x accuracy','Tri-modal vs single-modal AI'],['< 2s','From input to HR alert'],['0','Data sold or shared, ever']].map(([v,l]) => (
                  <div key={l} style={{ padding: '16px 20px', background: 'rgba(0,245,255,0.04)', borderRadius: 14, border: '1px solid rgba(0,245,255,0.12)' }}>
                    <div style={{ color: '#00F5FF', fontWeight: 800, fontSize: 22, fontFamily: 'monospace' }}>{v}</div>
                    <div style={{ color: '#8899aa', fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal direction="right" delay={0.1}>
            <div style={{ background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.12)', borderRadius: 24, padding: 40 }}>
              <div style={{ color: '#00F5FF', fontSize: 11, letterSpacing: 3, marginBottom: 20, fontWeight: 700 }}>WHAT WE BELIEVE</div>
              {[
                'Every employee deserves a workplace that notices when they\'re struggling.',
                'HR teams should be proactive partners in wellbeing, not reactive responders to crisis.',
                'AI should augment human empathy — not replace it.',
                'Workplace monitoring must always be transparent, consensual, and ethical.',
                'Technology built for India must speak India\'s language — literally.',
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00F5FF', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
                  <p style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{b}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOUNDER */}
      <section style={{ ...S.sec, background: 'rgba(0,245,255,0.02)' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={S.tag}>THE BUILDER</div>
            <h2 style={S.h2}>Built by One,<br/>Designed for Millions</h2>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ maxWidth: 780, margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: 28, padding: '48px 56px' }} className="founderCard">
            <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start' }} className="founderInner">
              <div style={{ flexShrink: 0, width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg,#00F5FF,#0080FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, border: '3px solid rgba(0,245,255,0.3)', boxShadow: '0 0 40px rgba(0,245,255,0.2)' }}>
                👨‍💻
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
                  <h3 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: 0 }}>Abhinash Kumar</h3>
                  <span style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', borderRadius: 8, padding: '3px 12px', color: '#00F5FF', fontSize: 11, fontWeight: 700 }}>Founder & Solo Engineer</span>
                </div>
                <p style={{ color: '#8899aa', fontSize: 13, marginBottom: 24 }}>Full-Stack AI Developer • Python • React • Machine Learning</p>
                <p style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 1.9, marginBottom: 20 }}>
                  I built AmdoxAI entirely solo — from the AI models to the frontend, from the database schema to the Chrome extension.
                  The idea came from watching colleagues burn out silently while HR departments had no early warning system.
                </p>
                <p style={{ color: '#8899aa', fontSize: 14, lineHeight: 1.9, marginBottom: 28 }}>
                  As a developer who understands both AI and human behavior, I wanted to build something that actually matters —
                  not just another dashboard, but a system that genuinely helps people before it's too late.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {[['🐱 GitHub','https://github.com/abhinashkumarin'],['💼 LinkedIn','https://www.linkedin.com/in/abhinash-kumar-833b82331/'],['📸 Instagram','https://www.instagram.com/iaviiiii_03?igsh=bzAzd204aGkzcWs1'],['🌐 Portfolio','https://tech-nanha.vercel.app/']].map(([l,h]) => (
                    <a key={l} href={h} target="_blank" rel="noopener noreferrer" style={{ color: '#00F5FF', border: '1px solid rgba(0,245,255,0.25)', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 600, textDecoration: 'none', background: 'rgba(0,245,255,0.05)', fontFamily: 'inherit' }}>{l}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* TIMELINE */}
      <section style={S.sec}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={S.tag}>JOURNEY</div>
            <h2 style={S.h2}>From Idea to Platform</h2>
            <p style={{ color: '#8899aa', fontSize: 15, maxWidth: 480, margin: '12px auto 0' }}>The story of building AmdoxAI from scratch</p>
          </div>
        </Reveal>
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'linear-gradient(to bottom, transparent, rgba(0,245,255,0.3), transparent)', transform: 'translateX(-50%)' }} className="timeline-line"/>
          {TIMELINE.map((t, i) => (
            <Reveal key={t.year} delay={i * 0.07}>
              <div style={{ display: 'flex', gap: 32, marginBottom: 40, flexDirection: i % 2 === 0 ? 'row' : 'row-reverse', alignItems: 'flex-start' }} className="tlItem">
                <div style={{ flex: 1, textAlign: i % 2 === 0 ? 'right' : 'left' }} className="tlContent">
                  <div style={{ color: '#00F5FF', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 6, fontFamily: 'monospace' }}>{t.year}</div>
                  <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{t.t}</h4>
                  <p style={{ color: '#8899aa', fontSize: 13, lineHeight: 1.7 }}>{t.d}</p>
                </div>
                <div style={{ flexShrink: 0, width: 16, height: 16, borderRadius: '50%', background: '#00F5FF', border: '3px solid #050B18', boxShadow: '0 0 16px rgba(0,245,255,0.6)', marginTop: 6, position: 'relative', zIndex: 1 }} className="tlDot"/>
                <div style={{ flex: 1 }} className="tlSpacer"/>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* VALUES */}
      <section style={{ ...S.sec, background: 'rgba(0,245,255,0.02)' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={S.tag}>CORE VALUES</div>
            <h2 style={S.h2}>What We Stand For</h2>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {VALUES.map((v, i) => (
            <Reveal key={v.t} delay={i * 0.07}>
              <div style={S.valueCard} className="card">
                <div style={{ fontSize: 36, marginBottom: 16 }}>{v.icon}</div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>{v.t}</h3>
                <p style={{ color: '#8899aa', fontSize: 13, lineHeight: 1.8 }}>{v.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* DEEP TECH STACK */}
      <section style={S.sec}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={S.tag}>ARCHITECTURE</div>
            <h2 style={S.h2}>How It's Built Inside</h2>
            <p style={{ color: '#8899aa', fontSize: 15, maxWidth: 500, margin: '12px auto 0' }}>Three distinct layers working in concert</p>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
          {STACK_DEEP.map((layer, i) => (
            <Reveal key={layer.layer} delay={i * 0.1}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${layer.color}22`, borderRadius: 20, padding: 28, borderTop: `3px solid ${layer.color}` }}>
                <div style={{ color: layer.color, fontWeight: 700, fontSize: 12, letterSpacing: 3, marginBottom: 24 }}>{layer.layer}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {layer.items.map(it => (
                    <div key={it.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: layer.color, flexShrink: 0, marginTop: 5 }}/>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{it.n}</div>
                        <div style={{ color: '#8899aa', fontSize: 12, marginTop: 3, lineHeight: 1.5 }}>{it.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== INTERNSHIP CREDITS ===== */}
      <InternshipCredits />

      {/* CTA */}
      <section style={S.cta}>
        <Reveal>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#fff', fontSize: 'clamp(22px,4vw,40px)', fontWeight: 800, marginBottom: 12 }}>Ready to Join the Mission?</h2>
            <p style={{ color: '#8899aa', marginBottom: 32, fontSize: 15 }}>Build a healthier, more human workplace with AmdoxAI.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => nav('/sign-up')} style={S.btnCyanLg}>Start Free →</button>
              <button onClick={() => nav('/api-docs')} style={S.btnOutlineLg}>View API Docs</button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer style={S.footer}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={S.logo} onClick={() => nav('/')}>
            <svg width="22" height="22" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" fill="#050B18"/>
              <polygon points="50,18 74,32 74,68 50,82 26,68 26,32" fill="none" stroke="#00F5FF" strokeWidth="3"/>
              <path d="M35,50 C33,41 38,33 44,36 C43,28 49,24 50,27 L50,73 C49,76 43,72 44,64 C38,67 33,59 35,50Z" fill="#00F5FF"/>
              <path d="M65,50 C67,41 62,33 56,36 C57,28 51,24 50,27 L50,73 C51,76 57,72 56,64 C62,67 67,59 65,50Z" fill="#00F5FF"/>
            </svg>
            <span style={S.logoTxt}>Amdox<span style={{ color: '#00F5FF' }}>AI</span></span>
          </div>
          <span style={{ color: '#8899aa', fontSize: 13 }}>
            Made with <span style={{ color: '#ff6b6b' }}>❤️</span> by{' '}
            <a href="https://your-portfolio.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00F5FF', textDecoration: 'none', fontWeight: 700 }}>Abhinash Kumar</a>
          </span>
        </div>
      </footer>
    </div>
  )
}

const S = {
  page: { background: '#050B18', minHeight: '100vh', fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: 'hidden', position: 'relative' },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '14px 24px', transition: 'all 0.3s' },
  navScrolled: { background: 'rgba(5,11,24,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,245,255,0.08)' },
  navWrap: { maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 },
  logo: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textDecoration: 'none' },
  logoTxt: { color: '#fff', fontWeight: 800, fontSize: 18 },
  btnGhost: { background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'all 0.2s' },
  btnCyan: { background: 'linear-gradient(135deg,#00F5FF,#0080FF)', color: '#050B18', padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' },
  btnCyanLg: { background: 'linear-gradient(135deg,#00F5FF,#0080FF)', color: '#050B18', padding: '14px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, fontFamily: 'inherit' },
  btnOutlineLg: { background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '14px 32px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 16, fontFamily: 'inherit' },
  hero: { position: 'relative', zIndex: 1, minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '140px 24px 80px' },
  heroTag: { color: '#00F5FF', fontSize: 11, letterSpacing: 4, fontWeight: 700, marginBottom: 20 },
  heroH1: { color: '#fff', fontSize: 'clamp(32px,5.5vw,72px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', marginBottom: 24 },
  heroSub: { color: '#8899aa', fontSize: 17, lineHeight: 1.85, maxWidth: 640, margin: '0 auto' },
  sec: { position: 'relative', zIndex: 1, padding: '100px 24px' },
  tag: { color: '#00F5FF', fontSize: 11, letterSpacing: 3, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase' },
  h2: { color: '#fff', fontSize: 'clamp(26px,4vw,50px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 },
  valueCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 32, transition: 'all 0.3s' },
  cta: { position: 'relative', zIndex: 1, padding: '80px 24px', background: 'linear-gradient(135deg,rgba(0,245,255,0.06),rgba(0,128,255,0.04))', borderTop: '1px solid rgba(0,245,255,0.1)', borderBottom: '1px solid rgba(0,245,255,0.1)' },
  footer: { position: 'relative', zIndex: 1, padding: '32px 24px', borderTop: '1px solid rgba(0,245,255,0.08)', background: 'rgba(0,0,0,0.4)' },
}

const CSS = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
  .fadeUp{animation:fadeUp 0.8s cubic-bezier(.16,1,.3,1) both}
  .d1{animation-delay:0.1s}.d2{animation-delay:0.2s}.d3{animation-delay:0.3s}
  .card:hover{border-color:rgba(0,245,255,0.25)!important;transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,0.4)}
  .timeline-line{display:block}
  @media(max-width:768px){
    .twoCol{grid-template-columns:1fr!important;gap:40px!important}
    .founderInner{flex-direction:column!important}
    .founderCard{padding:32px 24px!important}
    .tlItem{flex-direction:column!important;gap:12px!important}
    .tlSpacer{display:none!important}
    .tlDot{display:none!important}
    .timeline-line{display:none!important}
    .tlContent{text-align:left!important}
  }
`