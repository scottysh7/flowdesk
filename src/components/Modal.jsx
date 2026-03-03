import React, { useEffect } from 'react'
import s from './Modal.module.css'

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <h3 className={s.title}>{title}</h3>
        {children}
      </div>
    </div>
  )
}

export function ModalField({ label, children }) {
  return (
    <div className={s.field}>
      <label className={s.label}>{label}</label>
      {children}
    </div>
  )
}

export function ModalActions({ onCancel, onConfirm, confirmLabel = 'Confirmer' }) {
  return (
    <div className={s.actions}>
      <button className={s.cancel} onClick={onCancel}>Annuler</button>
      <button className={s.confirm} onClick={onConfirm}>{confirmLabel}</button>
    </div>
  )
}
