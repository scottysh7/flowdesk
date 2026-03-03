import React, { useState } from 'react'
import styles from './TaskCard.module.css'

const PRIORITY_LABELS = { high: 'haute', medium: 'moyenne', low: 'basse' }

function ageColor(createdAt, done) {
  if (done) return '#4a4a5c'
  const days = (Date.now() - new Date(createdAt).getTime()) / 86400000
  if (days < 2) return '#52c97e'
  if (days < 5) return '#a8d96a'
  if (days < 10) return '#f7d16a'
  if (days < 20) return '#f7a26a'
  return '#f76a6a'
}

function ageLabel(createdAt) {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000)
  if (days === 0) return "aujourd'hui"
  if (days === 1) return 'hier'
  return `il y a ${days}j`
}

export default function TaskCard({ task, subtasks = [], project, onToggle, onDelete, onAddSubtask, onUpdate, compact = false }) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editPriority, setEditPriority] = useState(task.priority)
  const doneSubtasks = subtasks.filter(t => t.done).length

  const handleEditSave = () => {
    if (editTitle.trim() && (editTitle !== task.title || editPriority !== task.priority)) {
      onUpdate(task.id, { title: editTitle.trim(), priority: editPriority })
    }
    setEditing(false)
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSave()
    if (e.key === 'Escape') { setEditing(false); setEditTitle(task.title); setEditPriority(task.priority) }
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.card} ${task.done ? styles.done : ''}`}
        data-priority={task.priority || 'none'}
      >
        <div
          className={`${styles.check} ${task.done ? styles.checked : ''}`}
          onClick={() => onToggle(task.id)}
        />

        <div className={styles.body}>
          {editing ? (
            <div className={styles.editRow}>
              <input
                className={styles.editInput}
                value={editTitle}
                autoFocus
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={handleEditKeyDown}
                onBlur={handleEditSave}
              />
              <select
                className={styles.editSelect}
                value={editPriority}
                onChange={e => setEditPriority(e.target.value)}
              >
                <option value="none">— priorité</option>
                <option value="high">🔴 haute</option>
                <option value="medium">🟡 moyenne</option>
                <option value="low">🟢 basse</option>
              </select>
            </div>
          ) : (
            <div className={styles.title} onDoubleClick={() => setEditing(true)}>
              {task.title}
            </div>
          )}

          <div className={styles.meta}>
            <div
              className={styles.ageDot}
              style={{ background: ageColor(task.created_at, task.done) }}
              title={`Ajoutée ${ageLabel(task.created_at)}`}
            />
            <span className={styles.metaTag}>{ageLabel(task.created_at)}</span>

            {task.priority && task.priority !== 'none' && (
              <span className={`${styles.priorityBadge} ${styles[task.priority]}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>
            )}

            {project && !compact && (
              <span
                className={styles.projectTag}
                style={{ background: `${project.color}22`, color: project.color }}
              >
                {project.name}
              </span>
            )}

            {subtasks.length > 0 && (
              <span className={styles.metaTag}>📎 {doneSubtasks}/{subtasks.length}</span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          {!task.parent_id && (
            <button className={styles.actionBtn} onClick={() => onAddSubtask(task.id)} title="Sous-tâche">+</button>
          )}
          <button className={styles.actionBtn} onClick={() => setEditing(true)} title="Modifier">✎</button>
          <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => onDelete(task.id)} title="Supprimer">✕</button>
        </div>
      </div>

      {subtasks.map(st => (
        <div key={st.id} className={styles.subtaskWrapper}>
          <TaskCard
            task={st}
            subtasks={[]}
            project={null}
            onToggle={onToggle}
            onDelete={onDelete}
            onAddSubtask={() => {}}
            onUpdate={onUpdate}
            compact
          />
        </div>
      ))}
    </div>
  )
}
