-- GoalSeek: table grants and account self-repair.
-- Run this once in the Supabase SQL editor, after 0001_init.sql.
-- It is safe to run more than once.

-- 1. Table privileges.
-- Newer Supabase projects may not grant the API roles access to new tables
-- automatically. Row-level security (from 0001) still decides which rows each
-- user can see; these grants only let the API reach the tables at all.
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;

-- 2. Create the profile and personal workspace for a user who has none.
-- This happens when someone signed in before 0001_init.sql was run, so the
-- sign-up trigger never fired for them.
create or replace function public.ensure_user_setup(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ws_id uuid;
  u auth.users%rowtype;
begin
  if exists (select 1 from public.profiles where id = uid) then
    return;
  end if;

  select * into u from auth.users where id = uid;
  if not found then
    return;
  end if;

  select workspace_id into ws_id
  from public.workspace_members
  where user_id = uid
  order by joined_at
  limit 1;

  if ws_id is null then
    insert into public.workspaces (name, created_by)
    values ('My workspace', uid)
    returning id into ws_id;
  end if;

  insert into public.profiles (id, email, full_name, avatar_url, default_workspace_id)
  values (
    uid,
    coalesce(u.email, ''),
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'avatar_url',
    ws_id
  )
  on conflict (id) do nothing;
end;
$$;

-- The app calls this for the signed-in user only.
create or replace function public.ensure_my_setup()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  perform public.ensure_user_setup(auth.uid());
end;
$$;

revoke execute on function public.ensure_user_setup(uuid) from public, anon, authenticated;
revoke execute on function public.ensure_my_setup() from public, anon;
grant execute on function public.ensure_my_setup() to authenticated;

-- 3. Repair everyone who already signed up without a profile.
select public.ensure_user_setup(id) from auth.users;
