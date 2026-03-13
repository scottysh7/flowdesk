import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { computeNextOccurrence } from '../lib/recurrence'

export function useFlowDesk(user) {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    if (!user) { setTasks([]); setProjects([]); setLoading(false); return }
    setLoading(true)
    const [{ data: tasksData, error: tasksErr }, { data: projectsData, error: projectsErr }] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: true }),
    ])
    if (tasksErr || projectsErr) setError(tasksErr || projectsErr)
    else { setTasks(tasksData || []); setProjects(projectsData || []) }
    setLoading(false)
  }, [user])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── TASKS ──
  const addTask = async ({ title, priority = 'none', projectId = null, parentId = null,
    dueDate = null, notes = null, recurrenceType = 'none', recurrenceValue = null, recurrenceEnd = null }) => {

    const isRecurring = recurrenceType && recurrenceType !== 'none'
    const nextOcc = isRecurring ? computeNextOccurrence(recurrenceType, recurrenceValue) : null

    const payload = {
      title, priority,
      project_id: projectId || null,
      parent_id: parentId || null,
      done: false,
      due_date: dueDate || null,
      notes: notes || null,
      user_id: user.id,
      recurrence_type: recurrenceType || 'none',
      recurrence_value: recurrenceValue || null,
      recurrence_end: recurrenceEnd || null,
      next_occurrence: nextOcc,
      is_template: isRecurring,
    }

    const { data, error } = await supabase.from('tasks').insert([payload]).select().single()
    if (error) { setError(error); return }

    // If recurring, also create the first instance immediately (due today or next_occurrence)
    if (isRecurring) {
      const instancePayload = {
        ...payload,
        is_template: false,
        template_id: data.id,
        due_date: dueDate || new Date().toISOString().split('T')[0],
        next_occurrence: null,
      }
      const { data: instance } = await supabase.from('tasks').insert([instancePayload]).select().single()
      setTasks(prev => [instance, data, ...prev])
    } else {
      setTasks(prev => [data, ...prev])
    }
  }

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const updates = { done: !task.done }
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single()
    if (error) { setError(error); return }

    let newTasks = tasks.map(t => t.id === id ? data : t)

    // If completing a recurring instance → spawn next instance
    if (!task.done && task.template_id) {
      const template = tasks.find(t => t.id === task.template_id)
      if (template) {
        const nextDate = computeNextOccurrence(template.recurrence_type, template.recurrence_value, new Date())
        // Check recurrence_end
        const ended = template.recurrence_end && nextDate > template.recurrence_end
        if (!ended) {
          const instancePayload = {
            title: template.title,
            priority: template.priority,
            project_id: template.project_id,
            parent_id: null,
            done: false,
            due_date: nextDate,
            notes: template.notes,
            user_id: user.id,
            recurrence_type: template.recurrence_type,
            recurrence_value: template.recurrence_value,
            recurrence_end: template.recurrence_end,
            next_occurrence: null,
            is_template: false,
            template_id: template.id,
            archived: false,
          }
          const { data: newInstance } = await supabase.from('tasks').insert([instancePayload]).select().single()
          if (newInstance) newTasks = [newInstance, ...newTasks]
        }
      }
    }

    setTasks(newTasks)
  }

  const updateTask = async (id, updates) => {
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single()
    if (error) { setError(error); return }
    setTasks(prev => prev.map(t => t.id === id ? data : t))
  }

  const deleteTask = async (id) => {
    const task = tasks.find(t => t.id === id)
    // If deleting a template, also delete all its instances
    if (task?.is_template) {
      await supabase.from('tasks').delete().eq('template_id', id)
    }
    await supabase.from('tasks').delete().eq('parent_id', id)
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) { setError(error); return }
    setTasks(prev => prev.filter(t => t.id !== id && t.parent_id !== id && t.template_id !== id))
  }

  const archiveDone = async () => {
    const doneIds = tasks.filter(t => t.done && !t.parent_id && !t.is_template).map(t => t.id)
    if (doneIds.length === 0) return
    await supabase.from('tasks').update({ archived: true }).in('parent_id', doneIds)
    await supabase.from('tasks').update({ archived: true }).in('id', doneIds)
    setTasks(prev => prev.map(t =>
      (doneIds.includes(t.id) || doneIds.includes(t.parent_id)) ? { ...t, archived: true } : t
    ))
  }

  // ── PROJECTS ──
  const addProject = async ({ name, color }) => {
    const { data, error } = await supabase.from('projects').insert([{ name, color, user_id: user.id }]).select().single()
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
