import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useFlowDesk() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── FETCH ──
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
  const addTask = async ({ title, priority = 'none', projectId = null, parentId = null }) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title, priority, project_id: projectId || null, parent_id: parentId || null, done: false }])
      .select()
      .single()
    if (error) { setError(error); return }
    setTasks(prev => [data, ...prev])
  }

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const { data, error } = await supabase
      .from('tasks')
      .update({ done: !task.done })
      .eq('id', id)
      .select()
      .single()
    if (error) { setError(error); return }
    setTasks(prev => prev.map(t => t.id === id ? data : t))
  }

  const updateTask = async (id, updates) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) { setError(error); return }
    setTasks(prev => prev.map(t => t.id === id ? data : t))
  }

  const deleteTask = async (id) => {
    // Also delete subtasks
    await supabase.from('tasks').delete().eq('parent_id', id)
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) { setError(error); return }
    setTasks(prev => prev.filter(t => t.id !== id && t.parent_id !== id))
  }

  // ── PROJECTS ──
  const addProject = async ({ name, color }) => {
    const { data, error } = await supabase
      .from('projects')
      .insert([{ name, color }])
      .select()
      .single()
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
    addTask, toggleTask, updateTask, deleteTask,
    addProject, deleteProject,
    refetch: fetchAll,
  }
}
