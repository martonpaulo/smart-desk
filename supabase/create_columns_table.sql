create extension if not exists "uuid-ossp";

create table if not exists public.columns (
  id text primary key,
  user_id uuid references auth.users not null,
  slug text not null,
  title text not null,
  color text not null,
  position integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.columns enable row level security;

create policy "Users can read columns" on public.columns
  for select using (auth.uid() = user_id);

create policy "Users can modify columns" on public.columns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
