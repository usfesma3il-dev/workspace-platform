'use client'

import { useState } from 'react'
import { Meeting, Profile } from '@/types'
import { Video, Plus, Calendar, Clock, ExternalLink, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Avatar from '@/components/shared/Avatar'
import CreateMeetingModal from './CreateMeetingModal'
import MeetingRoom from './MeetingRoom'

interface MeetingsClientProps {
  meetings: (Meeting & { host?: Profile })[]
  currentUser: Profile
}

export default function MeetingsClient({ meetings: initialMeetings, currentUser }: MeetingsClientProps) {
  const [meetings, setMeetings] = useState(initialMeetings)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null)

  const upcomingMeetings = meetings.filter(
    (m) => m.scheduled_at && new Date(m.scheduled_at) > new Date()
  )
  const pastMeetings = meetings.filter(
    (m) => !m.scheduled_at || new Date(m.scheduled_at) <= new Date()
  )

  const handleMeetingCreated = (meeting: Meeting & { host?: Profile }) => {
    setMeetings((prev) => [meeting, ...prev])
    setCreateModalOpen(false)
  }

  if (activeMeeting) {
    return (
      <MeetingRoom
        meeting={activeMeeting}
        onLeave={() => setActiveMeeting(null)}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-amber-400" />
          <div>
            <h1 className="text-lg font-bold text-foreground">Meetings</h1>
            <p className="text-xs text-muted-foreground">
              {upcomingMeetings.length} upcoming · {pastMeetings.length} past
            </p>
          </div>
        </div>
        <button
          id="create-meeting-btn"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Upcoming */}
        {upcomingMeetings.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Upcoming Meetings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoin={() => setActiveMeeting(meeting)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Past */}
        {pastMeetings.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Recent Meetings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoin={() => setActiveMeeting(meeting)}
                  isPast
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {meetings.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 rounded-2xl gradient-brand-subtle flex items-center justify-center mb-6">
              <Video className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No meetings yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Schedule a meeting with your team or start an instant room.
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              Schedule Meeting
            </button>
          </div>
        )}
      </div>

      {/* Create Meeting Modal */}
      {createModalOpen && (
        <CreateMeetingModal
          currentUser={currentUser}
          onClose={() => setCreateModalOpen(false)}
          onCreated={handleMeetingCreated}
        />
      )}
    </div>
  )
}

function MeetingCard({
  meeting,
  onJoin,
  isPast = false,
}: {
  meeting: Meeting & { host?: Profile }
  onJoin: () => void
  isPast?: boolean
}) {
  return (
    <div className={`glass-card p-5 transition-all hover:border-white/15 ${isPast ? 'opacity-60' : ''}`}>
      {/* Status badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
          isPast
            ? 'text-muted-foreground border-border'
            : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
        }`}>
          {isPast ? 'Past' : 'Upcoming'}
        </span>
        <span className="text-xs text-muted-foreground">{meeting.duration_min} min</span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground mb-1">{meeting.title}</h3>

      {/* Time */}
      {meeting.scheduled_at && (
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(meeting.scheduled_at).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      )}

      {/* Host */}
      {meeting.host && (
        <div className="flex items-center gap-2 mb-4">
          <Avatar profile={meeting.host} size="xs" />
          <span className="text-xs text-muted-foreground">
            {meeting.host.full_name || meeting.host.username}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onJoin}
          className="flex-1 py-2 rounded-lg gradient-brand text-white text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
        >
          <Video className="w-3.5 h-3.5" />
          {isPast ? 'Rejoin' : 'Join Now'}
        </button>
        <a
          href={meeting.room_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}
