create extension if not exists pgcrypto;

-- Core tables
create table if not exists public.states (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active',
  description text,
  commander_in_charge text,
  reset_event text,
  state_age text,
  cover_image_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.state_updates (
  id uuid primary key default gen_random_uuid(),
  state_id uuid references public.states(id) on delete cascade,
  title text not null,
  content text not null,
  image_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.alliances (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tag text not null,
  slogan text,
  description text,
  requirements text,
  timezone text,
  banner_url text
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  alliance_id uuid references public.alliances(id) on delete set null,
  game_id text unique not null,
  name text not null,
  power bigint not null default 0,
  role text not null default 'member',
  note text,
  updated_at timestamptz not null default now()
);

create table if not exists public.leaderboards (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  period text not null,
  player_id uuid not null references public.players(id) on delete cascade,
  rank integer not null,
  score bigint not null,
  snapshot_date date not null default current_date
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  game_id text not null,
  note text,
  power_image_url text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'public'
);

create table if not exists public.quick_stats (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text not null,
  note text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.alliance_events (
  id uuid primary key default gen_random_uuid(),
  alliance_id uuid references public.alliances(id) on delete set null,
  title text not null,
  subtitle text,
  event_time text not null default '00:00',
  event_timestamp timestamptz not null default now(),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- Patch existing tables safely (if tables already exist)
alter table public.states add column if not exists status text default 'active';
alter table public.states add column if not exists description text;
alter table public.states add column if not exists commander_in_charge text;
alter table public.states add column if not exists reset_event text;
alter table public.states add column if not exists state_age text;
alter table public.states add column if not exists cover_image_url text;
alter table public.states add column if not exists updated_at timestamptz default now();

alter table public.state_updates add column if not exists state_id uuid;
alter table public.state_updates add column if not exists image_url text;
alter table public.state_updates add column if not exists is_published boolean default true;
alter table public.state_updates add column if not exists created_at timestamptz default now();

alter table public.alliances add column if not exists description text;
alter table public.alliances add column if not exists slogan text;
alter table public.alliances add column if not exists requirements text;
alter table public.alliances add column if not exists timezone text;
alter table public.alliances add column if not exists banner_url text;

alter table public.players add column if not exists alliance_id uuid;
alter table public.players add column if not exists power bigint default 0;
alter table public.players add column if not exists role text default 'member';
alter table public.players add column if not exists note text;
alter table public.players add column if not exists updated_at timestamptz default now();

alter table public.leaderboards add column if not exists snapshot_date date default current_date;

alter table public.registrations add column if not exists note text;
alter table public.registrations add column if not exists status text default 'pending';
alter table public.registrations add column if not exists created_at timestamptz default now();
alter table public.registrations add column if not exists reviewed_by uuid;

alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists role text default 'public';

alter table public.quick_stats add column if not exists label text;
alter table public.quick_stats add column if not exists value text;
alter table public.quick_stats add column if not exists note text;
alter table public.quick_stats add column if not exists sort_order integer default 0;
alter table public.quick_stats add column if not exists is_active boolean default true;
alter table public.quick_stats add column if not exists updated_at timestamptz default now();

alter table public.alliance_events add column if not exists alliance_id uuid;
alter table public.alliance_events add column if not exists subtitle text;
alter table public.alliance_events add column if not exists event_time text default '00:00';
alter table public.alliance_events add column if not exists event_timestamp timestamptz default now();
alter table public.alliance_events add column if not exists is_published boolean default true;
alter table public.alliance_events add column if not exists created_at timestamptz default now();

-- Enable RLS
alter table public.states enable row level security;
alter table public.state_updates enable row level security;
alter table public.alliances enable row level security;
alter table public.players enable row level security;
alter table public.leaderboards enable row level security;
alter table public.registrations enable row level security;
alter table public.profiles enable row level security;
alter table public.quick_stats enable row level security;
alter table public.alliance_events enable row level security;

-- Helper function for role checks
create or replace function public.has_role(required_role text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = required_role
  );
$$;

-- Recreate policies safely (idempotent)
drop policy if exists "Public read states" on public.states;
create policy "Public read states"
on public.states for select
using (true);

drop policy if exists "Public read published updates" on public.state_updates;
create policy "Public read published updates"
on public.state_updates for select
using (is_published = true);

drop policy if exists "Public read alliances" on public.alliances;
create policy "Public read alliances"
on public.alliances for select
using (true);

drop policy if exists "Public read players" on public.players;
create policy "Public read players"
on public.players for select
using (true);

drop policy if exists "Public read leaderboards" on public.leaderboards;
create policy "Public read leaderboards"
on public.leaderboards for select
using (true);

drop policy if exists "Public read quick stats" on public.quick_stats;
create policy "Public read quick stats"
on public.quick_stats for select
using (is_active = true);

drop policy if exists "Public read published alliance events" on public.alliance_events;
create policy "Public read published alliance events"
on public.alliance_events for select
using (is_published = true);

drop policy if exists "Public insert registrations" on public.registrations;
create policy "Public insert registrations"
on public.registrations for insert
with check (status = 'pending');

drop policy if exists "Admin and recruiter read registrations" on public.registrations;
create policy "Admin and recruiter read registrations"
on public.registrations for select
using (
  public.has_role('admin') or public.has_role('recruiter')
);

drop policy if exists "Admin and recruiter update registrations" on public.registrations;
create policy "Admin and recruiter update registrations"
on public.registrations for update
using (
  public.has_role('admin') or public.has_role('recruiter')
)
with check (
  public.has_role('admin') or public.has_role('recruiter')
);

drop policy if exists "Admin and recruiter manage updates" on public.state_updates;
create policy "Admin and recruiter manage updates"
on public.state_updates for all
using (
  public.has_role('admin') or public.has_role('recruiter')
)
with check (
  public.has_role('admin') or public.has_role('recruiter')
);

-- Temporary policy for hardcoded frontend admin login (no Supabase Auth yet).
-- WARNING: this opens write access to anon/authenticated users.
drop policy if exists "Temporary frontend admin manage updates" on public.state_updates;
create policy "Temporary frontend admin manage updates"
on public.state_updates for all
using (true)
with check (true);

drop policy if exists "Temporary frontend admin manage states" on public.states;
create policy "Temporary frontend admin manage states"
on public.states for all
using (true)
with check (true);

drop policy if exists "Temporary frontend admin manage quick stats" on public.quick_stats;
create policy "Temporary frontend admin manage quick stats"
on public.quick_stats for all
using (true)
with check (true);

drop policy if exists "Temporary frontend admin manage alliances" on public.alliances;
create policy "Temporary frontend admin manage alliances"
on public.alliances for all
using (true)
with check (true);

drop policy if exists "Temporary frontend admin manage alliance events" on public.alliance_events;
create policy "Temporary frontend admin manage alliance events"
on public.alliance_events for all
using (true)
with check (true);

drop policy if exists "Temporary frontend admin manage players" on public.players;
create policy "Temporary frontend admin manage players"
on public.players for all
using (true)
with check (true);

drop policy if exists "Admin and recruiter manage players" on public.players;
create policy "Admin and recruiter manage players"
on public.players for all
using (
  public.has_role('admin') or public.has_role('recruiter')
)
with check (
  public.has_role('admin') or public.has_role('recruiter')
);
