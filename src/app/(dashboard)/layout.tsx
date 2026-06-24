import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from '@/components/layout/DashboardLayoutClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch channels
  let { data: channels } = await supabase
    .from('channels')
    .select('*')
    .order('created_at', { ascending: true })

  // Seed default channel if none exist
  if (!channels || channels.length === 0) {
    const { data: newChannel } = await supabase
      .from('channels')
      .insert({ name: 'general', is_private: false })
      .select()
      .single()
    
    if (newChannel) {
      channels = [newChannel]
    } else {
      channels = []
    }
  }

  return (
    <DashboardLayoutClient profile={profile} channels={channels}>
      {children}
    </DashboardLayoutClient>
  )
}
