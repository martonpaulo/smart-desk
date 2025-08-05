create extension if not exists "uuid-ossp";

create table if not exists public.cloudinary_image (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  url text not null,
  public_id text not null,
  trashed boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.cloudinary_image enable row level security;

create policy "Users can read cloudinary_image" on public.cloudinary_image
  for select using (auth.uid() = user_id);

create policy "Users can modify cloudinary_image" on public.cloudinary_image
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
