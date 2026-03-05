// Amdox AI — popup.js
// Clerk Login + Session Setup + Monitoring

const FRONTEND_URL = 'http://localhost:5173'
const CLERK_LOGIN_URL = `${FRONTEND_URL}/sign-in`
const EMPLOYEE_APP_URL = `${FRONTEND_URL}/app/employee`

const EMOTION_CFG = {
  Happy:    { color: '#4ade80', emoji: '😊' },
  Sad:      { color: '#60a5fa', emoji: '😢' },
  Angry:    { color: '#f87171', emoji: '😠' },
  Stress:   { color: '#facc15', emoji: '😤' },
  Fear:     { color: '#c084fc', emoji: '😨' },
  Surprise: { color: '#fb923c', emoji: '😲' },
  Neutral:  { color: '#94a3b8', emoji: '😐' },
}

const TASK_MAP = {
  Happy:    'Creative / Brainstorming work',
  Neutral:  'Routine operational tasks',
  Sad:      'Low workload + peer support',
  Stress:   'Break + HR check-in needed',
  Angry:    'Cool-down tasks only',
  Fear:     'Reassurance + guidance',
  Surprise: 'Event review / analysis',
}

let isMonitoring    = false
let refreshInterval = null
let timerInterval   = null
let workEndTime     = null
let clerkCheckInterval = null

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

  updateAutoDateTime()
  setInterval(updateAutoDateTime, 1000)

  // Quick preset buttons
  document.getElementById('preset30s').addEventListener('click', () => setDuration(0, 0, 30))
  document.getElementById('preset1m').addEventListener('click',  () => setDuration(0, 1, 0))
  document.getElementById('preset5m').addEventListener('click',  () => setDuration(0, 5, 0))
  document.getElementById('preset8h').addEventListener('click',  () => setDuration(8, 0, 0))

  // Clerk screen buttons
  document.getElementById('clerkOpenAppBtn').addEventListener('click', openAppForLogin)
  document.getElementById('clerkContinueBtn').addEventListener('click', handleClerkContinue)
  document.getElementById('clerkSwitchBtn').addEventListener('click', handleSwitchAccount)

  // Session setup buttons
  document.getElementById('loginSubmitBtn').addEventListener('click', handleLogin)

  // Main screen buttons
  document.getElementById('toggleBtn').addEventListener('click', toggleMonitoring)
  document.getElementById('reportBtn').addEventListener('click', sendReport)
  document.getElementById('dashboardBtn').addEventListener('click', openDashboard)
  document.getElementById('logoutBtn').addEventListener('click', handleLogout)

  // ── Decide which screen to show ──
  const data = await chrome.storage.local.get(['employee_profile', 'clerk_user'])

  if (data.employee_profile) {
    // Already fully set up → go to main
    showMainScreen(data.employee_profile)
  } else if (data.clerk_user) {
    // Clerk logged in but session not set up → go to session setup
    prefillFromClerk(data.clerk_user)
    showSessionScreen()
  } else {
    // Not logged in → check if logged in via frontend
    showClerkScreen()
    checkClerkLogin()
  }
})

window.addEventListener('unload', () => {
  clearInterval(refreshInterval)
  clearInterval(timerInterval)
  clearInterval(clerkCheckInterval)
})

// ── Preset duration setter ────────────────────────────────────
function setDuration(h, m, s) {
  document.getElementById('workHrs').value  = h
  document.getElementById('workMins').value = m
  document.getElementById('workSecs').value = s
}

// ── Auto Date Time ────────────────────────────────────────────
function updateAutoDateTime() {
  const now = new Date()
  const str = now.toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  }) + ' ' + now.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
  const el = document.getElementById('autoDateTime')
  if (el) el.textContent = str
}

// ════════════════════════════════════════════════
// CLERK AUTH FUNCTIONS
// ════════════════════════════════════════════════

// Open frontend app for login
function openAppForLogin() {
  chrome.tabs.create({ url: CLERK_LOGIN_URL })

  // Show checking state
  document.getElementById('clerkChecking').style.display = 'flex'

  // Poll for login every 2 seconds
  clearInterval(clerkCheckInterval)
  clerkCheckInterval = setInterval(checkClerkLogin, 2000)
}

// Check if user is logged in via frontend cookie/storage
async function checkClerkLogin() {
  try {
    // Query all tabs to find frontend tab
    const tabs = await chrome.tabs.query({ url: `${FRONTEND_URL}/*` })

    for (const tab of tabs) {
      try {
        const result = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Try to get Clerk user from window.__clerk_frontend_api or localStorage
            try {
              // Method 1: Check Clerk session in localStorage
              const keys = Object.keys(localStorage)
              for (const key of keys) {
                if (key.includes('clerk') || key.includes('__session')) {
                  const val = localStorage.getItem(key)
                  if (val && val.length > 10) return { found: true, key, val }
                }
              }

              // Method 2: Check for Clerk user in window
              if (window.__clerk && window.__clerk.user) {
                const u = window.__clerk.user
                return {
                  found: true,
                  id: u.id,
                  name: u.fullName || u.firstName + ' ' + (u.lastName || ''),
                  email: u.primaryEmailAddress?.emailAddress || '',
                  avatar: u.imageUrl || ''
                }
              }

              // Method 3: Check meta tag or data attribute set by frontend
              const meta = document.querySelector('meta[name="clerk-user"]')
              if (meta) return JSON.parse(meta.content)

              return { found: false }
            } catch (e) {
              return { found: false, error: e.message }
            }
          }
        })

        if (result && result[0]?.result?.found) {
          const userData = result[0].result

          // Try to get better user info from the page
          const userInfo = await getClerkUserFromTab(tab.id)

          if (userInfo) {
            await saveClerkUser(userInfo)
            clearInterval(clerkCheckInterval)
            return
          }
        }
      } catch (e) {
        // Tab script error — skip
      }
    }

    // If no tabs found, try checking via backend (if user is on employee page)
    await checkClerkViaEmployeePage()

  } catch (e) {
    console.log('Clerk check error:', e)
  }
}

// Get Clerk user details from frontend tab
async function getClerkUserFromTab(tabId) {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        try {
          // Check window.__clerk
          if (window.__clerk?.user) {
            const u = window.__clerk.user
            return {
              id: u.id,
              name: (u.fullName || (u.firstName || '') + ' ' + (u.lastName || '')).trim(),
              email: u.primaryEmailAddress?.emailAddress || '',
              avatar: u.imageUrl || ''
            }
          }

          // Check Clerk React context via DOM
          const userBtn = document.querySelector('[data-clerk-component="UserButton"]')
            || document.querySelector('.cl-userButtonTrigger')
          if (userBtn) {
            const img = userBtn.querySelector('img')
            const avatar = img?.src || ''
            return { id: 'clerk_user', name: '', email: '', avatar, found_dom: true }
          }

          // Check header for user email
          const emailEl = document.querySelector('[data-clerk-user-email]')
          if (emailEl) {
            return { id: 'clerk_user', name: '', email: emailEl.textContent, avatar: '' }
          }

          return null
        } catch (e) {
          return null
        }
      }
    })
    return result?.[0]?.result || null
  } catch (e) {
    return null
  }
}

// Fallback: check employee page for user info
async function checkClerkViaEmployeePage() {
  try {
    const tabs = await chrome.tabs.query({ url: `${FRONTEND_URL}/app/*` })
    if (tabs.length === 0) return

    const tab = tabs[0]
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        try {
          // Look for user info in the page
          const nameEl  = document.querySelector('[data-user-name]') || document.querySelector('.cl-userButtonPopoverActionButtonText')
          const emailEl = document.querySelector('[data-user-email]')
          const imgEl   = document.querySelector('.cl-userButtonAvatarImage') || document.querySelector('[data-clerk-component] img')

          if (nameEl || emailEl || imgEl) {
            return {
              id: 'clerk_user',
              name:   nameEl?.textContent?.trim()  || '',
              email:  emailEl?.textContent?.trim() || '',
              avatar: imgEl?.src || ''
            }
          }

          // Check window.__clerk
          if (window.__clerk?.user) {
            const u = window.__clerk.user
            return {
              id:     u.id,
              name:   (u.fullName || (u.firstName || '') + ' ' + (u.lastName || '')).trim(),
              email:  u.primaryEmailAddress?.emailAddress || '',
              avatar: u.imageUrl || ''
            }
          }

          return null
        } catch (e) {
          return null
        }
      }
    })

    const userInfo = result?.[0]?.result
    if (userInfo && (userInfo.name || userInfo.email)) {
      await saveClerkUser(userInfo)
      clearInterval(clerkCheckInterval)
    }
  } catch (e) {}
}

// Save Clerk user and update UI
async function saveClerkUser(userInfo) {
  await chrome.storage.local.set({ clerk_user: userInfo })

  // Update Clerk screen UI
  document.getElementById('clerkChecking').style.display = 'none'
  document.getElementById('clerkNotLoggedIn').style.display = 'none'
  document.getElementById('clerkLoggedIn').style.display = 'block'

  // Set name
  const displayName = userInfo.name || userInfo.email || 'User'
  document.getElementById('clerkUserName').textContent  = displayName
  document.getElementById('clerkUserEmail').textContent = userInfo.email || ''

  // Set avatar
  if (userInfo.avatar) {
    document.getElementById('clerkAvatarWrap').innerHTML =
      `<img src="${userInfo.avatar}" alt="avatar" />`
  }
}

// Handle "Continue to Work Session" after Clerk login
async function handleClerkContinue() {
  const data = await chrome.storage.local.get(['clerk_user'])
  if (data.clerk_user) {
    prefillFromClerk(data.clerk_user)
  }
  showSessionScreen()
}

// Prefill name from Clerk user
function prefillFromClerk(clerkUser) {
  if (clerkUser?.name) {
    const nameInput = document.getElementById('empNameInput')
    if (nameInput && !nameInput.value) {
      nameInput.value = clerkUser.name
    }
  }
}

// Switch account
async function handleSwitchAccount() {
  await chrome.storage.local.remove(['clerk_user', 'employee_profile'])
  document.getElementById('clerkNotLoggedIn').style.display = 'flex'
  document.getElementById('clerkLoggedIn').style.display = 'none'
  chrome.tabs.create({ url: `${FRONTEND_URL}/sign-out` })
}

// ════════════════════════════════════════════════
// SCREEN NAVIGATION
// ════════════════════════════════════════════════

function showClerkScreen() {
  document.getElementById('screenClerk').className = 'screen active'
  document.getElementById('screenLogin').className = 'screen'
  document.getElementById('screenMain').className  = 'screen'
}

function showSessionScreen() {
  document.getElementById('screenClerk').className = 'screen'
  document.getElementById('screenLogin').className = 'screen active'
  document.getElementById('screenMain').className  = 'screen'
}

function showMainScreen(profile) {
  document.getElementById('screenClerk').className = 'screen'
  document.getElementById('screenLogin').className = 'screen'
  document.getElementById('screenMain').className  = 'screen active'

  document.getElementById('empNameDisplay').textContent = profile.name
  document.getElementById('empRoleDisplay').textContent = profile.designation

  // Set avatar from Clerk if available
  chrome.storage.local.get(['clerk_user'], (data) => {
    if (data.clerk_user?.avatar) {
      document.getElementById('empAvatarMain').innerHTML =
        `<img src="${data.clerk_user.avatar}" alt="avatar" />`
    }
  })

  workEndTime = new Date(profile.work_end_time)

  clearInterval(timerInterval)
  timerInterval = setInterval(updateWorkTimer, 1000)
  updateWorkTimer()

  loadStatus()
  clearInterval(refreshInterval)
  refreshInterval = setInterval(loadStatus, 3000)
}

// ════════════════════════════════════════════════
// LOGIN HANDLER (Session Setup)
// ════════════════════════════════════════════════

async function handleLogin() {
  const name        = document.getElementById('empNameInput').value.trim()
  const designation = document.getElementById('empDesignation').value
  const hrs  = parseInt(document.getElementById('workHrs').value)  || 0
  const mins = parseInt(document.getElementById('workMins').value) || 0
  const secs = parseInt(document.getElementById('workSecs').value) || 0

  if (!name)        { alert('Please enter your name'); return }
  if (!designation) { alert('Please select your designation'); return }

  const totalSecs = hrs * 3600 + mins * 60 + secs
  if (totalSecs < 10) { alert('Please set at least 10 seconds work duration'); return }

  const now     = new Date()
  const endTime = new Date(now.getTime() + totalSecs * 1000)

  // Get Clerk user for avatar/email
  const clerkData = await chrome.storage.local.get(['clerk_user'])
  const clerkUser = clerkData.clerk_user || {}

  const profile = {
    name,
    designation,
    email:         clerkUser.email   || '',
    avatar:        clerkUser.avatar  || '',
    clerk_id:      clerkUser.id      || '',
    login_time:    now.toISOString(),
    work_hours:    hrs,
    work_mins:     mins,
    work_secs:     secs,
    total_seconds: totalSecs,
    work_end_time: endTime.toISOString(),
    date: now.toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  await chrome.storage.local.set({ employee_profile: profile })
  await chrome.runtime.sendMessage({
    type: 'UPDATE_SETTINGS',
    data: { employee_name: name, designation }
  })

  showMainScreen(profile)
}

// ── Logout ────────────────────────────────────────────────────
async function handleLogout() {
  if (!confirm('Are you sure you want to logout?')) return
  await chrome.storage.local.remove(['employee_profile', 'clerk_user'])
  await chrome.runtime.sendMessage({ type: 'STOP_MONITORING' })
  clearInterval(timerInterval)
  clearInterval(refreshInterval)

  // Reset Clerk screen to not-logged-in state
  document.getElementById('clerkNotLoggedIn').style.display = 'flex'
  document.getElementById('clerkLoggedIn').style.display    = 'none'
  showClerkScreen()
}

// ── Work Timer Countdown ──────────────────────────────────────
function updateWorkTimer() {
  if (!workEndTime) return
  const now  = new Date()
  const diff = workEndTime - now

  if (diff <= 0) {
    document.getElementById('timerHrsVal').textContent  = '00'
    document.getElementById('timerMinsVal').textContent = '00'
    document.getElementById('timerSecsVal').textContent = '00'
    document.getElementById('timerHrs').className  = 'timer-box done'
    document.getElementById('timerMins').className = 'timer-box done'
    document.getElementById('timerSecs').className = 'timer-box done'
    clearInterval(timerInterval)
    return
  }

  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)

  document.getElementById('timerHrsVal').textContent  = String(h).padStart(2, '0')
  document.getElementById('timerMinsVal').textContent = String(m).padStart(2, '0')
  document.getElementById('timerSecsVal').textContent = String(s).padStart(2, '0')
}

// ── Load Status ───────────────────────────────────────────────
async function loadStatus() {
  try {
    const res = await chrome.runtime.sendMessage({ type: 'GET_STATUS' })
    if (!res) return

    const { settings, session, stats } = res
    isMonitoring = settings?.monitoring || false

    updateHeader(isMonitoring)
    updateButton(isMonitoring)
    updateStats(session, stats)
    updateWorkTime(session)

    if (stats && stats.total > 0) {
      const lastLog = session?.logs?.slice(-1)[0]
      if (lastLog) updateCurrentEmotion(lastLog, stats)
      updateBreakdown(stats.distribution, stats.total)
      updateTimeline(stats.timeline)
    }
  } catch (e) {
    console.log('Status load error:', e)
  }
}

// ── Toggle Monitoring ─────────────────────────────────────────
async function toggleMonitoring() {
  try {
    if (!isMonitoring) {
      await chrome.runtime.sendMessage({ type: 'START_MONITORING' })
      const tabs = await chrome.tabs.query({})
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'START_MONITORING' }).catch(() => {})
      })
      isMonitoring = true
    } else {
      await chrome.runtime.sendMessage({ type: 'STOP_MONITORING' })
      const tabs = await chrome.tabs.query({})
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'STOP_MONITORING' }).catch(() => {})
      })
      isMonitoring = false
    }
    loadStatus()
  } catch (e) {
    console.log('Toggle error:', e)
  }
}

// ── Send Report ───────────────────────────────────────────────
async function sendReport() {
  const btn = document.getElementById('reportBtn')
  btn.textContent = '⏳ Sending...'
  btn.disabled = true

  try {
    await chrome.runtime.sendMessage({ type: 'SEND_EOD_NOW' })
    btn.textContent = '✅ Report Sent!'
    setTimeout(() => {
      btn.textContent = '📧 Send Report'
      btn.disabled = false
    }, 3000)
  } catch (e) {
    btn.textContent = '❌ Failed'
    setTimeout(() => {
      btn.textContent = '📧 Send Report'
      btn.disabled = false
    }, 2000)
  }
}

// ── Open Dashboard ────────────────────────────────────────────
function openDashboard() {
  chrome.tabs.create({ url: `${FRONTEND_URL}/analytics` })
}

// ── UI Updaters ───────────────────────────────────────────────
function updateHeader(monitoring) {
  const dot = document.getElementById('statusDot')
  if (dot) dot.className = `status-dot${monitoring ? ' active' : ''}`
}

function updateButton(monitoring) {
  const btn = document.getElementById('toggleBtn')
  if (!btn) return
  if (monitoring) {
    btn.className = 'toggle-btn stop'
    btn.innerHTML = '⏹ STOP MONITORING'
  } else {
    btn.className = 'toggle-btn start'
    btn.innerHTML = '▶ START MONITORING'
  }
}

function updateStats(session, stats) {
  const t = document.getElementById('totalScans')
  const f = document.getElementById('faceScans')
  const x = document.getElementById('textScans')
  if (t) t.textContent = stats?.total || 0
  if (f) f.textContent = session?.face_count || 0
  if (x) x.textContent = session?.text_count || 0
}

function updateWorkTime(session) {
  const el = document.getElementById('workTime')
  if (!el) return
  if (!session?.start_time) {
    el.textContent = 'Not started today'
    return
  }
  const start = new Date(session.start_time)
  const now   = new Date()
  const secs  = Math.floor((now - start) / 1000)
  const h     = Math.floor(secs / 3600)
  const m     = Math.floor((secs % 3600) / 60)
  const s     = secs % 60
  el.textContent = `⏱ Working for ${h}h ${m}m ${s}s (started ${start.toLocaleTimeString()})`
}

function updateCurrentEmotion(lastLog, stats) {
  if (!lastLog) return
  const cfg  = EMOTION_CFG[lastLog.emotion] || EMOTION_CFG.Neutral
  const task = TASK_MAP[lastLog.emotion] || 'Routine work'

  document.getElementById('emotionContent').innerHTML = `
    <div class="emotion-main">
      <span class="emotion-emoji">${cfg.emoji}</span>
      <div>
        <div class="emotion-name" style="color:${cfg.color}">${lastLog.emotion}</div>
        <div class="emotion-sub">${new Date(lastLog.time).toLocaleTimeString()} · ${lastLog.source}</div>
      </div>
    </div>
    <div class="bar-row">
      <div class="bar-label">
        <span>Confidence</span>
        <span style="color:${cfg.color}">${Math.round(lastLog.confidence * 100)}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${lastLog.confidence * 100}%;background:${cfg.color}"></div>
      </div>
    </div>
    <div class="bar-row" style="margin-bottom:10px">
      <div class="bar-label">
        <span>Stress</span>
        <span style="color:#f87171">${Math.round((lastLog.stress_level || 0) * 100)}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(lastLog.stress_level || 0) * 100}%;background:#f87171"></div>
      </div>
    </div>
    <div style="background:rgba(0,245,255,0.06);border:1px solid rgba(0,245,255,0.15);border-radius:8px;padding:8px;font-size:11px;color:#94a3b8">
      ⚡ ${task}
    </div>
  `
}

function updateBreakdown(distribution, total) {
  if (!distribution || total === 0) return
  const section = document.getElementById('breakdownSection')
  const bars    = document.getElementById('breakdownBars')
  if (!section || !bars) return
  section.style.display = 'block'

  const sorted = Object.entries(distribution).sort((a, b) => b[1] - a[1])
  bars.innerHTML = sorted.map(([emotion, count]) => {
    const cfg = EMOTION_CFG[emotion] || EMOTION_CFG.Neutral
    const pct = Math.round((count / total) * 100)
    return `
      <div class="emo-row">
        <div class="emo-badge" style="background:${cfg.color}15;color:${cfg.color};border:1px solid ${cfg.color}30">
          ${cfg.emoji} ${emotion}
        </div>
        <div class="emo-bar-wrap">
          <div class="emo-bar-fill" style="width:${pct}%;background:${cfg.color}"></div>
        </div>
        <div class="emo-pct">${pct}%</div>
      </div>
    `
  }).join('')
}

function updateTimeline(timeline) {
  if (!timeline || timeline.length === 0) return
  const section = document.getElementById('timelineSection')
  const el      = document.getElementById('timeline')
  if (!section || !el) return
  section.style.display = 'block'

  el.innerHTML = timeline.map(t => {
    const cfg = EMOTION_CFG[t.dominant] || EMOTION_CFG.Neutral
    return `
      <div class="timeline-item"
        style="background:${cfg.color}15;border-color:${cfg.color}25;color:${cfg.color}"
        title="${t.hour}:00 - ${t.dominant}">
        ${t.hour}h
      </div>
    `
  }).join('')
}