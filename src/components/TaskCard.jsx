import React, { useState, useRef, useEffect } from 'react'
import styles from './TaskCard.module.css'

const PRIORITY_LABELS = { high: 'haute', medium: 'moyenne', low: 'basse' }

export function ageColor(createdAt, done) {
  if (done) return '#4a4a5c'
  const days = (Date.now() - new Date(createdAt).getTime()) / 86400000
  if (days < 2) return '#52c97e'
  if (days < 5) return '#a8d96a'
  if (days < 10) return '#f7d16a'
  if (days < 20) return '#f7a26a'
  return '#f76a6a'
}

export function ageLabel(createdAt) {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000)
  if (days === 0) return "aujourd'hui"
  if (days === 1) return 'hier'
  return `il y a ${days}j`
}

function dueDateInfo(dueDate, done) {
  if (!dueDate) return null
  const due = new Date(dueDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diff = Math.round((due - now) / 86400000)
  if (done) return { label: due.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), color: '#4a4a5c', urgent: false }
  if (diff < 0) return { label: `en retard de ${Math.abs(diff)}j`, color: '#f76a6a', urgent: true }
  if (diff === 0) return { label: "échéance aujourd'hui", color: '#f76a6a', urgent: true }
  if (diff === 1) return { label: 'échéance demain', color: '#f7a26a', urgent: true }
  if (diff <= 7) return { label: `dans ${diff}j`, color: '#f7d16a', urgent: false }
  return { label: due.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), color: '#7a7a8c', urgent: false }
}

export default function TaskCard({ task, subtasks = [], project, projects = [], onToggle, onDelete, onAddSubtask, onUpdate, compact = false }) {
  const [editing, setEditing] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editPriority, setEditPriority] = useState(task.priority)
  const [editProject, setEditProject] = useState(task.project_id || '')
  const [editDueDate, setEditDueDate] = useState(task.due_date || '')
  const [editNotes, setEditNotes] = useState(task.notes || '')
  const inputRef = useRef()
  const doneSubtasks = subtasks.filter(t => t.done).length
  const due = dueDateInfo(task.due_date, task.done)

  useEffect(() => {
    if (!editing) {
      setEditTitle(task.title)
      setEditPriority(task.priority)
      setEditProject(task.project_id || '')
      setEditDueDate(task.due_date || '')
      setEditNotes(task.notes || '')
    }
  }, [task, editing])

  const startEditing = () => {
    setEditTitle(task.title)
    setEditPriority(task.priority)
    setEditProject(task.project_id || '')
    setEditDueDate(task.due_date || '')
    setEditNotes(task.notes || '')
    setEditing(true)
    setNotesOpen(false)
    setTimeout(() => inputRef.current?.focus(), 30)
  }

  const cancelEditing = () => {
    setEditing(false)
    setEditTitle(task.title)
    setEditPriority(task.priority)
    setEditProject(task.project_id || '')
    setEditDueDate(task.due_date || '')
    setEditNotes(task.notes || '')
  }

  const saveEditing = () => {
    if (!editTitle.trim()) { cancelEditing(); return }
    onUpdate(task.id, {
      title: editTitle.trim(),
      priority: editPriority,
      project_id: editProject || null,
      due_date: editDueDate || null,
      notes: editNotes.trim() || null,
    })
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); saveEditing() }
    if (e.key === 'Escape') cancelEditing()
  }

  const handleBlur = (e) => {
    if (e.currentTarget.closest('[data-editrow]')?.contains(e.relatedTarget)) return
    saveEditing()
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.card} ${task.done ? styles.done : ''} ${editing ? styles.editing : ''}`}
        data-priority={editing ? 'none' : (task.priority || 'none')}
      >
        {/* Checkbox */}
        <div
          className={`${styles.check} ${task.done ? styles.checked : ''}`}
          onClick={() => { if (!editing) onToggle(task.id) }}
        />

        <div className={styles.body}>
          {editing ? (
            <div className={styles.editBlock} data-editrow>
              {/* Row 1: title */}
              <input
                ref={inputRef}
                className={styles.editInput}
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder="Titre de la tâche..."
              />
              {/* Row 2: priority + project + due date */}
              <div className={styles.editMeta}>
                <select className={styles.editSelect} value={editPriority}
                  onChange={e => setEditPriority(e.target.value)}
                  onBlur={handleBlur} onKeyDown={handleKeyDown}>
                  <option value="none">— priorité</option>
                  <option value="high">🔴 haute</option>
                  <option value="medium">🟡 moyenne</option>
                  <option value="low">🟢 basse</option>
                </select>
                {!compact && projects.length > 0 && (
                  <select className={styles.editSelect} value={editProject}
                    onChange={e => setEditProject(e.target.value)}
                    onBlur={handleBlur} onKeyDown={handleKeyDown}>
                    <option value="">— projet</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
                <div className={styles.dueDateWrapper}>
                  <span className={styles.dueDateIcon}>📅</span>
                  <input
                    type="date"
                    className={styles.editDate}
                    value={editDueDate}
                    onChange={e => setEditDueDate(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    title="Date d'échéance"
                  />
                </div>
              </div>
              {/* Row 3: notes */}
              <textarea
                className={styles.editTextarea}
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="Notes (optionnel)..."
                rows={2}
              />
              {/* Row 4: actions */}
              <div className={styles.editActions}>
                <button className={styles.editSave} onMouseDown={e => { e.preventDefault(); saveEditing() }}>✓ Sauvegarder</button>
                <button className={styles.editCancel} onMouseDown={e => { e.preventDefault(); cancelEditing() }}>Annuler</button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.title} onDoubleClick={startEditing} title="Double-clic pour modifier">
                {task.title}
              </div>
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

                {due && (
                  <span className={styles.dueBadge} style={{ color: due.color, background: `${due.color}18` }}>
                    📅 {due.label}
                  </span>
                )}

                {project && !compact && (
                  <span className={styles.projectTag} style={{ background: `${project.color}22`, color: project.color }}>
                    {project.name}
                  </span>
                )}

                {subtasks.length > 0 && (
                  <span className={styles.metaTag}>📎 {doneSubtasks}/{subtasks.length}</span>
                )}

                {task.notes && (
                  <button
                    className={`${styles.notesToggle} ${notesOpen ? styles.notesOpen : ''}`}
                    onClick={() => setNotesOpen(v => !v)}
                    title={notesOpen ? 'Masquer les notes' : 'Afficher les notes'}
                  >
                    📝
                  </button>
                )}
              </div>

              {notesOpen && task.notes && (
                <div className={styles.notesPreview}>{task.notes}</div>
              )}
            </>
          )}
        </div>

        {!editing && (
          <div className={styles.actions}>
            {!task.parent_id && (
              <button className={styles.actionBtn} onClick={() => onAddSubtask(task.id)} title="Ajouter une sous-tâche">+</button>
            )}
            <button className={styles.actionBtn} onClick={startEditing} title="Modifier">✎</button>
            <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => onDelete(task.id)} title="Supprimer">✕</button>
          </div>
        )}
      </div>

      {subtasks.map(st => (
        <div key={st.id} className={styles.subtaskWrapper}>
          <TaskCard
            task={st} subtasks={[]} project={null} projects={projects}
            onToggle={onToggle} onDelete={onDelete} onAddSubtask={() => {}}
            onUpdate={onUpdate} compact
          />
        </div>
      ))}
    </div>
  )
}
