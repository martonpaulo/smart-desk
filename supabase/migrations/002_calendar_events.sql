create table public.calendar_events (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  google_event_id text        not null,
  calendar_id     text        not null default 'primary',
  title           text        not null default '',
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  all_day         boolean     not null default false,
  status          text        not null default 'confirmed',
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  unique (user_id, google_event_id)
);

alter table public.calendar_events enable row level security;

-- Users can read their own calendar events; writes are done by the server-side
-- sync job via the service-role key, which bypasses RLS.
create policy "users read own calendar events"
  on public.calendar_events
  for select
  using (auth.uid() = user_id);
