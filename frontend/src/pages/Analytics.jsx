import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { AlertTriangle, Users, Activity, Bell, RefreshCw, CheckCircle, Clock } from 'lucide-react'
import { getMood, getAlerts, updateAlert } from '../api/client'

const DEFAULT_ORG = '00000000-0000-0000-0000-000000000001'
const COLORS = { Happy:'#4ade80', Sad:'#60a5fa', Angry:'#f87171', Stress:'#facc15', Fear:'#c084fc', Neutral:'#94a3b8', Surprise:'#fb923c' }

function MetricCard({ label, value, icon: Icon, color }) {
  return (
    <div className="glass" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <span style={{ color: '#64748b', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
        <div style={{ background: `${color}20`, borderRadius: 8, padding: 8 }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || '#f1f5f9' }}>{value ?? '—'}</div>
    </div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [alertFilter, setAlertFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [mood, al] = await Promise.all([
        getMood(DEFAULT_ORG),
        getAlerts(DEFAULT_ORG)
      ])
      setData(mood)
      setAlerts(al.alerts || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    await updateAlert(id, status)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const distData = data ? Object.entries(data.data?.distribution || {}).map(([name, value]) => ({ name, value })) : []
  const recentLogs = data?.data?.recent_entries || []

  // Build daily trend from logs
  const trendMap = {}
  recentLogs.forEach(log => {
    const day = new Date(log.created_at).toLocaleDateString('en', { month:'short', day:'numeric' })
    if (!trendMap[day]) trendMap[day] = { day, stress: 0, count: 0 }
    trendMap[day].stress += log.stress_level || 0
    trendMap[day].count += 1
  })
  const trendData = Object.values(trendMap).slice(-7).map(d => ({
    day: d.day,
    avg: d.count > 0 ? parseFloat((d.stress / d.count).toFixed(2)) : 0
  }))

  const filteredAlerts = alertFilter === 'all' ? alerts : alerts.filter(a => a.status === alertFilter)

  const STATUS_COLORS = { pending: '#facc15', reviewed: '#60a5fa', resolved: '#4ade80' }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
      <RefreshCw size={32} color="#00F5FF" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>HR <span style={{ color: '#00F5FF' }}>Analytics</span></h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Real-time employee wellness monitoring</p>
        </div>
        <button onClick={load} className="btn-cyan" style={{ padding: '8px 16px', fontSize: 13 }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <MetricCard label="Total Employees" value={data?.data?.total_employees} icon={Users} color="#00F5FF" />
        <MetricCard label="Active Alerts" value={alerts.filter(a => a.status === 'pending').length} icon={AlertTriangle} color="#f87171" />
        <MetricCard label="Logs Today" value={recentLogs.filter(l => {
          const d = new Date(l.created_at); const n = new Date()
          return d.toDateString() === n.toDateString()
        }).length} icon={Activity} color="#4ade80" />
        <MetricCard label="Total Logs" value={recentLogs.length} icon={Bell} color="#c084fc" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Pie */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>Emotion Distribution</h3>
          {distData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={distData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {distData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0A1628', border: '1px solid #00F5FF30', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              No emotion data yet
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {distData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[d.name] || '#94a3b8' }} />
                <span style={{ color: '#94a3b8' }}>{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Area Chart */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>Daily Stress Trend</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="stress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#334155" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis stroke="#334155" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0A1628', border: '1px solid #00F5FF30', borderRadius: 8 }} />
                <Area type="monotone" dataKey="avg" stroke="#f87171" fill="url(#stress)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              No trend data yet
            </div>
          )}
        </div>
      </div>

      {/* Stress Alerts Table */}
      <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} color="#facc15" /> Stress Alerts
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {['all','pending','reviewed','resolved'].map(s => (
              <button key={s} onClick={() => setAlertFilter(s)}
                style={{
                  padding: '5px 12px', 
                  borderRadius: 8, 
                  cursor: 'pointer', 
                  fontSize: 12,
                  background: alertFilter === s ? 'rgba(0,245,255,0.15)' : 'transparent',
                  color: alertFilter === s ? '#00F5FF' : '#64748b',
                  border: alertFilter === s ? '1px solid rgba(0,245,255,0.3)' : '1px solid transparent'
                }}>{s}</button>
            ))}
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>No alerts found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredAlerts.slice(0,10).map(alert => (
              <div key={alert.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', background: 'rgba(255,255,255,0.03)',
                borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    background: `${STATUS_COLORS[alert.status] || '#94a3b8'}20`,
                    borderRadius: 8, padding: 8
                  }}>
                    <AlertTriangle size={16} color={STATUS_COLORS[alert.status] || '#94a3b8'} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>
                      {alert.dominant_emotion} — Score: {alert.stress_score?.toFixed(1)}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {new Date(alert.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: `${STATUS_COLORS[alert.status] || '#94a3b8'}20`,
                    color: STATUS_COLORS[alert.status] || '#94a3b8'
                  }}>{alert.status}</span>
                  {alert.status === 'pending' && (
                    <button onClick={() => handleStatus(alert.id, 'reviewed')}
                      style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid #60a5fa40', color: '#60a5fa', padding: '4px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
                      Review
                    </button>
                  )}
                  {alert.status === 'reviewed' && (
                    <button onClick={() => handleStatus(alert.id, 'resolved')}
                      style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid #4ade8040', color: '#4ade80', padding: '4px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Logs */}
      <div className="glass" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Recent Emotion Logs</h3>
        {recentLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>No logs yet — start analyzing emotions!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentLogs.slice(0,15).map((log, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', background: 'rgba(255,255,255,0.02)',
                borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: `${COLORS[log.emotion] || '#94a3b8'}20`,
                    color: COLORS[log.emotion] || '#94a3b8'
                  }}>{log.emotion}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{log.source}</span>
                </div>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    Conf: {Math.round(log.confidence * 100)}%
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}