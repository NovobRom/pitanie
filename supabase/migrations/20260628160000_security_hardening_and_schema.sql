-- Security Hardening and Schema Extension Migration

-- 1. Create request logs table for rate limiting
create table if not exists public.request_logs (
  ip text,
  endpoint text,
  created_at timestamptz not null default now()
);

alter table public.request_logs enable row level security;

-- Only service role can access request logs
create policy "no public access to request logs" on public.request_logs
  for all using (false);

create index if not exists request_logs_ip_created_at_idx on public.request_logs (ip, created_at);

-- 2. Update create_shared_plan with rate limiting
create or replace function public.create_shared_plan(p_title text, p_data jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_ip text;
  v_recent_calls int;
  v_new_id uuid;
begin
  -- Get client IP from headers
  begin
    v_client_ip := coalesce(
      current_setting('request.headers', true)::json->>'x-forwarded-for',
      'unknown'
    );
  exception when others then
    v_client_ip := 'unknown';
  end;

  -- Clean old logs (older than 1 minute)
  delete from public.request_logs where created_at < now() - interval '1 minute';

  -- Count recent calls from this IP
  select count(*) into v_recent_calls
  from public.request_logs
  where ip = v_client_ip and endpoint = 'create_shared_plan' and created_at >= now() - interval '1 minute';

  if v_recent_calls >= 5 then
    raise exception 'Too Many Requests' using errcode = '42900';
  end if;

  -- Log this call
  insert into public.request_logs (ip, endpoint) values (v_client_ip, 'create_shared_plan');

  -- Insert the plan
  insert into public.plans (title, data, owner_id)
  values (p_title, p_data, auth.uid())
  returning id into v_new_id;

  return v_new_id;
end;
$$;

-- 3. Create user_profiles table
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  weight numeric not null,
  height numeric not null,
  age integer not null,
  sex text not null,
  body_fat numeric,
  activity text not null,
  goal text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add check constraints for user_profiles
alter table public.user_profiles add constraint chk_weight_positive check (weight > 0);
alter table public.user_profiles add constraint chk_height_positive check (height > 0);
alter table public.user_profiles add constraint chk_age_range check (age >= 1 and age <= 150);

-- Enable RLS on user_profiles
alter table public.user_profiles enable row level security;

-- Granular RLS policies for user_profiles
create policy "users select own profile" on public.user_profiles
  for select using (auth.uid() = user_id);

create policy "users insert own profile" on public.user_profiles
  for insert with check (auth.uid() = user_id);

create policy "users update own profile" on public.user_profiles
  for update using (auth.uid() = user_id);

create policy "users delete own profile" on public.user_profiles
  for delete using (auth.uid() = user_id);

-- 4. Create goals table
create table if not exists public.goals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  calories integer not null,
  protein integer not null,
  fat integer not null,
  carbs integer not null,
  updated_at timestamptz not null default now()
);

-- Add check constraints for goals
alter table public.goals add constraint chk_calories_positive check (calories > 0);

-- Enable RLS on goals
alter table public.goals enable row level security;

-- Granular RLS policies for goals
create policy "users select own goals" on public.goals
  for select using (auth.uid() = user_id);

create policy "users insert own goals" on public.goals
  for insert with check (auth.uid() = user_id);

create policy "users update own goals" on public.goals
  for update using (auth.uid() = user_id);

create policy "users delete own goals" on public.goals
  for delete using (auth.uid() = user_id);

-- 5. Create diary_entries table
create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  meal_type text not null,
  product_name text not null,
  calories numeric not null,
  protein numeric not null,
  fat numeric not null,
  carbs numeric not null,
  grams numeric not null,
  created_at timestamptz not null default now()
);

-- Add check constraints for diary_entries
alter table public.diary_entries add constraint chk_grams_positive check (grams > 0);

-- Enable RLS on diary_entries
alter table public.diary_entries enable row level security;

-- Granular RLS policies for diary_entries
create policy "users select own diary" on public.diary_entries
  for select using (auth.uid() = user_id);

create policy "users insert own diary" on public.diary_entries
  for insert with check (auth.uid() = user_id);

create policy "users update own diary" on public.diary_entries
  for update using (auth.uid() = user_id);

create policy "users delete own diary" on public.diary_entries
  for delete using (auth.uid() = user_id);

-- 6. Create weight_history table
create table if not exists public.weight_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight numeric not null,
  created_at timestamptz not null default now()
);

-- Add check constraints for weight_history
alter table public.weight_history add constraint chk_weight_positive check (weight > 0);

-- Enable RLS on weight_history
alter table public.weight_history enable row level security;

-- Granular RLS policies for weight_history
create policy "users select own weight" on public.weight_history
  for select using (auth.uid() = user_id);

create policy "users insert own weight" on public.weight_history
  for insert with check (auth.uid() = user_id);

create policy "users update own weight" on public.weight_history
  for update using (auth.uid() = user_id);

create policy "users delete own weight" on public.weight_history
  for delete using (auth.uid() = user_id);

-- 7. Create composite indexes
create index if not exists plans_owner_id_title_idx on public.plans (owner_id, title);
create index if not exists diary_entries_user_id_date_idx on public.diary_entries (user_id, date);
create index if not exists weight_history_user_id_date_idx on public.weight_history (user_id, date);
