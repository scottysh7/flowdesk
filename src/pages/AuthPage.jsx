import React, { useState } from 'react'
import s from './AuthPage.module.css'

export default function AuthPage({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) { setError('Email et mot de passe requis'); return }
    setError(''); setSuccess(''); setLoading(true)
    if (mode === 'login') {
      const { error } = await onSignIn(email, password)
      if (error) setError(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : error.message)
    } else {
      const { error } = await onSignUp(email, password)
      if (error) setError(error.message)
      else setSuccess('Compte créé ! Tu peux maintenant te connecter.')
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div className={s.page}>
      <div className={s.bgGlow} />
      <div className={s.bgGlow2} />

      <div className={s.hero}>
        <div className={s.logo}>
          <div className={s.logoDot} />
          FlowDesk
        </div>
        <h1 className={s.headline}>
          Ton espace de travail.<br />
          <span className={s.headlineAccent}>Sans friction.</span>
        </h1>
        <p className={s.sub}>
          Tâches, projets, deadlines — tout au même endroit.<br />
          Simple, rapide, personnel.
        </p>
        <div className={s.features}>
          {["Tâches & sous-tâches", "Vue par projet", "Dates d'échéance", "Notes par tâche", "Archivage"].map(f => (
            <div key={f} className={s.featureChip}>
              <span className={s.featureDot} />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardTabs}>
          <button className={`${s.cardTab} ${mode === 'login' ? s.cardTabActive : ''}`}
            onClick={() => { setMode('login'); setError(''); setSuccess('') }}>
            Connexion
          </button>
          <button className={`${s.cardTab} ${mode === 'signup' ? s.cardTabActive : ''}`}
            onClick={() => { setMode('signup'); setError(''); setSuccess('') }}>
            Créer un compte
          </button>
        </div>

        <div className={s.cardBody}>
          <p className={s.cardHint}>{mode === 'login' ? 'Bon retour 👋' : 'Crée ton espace personnel'}</p>

          <div className={s.field}>
            <label className={s.label}>Email</label>
            <input className={s.input} type="email" value={email}
              onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="ton@email.com" autoFocus autoComplete="email" />
          </div>

          <div className={s.field}>
            <label className={s.label}>Mot de passe</label>
            <input className={s.input} type="password" value={password}
              onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>

          {error && <div className={s.errorMsg}>{error}</div>}
          {success && <div className={s.successMsg}>{success}</div>}

          <button className={s.btnSubmit} onClick={handleSubmit} disabled={loading}>
            {loading ? '...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
          </button>

          {mode === 'signup' && (
            <p className={s.disclaimer}>
              L'accès est sur invitation. Si tu n'as pas reçu d'invitation, contacte l'administrateur.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
