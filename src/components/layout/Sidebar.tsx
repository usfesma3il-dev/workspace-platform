'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquare,
  FolderOpen,
  CheckSquare,
  Video,
  LayoutDashboard,
  Zap,
  ChevronDown,
  Plus,
  Hash,
  Lock,
} from 'lucide-react'
import { Profile, Channel } from '@/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import Avatar from '@/components/shared/Avatar'
import StatusBadge from '@/components/shared/StatusBadge'

interface SidebarProps {
  profile: Profile | null
  channels: Channel[]
}

const mainNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/dashboard/files', icon: FolderOpen, label: 'Files' },
  { href: '/dashboard/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/dashboard/meetings', icon: Video, label: 'Meetings' },
]

export default function Sidebar({ profile, channels }: SidebarProps) {
  const pathname = usePathname()
  const [channelsOpen, setChannelsOpen] = useState(true)

  return (
    <aside className="w-64 flex flex-col border-r border-sidebar-border h-full shrink-0"
      style={{ background: 'hsl(var(--sidebar-bg))' }}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center glow-purple group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">WorkSpace</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {/* Main nav */}
        <div className="space-y-0.5">
          {mainNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                )}
              >
                <item.icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-purple-400' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-sidebar-border my-3" />

        {/* Channels */}
        <div>
          <div className="w-full flex items-center justify-between px-3 py-1.5 group">
            <button
              onClick={() => setChannelsOpen(!channelsOpen)}
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors flex-1 text-left"
            >
              <ChevronDown
                className={cn('w-3 h-3 transition-transform', !channelsOpen && '-rotate-90')}
              />
              Channels
            </button>
            <button
              className="w-4 h-4 rounded hover:bg-white/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Open create channel modal
              }}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {channelsOpen && (
            <div className="mt-1 space-y-0.5 animate-fade-in">
              {channels.map((channel) => {
                const isActive = pathname === `/dashboard/chat/${channel.id}`
                return (
                  <Link
                    key={channel.id}
                    href={`/dashboard/chat/${channel.id}`}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all',
                      isActive
                        ? 'bg-purple-600/20 text-purple-300'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    )}
                  >
                    {channel.is_private ? (
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Hash className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="truncate">{channel.name}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      {/* User Profile Footer */}
      {profile && (
        <div className="border-t border-sidebar-border p-3 shrink-0">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <div className="relative shrink-0">
              <Avatar profile={profile} size="sm" />
              <StatusBadge status={profile.status} className="absolute -bottom-0.5 -right-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile.full_name || profile.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
            </div>
            <span className="text-xs text-muted-foreground uppercase px-1.5 py-0.5 rounded border border-border">
              {profile.role}
            </span>
          </Link>
        </div>
      )}
    </aside>
  )
}
