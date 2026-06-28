-- ─── profiles table ───────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  sex           text check (sex in ('male','female')) default 'male',
  birthdate     date,
  height        int,
  age           int,
  activity      text default 'light',
  goal          text default 'maintain',
  protein_ratio numeric(4,2) default 2.0,
  fat_ratio     numeric(4,2) default 0.25,
  goals         jsonb,
  locale        text default 'ru',
  units         text default 'metric',
  updated_at    timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "own profile"
  on public.profiles
  for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── weights table ────────────────────────────────────────────────────────────
create table if not exists public.weights (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  weight_kg   numeric(5,2) not null,
  created_at  timestamptz default now(),
  unique (user_id, date)
);

alter table public.weights enable row level security;

create policy "own weights"
  on public.weights
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
