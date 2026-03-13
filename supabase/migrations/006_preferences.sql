create table public.preferences (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  language   text        not null default 'en',
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.preferences enable row level security;

create policy "users manage own preferences"
  on public.preferences
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

