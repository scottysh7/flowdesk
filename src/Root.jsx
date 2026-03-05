import React from 'react'
import { useAuth } from './hooks/useAuth'
import App from './App.jsx'
import AuthPage from './pages/AuthPage.jsx'

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

  if (!user) return <AuthPage onSignIn={signIn} onSignUp={signUp} />

  return <App user={user} onSignOut={signOut} />
}
