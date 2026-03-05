import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import s from './AuthForm.module.css'

export default function LoginPage({ onSignIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) { setError('Email et mot de passe requis'); return }
    setError(''); setLoading(true)
    const { error } = await onSignIn(email, password)
    if (error) setError(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : error.message)
    setLoading(false)
  }

  return (
    <div className={s.page}>
      <div className={s.bgGlow} /><div className={s.bgGlow2} />
      <Link to="/" className={s.backLink}>← FlowDesk</Link>
      <div className={s.card}>
        <div className={s.cardHeader}>
          <div className={s.logoDot} />
          <h1 className={s.cardTitle}>Connexion</h1>
          <p className={s.cardSub}>Bon retour 👋</p>
        </div>
        <div className={s.cardBody}>
          <div className={s.field}>
            <label className={s.label}>Email</label>
            <input className={s.input} type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="ton@email.com" autoFocus autoComplete="email" />
          </div>
          <div className={s.field}>
            <label className={s.label}>Mot de passe</label>
            <input className={s.input} type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••" autoComplete="current-password" />
          </div>
          {error && <div className={s.errorMsg}>{error}</div>}
          <button className={s.btnSubmit} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          <p className={s.switchLink}>
            Pas encore de compte ? <Link to="/signup">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
