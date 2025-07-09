create extension if not exists "uuid-ossp";

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  tags text[] default '{}',
  columnId text references columns(id) not null,
  quantity integer,
  quantityTotal integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tasks enable row level security;

create policy "Users can read tasks" on public.tasks
  for select using (auth.uid() = user_id);

create policy "Users can modify tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
