create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  purpose text not null,
  learning_outcome text not null,
  format text not null,
  audience text not null,
  duration_minutes integer not null check (duration_minutes between 15 and 120),
  capacity integer not null check (capacity between 2 and 50),
  recording_mode text not null check (recording_mode in ('none','transcript','room')),
  source_permissions text,
  moderation_plan text not null,
  status text not null default 'submitted' check (status in ('draft','submitted','review','approved','rejected','live','ended')),
  screening_reason text,
  room_name text unique,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.live_participants (
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'participant' check (role in ('host','moderator','participant')),
  recording_consent boolean not null default false,
  transcript_consent boolean not null default false,
  joined_at timestamptz,
  left_at timestamptz,
  primary key (session_id, user_id)
);

create table if not exists public.live_learning_events (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('confusion','key_note','question','moderation','transcript','board_anchor')),
  anchor jsonb,
  content text,
  moderation_status text not null default 'approved' check (moderation_status in ('approved','review','removed')),
  created_at timestamptz not null default now()
);

alter table public.live_sessions enable row level security;
alter table public.live_participants enable row level security;
alter table public.live_learning_events enable row level security;

create policy "Hosts manage proposed sessions" on public.live_sessions for all
using (auth.uid() = host_id) with check (auth.uid() = host_id);
create policy "Users discover approved sessions" on public.live_sessions for select
using (status in ('approved','live','ended'));
create policy "Participants read their room roster" on public.live_participants for select
using (user_id = auth.uid() or exists (select 1 from public.live_sessions s where s.id = session_id and s.host_id = auth.uid()));
create policy "Users join approved sessions" on public.live_participants for insert
with check (user_id = auth.uid() and exists (select 1 from public.live_sessions s where s.id = session_id and s.status in ('approved','live')));
create policy "Users update their own consent" on public.live_participants for update
using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Room members read learning events" on public.live_learning_events for select
using (exists (select 1 from public.live_participants p where p.session_id = live_learning_events.session_id and p.user_id = auth.uid()));
create policy "Room members create learning events" on public.live_learning_events for insert
with check (user_id = auth.uid() and exists (select 1 from public.live_participants p where p.session_id = live_learning_events.session_id and p.user_id = auth.uid()));

