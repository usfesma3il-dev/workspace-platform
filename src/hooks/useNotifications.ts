'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { NotificationType } from '@/types'

export interface NotificationItem {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) {
        setNotifications(data as NotificationItem[])
      }
      setLoading(false)
    }

    fetchNotifications()

    // Realtime subscription
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Simplest way to handle all changes is to refetch
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )
    await supabase.from('notifications').update({ read: true }).eq('id', notificationId)
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead }
}
