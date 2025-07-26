create extension if not exists "uuid-ossp";

create table if not exists public.locations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  type text not null check (type in ('place', 'flight', 'bus', 'stay', 'hidden')),
  name text not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  trashed boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz default now()
);

alter table public.locations enable row level security;

create policy "Users can read locations" on public.locations
  for select using (auth.uid() = user_id);

create policy "Users can modify locations" on public.locations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);