import { motion } from 'framer-motion'
import { CheckCircle, Zap } from 'lucide-react'

const EMOJI = {
  Happy: '😊', Sad: '😢', Angry: '😠',
  Stress: '😤', Fear: '😨', Surprise: '😲', Neutral: '😐'
}

const COLORS = {
  Happy: '#4ade80', Sad: '#60a5fa', Angry: '#f87171',
  Stress: '#facc15', Fear: '#c084fc', Neutral: '#94a3b8', Surprise: '#fb923c'
}

export default function EmotionResult({ result }) {
  if (!result) return null
  const color = COLORS[result.emotion] || '#94a3b8'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass glow"
      style={{ padding: 24, marginTop: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <CheckCircle size={20} color="#00F5FF" />
        <span style={{ color: '#00F5FF', fontWeight: 600 }}>Analysis Complete</span>
      </div>

      {/* Emotion */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 48 }}>{EMOJI[result.emotion] || '😐'}</div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color }}>{result.emotion}</div>
          <div style={{ color: '#64748b', fontSize: 14 }}>Source: {result.source}</div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>Confidence</span>
          <span style={{ fontSize: 13, color }}>{Math.round(result.confidence * 100)}%</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 6 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${result.confidence * 100}%` }}
            transition={{ duration: 0.8 }}
            style={{ height: '100%', borderRadius: 4, background: color }}
          />
        </div>
      </div>

      {/* Stress Bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>Stress Level</span>
          <span style={{ fontSize: 13, color: '#f87171' }}>{Math.round(result.stress_level * 100)}%</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 6 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${result.stress_level * 100}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ height: '100%', borderRadius: 4, background: '#f87171' }}
          />
        </div>
      </div>

      {/* Task Suggestion */}
      {result.task && (
        <div style={{
          background: 'rgba(0,245,255,0.07)',
          border: '1px solid rgba(0,245,255,0.2)',
          borderRadius: 10, padding: 14,
          display: 'flex', gap: 10, alignItems: 'flex-start'
        }}>
          <Zap size={18} color="#00F5FF" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, color: '#00F5FF', marginBottom: 4 }}>AI Task Suggestion</div>
            <div style={{ fontSize: 14, color: '#e2e8f0' }}>{result.task}</div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
