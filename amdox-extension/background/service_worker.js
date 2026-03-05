// ============================================================
// AMDOX AI — Background Service Worker
// All-day emotion monitoring engine
// ============================================================

const API = 'http://127.0.0.1:8000'
const DEFAULT_EMP = '00000000-0000-0000-0000-000000000001'
const DEFAULT_ORG = '00000000-0000-0000-0000-000000000001'

// Scan intervals (in minutes)
const FACE_INTERVAL_MIN  = 0.5   // face scan every 30 seconds
const EOD_REPORT_HOUR    = 18    // end-of-day report at 6 PM

// ── Init on install ──────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  console.log('Amdox AI Extension installed')
  initStorage()
  setupAlarms()
})

chrome.runtime.onStartup.addListener(() => {
  initStorage()
  setupAlarms()
  syncPendingEOD()  // sync any offline reports on startup
})

// ── Storage init ─────────────────────────────────────────────
function initStorage() {
  chrome.storage.local.get(['session'], (data) => {
    if (!data.session) {
      chrome.storage.local.set({
        session: createNewSession(),
        settings: {
          employee_id:   DEFAULT_EMP,
          org_id:        DEFAULT_ORG,
          employee_name: 'Employee',
          designation:   '',
          monitoring:    false,
          work_start:    null
        }
      })
    }
  })
}

function createNewSession() {
  return {
    date:        new Date().toDateString(),
    logs:        [],
    face_count:  0,
    text_count:  0,
    voice_count: 0,
    start_time:  null,
    end_time:    null,
    summary:     null
  }
}

// ── Alarms setup ─────────────────────────────────────────────
function setupAlarms() {
  chrome.alarms.clearAll(() => {
    chrome.alarms.create('face_scan',      { periodInMinutes: FACE_INTERVAL_MIN })
    chrome.alarms.create('eod_report',     { periodInMinutes: 1 })
    chrome.alarms.create('midnight_reset', { periodInMinutes: 60 })
    chrome.alarms.create('work_end_check', { periodInMinutes: 1 })  // NEW: check work end time
  })
}

// ── Alarm handler ────────────────────────────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
  const settings = await getSettings()
  if (!settings.monitoring) return

  if (alarm.name === 'face_scan') {
    await triggerFaceScan()
  }

  if (alarm.name === 'eod_report') {
    const now = new Date()
    if (now.getHours() === EOD_REPORT_HOUR && now.getMinutes() === 0) {
      await sendEODReport()
    }
  }

  if (alarm.name === 'midnight_reset') {
    const now = new Date()
    if (now.getHours() === 0) {
      await resetSession()
    }
  }

  // NEW: Check if employee work time is done
  if (alarm.name === 'work_end_check') {
    await checkWorkEndTime()
  }
})

// ── NEW: Check if work end time reached ─────────────────────
async function checkWorkEndTime() {
  const data = await new Promise(resolve =>
    chrome.storage.local.get(['employee_profile'], resolve)
  )
  if (!data.employee_profile) return

  const endTime = new Date(data.employee_profile.work_end_time)
  const now     = new Date()

  if (now >= endTime) {
    const settings = await getSettings()
    if (settings.monitoring) {
      // Auto stop monitoring + notify
      await chrome.storage.local.set({
        settings: { ...settings, monitoring: false }
      })
      try {
        chrome.notifications.create({
          type:    'basic',
          iconUrl: 'icons/icon48.png',
          title:   '🕐 Amdox AI — Work Day Complete!',
          message: 'Your work hours are done. Click "Send Report" to submit today\'s summary to HR.',
          priority: 2
        })
      } catch (e) {}
    }
  }
}

// ── Trigger face scan in active tab ─────────────────────────
async function triggerFaceScan() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab) return

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        window.postMessage({ type: 'AMDOX_FACE_SCAN' }, '*')
      }
    })
  } catch (e) {
    console.log('Face scan trigger error:', e.message)
  }
}

// ── Message handler from content/popup ──────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handleMessage(msg, sender, sendResponse)
  return true
})

async function handleMessage(msg, sender, sendResponse) {
  switch (msg.type) {

    case 'START_MONITORING': {
      const session = createNewSession()
      session.start_time = new Date().toISOString()
      await chrome.storage.local.set({
        session,
        settings: { ...await getSettings(), monitoring: true, work_start: Date.now() }
      })
      sendResponse({ ok: true })
      break
    }

    case 'STOP_MONITORING': {
      await chrome.storage.local.set({
        settings: { ...await getSettings(), monitoring: false }
      })
      const summary = await generateSummary()
      sendResponse({ ok: true, summary })
      break
    }

    case 'EMOTION_LOG': {
      const { emotion, confidence, stress_level, source } = msg.data
      await saveLog({ emotion, confidence, stress_level, source })
      sendResponse({ ok: true })
      break
    }

    case 'GET_STATUS': {
      const settings = await getSettings()
      const session  = await getSession()
      const stats    = computeStats(session.logs)
      sendResponse({ settings, session, stats })
      break
    }

    case 'GET_SESSION_LOGS': {
      const session = await getSession()
      sendResponse({ logs: session.logs })
      break
    }

    case 'SEND_EOD_NOW': {
      const result = await sendEODReport()
      sendResponse({ ok: true, result })
      break
    }

    // NEW: Update settings including employee name + designation from login
    case 'UPDATE_SETTINGS': {
      const current = await getSettings()
      const updated = { ...current, ...msg.data }
      // If designation provided, store it
      if (msg.data.designation) updated.designation = msg.data.designation
      await chrome.storage.local.set({ settings: updated })
      sendResponse({ ok: true })
      break
    }

    // NEW: Save employee profile from login screen
    case 'SAVE_PROFILE': {
      await chrome.storage.local.set({ employee_profile: msg.data })
      const current = await getSettings()
      await chrome.storage.local.set({
        settings: {
          ...current,
          employee_name: msg.data.name,
          designation:   msg.data.designation
        }
      })
      sendResponse({ ok: true })
      break
    }

    // NEW: Clear employee profile on logout
    case 'LOGOUT': {
      await chrome.storage.local.remove(['employee_profile'])
      const current = await getSettings()
      await chrome.storage.local.set({
        settings: {
          ...current,
          monitoring:    false,
          employee_name: 'Employee',
          designation:   ''
        }
      })
      sendResponse({ ok: true })
      break
    }

    default:
      sendResponse({ ok: false, error: 'Unknown message type' })
  }
}

// ── Save emotion log ─────────────────────────────────────────
async function saveLog({ emotion, confidence, stress_level, source }) {
  const session  = await getSession()
  const settings = await getSettings()

  const log = {
    emotion,
    confidence,
    stress_level: stress_level || 0,
    source,
    time:      new Date().toISOString(),
    timestamp: Date.now()
  }

  session.logs.push(log)
  if (source === 'FACE')  session.face_count++
  if (source === 'TEXT')  session.text_count++
  if (source === 'VOICE') session.voice_count++

  await chrome.storage.local.set({ session })

  // POST to backend with timeout
  try {
    const controller = new AbortController()
    const timeoutId  = setTimeout(() => controller.abort(), 5000)

    await fetch(`${API}/api/emotion/${source.toLowerCase()}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      signal:  controller.signal,
      body: JSON.stringify({
        text:         emotion,
        employee_id:  settings.employee_id || DEFAULT_EMP,
        org_id:       settings.org_id      || DEFAULT_ORG,
        emotion,
        confidence,
        stress_level
      })
    })
    clearTimeout(timeoutId)
  } catch (e) {
    console.log('Backend save skipped (offline):', e.message)
  }

  checkStressThreshold(session.logs, settings)
}

// ── Stress threshold check ───────────────────────────────────
function checkStressThreshold(logs, settings) {
  const recent = logs.slice(-10)
  const score  = recent
    .filter(l => ['Stress', 'Sad', 'Angry', 'Fear'].includes(l.emotion))
    .reduce((s, l) => s + l.confidence, 0)

  if (score >= 3.5) {
    chrome.notifications.create({
      type:     'basic',
      iconUrl:  'icons/icon48.png',
      title:    '⚠️ Amdox AI — Stress Detected',
      message:  'High stress level detected. HR has been notified.',
      priority: 2
    })
  }
}

// ── Compute stats from logs ──────────────────────────────────
function computeStats(logs) {
  if (!logs || logs.length === 0) {
    return { total: 0, distribution: {}, dominant: 'Neutral', avg_stress: 0, timeline: [] }
  }

  const distribution = {}
  let totalStress = 0

  logs.forEach(log => {
    distribution[log.emotion] = (distribution[log.emotion] || 0) + 1
    totalStress += log.stress_level || 0
  })

  const dominant   = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Neutral'
  const avg_stress = totalStress / logs.length

  const hourly = {}
  logs.forEach(log => {
    const hr = new Date(log.time).getHours()
    if (!hourly[hr]) hourly[hr] = {}
    hourly[hr][log.emotion] = (hourly[hr][log.emotion] || 0) + 1
  })

  const timeline = Object.entries(hourly).map(([hour, emotions]) => ({
    hour:     parseInt(hour),
    dominant: Object.entries(emotions).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Neutral',
    emotions
  }))

  return { total: logs.length, distribution, dominant, avg_stress, timeline }
}

// ── Generate daily summary ────────────────────────────────────
async function generateSummary() {
  const session  = await getSession()
  const settings = await getSettings()
  const stats    = computeStats(session.logs)

  // NEW: Use employee profile for name/designation if available
  const profileData = await new Promise(resolve =>
    chrome.storage.local.get(['employee_profile'], d => resolve(d.employee_profile || null))
  )

  const employeeName  = profileData?.name        || settings.employee_name || 'Employee'
  const designation   = profileData?.designation || settings.designation   || ''
  const workHoursSet  = profileData ? (profileData.work_hours + profileData.work_mins / 60).toFixed(1) : null

  const workStart   = session.start_time ? new Date(session.start_time) : new Date()
  const workEnd     = new Date()
  const hoursWorked = workHoursSet || ((workEnd - workStart) / 3600000).toFixed(1)

  const dist  = stats.distribution
  const total = stats.total || 1
  const pct   = (emo) => Math.round(((dist[emo] || 0) / total) * 100)

  const summary = {
    employee_name:    employeeName,
    designation:      designation,
    date:             new Date().toLocaleDateString('en-IN', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      }),
    work_hours:       hoursWorked,
    total_scans:      total,
    face_scans:       session.face_count,
    text_scans:       session.text_count,
    voice_scans:      session.voice_count,
    dominant_emotion: stats.dominant,
    avg_stress_pct:   Math.round(stats.avg_stress * 100),
    distribution:     dist,
    distribution_pct: {
      Happy:    pct('Happy'),   Sad:      pct('Sad'),
      Angry:    pct('Angry'),   Stress:   pct('Stress'),
      Fear:     pct('Fear'),    Neutral:  pct('Neutral'),
      Surprise: pct('Surprise')
    },
    timeline:           stats.timeline,
    needs_hr_attention: stats.avg_stress > 0.6 || pct('Stress') + pct('Angry') + pct('Fear') > 40
  }

  session.summary = summary
  await chrome.storage.local.set({ session })
  return summary
}

// ── Send EOD report to backend ───────────────────────────────
async function sendEODReport() {
  const summary  = await generateSummary()
  const settings = await getSettings()

  let backendOk = false
  try {
    const controller = new AbortController()
    const timeoutId  = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(`${API}/api/analytics/eod-report`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      signal:  controller.signal,
      body: JSON.stringify({
        employee_id: settings.employee_id || DEFAULT_EMP,
        org_id:      settings.org_id      || DEFAULT_ORG,
        summary
      })
    })
    clearTimeout(timeoutId)
    backendOk = res.ok
  } catch (e) {
    console.warn('EOD backend unavailable, stored locally:', e.message)
    await storePendingEOD(summary, settings)
  }

  const notifMsg = backendOk
    ? `Today's report sent to HR. Dominant mood: ${summary.dominant_emotion}`
    : `Report saved locally. Will sync when backend is online. Mood: ${summary.dominant_emotion}`

  try {
    chrome.notifications.create({
      type:     'basic',
      iconUrl:  'icons/icon48.png',
      title:    backendOk ? '✅ Amdox AI — Daily Report Sent' : '💾 Amdox AI — Report Saved Locally',
      message:  notifMsg,
      priority: 1
    })
  } catch (notifErr) {
    console.log('Notification error:', notifErr.message)
  }

  return summary
}

// ── Store pending EOD report for later sync ──────────────────
async function storePendingEOD(summary, settings) {
  return new Promise(resolve => {
    chrome.storage.local.get(['pending_eod'], (data) => {
      const pending = data.pending_eod || []
      pending.push({
        summary,
        employee_id: settings.employee_id || DEFAULT_EMP,
        org_id:      settings.org_id      || DEFAULT_ORG,
        stored_at:   new Date().toISOString()
      })
      chrome.storage.local.set({ pending_eod: pending }, resolve)
    })
  })
}

// ── Sync pending EOD reports when backend comes online ───────
async function syncPendingEOD() {
  return new Promise(resolve => {
    chrome.storage.local.get(['pending_eod'], async (data) => {
      const pending = data.pending_eod || []
      if (pending.length === 0) return resolve()

      const remaining = []
      for (const item of pending) {
        try {
          const controller = new AbortController()
          const timeoutId  = setTimeout(() => controller.abort(), 5000)

          const res = await fetch(`${API}/api/analytics/eod-report`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            signal:  controller.signal,
            body:    JSON.stringify(item)
          })
          clearTimeout(timeoutId)
          if (!res.ok) remaining.push(item)
        } catch (e) {
          remaining.push(item)
        }
      }

      chrome.storage.local.set({ pending_eod: remaining }, resolve)
      if (remaining.length < pending.length) {
        console.log(`✅ Synced ${pending.length - remaining.length} pending EOD reports`)
      }
    })
  })
}

// ── Reset session ─────────────────────────────────────────────
async function resetSession() {
  const today   = new Date().toDateString()
  const session = await getSession()
  if (session.date !== today) {
    await chrome.storage.local.set({ session: createNewSession() })
  }
}

// ── Helpers ──────────────────────────────────────────────────
async function getSettings() {
  return new Promise(resolve => {
    chrome.storage.local.get(['settings'], d => resolve(d.settings || {}))
  })
}

async function getSession() {
  return new Promise(resolve => {
    chrome.storage.local.get(['session'], d => resolve(d.session || createNewSession()))
  })
}