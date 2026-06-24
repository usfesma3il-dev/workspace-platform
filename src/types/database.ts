export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'member'
          status: 'online' | 'offline' | 'away'
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'member'
          status?: 'online' | 'offline' | 'away'
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'member'
          status?: 'online' | 'offline' | 'away'
          bio?: string | null
          updated_at?: string
        }
      }
      channels: {
        Row: {
          id: string
          name: string
          description: string | null
          is_private: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_private?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          is_private?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          channel_id: string | null
          dm_thread_id: string | null
          sender_id: string
          content: string | null
          attachments: Json
          created_at: string
          edited_at: string | null
        }
        Insert: {
          id?: string
          channel_id?: string | null
          dm_thread_id?: string | null
          sender_id: string
          content?: string | null
          attachments?: Json
          created_at?: string
          edited_at?: string | null
        }
        Update: {
          content?: string | null
          attachments?: Json
          edited_at?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'done'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id: string | null
          creator_id: string
          channel_id: string | null
          deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id?: string | null
          creator_id: string
          channel_id?: string | null
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id?: string | null
          deadline?: string | null
          updated_at?: string
        }
      }
      files: {
        Row: {
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
        }
        Insert: {
          id?: string
          name: string
          size: number
          type: string
          url: string
          storage_path: string
          uploaded_by?: string | null
          channel_id?: string | null
          task_id?: string | null
          created_at?: string
        }
        Update: {
          channel_id?: string | null
          task_id?: string | null
        }
      }
      meetings: {
        Row: {
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
        }
        Insert: {
          id?: string
          title: string
          room_url: string
          room_name?: string | null
          host_id?: string | null
          task_id?: string | null
          channel_id?: string | null
          scheduled_at?: string | null
          duration_min?: number
          created_at?: string
        }
        Update: {
          title?: string
          scheduled_at?: string | null
          duration_min?: number
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          read?: boolean
        }
      }
    }
  }
}
