-- =========================================================
-- Step 1: 多租户基础表（零风险，不动旧表）
-- 在 Cloud → SQL Editor 整段粘贴执行即可
-- =========================================================

-- ---------- ENUMS ----------
do $$ begin
  create type public.couple_role as enum ('a','b');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.couple_member_status as enum ('active','left','removed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.invite_status as enum ('pending','accepted','declined','cancelled','expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notification_type as enum (
    'couple_invite','couple_invite_accepted','couple_invite_declined',
    'anniversary_milestone',
    'wish_added','wish_completed',
    'gift_added','gift_given',
    'photo_added','timeline_added',
    'system'
  );
exception when duplicate_object then null; end $$;

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null default '',
  avatar_url    text default '',
  email         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read all" on public.profiles;
create policy "profiles: read all"
  on public.profiles for select to authenticated using (true);

drop policy if exists "profiles: update self" on public.profiles;
create policy "profiles: update self"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles: insert self" on public.profiles;
create policy "profiles: insert self"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name',
             split_part(coalesce(new.email,''),'@',1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- COUPLES ----------
create table if not exists public.couples (
  id            uuid primary key default gen_random_uuid(),
  name_a        text not null default '',
  name_b        text not null default '',
  anniversary   date,
  slogan        text not null default '把走过的城市、吃过的甜、笑过的瞬间，全部贴进这本只属于我们的手账。',
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.couples enable row level security;

-- ---------- COUPLE MEMBERS ----------
create table if not exists public.couple_members (
  couple_id   uuid not null references public.couples(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        public.couple_role not null,
  status      public.couple_member_status not null default 'active',
  joined_at   timestamptz not null default now(),
  primary key (couple_id, user_id)
);
create unique index if not exists couple_members_one_active_per_user
  on public.couple_members(user_id) where (status = 'active');
alter table public.couple_members enable row level security;

-- ---------- HELPER FUNCTIONS ----------
create or replace function public.current_couple_id()
returns uuid language sql stable security definer set search_path = public as $$
  select couple_id from public.couple_members
   where user_id = auth.uid() and status = 'active' limit 1
$$;

create or replace function public.is_member_of(c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.couple_members
     where couple_id = c and user_id = auth.uid() and status = 'active'
  )
$$;

-- ---------- COUPLES RLS ----------
drop policy if exists "couples: read own" on public.couples;
create policy "couples: read own" on public.couples for select to authenticated
  using (public.is_member_of(id));
drop policy if exists "couples: insert by creator" on public.couples;
create policy "couples: insert by creator" on public.couples for insert to authenticated
  with check (created_by = auth.uid());
drop policy if exists "couples: update by member" on public.couples;
create policy "couples: update by member" on public.couples for update to authenticated
  using (public.is_member_of(id)) with check (public.is_member_of(id));
drop policy if exists "couples: delete by member" on public.couples;
create policy "couples: delete by member" on public.couples for delete to authenticated
  using (public.is_member_of(id));

-- ---------- COUPLE_MEMBERS RLS ----------
drop policy if exists "members: read own couple" on public.couple_members;
create policy "members: read own couple" on public.couple_members for select to authenticated
  using (user_id = auth.uid() or public.is_member_of(couple_id));
drop policy if exists "members: insert self" on public.couple_members;
create policy "members: insert self" on public.couple_members for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists "members: update self" on public.couple_members;
create policy "members: update self" on public.couple_members for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "members: delete self" on public.couple_members;
create policy "members: delete self" on public.couple_members for delete to authenticated
  using (user_id = auth.uid());

-- ---------- COUPLE_INVITES ----------
create table if not exists public.couple_invites (
  id          uuid primary key default gen_random_uuid(),
  from_user   uuid not null references auth.users(id) on delete cascade,
  to_email    text not null,
  to_user     uuid references auth.users(id) on delete set null,
  couple_id   uuid references public.couples(id) on delete cascade,
  status      public.invite_status not null default 'pending',
  message     text default '',
  created_at  timestamptz not null default now(),
  responded_at timestamptz
);
create index if not exists couple_invites_to_email_idx on public.couple_invites(lower(to_email));
create index if not exists couple_invites_to_user_idx  on public.couple_invites(to_user);
create index if not exists couple_invites_from_user_idx on public.couple_invites(from_user);

alter table public.couple_invites enable row level security;

drop policy if exists "invites: read involved" on public.couple_invites;
create policy "invites: read involved" on public.couple_invites for select to authenticated
  using (
    from_user = auth.uid() or to_user = auth.uid()
    or lower(to_email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  );
drop policy if exists "invites: insert by sender" on public.couple_invites;
create policy "invites: insert by sender" on public.couple_invites for insert to authenticated
  with check (from_user = auth.uid());
drop policy if exists "invites: update by involved" on public.couple_invites;
create policy "invites: update by involved" on public.couple_invites for update to authenticated
  using (
    from_user = auth.uid() or to_user = auth.uid()
    or lower(to_email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  );

-- ---------- NOTIFICATIONS ----------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        public.notification_type not null,
  title       text not null default '',
  body        text not null default '',
  payload     jsonb not null default '{}'::jsonb,
  action_url  text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists notifications_user_unread_idx  on public.notifications(user_id) where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists "notif: read own" on public.notifications;
create policy "notif: read own" on public.notifications for select to authenticated
  using (user_id = auth.uid());
drop policy if exists "notif: update own (mark read)" on public.notifications;
create policy "notif: update own (mark read)" on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "notif: delete own" on public.notifications;
create policy "notif: delete own" on public.notifications for delete to authenticated
  using (user_id = auth.uid());
drop policy if exists "notif: insert any authenticated" on public.notifications;
create policy "notif: insert any authenticated" on public.notifications for insert to authenticated
  with check (true);

-- ---------- 给已有用户补建 profile（幂等） ----------
insert into public.profiles (id, display_name, email)
select u.id,
       coalesce(u.raw_user_meta_data->>'display_name', split_part(coalesce(u.email,''),'@',1)),
       u.email
from auth.users u
on conflict (id) do nothing;

notify pgrst, 'reload schema';
