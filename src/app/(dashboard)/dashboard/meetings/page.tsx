import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MeetingsClient from '@/components/meetings/MeetingsClient'

export default async function MeetingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [meetingsResult, profileResult] = await Promise.all([
    supabase
      .from('meetings')
      .select(`*, host:profiles(*)`)
      .order('scheduled_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ])

  return (
    <div className="h-full">
      <MeetingsClient
        meetings={meetingsResult.data ?? []}
        currentUser={profileResult.data!}
      />
    </div>
  )
}
