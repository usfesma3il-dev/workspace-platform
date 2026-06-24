export type UserRole = 'admin' | 'member'
export type UserStatus = 'online' | 'offline' | 'away'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type NotificationType =
  | 'message'
  | 'task_assigned'
  | 'task_comment'
  | 'task_status'
  | 'meeting_invite'
  | 'mention'
  | 'file_shared'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  status: UserStatus
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Channel {
  id: string
  name: string
  description: string | null
  is_private: boolean
  created_by: string | null
  created_at: string
}

export interface ChannelMember {
  channel_id: string
  user_id: string
  joined_at: string
}

export interface DmThread {
  id: string
  participant_ids: string[]
  created_at: string
}

export interface FileAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface Message {
  id: string
  channel_id: string | null
  dm_thread_id: string | null
  sender_id: string
  content: string | null
  attachments: FileAttachment[]
  created_at: string
  edited_at: string | null
  sender?: Profile
}

export interface FileRecord {
  id: string
  name: string
  size: number
  type: string
  url: string
  storage_path: string
  uploaded_by: string | null
  channel_id: string | null
  task_id: string | null
  created_at: string
  uploader?: Profile
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee_id: string | null
  creator_id: string
  channel_id: string | null
  deadline: string | null
  created_at: string
  updated_at: string
  assignee?: Profile
  creator?: Profile
}

export interface TaskComment {
  id: string
  task_id: string
  user_id: string
  content: string
  attachments: FileAttachment[]
  created_at: string
  user?: Profile
}

export interface TaskHistory {
  id: string
  task_id: string
  changed_by: string | null
  change_type: string
  old_value: string | null
  new_value: string | null
  created_at: string
  changer?: Profile
}

export interface Meeting {
  id: string
  title: string
  room_url: string
  room_name: string | null
  host_id: string | null
  task_id: string | null
  channel_id: string | null
  scheduled_at: string | null
  duration_min: number
  created_at: string
  host?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}
