import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import App from './App.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ user, children }) {
  if (user) return <Navigate to="/app" replace />
  return children
}

export default function Root() {
  const { user, loading, signIn, signUp, signOut } = useAuth()

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', color: 'var(--text-dim)',
      fontFamily: 'DM Mono, monospace', fontSize: '13px',
      background: 'var(--bg)'
    }}>
      chargement...
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PublicRoute user={user}>
            <LandingPage />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute user={user}>
            <LoginPage onSignIn={signIn} />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute user={user}>
            <SignupPage onSignUp={signUp} />
          </PublicRoute>
        } />
        <Route path="/app" element={
          <ProtectedRoute user={user}>
            <App user={user} onSignOut={signOut} />
          </ProtectedRoute>
        } />
        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? '/app' : '/'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
