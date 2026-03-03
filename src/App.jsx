import React, { useState, useRef } from 'react'
import { useFlowDesk } from './hooks/useFlowDesk'
import TaskCard from './components/TaskCard'
import Modal, { ModalField, ModalActions } from './components/Modal'
import s from './App.module.css'

const PROJECT_COLORS = ['#7c6af7','#f76a6a','#52c97e','#f7a26a','#6ab4f7','#f76af2','#f7d16a','#6af7e8']

function useTime() {
  const [time, setTime] = useState(new Date())
  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return time
}

export default function App() {
  const { tasks, projects, loading, error, addTask, toggleTask, updateTask, deleteTask, addProject } = useFlowDesk()
  const time = useTime()

  // Quick add state
  const [quickTitle, setQuickTitle] = useState('')
  const [quickPriority, setQuickPriority] = useState('none')
  const [quickProject, setQuickProject] = useState('')

  // View state
  const [view, setView] = useState('all')         // 'all' | 'projects'
  const [navFilter, setNavFilter] = useState('all') // 'all' | 'today' | 'high' | 'done' | 'proj_<id>'
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'done'

  // Project modal
  const [projectModal, setProjectModal] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectColor, setProjectColor] = useState(PROJECT_COLORS[0])

  // Subtask modal
  const [subtaskModal, setSubtaskModal] = useState(false)
  const [subtaskParent, setSubtaskParent] = useState(null)
  const [subtaskTitle, setSubtaskTitle] = useState('')
  const [subtaskPriority, setSubtaskPriority] = useState('none')

  const quickInputRef = useRef()

  // ── HANDLERS ──
  const handleAddTask = async () => {
    if (!quickTitle.trim()) return
    await addTask({ title: quickTitle.trim(), priority: quickPriority, projectId: quickProject || null })
    setQuickTitle('')
    setQuickPriority('none')
    quickInputRef.current?.focus()
  }

  const handleSaveProject = async () => {
    if (!projectName.trim()) return
    await addProject({ name: projectName.trim(), color: projectColor })
    setProjectName('')
    setProjectModal(false)
  }

  const handleSaveSubtask = async () => {
    if (!subtaskTitle.trim()) return
    await addTask({ title: subtaskTitle.trim(), priority: subtaskPriority, parentId: subtaskParent })
    setSubtaskTitle('')
    setSubtaskPriority('none')
    setSubtaskModal(false)
  }

  const openSubtaskModal = (parentId) => {
    setSubtaskParent(parentId)
    setSubtaskModal(true)
  }

  // ── DERIVED DATA ──
  const rootTasks = tasks.filter(t => !t.parent_id)
  const subtasksOf = (id) => tasks.filter(t => t.parent_id === id)

  const activeTasks = rootTasks.filter(t => !t.done)
  const doneTasks = rootTasks.filter(t => t.done)
  const highTasks = rootTasks.filter(t => t.priority === 'high' && !t.done)
  const recentTasks = rootTasks.filter(t => !t.done && (Date.now() - new Date(t.created_at).getTime()) < 7*86400000)

  const getProjectById = (id) => projects.find(p => p.id === id)

  // Filter tasks for the all view
  let filteredTasks = rootTasks
  if (navFilter === 'high') filteredTasks = rootTasks.filter(t => t.priority === 'high')
  else if (navFilter === 'today') filteredTasks = rootTasks.filter(t => (Date.now() - new Date(t.created_at).getTime()) < 7*86400000)
  else if (navFilter === 'done') filteredTasks = rootTasks.filter(t => t.done)
  else if (navFilter.startsWith('proj_')) filteredTasks = rootTasks.filter(t => t.project_id === navFilter.replace('proj_',''))

  if (statusFilter === 'active') filteredTasks = filteredTasks.filter(t => !t.done)
  else if (statusFilter === 'done') filteredTasks = filteredTasks.filter(t => t.done)

  const activeFiltered = filteredTasks.filter(t => !t.done)
  const doneFiltered = filteredTasks.filter(t => t.done)

  const timeStr = time.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
    + ' · ' + time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  // ── RENDER HELPERS ──
  const renderNavItem = (id, emoji, label, badge, subId) => (
    <div
      className={`${s.navItem} ${navFilter === id ? s.navActive : ''}`}
      onClick={() => { setNavFilter(id); if (subId) {} }}
    >
      <div className={s.navLeft}>
        <span>{emoji}</span>
        <span className={s.navLabel}>{label}</span>
      </div>
      <span className={s.navBadge}>{badge}</span>
    </div>
  )

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text-dim)', fontFamily:'DM Mono,monospace', fontSize:'13px' }}>
      chargement...
    </div>
  )

  if (error) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--red)', fontFamily:'DM Mono,monospace', fontSize:'13px', flexDirection:'column', gap:'8px' }}>
      <div>erreur de connexion Supabase</div>
      <div style={{color:'var(--text-dim)', fontSize:'11px'}}>{error.message}</div>
    </div>
  )

  return (
    <>
      {/* HEADER */}
      <header className={s.header}>
        <div className={s.logo}>
          <div className={s.logoDot} />
          FlowDesk
        </div>
        <div className={s.headerTabs}>
          <button className={`${s.tabBtn} ${view === 'all' ? s.tabActive : ''}`} onClick={() => setView('all')}>Toutes les tâches</button>
          <button className={`${s.tabBtn} ${view === 'projects' ? s.tabActive : ''}`} onClick={() => setView('projects')}>Par projet</button>
        </div>
        <div className={s.clock}>{timeStr}</div>
      </header>

      {/* QUICK ADD */}
      <div className={s.quickAdd}>
        <div className={s.quickBar}>
          <span className={s.quickPlus}>+</span>
          <input
            ref={quickInputRef}
            className={s.quickInput}
            value={quickTitle}
            onChange={e => setQuickTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            placeholder="Nouvelle tâche... (Entrée pour ajouter)"
          />
          <div className={s.quickControls}>
            <select className={s.qaSelect} value={quickPriority} onChange={e => setQuickPriority(e.target.value)}>
              <option value="none">— priorité</option>
              <option value="high">🔴 haute</option>
              <option value="medium">🟡 moyenne</option>
              <option value="low">🟢 basse</option>
            </select>
            <select className={s.qaSelect} value={quickProject} onChange={e => setQuickProject(e.target.value)}>
              <option value="">— projet</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className={s.sep} />
            <button className={s.btnAdd} onClick={handleAddTask}>Ajouter</button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className={s.statsBar}>
        <div className={s.stat}><strong>{activeTasks.length}</strong> tâches actives</div>
        <div className={s.stat}><strong>{doneTasks.length}</strong> complétées</div>
        <div className={s.stat}><strong>{highTasks.length}</strong> haute priorité</div>
        <div className={s.stat}><strong>{projects.length}</strong> projets</div>
      </div>

      {/* MAIN */}
      <div className={s.main}>
        {/* SIDEBAR */}
        <aside className={s.sidebar}>
          <div className={s.sideSection}>Navigation</div>
          {renderNavItem('all', '📋', 'Toutes', activeTasks.length)}
          {renderNavItem('today', '☀️', 'Récentes (7j)', recentTasks.length)}
          {renderNavItem('high', '🔴', 'Haute priorité', highTasks.length)}
          {renderNavItem('done', '✅', 'Complétées', doneTasks.length)}

          <div className={s.sideSection}>Projets</div>
          {projects.map(p => {
            const count = rootTasks.filter(t => t.project_id === p.id && !t.done).length
            return (
              <div
                key={p.id}
                className={`${s.navItem} ${navFilter === 'proj_'+p.id ? s.navActive : ''}`}
                onClick={() => setNavFilter('proj_'+p.id)}
              >
                <div className={s.navLeft}>
                  <div className={s.projectDot} style={{ background: p.color }} />
                  <span className={s.navLabel}>{p.name}</span>
                </div>
                <span className={s.navBadge}>{count}</span>
              </div>
            )
          })}

          <button className={s.btnNewProject} onClick={() => setProjectModal(true)}>
            <span style={{ fontSize: 16 }}>+</span> Nouveau projet
          </button>
        </aside>

        {/* CONTENT */}
        <main className={s.content}>
          <div className={s.contentHeader}>
            <div>
              <div className={s.contentTitle}>
                {navFilter === 'all' ? 'Toutes les tâches'
                  : navFilter === 'today' ? 'Récentes (7 derniers jours)'
                  : navFilter === 'high' ? 'Haute priorité'
                  : navFilter === 'done' ? 'Tâches complétées'
                  : navFilter.startsWith('proj_') ? projects.find(p => p.id === navFilter.replace('proj_',''))?.name || 'Projet'
                  : 'Toutes les tâches'}
              </div>
            </div>
            <div className={s.filterBar}>
              {['all','active','done'].map(f => (
                <div
                  key={f}
                  className={`${s.filterPill} ${statusFilter === f ? s.filterActive : ''}`}
                  onClick={() => setStatusFilter(f)}
                >
                  {f === 'all' ? 'Toutes' : f === 'active' ? 'Actives' : 'Faites'}
                </div>
              ))}
            </div>
          </div>

          {view === 'all' ? (
            <>
              {activeFiltered.length === 0 && doneFiltered.length === 0 && (
                <div className={s.empty}>
                  <div className={s.emptyIcon}>✨</div>
                  <div>Aucune tâche ici — tu es libre !</div>
                </div>
              )}

              {activeFiltered.length > 0 && (
                <div className={s.taskGroup}>
                  <div className={s.groupHeader}>
                    <span className={s.groupTitle}>⚡ En cours</span>
                    <span className={s.groupCount}>{activeFiltered.length}</span>
                  </div>
                  {activeFiltered.map(t => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      subtasks={subtasksOf(t.id)}
                      project={getProjectById(t.project_id)}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                      onAddSubtask={openSubtaskModal}
                      onUpdate={updateTask}
                    />
                  ))}
                </div>
              )}

              {doneFiltered.length > 0 && statusFilter !== 'active' && (
                <div className={s.taskGroup}>
                  <div className={s.groupHeader}>
                    <span className={s.groupTitle}>✅ Complétées</span>
                    <span className={s.groupCount}>{doneFiltered.length}</span>
                  </div>
                  {doneFiltered.map(t => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      subtasks={subtasksOf(t.id)}
                      project={getProjectById(t.project_id)}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                      onAddSubtask={openSubtaskModal}
                      onUpdate={updateTask}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* PROJECT BOARD VIEW */
            <div className={s.board}>
              {(() => {
                const noProj = rootTasks.filter(t => !t.project_id && !t.done)
                const cols = [
                  ...(noProj.length > 0 ? [{ project: { id: '', name: 'Sans projet', color: '#4a4a5c' }, tasks: noProj }] : []),
                  ...projects.map(p => ({
                    project: p,
                    tasks: rootTasks.filter(t => t.project_id === p.id && !t.done),
                  }))
                ]
                return cols.map(({ project, tasks: colTasks }) => (
                  <div key={project.id} className={s.col}>
                    <div className={s.colHeader}>
                      <div className={s.colTitle}>
                        <div className={s.projectDot} style={{ background: project.color }} />
                        {project.name}
                      </div>
                      <span className={s.colMeta}>{colTasks.length} active{colTasks.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className={s.colBody}>
                      {colTasks.length === 0
                        ? <div className={s.colEmpty}>Aucune tâche active</div>
                        : colTasks.map(t => (
                          <TaskCard
                            key={t.id}
                            task={t}
                            subtasks={subtasksOf(t.id)}
                            project={null}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            onAddSubtask={openSubtaskModal}
                            onUpdate={updateTask}
                            compact
                          />
                        ))
                      }
                    </div>
                  </div>
                ))
              })()}
            </div>
          )}
        </main>
      </div>

      {/* PROJECT MODAL */}
      <Modal open={projectModal} onClose={() => setProjectModal(false)} title="Nouveau projet">
        <ModalField label="Nom du projet">
          <input
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveProject()}
            placeholder="Ex: Refonte site web"
            autoFocus
          />
        </ModalField>
        <ModalField label="Couleur">
          <div style={{ display:'flex', gap:8, paddingTop:2 }}>
            {PROJECT_COLORS.map(c => (
              <div
                key={c}
                onClick={() => setProjectColor(c)}
                style={{
                  width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer',
                  border: `2px solid ${projectColor === c ? 'white' : 'transparent'}`,
                  transform: projectColor === c ? 'scale(1.15)' : 'scale(1)',
                  transition:'all 0.12s',
                }}
              />
            ))}
          </div>
        </ModalField>
        <ModalActions onCancel={() => setProjectModal(false)} onConfirm={handleSaveProject} confirmLabel="Créer" />
      </Modal>

      {/* SUBTASK MODAL */}
      <Modal open={subtaskModal} onClose={() => setSubtaskModal(false)} title="Ajouter une sous-tâche">
        <ModalField label="Titre">
          <input
            value={subtaskTitle}
            onChange={e => setSubtaskTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveSubtask()}
            placeholder="Décris la sous-tâche..."
            autoFocus
          />
        </ModalField>
        <ModalField label="Priorité">
          <select value={subtaskPriority} onChange={e => setSubtaskPriority(e.target.value)}>
            <option value="none">Aucune</option>
            <option value="high">🔴 Haute</option>
            <option value="medium">🟡 Moyenne</option>
            <option value="low">🟢 Basse</option>
          </select>
        </ModalField>
        <ModalActions onCancel={() => setSubtaskModal(false)} onConfirm={handleSaveSubtask} confirmLabel="Ajouter" />
      </Modal>
    </>
  )
}
