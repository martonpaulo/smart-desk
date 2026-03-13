create table public.tasks (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  title        text        not null default '',
  description  text,
  tag          text        not null,
  planned_date date        not null,
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

alter table public.tasks enable row level security;

create policy "users manage own tasks"
  on public.tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
