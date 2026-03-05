// import { useState, useEffect } from 'react'
// import { AlertTriangle, TrendingUp, Users, Clock, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

// const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
// const DEFAULT_ORG = '00000000-0000-0000-0000-000000000001'

// const EMOTION_CONFIG = {
//   Happy:    { color: '#22c55e', emoji: '😊' },
//   Neutral:  { color: '#60a5fa', emoji: '😐' },
//   Surprise: { color: '#f59e0b', emoji: '😲' },
//   Sad:      { color: '#818cf8', emoji: '😢' },
//   Fear:     { color: '#fb923c', emoji: '😨' },
//   Angry:    { color: '#f87171', emoji: '😠' },
//   Stress:   { color: '#ef4444', emoji: '😤' },
//   Disgust:  { color: '#a78bfa', emoji: '🤢' },
//   Calm:     { color: '#34d399', emoji: '😌' },
// }

// export default function DailyReport({ orgId }) {
//   const org = orgId || DEFAULT_ORG
//   const [data, setData] = useState(null)
//   const [alerts, setAlerts] = useState([])
//   const [logs, setLogs] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [lastRefresh, setLastRefresh] = useState(null)

//   const fetchAll = async () => {
//     setLoading(true)
//     try {
//       const [moodRes, alertsRes, logsRes] = await Promise.all([
//         fetch(`${API_BASE}/api/analytics/mood?org_id=${org}`).then(r => r.json()),
//         fetch(`${API_BASE}/api/analytics/stress-alerts?org_id=${org}`).then(r => r.json()),
//         fetch(`${API_BASE}/api/analytics/logs?org_id=${org}&limit=100`).then(r => r.json()),
//       ])
//       setData(moodRes?.data || moodRes)
//       setAlerts(alertsRes?.alerts || [])
//       setLogs(logsRes?.logs || [])
//       setLastRefresh(new Date())
//     } catch (e) {
//       console.error('DailyReport fetch error:', e)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchAll()
//     const interval = setInterval(fetchAll, 60000) // refresh every minute
//     return () => clearInterval(interval)
//   }, [org])

//   // Today's logs only
//   const today = new Date().toDateString()
//   const todayLogs = logs.filter(l => new Date(l.created_at).toDateString() === today)

//   // Per-source counts
//   const sourceCounts = todayLogs.reduce((a, l) => { a[l.source] = (a[l.source] || 0) + 1; return a }, {})

//   // Emotion distribution
//   const emotionDist = todayLogs.reduce((a, l) => { a[l.emotion] = (a[l.emotion] || 0) + 1; return a }, {})

//   // Hourly stress heatmap (0-23)
//   const hourlyStress = Array(24).fill(0)
//   const hourlyCount = Array(24).fill(0)
//   todayLogs.forEach(l => {
//     const h = new Date(l.created_at).getHours()
//     hourlyStress[h] += l.stress_level || 0
//     hourlyCount[h] += 1
//   })
//   const hourlyAvg = hourlyStress.map((s, i) => hourlyCount[i] > 0 ? s / hourlyCount[i] : null)

//   const pendingAlerts = alerts.filter(a => a.status === 'pending')
//   const avgStressToday = todayLogs.length
//     ? todayLogs.reduce((s, l) => s + (l.stress_level || 0), 0) / todayLogs.length
//     : 0

//   const updateAlertStatus = async (alertId, status) => {
//     try {
//       await fetch(`${API_BASE}/api/analytics/stress-alerts/${alertId}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status }),
//       })
//       fetchAll()
//     } catch (e) { console.error(e) }
//   }

//   if (loading && !data) {
//     return (
//       <div style={{ padding: 24, textAlign: 'center', color: '#475569', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
//         <div style={{ width: 28, height: 28, border: '2px solid transparent', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
//         Loading daily report...
//         <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//       </div>
//     )
//   }

//   return (
//     <div style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", color: '#e2e8f0', background: '#0a0a0f', padding: '14px' }}>

//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
//         <div>
//           <div style={{ fontSize: 13, fontWeight: 'bold', letterSpacing: '0.08em', color: '#f1f5f9' }}>
//             📊 DAILY EMOTION REPORT
//           </div>
//           <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
//             {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
//           </div>
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//           {lastRefresh && (
//             <span style={{ fontSize: 9, color: '#334155' }}>
//               {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
//             </span>
//           )}
//           <button onClick={fetchAll} disabled={loading} style={{ background: '#1e293b', border: '1px solid #334155', color: '#64748b', padding: '4px 8px', borderRadius: 5, cursor: 'pointer', fontSize: 10, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
//             <RefreshCw size={10} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> REFRESH
//           </button>
//         </div>
//       </div>

//       {/* KPI cards */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 14 }}>
//         {[
//           { label: 'Today Scans', value: todayLogs.length, icon: <TrendingUp size={14} />, color: '#3b82f6' },
//           { label: 'Pending Alerts', value: pendingAlerts.length, icon: <AlertTriangle size={14} />, color: pendingAlerts.length > 0 ? '#ef4444' : '#22c55e', warn: pendingAlerts.length > 0 },
//           { label: 'Avg Stress', value: `${Math.round(avgStressToday * 100)}%`, icon: <Users size={14} />, color: avgStressToday > 0.6 ? '#ef4444' : avgStressToday > 0.3 ? '#f59e0b' : '#22c55e' },
//           { label: 'Total Alerts', value: alerts.length, icon: <Clock size={14} />, color: '#60a5fa' },
//         ].map((k, i) => (
//           <div key={i} style={{ padding: '10px 12px', background: '#0f0f1a', border: `1px solid ${k.warn ? '#ef444444' : '#1e293b'}`, borderRadius: 8 }}>
//             <div style={{ color: k.color, marginBottom: 4 }}>{k.icon}</div>
//             <div style={{ fontSize: 20, fontWeight: 'bold', color: k.color }}>{k.value}</div>
//             <div style={{ fontSize: 10, color: '#475569' }}>{k.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* Hourly stress heatmap */}
//       <div style={{ marginBottom: 14 }}>
//         <div style={{ fontSize: 10, color: '#475569', letterSpacing: '0.08em', marginBottom: 6 }}>HOURLY STRESS HEATMAP (TODAY)</div>
//         <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 40 }}>
//           {hourlyAvg.map((val, h) => {
//             const height = val !== null ? Math.max(4, val * 36) : 3
//             const color = val === null ? '#1e293b' : val > 0.7 ? '#ef4444' : val > 0.4 ? '#f59e0b' : '#22c55e'
//             return (
//               <div key={h} title={`${h}:00 — ${val !== null ? Math.round(val * 100) + '%' : 'no data'}`} style={{ flex: 1, height: `${height}px`, background: color, borderRadius: '2px 2px 0 0', opacity: val !== null ? 0.85 : 0.2, transition: 'height 0.3s ease', cursor: 'pointer' }} />
//             )
//           })}
//         </div>
//         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#334155', marginTop: 2 }}>
//           <span>12AM</span><span>6AM</span><span>12PM</span><span>6PM</span><span>11PM</span>
//         </div>
//       </div>

//       {/* Emotion distribution */}
//       {Object.keys(emotionDist).length > 0 && (
//         <div style={{ marginBottom: 14 }}>
//           <div style={{ fontSize: 10, color: '#475569', letterSpacing: '0.08em', marginBottom: 6 }}>TODAY'S EMOTION BREAKDOWN</div>
//           {Object.entries(emotionDist).sort((a, b) => b[1] - a[1]).map(([em, cnt]) => {
//             const ec = EMOTION_CONFIG[em] || { color: '#60a5fa', emoji: '😐' }
//             const pct = ((cnt / todayLogs.length) * 100).toFixed(0)
//             return (
//               <div key={em} style={{ marginBottom: 5 }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', marginBottom: 2 }}>
//                   <span>{ec.emoji} {em}</span>
//                   <span style={{ color: ec.color }}>{cnt} scans ({pct}%)</span>
//                 </div>
//                 <div style={{ height: 5, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
//                   <div style={{ height: '100%', width: `${pct}%`, background: ec.color, borderRadius: 3 }} />
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       )}

//       {/* Source breakdown */}
//       {Object.keys(sourceCounts).length > 0 && (
//         <div style={{ marginBottom: 14, display: 'flex', gap: 7 }}>
//           {Object.entries(sourceCounts).map(([src, cnt]) => (
//             <div key={src} style={{ flex: 1, padding: '7px 8px', background: '#0f0f1a', border: '1px solid #1e293b', borderRadius: 7, textAlign: 'center' }}>
//               <div style={{ fontSize: 11, color: '#60a5fa', fontWeight: 'bold' }}>{cnt}</div>
//               <div style={{ fontSize: 9, color: '#475569' }}>{src}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Pending stress alerts */}
//       {pendingAlerts.length > 0 && (
//         <div style={{ marginBottom: 14 }}>
//           <div style={{ fontSize: 10, color: '#ef4444', letterSpacing: '0.08em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
//             <AlertTriangle size={10} /> PENDING STRESS ALERTS ({pendingAlerts.length})
//           </div>
//           {pendingAlerts.map(alert => (
//             <div key={alert.id} style={{ marginBottom: 6, padding: '10px 12px', background: '#ef444410', border: '1px solid #ef444440', borderRadius: 8 }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
//                 <div>
//                   <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 'bold' }}>
//                     🚨 {alert.dominant_emotion || 'Stress'} Alert
//                   </div>
//                   <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
//                     Score: {((alert.stress_score || 0) * 100).toFixed(0)}% • {new Date(alert.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
//                   </div>
//                 </div>
//                 <div style={{ display: 'flex', gap: 5 }}>
//                   <button onClick={() => updateAlertStatus(alert.id, 'reviewed')} style={{ background: '#f59e0b18', border: '1px solid #f59e0b', color: '#f59e0b', padding: '3px 7px', borderRadius: 4, cursor: 'pointer', fontSize: 9, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}>
//                     <CheckCircle size={9} /> REVIEW
//                   </button>
//                   <button onClick={() => updateAlertStatus(alert.id, 'resolved')} style={{ background: '#22c55e18', border: '1px solid #22c55e', color: '#22c55e', padding: '3px 7px', borderRadius: 4, cursor: 'pointer', fontSize: 9, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}>
//                     <XCircle size={9} /> RESOLVE
//                   </button>
//                 </div>
//               </div>
//               {alert.message && (
//                 <div style={{ fontSize: 10, color: '#94a3b8', borderTop: '1px solid #ef444430', paddingTop: 5 }}>
//                   {alert.message}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Recent logs table */}
//       <div>
//         <div style={{ fontSize: 10, color: '#475569', letterSpacing: '0.08em', marginBottom: 6 }}>RECENT DETECTIONS (TODAY)</div>
//         {todayLogs.length === 0 ? (
//           <div style={{ textAlign: 'center', color: '#334155', fontSize: 11, padding: '16px 0' }}>No data yet today</div>
//         ) : (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 220, overflowY: 'auto' }}>
//             {[...todayLogs].reverse().slice(0, 30).map((log, i) => {
//               const ec = EMOTION_CONFIG[log.emotion] || { color: '#60a5fa', emoji: '😐' }
//               const stressColor = (log.stress_level || 0) > 0.6 ? '#ef4444' : (log.stress_level || 0) > 0.3 ? '#f59e0b' : '#22c55e'
//               return (
//                 <div key={log.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#0f0f1a', borderRadius: 5, borderLeft: `2px solid ${ec.color}44` }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <span>{ec.emoji}</span>
//                     <span style={{ color: ec.color, fontSize: 11 }}>{log.emotion}</span>
//                     <span style={{ fontSize: 9, color: '#475569', background: '#1e293b', padding: '1px 5px', borderRadius: 3 }}>{log.source}</span>
//                   </div>
//                   <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//                     <span style={{ fontSize: 10, color: stressColor }}>
//                       {Math.round((log.stress_level || 0) * 100)}%
//                     </span>
//                     <span style={{ fontSize: 9, color: '#334155' }}>
//                       {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
//                     </span>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </div>

//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//     </div>
//   )
// }