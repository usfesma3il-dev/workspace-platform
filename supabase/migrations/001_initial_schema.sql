-- ============================================================
-- WorkSpace Platform — Initial Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create type user_role as enum ('admin', 'member');
create type user_status as enum ('online', 'offline', 'away');

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  role user_role default 'member' not null,
  status user_status default 'offline',
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by all authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CHANNELS
-- ============================================================
create table public.channels (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  is_private boolean default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.channels enable row level security;

create policy "Channels viewable by members"
  on public.channels for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can create channels"
  on public.channels for insert
  with check (auth.role() = 'authenticated');

-- ============================================================
-- CHANNEL MEMBERS
-- ============================================================
create table public.channel_members (
  channel_id uuid references public.channels(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (channel_id, user_id)
);

alter table public.channel_members enable row level security;

create policy "Channel members viewable by authenticated"
  on public.channel_members for select
  using (auth.role() = 'authenticated');

create policy "Users can join channels"
  on public.channel_members for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- DIRECT MESSAGE THREADS
-- ============================================================
create table public.dm_threads (
  id uuid default uuid_generate_v4() primary key,
  participant_ids uuid[] not null,
  created_at timestamptz default now()
);

alter table public.dm_threads enable row level security;

create policy "DM threads viewable by participants"
  on public.dm_threads for select
  using (auth.uid() = any(participant_ids));

create policy "Authenticated can create DM threads"
  on public.dm_threads for insert
  with check (auth.uid() = any(participant_ids));

-- ============================================================
-- MESSAGES
-- ============================================================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  channel_id uuid references public.channels(id) on delete cascade,
  dm_thread_id uuid references public.dm_threads(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  edited_at timestamptz,
  check (
    (channel_id is not null and dm_thread_id is null) or
    (channel_id is null and dm_thread_id is not null)
  )
);

alter table public.messages enable row level security;

create policy "Messages viewable by authenticated"
  on public.messages for select
  using (auth.role() = 'authenticated');

create policy "Authenticated can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Users can edit own messages"
  on public.messages for update
  using (auth.uid() = sender_id);

create policy "Users can delete own messages"
  on public.messages for delete
  using (auth.uid() = sender_id);

-- ============================================================
-- FILES
-- ============================================================
create table public.files (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  size bigint not null,
  type text not null,
  url text not null,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  channel_id uuid references public.channels(id) on delete set null,
  task_id uuid, -- will reference tasks after tasks table creation
  created_at timestamptz default now()
);

alter table public.files enable row level security;

create policy "Files viewable by authenticated"
  on public.files for select
  using (auth.role() = 'authenticated');

create policy "Authenticated can upload files"
  on public.files for insert
  with check (auth.uid() = uploaded_by);

create policy "Users can delete own files"
  on public.files for delete
  using (auth.uid() = uploaded_by);

-- ============================================================
-- TASKS
-- ============================================================
create type task_status as enum ('todo', 'in_progress', 'done');
create type task_priority as enum ('low', 'medium', 'high', 'urgent');

create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status task_status default 'todo' not null,
  priority task_priority default 'medium' not null,
  assignee_id uuid references public.profiles(id) on delete set null,
  creator_id uuid references public.profiles(id) on delete set null not null,
  channel_id uuid references public.channels(id) on delete set null,
  deadline timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tasks enable row level security;

create policy "Tasks viewable by authenticated"
  on public.tasks for select
  using (auth.role() = 'authenticated');

create policy "Authenticated can create tasks"
  on public.tasks for insert
  with check (auth.uid() = creator_id);

create policy "Authenticated can update tasks"
  on public.tasks for update
  using (auth.role() = 'authenticated');

-- Add foreign key for files -> tasks
alter table public.files
  add constraint files_task_id_fkey
  foreign key (task_id) references public.tasks(id) on delete set null;

-- ============================================================
-- TASK COMMENTS
-- ============================================================
create table public.task_comments (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.task_comments enable row level security;

create policy "Task comments viewable by authenticated"
  on public.task_comments for select
  using (auth.role() = 'authenticated');

create policy "Authenticated can add comments"
  on public.task_comments for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- TASK HISTORY
-- ============================================================
create table public.task_history (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  changed_by uuid references public.profiles(id) on delete set null,
  change_type text not null, -- 'status_change', 'assignee_change', 'priority_change', etc.
  old_value text,
  new_value text,
  created_at timestamptz default now()
);

alter table public.task_history enable row level security;

create policy "Task history viewable by authenticated"
  on public.task_history for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- MEETINGS
-- ============================================================
create table public.meetings (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  room_url text not null,
  room_name text,
  host_id uuid references public.profiles(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  channel_id uuid references public.channels(id) on delete set null,
  scheduled_at timestamptz,
  duration_min integer default 60,
  created_at timestamptz default now()
);

alter table public.meetings enable row level security;

create policy "Meetings viewable by authenticated"
  on public.meetings for select
  using (auth.role() = 'authenticated');

create policy "Authenticated can create meetings"
  on public.meetings for insert
  with check (auth.uid() = host_id);

-- ============================================================
-- MEETING PARTICIPANTS
-- ============================================================
create table public.meeting_participants (
  meeting_id uuid references public.meetings(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (meeting_id, user_id)
);

alter table public.meeting_participants enable row level security;

create policy "Meeting participants viewable by authenticated"
  on public.meeting_participants for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create type notification_type as enum (
  'message', 'task_assigned', 'task_comment', 'task_status',
  'meeting_invite', 'mention', 'file_shared'
);

create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================
-- Enable realtime for these tables
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.profiles;

-- ============================================================
-- STORAGE BUCKETS (run separately in Supabase dashboard or via API)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('files', 'files', true);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
