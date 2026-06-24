'use client'

import { Meeting } from '@/types'
import { X, Video } from 'lucide-react'

interface MeetingRoomProps {
  meeting: Meeting
  onLeave: () => void
}

export default function MeetingRoom({ meeting, onLeave }: MeetingRoomProps) {
  return (
    <div className="relative h-full bg-black animate-fade-in">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-white">{meeting.title}</h2>
        </div>
        <button
          onClick={onLeave}
          id="leave-meeting-btn"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors text-xs font-medium"
        >
          <X className="w-3.5 h-3.5" />
          Leave Meeting
        </button>
      </div>

      {/* Whereby Embedded Room */}
      <iframe
        src={`${meeting.room_url}?background=off&minimal=on`}
        allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
        className="w-full h-full border-0"
        title={meeting.title}
      />
    </div>
  )
}
