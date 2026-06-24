import { MessageSquare, Hash, Plus } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: channels } = await supabase
    .from('channels')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)

  const defaultChannelId = channels?.[0]?.id

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl gradient-brand-subtle flex items-center justify-center mb-6">
        <MessageSquare className="w-10 h-10 text-purple-400" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Welcome to Chat</h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">
        Select a channel from the sidebar to start messaging your team in real-time.
      </p>
      
      {defaultChannelId && (
        <div className="flex gap-3">
          <Link
            href={`/dashboard/chat/${defaultChannelId}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          >
            <Hash className="w-4 h-4" />
            #general
          </Link>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" />
            New Channel
          </button>
        </div>
      )}
    </div>
  )
}
