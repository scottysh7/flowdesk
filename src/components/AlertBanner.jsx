import React, { useState, useEffect } from 'react'
import { ageColor } from './TaskCard'
import s from './AlertBanner.module.css'

const DISMISS_KEY = 'flowdesk_alert_dismissed'

export default function AlertBanner({ tasks }) {
  const [dismissed, setDismissed] = useState(false)

  // Reset dismiss each day
  useEffect(() => {
    const stored = localStorage.getItem(DISMISS_KEY)
    if (stored) {
      const dismissedDate = new Date(stored).toDateString()
      const today = new Date().toDateString()
      if (dismissedDate !== today) localStorage.removeItem(DISMISS_KEY)
      else setDismissed(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString())
    setDismissed(true)
  }

  // Find tasks that need attention
  const urgent = tasks.filter(t => {
    if (t.done || t.parent_id) return false
    const days = (Date.now() - new Date(t.created_at).getTime()) / 86400000
    return t.priority === 'high' && days >= 3
  })

  const stale = tasks.filter(t => {
    if (t.done || t.parent_id) return false
    const days = (Date.now() - new Date(t.created_at).getTime()) / 86400000
    return days >= 14 && t.priority !== 'high'
  })

  if (dismissed || (urgent.length === 0 && stale.length === 0)) return null

  const messages = []
  if (urgent.length > 0)
    messages.push(`${urgent.length} tâche${urgent.length > 1 ? 's' : ''} haute priorité en attente depuis +3 jours`)
  if (stale.length > 0)
    messages.push(`${stale.length} tâche${stale.length > 1 ? 's' : ''} non traitée${stale.length > 1 ? 's' : ''} depuis +14 jours`)

  const isUrgent = urgent.length > 0

  return (
    <div className={`${s.banner} ${isUrgent ? s.urgent : s.stale}`}>
      <span className={s.icon}>{isUrgent ? '🔴' : '🟡'}</span>
      <div className={s.messages}>
        {messages.map((m, i) => <span key={i} className={s.msg}>{m}</span>)}
      </div>
      <button className={s.dismiss} onClick={dismiss} title="Ignorer jusqu'à demain">✕</button>
    </div>
  )
}
