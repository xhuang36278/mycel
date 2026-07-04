create table if not exists public.mycel_user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_key text not null,
  value text,
  updated_at timestamptz not null default now(),
  primary key (user_id, storage_key)
);

alter table public.mycel_user_data enable row level security;

drop policy if exists "Users read their own Mycel data" on public.mycel_user_data;
drop policy if exists "Users create their own Mycel data" on public.mycel_user_data;
drop policy if exists "Users update their own Mycel data" on public.mycel_user_data;
drop policy if exists "Users delete their own Mycel data" on public.mycel_user_data;
create policy "Users read their own Mycel data" on public.mycel_user_data for select using (auth.uid() = user_id);
create policy "Users create their own Mycel data" on public.mycel_user_data for insert with check (auth.uid() = user_id);
create policy "Users update their own Mycel data" on public.mycel_user_data for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their own Mycel data" on public.mycel_user_data for delete using (auth.uid() = user_id);

create or replace function public.set_mycel_user_data_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists mycel_user_data_updated_at on public.mycel_user_data;
create trigger mycel_user_data_updated_at before update on public.mycel_user_data
for each row execute function public.set_mycel_user_data_updated_at();

insert into storage.buckets (id, name, public, file_size_limit)
values ('mycel-files', 'mycel-files', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists "Users read their own Mycel files" on storage.objects;
drop policy if exists "Users upload their own Mycel files" on storage.objects;
drop policy if exists "Users update their own Mycel files" on storage.objects;
drop policy if exists "Users delete their own Mycel files" on storage.objects;
create policy "Users read their own Mycel files" on storage.objects for select
using (bucket_id = 'mycel-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users upload their own Mycel files" on storage.objects for insert
with check (bucket_id = 'mycel-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users update their own Mycel files" on storage.objects for update
using (bucket_id = 'mycel-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users delete their own Mycel files" on storage.objects for delete
using (bucket_id = 'mycel-files' and (storage.foldername(name))[1] = auth.uid()::text);
