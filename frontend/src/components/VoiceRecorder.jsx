import { useState, useRef } from 'react'
import { Mic, MicOff, Send, Loader } from 'lucide-react'
import { motion } from 'framer-motion'
import { analyzeVoice } from '../api/client'

const DEFAULT_ID = '00000000-0000-0000-0000-000000000001'

export default function VoiceRecorder({ onResult }) {
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [blob, setBlob] = useState(null)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      chunksRef.current = []

      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const b = new Blob(chunksRef.current, { type: 'audio/webm' })
        setBlob(b)
        stream.getTracks().forEach(t => t.stop())
      }

      mr.start()
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch (e) {
      alert('Microphone access denied!')
    }
  }

  const stop = () => {
    mediaRef.current?.stop()
    setRecording(false)
    clearInterval(timerRef.current)
  }

  const analyze = async () => {
    if (!blob) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('audio', blob, 'recording.webm')
      fd.append('employee_id', DEFAULT_ID)
      fd.append('org_id', DEFAULT_ID)
      const result = await analyzeVoice(fd)
      onResult(result)
    } catch (e) {
      alert('Voice analysis failed: ' + e.message)
    } finally {
      setLoading(false)
      setBlob(null)
    }
  }

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <div className="glass" style={{ padding: 24 }}>
      <p style={{ color: '#94a3b8', marginBottom: 20, fontSize: 14 }}>
        Record your voice — our AI will analyze your emotional tone using wav2vec2.
      </p>

      {/* Timer */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: recording ? '#f87171' : '#00F5FF', fontVariantNumeric: 'tabular-nums' }}>
          {fmt(seconds)}
        </div>
        {recording && (
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}
            style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>
            ● Recording...
          </motion.div>
        )}
      </div>

      {/* Waveform bars */}
      {recording && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 20, height: 40 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div key={i}
              animate={{ scaleY: [0.2, 1, 0.2] }}
              transition={{ duration: 0.6, delay: i * 0.05, repeat: Infinity }}
              style={{ width: 4, background: '#00F5FF', borderRadius: 2, transformOrigin: 'bottom' }}
            />
          ))}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {!recording ? (
          <button onClick={start} className="btn-cyan" style={{ gap: 8 }}>
            <Mic size={18} /> Start Recording
          </button>
        ) : (
          <button onClick={stop} style={{
            background: 'rgba(248,113,113,0.2)', border: '1px solid #f87171',
            color: '#f87171', padding: '10px 24px', borderRadius: 10, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600
          }}>
            <MicOff size={18} /> Stop
          </button>
        )}

        {blob && !recording && (
          <button onClick={analyze} disabled={loading} className="btn-cyan">
            {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
            {loading ? 'Analyzing...' : 'Analyze Voice'}
          </button>
        )}
      </div>
    </div>
  )
}
