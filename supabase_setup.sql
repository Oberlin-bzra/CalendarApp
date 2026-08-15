-- ============================================================
-- Calendar App: 'events' and 'notes' tables incl. Row Level Security
-- Paste this whole block into the Supabase SQL Editor and run it.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS
-- everywhere, so it also works as an update script if you already
-- created the 'events' table with an earlier version of this file.
-- ============================================================

-- ---------- events ----------

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'Work',
  start_time timestamptz not null,
  end_time timestamptz not null,
  all_day boolean not null default false,
  color text default '#6366f1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint end_after_start check (end_time >= start_time)
);

-- Update the category constraint to Work / Personal / School
-- (drops the old constraint first in case it already exists from a
-- previous run with different category values, e.g. 'Sprint'/'Dev')
alter table public.events drop constraint if exists events_category_check;
alter table public.events add constraint events_category_check
  check (category in ('Work', 'Personal', 'School'));

-- If you already have events stored with the old 'Dev' or 'Sprint'
-- categories, this remaps them so the constraint above doesn't fail.
update public.events set category = 'School' where category = 'Dev';
update public.events set category = 'Work' where category = 'Sprint';

create index if not exists events_user_id_idx on public.events (user_id);
create index if not exists events_start_time_idx on public.events (start_time);

alter table public.events enable row level security;

drop policy if exists "Users can read their own events" on public.events;
create policy "Users can read their own events"
  on public.events for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own events" on public.events;
create policy "Users can create their own events"
  on public.events for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own events" on public.events;
create policy "Users can update their own events"
  on public.events for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own events" on public.events;
create policy "Users can delete their own events"
  on public.events for delete
  using (auth.uid() = user_id);

-- ---------- notes ----------

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_id_idx on public.notes (user_id);
create index if not exists notes_created_at_idx on public.notes (created_at);

alter table public.notes enable row level security;

drop policy if exists "Users can read their own notes" on public.notes;
create policy "Users can read their own notes"
  on public.notes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own notes" on public.notes;
create policy "Users can create their own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own notes" on public.notes;
create policy "Users can update their own notes"
  on public.notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own notes" on public.notes;
create policy "Users can delete their own notes"
  on public.notes for delete
  using (auth.uid() = user_id);

-- ---------- shared: auto-update 'updated_at' ----------

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.events;
create trigger set_updated_at
  before update on public.events
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.notes;
create trigger set_updated_at
  before update on public.notes
  for each row execute function public.handle_updated_at();
