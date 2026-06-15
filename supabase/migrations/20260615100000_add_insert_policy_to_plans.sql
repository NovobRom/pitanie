-- Allow authenticated users to INSERT their own plans (required for upsert to work)
create policy "owners insert own plans" on public.plans
  for insert with check (auth.uid() = owner_id);
