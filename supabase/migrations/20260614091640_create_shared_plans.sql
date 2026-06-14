-- Shared meal plans for anonymous link-sharing.
-- The table is locked behind RLS; all public access goes through two
-- SECURITY DEFINER functions so the anon key cannot enumerate other plans.

create extension if not exists "pgcrypto";

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text,
  data jsonb not null,
  owner_id uuid references auth.users (id) on delete set null
);

alter table public.plans enable row level security;

-- Owners (once auth is added) may read/manage their own plans directly.
create policy "owners read own plans" on public.plans
  for select using (auth.uid() = owner_id);
create policy "owners update own plans" on public.plans
  for update using (auth.uid() = owner_id);
create policy "owners delete own plans" on public.plans
  for delete using (auth.uid() = owner_id);

-- Create a shareable plan; returns its id. Open to anyone (anonymous sharing).
create or replace function public.create_shared_plan(p_title text, p_data jsonb)
returns uuid
language sql
security definer
set search_path = public
as $$
  insert into public.plans (title, data, owner_id)
  values (p_title, p_data, auth.uid())
  returning id;
$$;

-- Read a single plan by its (unguessable) id. No enumeration possible.
create or replace function public.get_shared_plan(p_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select data from public.plans where id = p_id;
$$;

revoke all on function public.create_shared_plan(text, jsonb) from public;
revoke all on function public.get_shared_plan(uuid) from public;
grant execute on function public.create_shared_plan(text, jsonb) to anon, authenticated;
grant execute on function public.get_shared_plan(uuid) to anon, authenticated;
