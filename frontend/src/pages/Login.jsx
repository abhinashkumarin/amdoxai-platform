import { SignIn } from '@clerk/clerk-react'
import { Brain } from 'lucide-react'

export default function Login() {
  return (
    <div style={{
      minHeight: '100vh', background: '#050B18',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
          <Brain size={40} color="#00F5FF" />
          <span style={{ fontSize: 32, fontWeight: 700, color: '#00F5FF' }}>AmdoxAI</span>
        </div>
        <p style={{ color: '#64748b' }}>Emotion Intelligence Platform</p>
      </div>
      <SignIn redirectUrl="/employee" />
    </div>
  )
}
