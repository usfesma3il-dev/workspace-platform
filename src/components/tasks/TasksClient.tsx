'use client'

import { useState, useTransition } from 'react'
import { Task, TaskStatus, Profile } from '@/types'
import KanbanBoard from '@/components/tasks/KanbanBoard'
import CreateTaskModal from '@/components/tasks/CreateTaskModal'
import { Plus, CheckSquare, LayoutGrid, List } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/shared/Avatar'

interface TasksClientProps {
  tasks: (Task & { assignee?: Profile; creator?: Profile })[]
  profiles: Profile[]
  currentUser: Profile
}

export default function TasksClient({ tasks: initialTasks, profiles, currentUser }: TasksClientProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  const handleTaskUpdate = async (taskId: string, status: TaskStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    )

    const { error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId)

    if (error) {
      // Revert on error
      setTasks(initialTasks)
      console.error('Error updating task:', error)
    } else {
      startTransition(() => router.refresh())
    }
  }

  const handleTaskCreated = (newTask: Task & { assignee?: Profile }) => {
    setTasks((prev) => [...prev, newTask])
    setCreateModalOpen(false)
  }

  const todoCount = tasks.filter((t) => t.status === 'todo').length
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length
  const doneCount = tasks.filter((t) => t.status === 'done').length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-purple-400" />
          <div>
            <h1 className="text-lg font-bold text-foreground">Tasks</h1>
            <p className="text-xs text-muted-foreground">
              {todoCount} to do · {inProgressCount} in progress · {doneCount} done
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border">
            <button
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded-md transition-all ${view === 'kanban' ? 'bg-purple-500/20 text-purple-400' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-purple-500/20 text-purple-400' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Create task button */}
          <button
            id="create-task-btn"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 p-6 overflow-hidden">
        {view === 'kanban' ? (
          <KanbanBoard
            tasks={tasks}
            currentUser={currentUser}
            onTaskUpdate={handleTaskUpdate}
            onCreateTask={() => setCreateModalOpen(true)}
          />
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="glass-card p-4 flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  task.status === 'done' ? 'bg-emerald-400' :
                  task.status === 'in_progress' ? 'bg-blue-400' : 'bg-slate-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground capitalize">{task.priority}</span>
                {task.assignee && <Avatar profile={task.assignee} size="xs" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {createModalOpen && (
        <CreateTaskModal
          profiles={profiles}
          currentUser={currentUser}
          onClose={() => setCreateModalOpen(false)}
          onCreated={handleTaskCreated}
        />
      )}
    </div>
  )
}
