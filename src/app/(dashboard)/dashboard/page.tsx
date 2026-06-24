import { createClient } from '@/lib/supabase/server'
import {
  MessageSquare,
  FolderOpen,
  CheckSquare,
  Video,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Get counts
  const [tasksResult, meetingsResult, membersResult] = await Promise.all([
    supabase.from('tasks').select('id, status', { count: 'exact' }),
    supabase.from('meetings').select('id', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }),
  ])

  const stats = [
    {
      label: 'Team Members',
      value: membersResult.count ?? 0,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      href: '/dashboard/profile',
    },
    {
      label: 'Active Tasks',
      value: tasksResult.data?.filter((t) => t.status !== 'done').length ?? 0,
      icon: CheckSquare,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      href: '/dashboard/tasks',
    },
    {
      label: 'Meetings',
      value: meetingsResult.count ?? 0,
      icon: Video,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      href: '/dashboard/meetings',
    },
    {
      label: 'Tasks Done',
      value: tasksResult.data?.filter((t) => t.status === 'done').length ?? 0,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      href: '/dashboard/tasks',
    },
  ]

  const quickActions = [
    { href: '/dashboard/chat', icon: MessageSquare, label: 'Open Chat', description: 'Send a message to your team', color: 'from-blue-500 to-cyan-500' },
    { href: '/dashboard/files', icon: FolderOpen, label: 'Upload Files', description: 'Share documents and media', color: 'from-purple-500 to-violet-500' },
    { href: '/dashboard/tasks', icon: CheckSquare, label: 'Manage Tasks', description: 'View your Kanban board', color: 'from-emerald-500 to-teal-500' },
    { href: '/dashboard/meetings', icon: Video, label: 'Start Meeting', description: 'Create or join a room', color: 'from-amber-500 to-orange-500' },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {greeting}, {profile?.full_name?.split(' ')[0] || profile?.username} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Here&apos;s what&apos;s happening in your workspace today
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="glass-card p-5 hover:border-white/15 transition-all group cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className={`h-0.5 rounded-full ${stat.bg} mt-4 group-hover:bg-opacity-50 transition-all`} style={{ width: `${Math.min((stat.value / 10) * 100, 100)}%` }} />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="glass-card p-4 hover:border-white/15 transition-all group cursor-pointer">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{action.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">{action.description}</p>
                <div className="flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  Open
                  <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
