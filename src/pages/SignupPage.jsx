import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import s from './AuthForm.module.css'

export default function SignupPage({ onSignUp }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) { setError('Email et mot de passe requis'); return }
    if (password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères'); return }
    setError(''); setLoading(true)
    const { error } = await onSignUp(email, password)
    if (error) setError(error.message)
    else setSuccess('Compte créé ! Tu peux maintenant te connecter.')
    setLoading(false)
  }

  return (
    <div className={s.page}>
      <div className={s.bgGlow} /><div className={s.bgGlow2} />
      <Link to="/" className={s.backLink}>← FlowDesk</Link>
      <div className={s.card}>
        <div className={s.cardHeader}>
          <div className={s.logoDot} />
          <h1 className={s.cardTitle}>Créer un compte</h1>
          <p className={s.cardSub}>Ton espace de travail personnel</p>
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
              placeholder="••••••••" autoComplete="new-password" />
          </div>
          {error && <div className={s.errorMsg}>{error}</div>}
          {success && <div className={s.successMsg}>{success}</div>}
          <button className={s.btnSubmit} onClick={handleSubmit} disabled={loading || !!success}>
            {loading ? 'Création...' : 'Créer le compte'}
          </button>
          <p className={s.disclaimer}>
            L'accès est sur invitation uniquement.
          </p>
          <p className={s.switchLink}>
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
