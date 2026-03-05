import { useState } from 'react'
import { MessageSquare, Mic, Camera, Send, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeText } from '../api/client'
import VoiceRecorder from '../components/VoiceRecorder'
import CameraCapture from '../components/CameraCapture'
import EmotionResult from '../components/EmotionResult'

const DEFAULT_ID = '00000000-0000-0000-0000-000000000001'
const TABS = [
  { id: 'text',  icon: MessageSquare, label: 'Text' },
  { id: 'voice', icon: Mic,           label: 'Voice' },
  { id: 'face',  icon: Camera,        label: 'Face' },
]

export default function EmotionInput() {
  const [tab, setTab] = useState('text')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleText = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const r = await analyzeText(text, DEFAULT_ID, DEFAULT_ID)
      setResult(r)
    } catch (e) {
      alert('Analysis failed: ' + (e.response?.data?.detail || e.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f1f5f9' }}>
          Emotion <span style={{ color: '#00F5FF' }}>Check-In</span>
        </h1>
        <p style={{ color: '#64748b', marginTop: 6 }}>
          Share how you're feeling — your emotional data helps us support you better.
        </p>
      </div>

      {/* Tabs */}
      <div className="glass" style={{ display: 'flex', padding: 6, marginBottom: 20, gap: 4 }}>
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => { setTab(id); setResult(null) }}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14,
              background: tab === id ? 'linear-gradient(135deg,#00F5FF,#0080FF)' : 'transparent',
              color: tab === id ? '#050B18' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s'
            }}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}>

          {tab === 'text' && (
            <div className="glass" style={{ padding: 24 }}>
              <p style={{ color: '#94a3b8', marginBottom: 12, fontSize: 14 }}>
                How are you feeling today? Express yourself freely.
              </p>
              <textarea
                className="input-amdox"
                rows={5}
                placeholder="Type how you're feeling... e.g., 'I'm overwhelmed with deadlines and feeling burnt out'"
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>{text.length} chars</span>
                <button onClick={handleText} disabled={loading || !text.trim()} className="btn-cyan">
                  {loading ? <Loader size={16} /> : <Send size={16} />}
                  {loading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>
          )}

          {tab === 'voice' && <VoiceRecorder onResult={r => setResult(r)} />}
          {tab === 'face'  && <CameraCapture onResult={r => setResult(r)} />}
        </motion.div>
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && tab !== 'face' && <EmotionResult result={result} />}
      </AnimatePresence>

      {/* Privacy note */}
      <div style={{
        marginTop: 20, padding: 14,
        background: 'rgba(0,245,255,0.05)',
        border: '1px solid rgba(0,245,255,0.15)',
        borderRadius: 10, fontSize: 13, color: '#475569'
      }}>
        🔒 Your emotional data is encrypted and only visible to authorized HR managers.
        Regular check-ins help build better workplace support systems.
      </div>
    </div>
  )
}
