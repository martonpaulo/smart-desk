create extension if not exists "uuid-ossp";

create table if not exists public.events (
  id uuid primary key,
  user_id uuid references auth.users not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  summary text not null,
  description text,
  all_day boolean not null,
  -- calendar_id uuid references public.calendars not null,
  acknowledged boolean not null default false,
  -- recurrence_id uuid references public.events on delete cascade,
  trashed boolean not null default false,
  updated_at timestamptz not null,
  created_at timestamptz not null
);

alter table public.events enable row level security;

create policy "Users can read events" on public.events
  for select using (auth.uid() = user_id);

create policy "Users can modify events" on public.events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
