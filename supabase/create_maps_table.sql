create extension if not exists "uuid-ossp";

create table if not exists public.maps (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  file_url text not null,
  geojson jsonb,
  region_colors jsonb not null default '{}'::jsonb,
  region_labels jsonb not null default '{}'::jsonb,
  region_tooltips jsonb not null default '{}'::jsonb,
  trashed boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.maps enable row level security;

create policy "Users can read maps" on public.maps
  for select using (auth.uid() = user_id);

create policy "Users can modify maps" on public.maps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
