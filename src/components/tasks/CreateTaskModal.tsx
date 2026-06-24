'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Task, Profile, TaskPriority } from '@/types'
import { X, Loader2, Calendar, User, Flag } from 'lucide-react'
import Avatar from '@/components/shared/Avatar'

interface CreateTaskModalProps {
  profiles: Profile[]
  currentUser: Profile
  onClose: () => void
  onCreated: (task: Task & { assignee?: Profile }) => void
}

export default function CreateTaskModal({
  profiles,
  currentUser,
  onClose,
  onCreated,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [assigneeId, setAssigneeId] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: 'text-emerald-400' },
    { value: 'medium', label: 'Medium', color: 'text-amber-400' },
    { value: 'high', label: 'High', color: 'text-orange-400' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
  ]

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        assignee_id: assigneeId || null,
        creator_id: currentUser.id,
        deadline: deadline || null,
        status: 'todo',
      })
      .select(`*, assignee:profiles!tasks_assignee_id_fkey(*)`)
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onCreated(data as Task & { assignee?: Profile })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-lg shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Create New Task</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Task Title *</label>
            <input
              type="text"
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
            />
          </div>

          {/* Priority + Assignee + Deadline row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Priority */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Flag className="w-3 h-3" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              >
                <option value="">Unassigned</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name || p.username}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              id="submit-task"
              className="flex-1 py-2.5 rounded-lg gradient-brand text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
