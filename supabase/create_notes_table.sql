create extension if not exists "uuid-ossp";

create table if not exists public.notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  title text,
  content text,
  updated_at timestamptz not null default now(),
  created_at timestamptz default now()
);

alter table public.notes enable row level security;

create policy "Users can read notes" on public.notes
  for select using (auth.uid() = user_id);

create policy "Users can modify notes" on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
