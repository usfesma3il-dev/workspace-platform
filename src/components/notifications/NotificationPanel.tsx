'use client'

import { Bell, Check, MessageSquare, CheckSquare, Video, FileText, AtSign } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { NotificationType } from '@/types'
import { useEffect, useRef } from 'react'

import { NotificationItem } from '@/hooks/useNotifications'
import { useRouter } from 'next/navigation'
import { NotificationType } from '@/types'
import { Bell, Check, MessageSquare, CheckSquare, Video, FileText, AtSign } from 'lucide-react'

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  const icons: Record<NotificationType, React.ReactNode> = {
    message: <MessageSquare className="w-4 h-4 text-blue-400" />,
    task_assigned: <CheckSquare className="w-4 h-4 text-purple-400" />,
    task_comment: <CheckSquare className="w-4 h-4 text-purple-400" />,
    task_status: <CheckSquare className="w-4 h-4 text-emerald-400" />,
    meeting_invite: <Video className="w-4 h-4 text-amber-400" />,
    mention: <AtSign className="w-4 h-4 text-pink-400" />,
    file_shared: <FileText className="w-4 h-4 text-cyan-400" />,
  }
  return <>{icons[type]}</>
}

interface NotificationPanelProps {
  notifications: NotificationItem[]
  unreadCount: number
  onClose: () => void
  onMarkAsRead: (id: string) => Promise<void>
  onMarkAllAsRead: () => Promise<void>
}

export default function NotificationPanel({ 
  notifications, 
  unreadCount, 
  onClose, 
  onMarkAsRead, 
  onMarkAllAsRead 
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      await onMarkAsRead(notif.id)
    }
    if (notif.link) {
      router.push(notif.link)
    }
    onClose()
  }

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 glass-card z-50 animate-scale-in shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full gradient-brand text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
            onClick={onMarkAllAsRead}
          >
            <Check className="w-3 h-3" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <button
              key={notif.id}
              className={`w-full flex items-start gap-3 p-4 hover:bg-white/5 transition-colors border-b border-border/50 last:border-0 text-left ${
                !notif.read ? 'bg-purple-500/5' : ''
              }`}
              onClick={() => handleNotificationClick(notif)}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                !notif.read ? 'bg-purple-500/20' : 'bg-muted/50'
              }`}>
                <NotificationIcon type={notif.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${notif.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {notif.title}
                </p>
                {notif.body && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{notif.body}</p>
                )}
                <p className="text-[11px] text-muted-foreground mt-1">{formatDate(notif.created_at)}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full gradient-brand shrink-0 mt-1" />
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <button className="w-full text-center text-xs text-purple-400 hover:text-purple-300 transition-colors py-1">
          View all notifications
        </button>
      </div>
    </div>
  )
}
