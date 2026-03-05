import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: BASE,
  timeout: 120000   // 120 seconds — AI models (DeepFace, wav2vec2) take time to load first time
})

// ── EMOTION ───────────────────────────────────────────────────────────────────
export const analyzeText = (text, employee_id, org_id) =>
  api.post('/api/emotion/text', { text, employee_id, org_id }).then(r => r.data)

export const analyzeFace = (image, employee_id, org_id) =>
  api.post('/api/emotion/face', { image, employee_id, org_id }).then(r => r.data)

export const analyzeVoice = (formData) =>
  api.post('/api/emotion/voice', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  }).then(r => r.data)

// ── ANALYTICS ────────────────────────────────────────────────────────────────
export const getMood = (org_id = '00000000-0000-0000-0000-000000000001') =>
  api.get('/api/analytics/mood', { params: { org_id } }).then(r => r.data)

export const getLogs = (org_id = '00000000-0000-0000-0000-000000000001', limit = 50) =>
  api.get('/api/analytics/logs', { params: { org_id, limit } }).then(r => r.data)

export const getAlerts = (org_id = '00000000-0000-0000-0000-000000000001', status) =>
  api.get('/api/analytics/stress-alerts', { params: { org_id, status } }).then(r => r.data)

export const updateAlert = (id, status) =>
  api.patch(`/api/analytics/stress-alerts/${id}`, { status }).then(r => r.data)

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const syncUser = (data) =>
  api.post('/api/auth/sync', data).then(r => r.data)

export default api