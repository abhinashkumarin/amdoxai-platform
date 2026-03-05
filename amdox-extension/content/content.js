// ============================================================
// AMDOX AI — Content Script
// Runs silently in employee's browser tab
// Handles: Face capture, Text analysis, Voice detection
// ============================================================

const API = 'http://127.0.0.1:8000'

let videoStream    = null
let videoElement   = null
let canvasElement  = null
let isMonitoring   = false
let textBuffer     = ''
let textTimer      = null
let lastFaceTime   = 0
const FACE_COOLDOWN = 25000  // 25 seconds between face scans
const TEXT_DELAY    = 8000   // 8 seconds after typing stops

// ── Init ──────────────────────────────────────────────────────
;(async () => {
  const { settings } = await chrome.storage.local.get(['settings'])
  isMonitoring = settings?.monitoring || false
  if (isMonitoring) initCamera()
  initTextMonitor()
})()

// ── Listen for messages from background ──────────────────────
window.addEventListener('message', async (e) => {
  if (e.data?.type === 'AMDOX_FACE_SCAN') {
    const now = Date.now()
    if (isMonitoring && now - lastFaceTime > FACE_COOLDOWN) {
      lastFaceTime = now
      await captureAndAnalyzeFace()
    }
  }
})

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'START_MONITORING') {
    isMonitoring = true
    initCamera()
  }
  if (msg.type === 'STOP_MONITORING') {
    isMonitoring = false
    releaseCamera()
  }
})

// ── FACE: Setup hidden camera ─────────────────────────────────
async function initCamera() {
  try {
    if (videoStream) return // already initialized
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240, facingMode: 'user' }
    })
    videoElement = document.createElement('video')
    videoElement.style.display = 'none'
    videoElement.srcObject = videoStream
    await videoElement.play()
    document.body.appendChild(videoElement)

    canvasElement = document.createElement('canvas')
    canvasElement.style.display = 'none'
    document.body.appendChild(canvasElement)

    console.log('Amdox AI: Camera initialized silently')
  } catch (e) {
    console.log('Amdox AI: Camera not available:', e.message)
  }
}

function releaseCamera() {
  videoStream?.getTracks().forEach(t => t.stop())
  videoStream = null
  videoElement?.remove()
  canvasElement?.remove()
  videoElement = null
  canvasElement = null
}

// ── FACE: Capture and analyze ─────────────────────────────────
async function captureAndAnalyzeFace() {
  if (!videoElement || !canvasElement) return
  if (videoElement.readyState < 2) return

  try {
    canvasElement.width  = videoElement.videoWidth  || 320
    canvasElement.height = videoElement.videoHeight || 240
    canvasElement.getContext('2d').drawImage(videoElement, 0, 0)
    const imageData = canvasElement.toDataURL('image/jpeg', 0.6)

    // Collect 3 frames with 1 second gap for accuracy
    const frames = [imageData]
    for (let i = 0; i < 2; i++) {
      await sleep(1000)
      canvasElement.getContext('2d').drawImage(videoElement, 0, 0)
      frames.push(canvasElement.toDataURL('image/jpeg', 0.6))
    }

    // Analyze all frames
    const results = []
    for (const frame of frames) {
      const res = await callAPI('face', { image: frame })
      if (res) results.push(res)
    }

    if (results.length === 0) return

    // Get dominant emotion
    const votes = {}
    results.forEach(r => { votes[r.emotion] = (votes[r.emotion] || 0) + 1 })
    const dominant = Object.entries(votes).sort((a,b)=>b[1]-a[1])[0][0]
    const domResults = results.filter(r => r.emotion === dominant)
    const avgConf    = domResults.reduce((s,r) => s+r.confidence, 0) / domResults.length
    const avgStress  = domResults.reduce((s,r) => s+(r.stress_level||0), 0) / domResults.length

    // Save to background
    chrome.runtime.sendMessage({
      type: 'EMOTION_LOG',
      data: {
        emotion: dominant,
        confidence: parseFloat(avgConf.toFixed(2)),
        stress_level: parseFloat(avgStress.toFixed(2)),
        source: 'FACE'
      }
    })

    console.log(`Amdox AI [FACE]: ${dominant} (${Math.round(avgConf*100)}%)`)

  } catch (e) {
    console.log('Face capture error:', e.message)
  }
}

// ── TEXT: Monitor typing ──────────────────────────────────────
function initTextMonitor() {
  document.addEventListener('input', (e) => {
    if (!isMonitoring) return
    const target = e.target
    if (!['INPUT','TEXTAREA'].includes(target.tagName) &&
        !target.isContentEditable) return

    const text = target.value || target.innerText || ''
    if (text.length < 15) return

    textBuffer = text

    // Debounce — analyze 8 seconds after typing stops
    clearTimeout(textTimer)
    textTimer = setTimeout(async () => {
      if (textBuffer.trim().length < 15) return
      await analyzeText(textBuffer.trim().slice(-300)) // last 300 chars
      textBuffer = ''
    }, TEXT_DELAY)
  })
}

async function analyzeText(text) {
  try {
    const res = await callAPI('text', { text })
    if (!res) return

    chrome.runtime.sendMessage({
      type: 'EMOTION_LOG',
      data: {
        emotion: res.emotion,
        confidence: res.confidence,
        stress_level: res.stress_level || 0,
        source: 'TEXT'
      }
    })

    console.log(`Amdox AI [TEXT]: ${res.emotion} (${Math.round(res.confidence*100)}%)`)
  } catch (e) {
    console.log('Text analysis error:', e.message)
  }
}

// ── API call helper ───────────────────────────────────────────
async function callAPI(endpoint, body) {
  try {
    const { settings } = await chrome.storage.local.get(['settings'])
    const employee_id = settings?.employee_id || '00000000-0000-0000-0000-000000000001'
    const org_id      = settings?.org_id      || '00000000-0000-0000-0000-000000000001'

    const res = await fetch(`${API}/api/emotion/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, employee_id, org_id })
    })
    if (!res.ok) return null
    return await res.json()
  } catch (e) {
    return null
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
