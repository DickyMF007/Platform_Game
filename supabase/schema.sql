-- Core tables
create table if not exists public.states (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active',
  description text,
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

-- Enable RLS
alter table public.states enable row level security;
alter table public.state_updates enable row level security;
alter table public.alliances enable row level security;
alter table public.players enable row level security;
alter table public.leaderboards enable row level security;
alter table public.registrations enable row level security;
alter table public.profiles enable row level security;

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

-- Public read policies
create policy "Public read states"
on public.states for select
using (true);

create policy "Public read published updates"
on public.state_updates for select
using (is_published = true);

create policy "Public read alliances"
on public.alliances for select
using (true);

create policy "Public read players"
on public.players for select
using (true);

create policy "Public read leaderboards"
on public.leaderboards for select
using (true);

-- Registration policies
create policy "Public insert registrations"
on public.registrations for insert
with check (status = 'pending');

create policy "Admin and recruiter read registrations"
on public.registrations for select
using (
  public.has_role('admin') or public.has_role('recruiter')
);

create policy "Admin and recruiter update registrations"
on public.registrations for update
using (
  public.has_role('admin') or public.has_role('recruiter')
)
with check (
  public.has_role('admin') or public.has_role('recruiter')
);

-- Admin content management
create policy "Admin and recruiter manage updates"
on public.state_updates for all
using (
  public.has_role('admin') or public.has_role('recruiter')
)
with check (
  public.has_role('admin') or public.has_role('recruiter')
);

create policy "Admin and recruiter manage players"
on public.players for all
using (
  public.has_role('admin') or public.has_role('recruiter')
)
with check (
  public.has_role('admin') or public.has_role('recruiter')
);
