import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, CameraOff, Zap, Loader, FlipHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'
import { analyzeFace } from '../api/client'

const DEFAULT_ID = '00000000-0000-0000-0000-000000000001'

export default function CameraCapture({ onResult }) {
  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)
  const overlayRef  = useRef(null)
  const streamRef   = useRef(null)
  const intervalRef = useRef(null)

  const [active,          setActive]          = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [liveEmotion,     setLiveEmotion]     = useState(null)
  const [error,           setError]           = useState('')
  const [facingMode,      setFacingMode]      = useState('user')   // 'user' = front, 'environment' = back
  const [hasMultipleCams, setHasMultipleCams] = useState(false)    // show flip btn only if phone has 2 cams

  // ── Check if device has multiple cameras (phones have 2) ──────────────────
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const cams = devices.filter(d => d.kind === 'videoinput')
      setHasMultipleCams(cams.length > 1)
    }).catch(() => {})
  }, [])

  // ── Draw cyan grid overlay on face region ─────────────────────────────────
  const drawGrid = useCallback((ctx, x, y, w, h) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    // Outer box
    ctx.strokeStyle = '#00F5FF'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, w, h)
    // Corner accents
    const len = 20
    ctx.strokeStyle = '#00FF88'
    ctx.lineWidth = 3
    // TL
    ctx.beginPath(); ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y); ctx.stroke()
    // TR
    ctx.beginPath(); ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len); ctx.stroke()
    // BL
    ctx.beginPath(); ctx.moveTo(x, y + h - len); ctx.lineTo(x, y + h); ctx.lineTo(x + len, y + h); ctx.stroke()
    // BR
    ctx.beginPath(); ctx.moveTo(x + w - len, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - len); ctx.stroke()
    // Grid lines inside face box (3x3)
    ctx.strokeStyle = 'rgba(0,245,255,0.2)'
    ctx.lineWidth = 1
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(x + (w / 3) * i, y);     ctx.lineTo(x + (w / 3) * i, y + h); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x, y + (h / 3) * i);     ctx.lineTo(x + w, y + (h / 3) * i); ctx.stroke()
    }
    // Emotion label above box
    if (liveEmotion) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(x, y - 28, w, 26)
      ctx.fillStyle = '#00F5FF'
      ctx.font = 'bold 13px DM Sans'
      ctx.fillText(`${liveEmotion.emotion}  ${Math.round(liveEmotion.confidence * 100)}%`, x + 8, y - 10)
    }
  }, [liveEmotion])

  // ── Start camera stream ───────────────────────────────────────────────────
  const startCamera = useCallback(async (mode = facingMode) => {
    // Stop existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    clearInterval(intervalRef.current)
    setError('')
    setLoading(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,          // 'user' = selfie / 'environment' = back
          width:  { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setActive(true)

      // Auto-analyze every 3 seconds
      intervalRef.current = setInterval(() => captureAndAnalyze(mode), 3000)

    } catch (err) {
      const msg =
        err.name === 'NotAllowedError'  ? '❌ Camera permission denied. Please allow camera access.' :
        err.name === 'NotFoundError'    ? '❌ No camera found on this device.' :
        err.name === 'NotReadableError' ? '❌ Camera is in use by another app.' :
        `❌ Camera error: ${err.message}`
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [facingMode]) // eslint-disable-line

  // ── Stop camera ───────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    clearInterval(intervalRef.current)
    if (videoRef.current) videoRef.current.srcObject = null
    setActive(false)
    setLiveEmotion(null)
    setError('')
    // Clear overlay
    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext('2d')
      ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height)
    }
  }, [])

  // ── Flip camera front ↔ back ──────────────────────────────────────────────
  const flipCamera = useCallback(async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newMode)
    setLiveEmotion(null)
    if (active) {
      clearInterval(intervalRef.current)
      await startCamera(newMode)
    }
  }, [facingMode, active, startCamera])

  // ── Capture frame + draw grid + send to backend ───────────────────────────
  const captureAndAnalyze = useCallback(async (mode) => {
    if (!videoRef.current || !canvasRef.current) return

    const currentMode = mode || facingMode
    const video  = videoRef.current
    const canvas = canvasRef.current

    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')

    // Mirror front camera image so DeepFace gets correct orientation
    if (currentMode === 'user') {
      ctx.save()
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      ctx.restore()
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    }

    // Draw face grid overlay
    if (overlayRef.current) {
      const oCtx = overlayRef.current.getContext('2d')
      overlayRef.current.width  = video.clientWidth
      overlayRef.current.height = video.clientHeight
      const scaleX = video.clientWidth  / (video.videoWidth  || 640)
      const scaleY = video.clientHeight / (video.videoHeight || 480)
      const fw = 200 * scaleX
      const fh = 240 * scaleY
      const fx = (video.clientWidth  - fw) / 2
      const fy = (video.clientHeight - fh) / 2
      drawGrid(oCtx, fx, fy, fw, fh)
    }

    try {
      const imageData = canvas.toDataURL('image/jpeg', 0.85)
      const result    = await analyzeFace(imageData, DEFAULT_ID, DEFAULT_ID)
      setLiveEmotion(result)
      if (onResult) onResult(result)
    } catch (e) {
      console.error('Face analysis error:', e)
    }
  }, [facingMode, drawGrid, onResult])

  // ── Manual capture button ─────────────────────────────────────────────────
  const manualCapture = async () => {
    setLoading(true)
    await captureAndAnalyze(facingMode)
    setLoading(false)
  }

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    clearInterval(intervalRef.current)
  }, [])

  const COLORS = {
    Happy: '#4ade80', Sad: '#60a5fa', Angry: '#f87171',
    Stress: '#facc15', Fear: '#c084fc', Neutral: '#94a3b8', Surprise: '#fb923c'
  }

  return (
    <div className="glass" style={{ padding: 24 }}>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <p style={{ color: '#94a3b8', fontSize: 14, flex: 1 }}>
          Real-time face emotion detection with AI grid overlay. Auto-analyzes every 3 seconds.
        </p>

        {/* Flip camera button — only shown on phones with 2 cameras */}
        {hasMultipleCams && active && (
          <button
            onClick={flipCamera}
            title={facingMode === 'user' ? 'Switch to Back Camera' : 'Switch to Front Camera'}
            style={{
              background: 'rgba(0,245,255,0.1)',
              border: '1px solid rgba(0,245,255,0.3)',
              color: '#00F5FF',
              borderRadius: 10,
              padding: '8px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontFamily: 'inherit',
              fontWeight: 600,
              transition: 'all 0.2s',
              marginLeft: 12,
              flexShrink: 0,
            }}
          >
            <FlipHorizontal size={16} />
            {facingMode === 'user' ? '📷 Back' : '🤳 Front'}
          </button>
        )}
      </div>

      {/* Camera indicator badge */}
      {active && (
        <div style={{ marginBottom: 12 }}>
          <span style={{
            background: facingMode === 'user' ? 'rgba(0,245,255,0.1)' : 'rgba(255,209,102,0.1)',
            border: `1px solid ${facingMode === 'user' ? 'rgba(0,245,255,0.3)' : 'rgba(255,209,102,0.3)'}`,
            color: facingMode === 'user' ? '#00F5FF' : '#ffd166',
            borderRadius: 8,
            padding: '3px 12px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
          }}>
            {facingMode === 'user' ? '🤳 Front Camera (Selfie)' : '📷 Back Camera'}
          </span>
        </div>
      )}

      {/* Camera Feed */}
      <div style={{
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#0A1628',
        border: '1px solid rgba(0,245,255,0.15)',
        marginBottom: 16,
        minHeight: 300,
        aspectRatio: '4/3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: active ? 'block' : 'none',
            borderRadius: 12,
            // Mirror front camera for natural selfie feel
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          }}
        />

        {/* Cyan Grid Overlay Canvas */}
        <canvas
          ref={overlayRef}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none',
          }}
        />

        {/* Hidden capture canvas */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Camera not started placeholder */}
        {!active && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: 300, gap: 12,
          }}>
            <Camera size={48} color="#1e3a5f" />
            <span style={{ color: '#475569', fontSize: 14 }}>Camera not started</span>
          </div>
        )}

        {/* Analyzing spinner overlay */}
        {loading && active && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(5,11,24,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 10,
          }}>
            <Loader size={32} style={{ color: '#00F5FF', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#00F5FF', fontSize: 13, fontWeight: 600 }}>Analyzing...</span>
          </div>
        )}

        {/* Live emotion badge (bottom-right) */}
        {liveEmotion && active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute', bottom: 12, right: 12,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              borderRadius: 10,
              padding: '8px 14px',
              border: `1px solid ${(COLORS[liveEmotion.emotion] || '#64748b')}40`,
            }}
          >
            <span style={{
              color: COLORS[liveEmotion.emotion] || '#94a3b8',
              fontWeight: 700,
              fontSize: 14,
            }}>
              {liveEmotion.emotion}  {Math.round((liveEmotion.confidence || 0) * 100)}%
            </span>
          </motion.div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          background: 'rgba(255,107,107,0.1)',
          border: '1px solid rgba(255,107,107,0.3)',
          borderRadius: 10, padding: '10px 16px',
          color: '#ff6b6b', fontSize: 13, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {!active ? (
          <button
            onClick={() => startCamera(facingMode)}
            disabled={loading}
            className="btn-cyan"
            style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? <Loader size={18} /> : <Camera size={18} />}
            {loading ? 'Starting...' : 'Start Camera'}
          </button>
        ) : (
          <>
            <button
              onClick={manualCapture}
              disabled={loading}
              className="btn-cyan"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <Loader size={18} /> : <Zap size={18} />}
              {loading ? 'Analyzing...' : 'Capture & Analyze'}
            </button>
            <button
              onClick={stopCamera}
              style={{
                background: 'rgba(248,113,113,0.15)',
                border: '1px solid #f87171',
                color: '#f87171',
                padding: '10px 20px',
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                fontWeight: 600,
                fontFamily: 'inherit',
              }}
            >
              <CameraOff size={18} /> Stop
            </button>
          </>
        )}
      </div>

      {/* Hint text */}
      <p style={{ color: '#475569', fontSize: 12, marginTop: 14, textAlign: 'center' }}>
        💡 Make sure your face is clearly visible and well-lit for best accuracy.
        {hasMultipleCams && ' Tap the flip button to switch between front and back camera.'}
      </p>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}