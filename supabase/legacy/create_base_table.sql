create extension if not exists "uuid-ossp";

create table if not exists public.base (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  <!-- BASE metadata -->
  trashed boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.base enable row level security;

create policy "Users can read base" on public.base
  for select using (auth.uid() = user_id);

create policy "Users can modify base" on public.base
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
