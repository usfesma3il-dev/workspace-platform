'use client'

import { useState } from 'react'
import { Task, TaskStatus, Profile } from '@/types'
import { cn, PRIORITY_COLORS, STATUS_COLORS, formatDate } from '@/lib/utils'
import { Calendar, User, Flag, MoreVertical, Plus, CheckSquare } from 'lucide-react'
import Avatar from '@/components/shared/Avatar'

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'text-slate-400' },
  { id: 'in_progress', label: 'In Progress', color: 'text-blue-400' },
  { id: 'done', label: 'Done', color: 'text-emerald-400' },
]

interface KanbanBoardProps {
  tasks: (Task & { assignee?: Profile; creator?: Profile })[]
  currentUser: Profile
  onTaskUpdate: (taskId: string, status: TaskStatus) => void
  onCreateTask: () => void
}

function TaskCard({ task }: { task: Task & { assignee?: Profile } }) {
  const priorityClass = PRIORITY_COLORS[task.priority]
  const isPastDue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done'

  return (
    <div className="glass-card p-4 cursor-pointer hover:border-white/15 transition-all group animate-slide-up">
      {/* Priority badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize', priorityClass)}>
          {task.priority}
        </span>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">
          <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-foreground mb-2 line-clamp-2">{task.title}</h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        {/* Deadline */}
        <div className={cn('flex items-center gap-1 text-[11px]', isPastDue ? 'text-red-400' : 'text-muted-foreground')}>
          <Calendar className="w-3 h-3" />
          {task.deadline ? formatDate(task.deadline) : 'No deadline'}
        </div>

        {/* Assignee */}
        {task.assignee ? (
          <Avatar profile={task.assignee} size="xs" />
        ) : (
          <div className="w-6 h-6 rounded-full border border-dashed border-border flex items-center justify-center">
            <User className="w-3 h-3 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  )
}

export default function KanbanBoard({ tasks, onCreateTask, onTaskUpdate }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)

  const getColumnTasks = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status)

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId)
  }

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    setDragOverColumn(status)
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    if (draggedTask) {
      onTaskUpdate(draggedTask, status)
    }
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {COLUMNS.map((column) => {
        const columnTasks = getColumnTasks(column.id)
        const isDragOver = dragOverColumn === column.id

        return (
          <div
            key={column.id}
            className={cn(
              'flex flex-col w-72 shrink-0 rounded-xl p-3 transition-all',
              isDragOver ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-muted/20'
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
            onDragLeave={() => setDragOverColumn(null)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', {
                  'bg-slate-400': column.id === 'todo',
                  'bg-blue-400': column.id === 'in_progress',
                  'bg-emerald-400': column.id === 'done',
                })} />
                <h3 className={cn('text-sm font-semibold', column.color)}>{column.label}</h3>
                <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded-full border border-border">
                  {columnTasks.length}
                </span>
              </div>
              {column.id === 'todo' && (
                <button
                  onClick={onCreateTask}
                  className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tasks */}
            <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
              {columnTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckSquare className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">No tasks here</p>
                  {column.id === 'todo' && (
                    <button
                      onClick={onCreateTask}
                      className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      + Add task
                    </button>
                  )}
                </div>
              )}
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  className={cn('transition-opacity', draggedTask === task.id && 'opacity-50')}
                >
                  <TaskCard task={task} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
