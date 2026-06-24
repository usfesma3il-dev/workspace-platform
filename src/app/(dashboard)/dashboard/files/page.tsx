import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FilesClient from '@/components/files/FilesClient'

export default async function FilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [filesResult, profileResult] = await Promise.all([
    supabase
      .from('files')
      .select(`*, uploader:profiles(*)`)
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ])

  return (
    <div className="h-full">
      <FilesClient
        files={filesResult.data ?? []}
        currentUser={profileResult.data!}
      />
    </div>
  )
}
