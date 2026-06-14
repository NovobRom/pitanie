-- Remove duplicate plans for the same user and date, keeping the latest one
delete from public.plans a
using public.plans b
where a.id <> b.id
  and a.owner_id = b.owner_id
  and a.title = b.title
  and a.created_at < b.created_at;

-- Add unique constraint to enforce one plan per user per date
alter table public.plans add constraint plans_owner_id_title_uniq unique (owner_id, title);
