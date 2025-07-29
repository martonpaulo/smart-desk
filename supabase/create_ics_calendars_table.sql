create extension if not exists "uuid-ossp";

create table if not exists public.ics_calendars (
  id uuid primary key,
  user_id uuid references auth.users not null,
  title text not null,
  source text not null unique,
  color text not null,
  trashed boolean not null default false,
  updated_at timestamptz not null,
  created_at timestamptz not null
);

alter table public.ics_calendars enable row level security;

create policy "Users can read ics_calendars" on public.ics_calendars
  for select using (auth.uid() = user_id);

create policy "Users can modify ics_calendars" on public.ics_calendars
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
