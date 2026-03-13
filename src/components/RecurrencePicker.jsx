import React, { useState } from 'react'
import { recurrenceLabel } from '../lib/recurrence'
import s from './RecurrencePicker.module.css'

const PRESETS = [
  { label: 'Tous les jours', type: 'daily', value: 1 },
  { label: 'Tous les 2 jours', type: 'custom_days', value: 2 },
  { label: 'Toutes les semaines', type: 'weekly', value: 1 },
  { label: 'Toutes les 2 semaines', type: 'weekly', value: 2 },
  { label: 'Tous les mois', type: 'monthly_day', value: null }, // value = day of month
]

export default function RecurrencePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [customMode, setCustomMode] = useState(false)
  const [customType, setCustomType] = useState('daily')
  const [customValue, setCustomValue] = useState(3)
  const [monthDay, setMonthDay] = useState(1)

  const current = value?.type && value.type !== 'none' ? recurrenceLabel(value.type, value.value) : null

  const select = (type, val) => {
    onChange({ type, value: val })
    setOpen(false)
    setCustomMode(false)
  }

  const clear = (e) => {
    e.stopPropagation()
    onChange({ type: 'none', value: null })
    setOpen(false)
  }

  return (
    <div className={s.wrapper}>
      <button
        type="button"
        className={`${s.trigger} ${current ? s.active : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        🔁 {current || 'Récurrence'}
        {current && <span className={s.clearBtn} onMouseDown={clear}>✕</span>}
      </button>

      {open && (
        <div className={s.dropdown}>
          <div className={s.dropdownTitle}>Fréquence de répétition</div>

          {PRESETS.map((p, i) => {
            const val = p.type === 'monthly_day' ? monthDay : p.value
            const isActive = value?.type === p.type && value?.value === val
            return (
              <div key={i}>
                {p.type === 'monthly_day' ? (
                  <div className={s.monthDayRow}>
                    <button
                      className={`${s.preset} ${isActive ? s.presetActive : ''}`}
                      onClick={() => select('monthly_day', monthDay)}
                    >
                      Le
                    </button>
                    <input
                      type="number" min="1" max="28"
                      value={monthDay}
                      onChange={e => setMonthDay(parseInt(e.target.value) || 1)}
                      className={s.dayInput}
                    />
                    <span className={s.dayLabel}>de chaque mois</span>
                  </div>
                ) : (
                  <button
                    className={`${s.preset} ${isActive ? s.presetActive : ''}`}
                    onClick={() => select(p.type, p.value)}
                  >
                    {p.label}
                  </button>
                )}
              </div>
            )
          })}

          <div className={s.divider} />

          {!customMode ? (
            <button className={s.customToggle} onClick={() => setCustomMode(true)}>
              + Personnalisé...
            </button>
          ) : (
            <div className={s.customRow}>
              <span className={s.customLabel}>Tous les</span>
              <input
                type="number" min="1" max="365"
                value={customValue}
                onChange={e => setCustomValue(parseInt(e.target.value) || 1)}
                className={s.dayInput}
              />
              <select
                className={s.customSelect}
                value={customType}
                onChange={e => setCustomType(e.target.value)}
              >
                <option value="custom_days">jours</option>
                <option value="weekly">semaines</option>
              </select>
              <button className={s.customConfirm} onClick={() => select(customType, customValue)}>✓</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
