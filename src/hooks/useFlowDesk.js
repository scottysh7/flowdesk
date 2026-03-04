import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useFlowDesk() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [{ data: tasksData, error: tasksErr }, { data: projectsData, error: projectsErr }] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: true }),
    ])
    if (tasksErr || projectsErr) setError(tasksErr || projectsErr)
    else {
      setTasks(tasksData || [])
      setProjects(projectsData || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── TASKS ──
  const addTask = async ({ title, priority = 'none', projectId = null, parentId = null, dueDate = null, notes = null }) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title, priority, project_id: projectId || null, parent_id: parentId || null, done: false, due_date: dueDate || null, notes: notes || null }])
      .select().single()
    if (error) { setError(error); return }
    setTasks(prev => [data, ...prev])
  }

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const { data, error } = await supabase
      .from('tasks').update({ done: !task.done }).eq('id', id).select().single()
    if (error) { setError(error); return }
    setTasks(prev => prev.map(t => t.id === id ? data : t))
  }

  const updateTask = async (id, updates) => {
    const { data, error } = await supabase
      .from('tasks').update(updates).eq('id', id).select().single()
    if (error) { setError(error); return }
    setTasks(prev => prev.map(t => t.id === id ? data : t))
  }

  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('parent_id', id)
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) { setError(error); return }
    setTasks(prev => prev.filter(t => t.id !== id && t.parent_id !== id))
  }

  // Archive = marquer done toutes les tâches complétées + leurs sous-tâches comme archived
  // On utilise un champ booléen "archived" — s'assurer que la colonne existe (migration SQL)
  const archiveDone = async () => {
    const doneIds = tasks.filter(t => t.done && !t.parent_id).map(t => t.id)
    if (doneIds.length === 0) return
    // Archive subtasks of done tasks first
    await supabase.from('tasks').update({ archived: true }).in('parent_id', doneIds)
    await supabase.from('tasks').update({ archived: true }).in('id', doneIds)
    setTasks(prev => prev.map(t =>
      (doneIds.includes(t.id) || doneIds.includes(t.parent_id)) ? { ...t, archived: true } : t
    ))
  }

  // ── PROJECTS ──
  const addProject = async ({ name, color }) => {
    const { data, error } = await supabase.from('projects').insert([{ name, color }]).select().single()
    if (error) { setError(error); return }
    setProjects(prev => [...prev, data])
  }

  const deleteProject = async (id) => {
    await supabase.from('tasks').update({ project_id: null }).eq('project_id', id)
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) { setError(error); return }
    setProjects(prev => prev.filter(p => p.id !== id))
    setTasks(prev => prev.map(t => t.project_id === id ? { ...t, project_id: null } : t))
  }

  return {
    tasks, projects, loading, error,
    addTask, toggleTask, updateTask, deleteTask, archiveDone,
    addProject, deleteProject,
    refetch: fetchAll,
  }
}
