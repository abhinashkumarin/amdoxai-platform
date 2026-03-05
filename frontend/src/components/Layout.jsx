import { Outlet, NavLink } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'
import { Brain, BarChart2, Shield, Activity } from 'lucide-react'

const NAV = [
  { to: '/employee',  icon: Activity,  label: 'Emotion Check-In' },
  { to: '/analytics', icon: BarChart2, label: 'HR Analytics' },
  { to: '/admin',     icon: Shield,    label: 'Admin' },
]

export default function Layout() {
  const { user } = useUser()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050B18' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#07111F',
        borderRight: '1px solid rgba(0,245,255,0.1)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 12px', gap: 8, flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 24px' }}>
          <Brain size={28} color="#00F5FF" />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#00F5FF' }}>AmdoxAI</span>
        </div>

        {/* Nav */}
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* User at bottom */}
        <div style={{ marginTop: 'auto', padding: '12px 8px', borderTop: '1px solid rgba(0,245,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserButton />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                {user?.firstName || 'User'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Employee</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        <Outlet />
      </main>
    </div>
  )
}
