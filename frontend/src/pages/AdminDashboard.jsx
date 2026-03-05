import { useState, useEffect } from 'react'
import { Shield, Users, Activity, Database, Settings, RefreshCw } from 'lucide-react'
import { getLogs, getAlerts } from '../api/client'

const DEFAULT_ORG = '00000000-0000-0000-0000-000000000001'

export default function AdminDashboard() {
  const [logs, setLogs] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [l, a] = await Promise.all([getLogs(DEFAULT_ORG, 100), getAlerts(DEFAULT_ORG)])
      setLogs(l.logs || [])
      setAlerts(a.alerts || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const stats = [
    { label: 'Total Logs', value: logs.length, icon: Database, color: '#00F5FF' },
    { label: 'Total Alerts', value: alerts.length, icon: Activity, color: '#f87171' },
    { label: 'Pending', value: alerts.filter(a => a.status === 'pending').length, icon: Shield, color: '#facc15' },
    { label: 'Resolved', value: alerts.filter(a => a.status === 'resolved').length, icon: Users, color: '#4ade80' },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Admin <span style={{ color: '#00F5FF' }}>Dashboard</span></h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>System overview and management</p>
        </div>
        <button onClick={load} className="btn-cyan" style={{ padding: '8px 16px', fontSize: 13 }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} className="glass" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>{s.label}</span>
              <s.icon size={18} color={s.color} />
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Logs */}
      <div className="glass" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>All Emotion Logs</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>Loading...</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>No logs found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Emotion','Confidence','Stress','Source','Time'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.slice(0,50).map((log, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{log.emotion}</td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{Math.round(log.confidence * 100)}%</td>
                    <td style={{ padding: '10px 12px', color: '#f87171' }}>{Math.round((log.stress_level || 0) * 100)}%</td>
                    <td style={{ padding: '10px 12px', color: '#00F5FF' }}>{log.source}</td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
