create extension if not exists "uuid-ossp";

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  title text not null,
  notes text default null,
  important boolean not null default false,
  urgent boolean not null default false,
  blocked boolean not null default false,
  estimated_time integer default null,
  planned_date timestamptz default null,
  quantity_done integer not null default 0,
  quantity_target integer not null default 1,
  daily boolean not null default false,
  position float not null default 0,
  classified_date timestamptz default null,
  column_id uuid references columns(id) not null,
  tag_id uuid references tags(id) default null,
  trashed boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Users can read tasks" on public.tasks
  for select using (auth.uid() = user_id);

create policy "Users can modify tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
