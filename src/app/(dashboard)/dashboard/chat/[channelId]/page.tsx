import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatWindow from '@/components/chat/ChatWindow'

export default async function ChannelChatPage({
  params,
}: {
  params: Promise<{ channelId: string }>
}) {
  const { channelId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [profileResult, channelResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('channels').select('*').eq('id', channelId).single(),
  ])

  if (!channelResult.data) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Channel not found
      </div>
    )
  }

  return (
    <div className="h-full">
      <ChatWindow
        channelId={channelId}
        channelName={channelResult.data.name}
        currentUser={profileResult.data!}
      />
    </div>
  )
}
