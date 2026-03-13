create table public.google_connections (
  id                     uuid        primary key default gen_random_uuid(),
  user_id                uuid        not null references auth.users(id) on delete cascade,
  provider_account_id    text        not null,
  refresh_token_encrypted text       not null,
  sync_token             text,
  token_expiry           timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (user_id, provider_account_id)
);

alter table public.google_connections enable row level security;

-- Users can only manage their own Google connection records.
create policy "users manage own google connections"
  on public.google_connections
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
