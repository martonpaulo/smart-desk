create extension if not exists "uuid-ossp";

create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  start timestamptz not null,
  "end" timestamptz not null,
  title text not null,
  attendee_count integer,
  calendar text,
  aknowledged boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.events enable row level security;

create policy "Users can read events" on public.events
  for select using (auth.uid() = user_id);

create policy "Users can modify events" on public.events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
