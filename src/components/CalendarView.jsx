import React, { useState, useMemo } from 'react'
import { recurrenceLabel } from '../lib/recurrence'
import s from './CalendarView.module.css'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

function getDaysInMonth(year, month) {
  const days = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // Pad start (Mon=0)
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6
  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month, -startDow + i + 1)
    days.push({ date: d, current: false })
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), current: true })
  }
  // Pad end to complete 6 rows
  while (days.length < 42) {
    const d = new Date(year, month + 1, days.length - lastDay.getDate() - startDow + 1)
    days.push({ date: d, current: false })
  }
  return days
}

function toDateStr(date) {
  return date.toISOString().split('T')[0]
}

const PRIORITY_COLORS = { high: '#f76a6a', medium: '#f7d16a', low: '#52c97e', none: '#7a7a8c' }

export default function CalendarView({ tasks, projects, onToggle, onTaskClick }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)

  const days = useMemo(() => getDaysInMonth(year, month), [year, month])

  // Map due_date → tasks (exclude templates, archived)
  const tasksByDate = useMemo(() => {
    const map = {}
    tasks.forEach(t => {
      if (t.is_template || t.archived) return
      const d = t.due_date
      if (!d) return
      if (!map[d]) map[d] = []
      map[d].push(t)
    })
    return map
  }, [tasks])

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const todayStr = toDateStr(today)
  const selectedStr = selectedDay ? toDateStr(selectedDay) : null
  const selectedTasks = selectedStr ? (tasksByDate[selectedStr] || []) : []
  const getProject = id => projects.find(p => p.id === id)

  return (
    <div className={s.wrapper}>
      {/* Calendar panel */}
      <div className={s.calendar}>
        {/* Header */}
        <div className={s.calHeader}>
          <button className={s.navBtn} onClick={prevMonth}>‹</button>
          <div className={s.monthTitle}>
            {MONTHS[month]} {year}
          </div>
          <button className={s.navBtn} onClick={nextMonth}>›</button>
          <button className={s.todayBtn} onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today) }}>
            Aujourd'hui
          </button>
        </div>

        {/* Day headers */}
        <div className={s.dayHeaders}>
          {DAYS.map(d => <div key={d} className={s.dayHeader}>{d}</div>)}
        </div>

        {/* Grid */}
        <div className={s.grid}>
          {days.map(({ date, current }, i) => {
            const ds = toDateStr(date)
            const dayTasks = tasksByDate[ds] || []
            const isToday = ds === todayStr
            const isSelected = ds === selectedStr
            const hasTasks = dayTasks.length > 0
            const hasOverdue = dayTasks.some(t => !t.done && ds < todayStr)

            return (
              <div
                key={i}
                className={`${s.cell} ${!current ? s.cellOther : ''} ${isToday ? s.cellToday : ''} ${isSelected ? s.cellSelected : ''}`}
                onClick={() => setSelectedDay(date)}
              >
                <div className={s.cellDate}>{date.getDate()}</div>
                {hasTasks && (
                  <div className={s.taskDots}>
                    {dayTasks.slice(0, 4).map((t, j) => (
                      <div
                        key={j}
                        className={`${s.taskDot} ${t.done ? s.taskDotDone : ''}`}
                        style={{ background: t.done ? '#4a4a5c' : PRIORITY_COLORS[t.priority || 'none'] }}
                        title={t.title}
                      />
                    ))}
                    {dayTasks.length > 4 && <div className={s.taskMore}>+{dayTasks.length - 4}</div>}
                  </div>
                )}
                {hasOverdue && !isSelected && (
                  <div className={s.overdueFlag} />
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className={s.legend}>
          <div className={s.legendItem}><div className={s.legendDot} style={{background:'#f76a6a'}}/>Haute</div>
          <div className={s.legendItem}><div className={s.legendDot} style={{background:'#f7d16a'}}/>Moyenne</div>
          <div className={s.legendItem}><div className={s.legendDot} style={{background:'#52c97e'}}/>Basse</div>
          <div className={s.legendItem}><div className={s.legendDot} style={{background:'#7a7a8c'}}/>Aucune</div>
          <div className={s.legendItem}><div className={s.legendDot} style={{background:'#4a4a5c'}}/>Terminée</div>
        </div>
      </div>

      {/* Side panel */}
      <div className={s.sidePanel}>
        {selectedDay ? (
          <>
            <div className={s.sidePanelHeader}>
              <div className={s.sidePanelDate}>
                {selectedDay.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              {toDateStr(selectedDay) === todayStr && <span className={s.todayBadge}>Aujourd'hui</span>}
            </div>

            {selectedTasks.length === 0 ? (
              <div className={s.emptyDay}>
                <div style={{fontSize:28,opacity:0.3}}>📅</div>
                <div>Aucune tâche ce jour</div>
              </div>
            ) : (
              <div className={s.dayTasks}>
                {selectedTasks.map(t => {
                  const proj = getProject(t.project_id)
                  const rec = recurrenceLabel(t.recurrence_type, t.recurrence_value)
                  return (
                    <div key={t.id} className={`${s.dayTask} ${t.done ? s.dayTaskDone : ''}`} data-priority={t.priority || 'none'}>
                      <div
                        className={`${s.dayCheck} ${t.done ? s.dayCheckDone : ''}`}
                        onClick={() => onToggle(t.id)}
                      />
                      <div className={s.dayTaskBody} onClick={() => onTaskClick && onTaskClick(t)}>
                        <div className={s.dayTaskTitle}>{t.title}</div>
                        <div className={s.dayTaskMeta}>
                          {proj && <span className={s.dayTaskProject} style={{color: proj.color, background: `${proj.color}18`}}>{proj.name}</span>}
                          {rec && <span className={s.dayTaskRec}>🔁 {rec}</span>}
                          {t.priority !== 'none' && t.priority && (
                            <span className={s.dayTaskPrio} style={{
                              color: PRIORITY_COLORS[t.priority],
                              background: `${PRIORITY_COLORS[t.priority]}15`
                            }}>{t.priority}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className={s.emptyDay}>
            <div style={{fontSize:28,opacity:0.3}}>👆</div>
            <div>Clique sur un jour pour voir ses tâches</div>
          </div>
        )}

        {/* Monthly summary */}
        <div className={s.monthlySummary}>
          <div className={s.summaryTitle}>Ce mois</div>
          <div className={s.summaryStats}>
            {(() => {
              const monthTasks = Object.entries(tasksByDate)
                .filter(([d]) => d.startsWith(`${year}-${String(month+1).padStart(2,'0')}`))
                .flatMap(([,t]) => t)
              const done = monthTasks.filter(t => t.done).length
              const total = monthTasks.length
              const overdue = monthTasks.filter(t => !t.done && t.due_date < todayStr).length
              return (
                <>
                  <div className={s.statItem}><strong>{total}</strong> tâches planifiées</div>
                  <div className={s.statItem}><strong style={{color:'var(--green)'}}>{done}</strong> complétées</div>
                  {overdue > 0 && <div className={s.statItem}><strong style={{color:'var(--red)'}}>{overdue}</strong> en retard</div>}
                </>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
