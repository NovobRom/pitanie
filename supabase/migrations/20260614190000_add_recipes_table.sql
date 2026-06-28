create table if not exists public.recipes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  serving_g   int not null default 100,
  items       jsonb not null default '[]',
  kcal        numeric(7,2) not null default 0,
  protein     numeric(6,2) not null default 0,
  fat         numeric(6,2) not null default 0,
  carbs       numeric(6,2) not null default 0,
  fiber       numeric(6,2) not null default 0,
  created_at  timestamptz default now()
);

alter table public.recipes enable row level security;

create policy "own recipes"
  on public.recipes
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
