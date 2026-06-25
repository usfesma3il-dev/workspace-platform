'use client'

import { useState } from 'react'
import { Bell, Search, LogOut, Settings, Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import Avatar from '@/components/shared/Avatar'
import NotificationPanel from '@/components/notifications/NotificationPanel'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/hooks/useNotifications'
import { useNotifications } from '@/hooks/useNotifications'

interface HeaderProps {
  profile: Profile | null
  onMenuClick?: () => void
}

export default function Header({ profile, onMenuClick }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(profile?.id)

  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur-sm shrink-0 z-20 gap-4">
      {/* Mobile Menu Button */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="global-search"
            type="text"
            placeholder="Search messages, files, tasks..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-bell"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={cn(
              'relative w-9 h-9 rounded-lg flex items-center justify-center transition-all',
              notificationsOpen
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            )}
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full gradient-brand text-white text-[10px] font-bold flex items-center justify-center animate-fade-in">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <NotificationPanel 
              notifications={notifications}
              unreadCount={unreadCount}
              onClose={() => setNotificationsOpen(false)} 
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
            />
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            id="user-menu-button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            {profile && <Avatar profile={profile} size="sm" />}
            <span className="text-sm font-medium text-foreground hidden sm:block">
              {profile?.full_name?.split(' ')[0] || profile?.username}
            </span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 glass-card py-1 z-50 animate-scale-in shadow-xl">
              <button
                onClick={() => { router.push('/dashboard/profile'); setUserMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Profile Settings
              </button>
              <div className="h-px bg-border my-1" />
              <button
                onClick={handleLogout}
                id="logout-button"
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
