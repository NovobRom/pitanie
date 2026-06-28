-- Per-user AI usage log used to rate-limit the Anthropic-backed endpoints.
-- Prevents a single account from burning through API credits and bounds the
-- blast radius if an account is compromised.
create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index ai_usage_user_time_idx on public.ai_usage (user_id, created_at desc);

alter table public.ai_usage enable row level security;
-- No direct policies: the table is only ever touched through the
-- SECURITY DEFINER function below, so clients cannot read or forge rows.

-- Atomically check the caller's recent usage and, if under both the
-- per-minute and per-day caps, record one more call. Returns a JSON verdict.
create or replace function public.record_ai_usage(p_max_min int, p_max_day int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cnt_min int;
  cnt_day int;
begin
  if uid is null then
    return jsonb_build_object('allowed', false, 'reason', 'unauthorized');
  end if;

  select count(*) into cnt_min from public.ai_usage
    where user_id = uid and created_at > now() - interval '1 minute';
  select count(*) into cnt_day from public.ai_usage
    where user_id = uid and created_at > now() - interval '1 day';

  if cnt_min >= p_max_min or cnt_day >= p_max_day then
    return jsonb_build_object('allowed', false, 'reason', 'rate_limited',
      'perMinute', cnt_min, 'perDay', cnt_day);
  end if;

  insert into public.ai_usage (user_id) values (uid);
  return jsonb_build_object('allowed', true,
    'perMinute', cnt_min + 1, 'perDay', cnt_day + 1);
end;
$$;

revoke all on function public.record_ai_usage(int, int) from public, anon;
grant execute on function public.record_ai_usage(int, int) to authenticated;
