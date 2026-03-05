// utils/keepAlive.js
// Backend ko har 10 min ping karo taaki Render free tier sleep na kare

const BACKEND = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export function startKeepAlive() {
  // Initial ping after 5 seconds
  setTimeout(async () => {
    try {
      await fetch(`${BACKEND}/health`)
      console.log('[KeepAlive] Backend is awake ✅')
    } catch (e) {
      console.warn('[KeepAlive] Backend wakeup ping failed:', e.message)
    }
  }, 5000)

  // Then ping every 10 minutes
  setInterval(async () => {
    try {
      await fetch(`${BACKEND}/health`)
      console.log('[KeepAlive] Ping sent ✅', new Date().toLocaleTimeString())
    } catch (e) {
      console.warn('[KeepAlive] Ping failed:', e.message)
    }
  }, 10 * 60 * 1000)
}