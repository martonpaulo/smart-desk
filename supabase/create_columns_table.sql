create extension if not exists "uuid-ossp";

create table if not exists public.columns (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  title text not null unique,
  color text not null,
  position float not null default 0,
  trashed boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.columns enable row level security;

create policy "Users can read columns" on public.columns
  for select using (auth.uid() = user_id);

create policy "Users can modify columns" on public.columns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
