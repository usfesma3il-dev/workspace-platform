'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Meeting, Profile } from '@/types'
import { X, Loader2, Calendar, Clock, Video } from 'lucide-react'

interface CreateMeetingModalProps {
  currentUser: Profile
  onClose: () => void
  onCreated: (meeting: Meeting & { host?: Profile }) => void
}

export default function CreateMeetingModal({
  currentUser,
  onClose,
  onCreated,
}: CreateMeetingModalProps) {
  const [title, setTitle] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const createWherebyRoom = async (roomName: string) => {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 365)

    const response = await fetch('/api/meetings/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName,
        endDate: endDate.toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create meeting room')
    }

    return response.json()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    setError(null)

    try {
      // Create Whereby room
      const roomSlug = title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
      const { roomUrl, roomName } = await createWherebyRoom(roomSlug)

      const scheduledDateTime =
        scheduledAt && scheduledTime
          ? new Date(`${scheduledAt}T${scheduledTime}`).toISOString()
          : null

      const { data, error: dbError } = await supabase
        .from('meetings')
        .insert({
          title: title.trim(),
          room_url: roomUrl,
          room_name: roomName,
          host_id: currentUser.id,
          scheduled_at: scheduledDateTime,
          duration_min: duration,
        })
        .select(`*, host:profiles(*)`)
        .single()

      if (dbError) throw new Error(dbError.message)

      onCreated(data as Meeting & { host?: Profile })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create meeting')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-foreground">Schedule Meeting</h2>
          </div>
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
            <label className="text-sm font-medium text-foreground">Meeting Title *</label>
            <input
              type="text"
              id="meeting-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly Team Sync"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Date
              </label>
              <input
                type="date"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
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
              id="submit-meeting"
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating room...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  Create Meeting
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
