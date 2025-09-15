create extension if not exists "uuid-ossp";

create table if not exists public.tags (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null unique,
  color text not null,
  position float not null,
  trashed boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.tags enable row level security;

create policy "Users can read tags" on public.tags
  for select using (auth.uid() = user_id);

create policy "Users can modify tags" on public.tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
