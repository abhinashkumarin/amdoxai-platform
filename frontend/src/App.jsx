import { Routes, Route, Navigate } from 'react-router-dom'
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react'

// Pages
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import ApiDocsPage from './pages/ApiDocsPage'
import EmotionInput from './pages/EmotionInput'
import Analytics from './pages/Analytics'
import AdminDashboard from './pages/AdminDashboard'
import Layout from './components/Layout'

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return (
    <div style={{ minHeight: '100vh', background: '#050B18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#00F5FF', fontSize: 14, fontFamily: 'monospace' }}>Loading...</div>
    </div>
  )
  if (!isSignedIn) return <Navigate to="/sign-in" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* ── PUBLIC ROUTES (no auth needed) ── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/api-docs" element={<ApiDocsPage />} />

      {/* ── CLERK AUTH ROUTES ── */}
      <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" redirectUrl="/employee" />} />
      <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" redirectUrl="/employee" />} />

      {/* ── PROTECTED ROUTES (auth required) ── */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/employee" element={<EmotionInput />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* ── 404 FALLBACK ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}