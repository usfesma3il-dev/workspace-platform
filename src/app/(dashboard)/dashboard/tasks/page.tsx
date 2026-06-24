import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TasksClient from '@/components/tasks/TasksClient'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [tasksResult, profilesResult, currentProfileResult] = await Promise.all([
    supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(*),
        creator:profiles!tasks_creator_id_fkey(*)
      `)
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('full_name'),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ])

  return (
    <div className="h-full">
      <TasksClient
        tasks={tasksResult.data ?? []}
        profiles={profilesResult.data ?? []}
        currentUser={currentProfileResult.data!}
      />
    </div>
  )
}
