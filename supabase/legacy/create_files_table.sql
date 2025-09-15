create extension if not exists "uuid-ossp";

create table if not exists public.files (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  url text not null,
  public_id text not null,
  resource_type text not null,
  trashed boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.files enable row level security;

create policy "Users can read files" on public.files
  for select using (auth.uid() = user_id);

create policy "Users can modify files" on public.files
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
