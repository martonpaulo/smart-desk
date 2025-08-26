-- User-level retention. Only 7, 30, 90 are valid. Default 30.
create table if not exists public.user_settings (
	user_id uuid primary key references auth.users(id) on delete cascade,
	retention_days integer not null default 30,
	constraint user_settings_retention_chk check (retention_days in (7, 30, 90))
);

-- RLS enabled so the app can safely read/write user settings.
alter table
	public.user_settings enable row level security;

create policy "user can read own settings" on public.user_settings for
select
	using (auth.uid() = user_id);

create policy "user can insert own settings" on public.user_settings for
insert
	with check (auth.uid() = user_id);

create policy "user can update own settings" on public.user_settings for
update
	using (auth.uid() = user_id) with check (auth.uid() = user_id);
