-- GoalSeek: initial schema
-- Run this once in the Supabase SQL editor (or with `supabase db push`).
-- Every table has row-level security (RLS) on, so a user can only ever see
-- rows that belong to a workspace they are a member of.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.item_category as enum ('job', 'certification', 'project', 'meetup', 'resource');
create type public.item_status as enum ('new', 'interested', 'applied', 'interview', 'rejected', 'skipped');
create type public.workspace_role as enum ('owner', 'member');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.workspace_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index workspace_members_user_idx on public.workspace_members (user_id);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  timezone text not null default 'Asia/Kolkata',
  reminder_hour smallint not null default 21 check (reminder_hour between 0 and 23),
  reminders_enabled boolean not null default true,
  last_digest_sent_on date,
  default_workspace_id uuid references public.workspaces (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(18), 'hex'),
  created_by uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz not null default now() + interval '7 days',
  created_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  url text not null,
  normalized_url text not null,
  title text,
  description text,
  image_url text,
  site_name text,
  category public.item_category not null default 'resource',
  status public.item_status not null default 'new',
  owner_id uuid references auth.users (id) on delete set null,
  added_by uuid references auth.users (id) on delete set null,
  notes text,
  jd_text text,
  resume_version text,
  deadline date,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, normalized_url)
);
create index items_workspace_status_idx on public.items (workspace_id, status);
create index items_deadline_idx on public.items (deadline) where deadline is not null;

create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  prefix text not null,
  key_hash text not null unique,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index api_keys_user_idx on public.api_keys (user_id);

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

-- SECURITY DEFINER so policies can call it without recursing into RLS.
create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_owner(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid() and role = 'owner'
  );
$$;

-- Keep updated_at fresh, and bump last_activity_at whenever someone edits an item.
create or replace function public.touch_item()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.last_activity_at := now();
  return new;
end;
$$;

create trigger items_touch
before update on public.items
for each row execute function public.touch_item();

-- The creator of a workspace automatically becomes its owner.
create or replace function public.add_workspace_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger workspaces_add_owner
after insert on public.workspaces
for each row execute function public.add_workspace_owner();

-- On sign up: create a profile and a personal workspace.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ws_id uuid;
begin
  insert into public.workspaces (name, created_by)
  values ('My workspace', new.id)
  returning id into ws_id;

  insert into public.profiles (id, email, full_name, avatar_url, default_workspace_id)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    ws_id
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Create a workspace (the trigger above makes the caller its owner).
create or replace function public.create_workspace(workspace_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  ws_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into public.workspaces (name, created_by)
  values (workspace_name, auth.uid())
  returning id into ws_id;

  return ws_id;
end;
$$;

-- Join a workspace with an invite token. Returns the workspace id.
create or replace function public.accept_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  ws_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select workspace_id into ws_id
  from public.workspace_invites
  where token = invite_token and expires_at > now();

  if ws_id is null then
    raise exception 'invite is invalid or expired';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (ws_id, auth.uid(), 'member')
  on conflict do nothing;

  return ws_id;
end;
$$;

-- Read the workspace name behind an invite, so the join page can show it
-- before the visitor is a member.
create or replace function public.invite_preview(invite_token text)
returns table (workspace_name text, expired boolean)
language sql
stable
security definer
set search_path = public
as $$
  select w.name, i.expires_at <= now()
  from public.workspace_invites i
  join public.workspaces w on w.id = i.workspace_id
  where i.token = invite_token;
$$;

-- Only signed-in users may call these. (Postgres grants EXECUTE to PUBLIC by default.)
revoke execute on function public.create_workspace(text) from public, anon;
revoke execute on function public.accept_invite(text) from public, anon;
revoke execute on function public.invite_preview(text) from public, anon;
grant execute on function public.create_workspace(text) to authenticated;
grant execute on function public.accept_invite(text) to authenticated;
grant execute on function public.invite_preview(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.profiles enable row level security;
alter table public.workspace_invites enable row level security;
alter table public.items enable row level security;
alter table public.api_keys enable row level security;

-- workspaces
create policy "members read workspaces" on public.workspaces
  for select to authenticated using (public.is_workspace_member(id));
create policy "users create workspaces" on public.workspaces
  for insert to authenticated with check (created_by = auth.uid());
create policy "owners rename workspaces" on public.workspaces
  for update to authenticated using (public.is_workspace_owner(id));
create policy "owners delete workspaces" on public.workspaces
  for delete to authenticated using (public.is_workspace_owner(id));

-- workspace_members (joining happens through accept_invite / triggers)
create policy "members read members" on public.workspace_members
  for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members leave or owners remove" on public.workspace_members
  for delete to authenticated
  using (user_id = auth.uid() or public.is_workspace_owner(workspace_id));

-- profiles: you can edit your own; you can see people you share a workspace with
create policy "read own or teammates profile" on public.profiles
  for select to authenticated using (
    id = auth.uid()
    or exists (
      select 1 from public.workspace_members mine
      join public.workspace_members theirs on theirs.workspace_id = mine.workspace_id
      where mine.user_id = auth.uid() and theirs.user_id = profiles.id
    )
  );
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- workspace_invites
create policy "members read invites" on public.workspace_invites
  for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members create invites" on public.workspace_invites
  for insert to authenticated
  with check (created_by = auth.uid() and public.is_workspace_member(workspace_id));
create policy "members delete invites" on public.workspace_invites
  for delete to authenticated using (public.is_workspace_member(workspace_id));

-- items
create policy "members read items" on public.items
  for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members add items" on public.items
  for insert to authenticated
  with check (public.is_workspace_member(workspace_id) and added_by = auth.uid());
create policy "members update items" on public.items
  for update to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "members delete items" on public.items
  for delete to authenticated using (public.is_workspace_member(workspace_id));

-- api_keys: only your own. The capture endpoint looks keys up with the
-- server-only secret key, which bypasses RLS.
create policy "own api keys read" on public.api_keys
  for select to authenticated using (user_id = auth.uid());
create policy "own api keys create" on public.api_keys
  for insert to authenticated with check (user_id = auth.uid());
create policy "own api keys revoke" on public.api_keys
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
