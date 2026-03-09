-- Tennis court sources in West LA
create table if not exists public.court_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area text not null default 'West LA',
  address text,
  latitude double precision,
  longitude double precision,
  source_url text not null,
  booking_url text not null,
  parser_type text not null default 'generic',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Latest availability snapshots
create table if not exists public.court_availability_snapshots (
  id uuid primary key default gen_random_uuid(),
  court_source_id uuid not null references public.court_sources(id) on delete cascade,
  status text not null check (status in ('available','limited','full','unknown')),
  available_courts integer,
  total_courts integer,
  details jsonb not null default '{}'::jsonb,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_court_snapshots_source_observed_at
  on public.court_availability_snapshots (court_source_id, observed_at desc);

create index if not exists idx_court_sources_active
  on public.court_sources (is_active);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_court_sources_updated_at on public.court_sources;
create trigger trg_court_sources_updated_at
before update on public.court_sources
for each row
execute function public.set_updated_at();

-- Enable RLS on base tables
alter table public.court_sources enable row level security;
alter table public.court_availability_snapshots enable row level security;

-- Service key bypasses RLS. Keep client roles denied by default.
-- (No permissive policies for anon/authenticated on base tables.)

-- Restrict base-table grants for browser roles
revoke all on public.court_sources from anon, authenticated;
revoke all on public.court_availability_snapshots from anon, authenticated;

-- Public-safe view with latest snapshot per source
create or replace view public.public_court_availability
with (security_invoker = true)
as
select distinct on (cs.id)
  cs.id as court_source_id,
  cs.name,
  cs.area,
  cs.address,
  cs.latitude,
  cs.longitude,
  cs.source_url,
  cs.booking_url,
  cs.is_active,
  cas.status,
  cas.available_courts,
  cas.total_courts,
  cas.details,
  cas.observed_at,
  cas.created_at as snapshot_created_at
from public.court_sources cs
left join public.court_availability_snapshots cas
  on cas.court_source_id = cs.id
where cs.is_active = true
order by cs.id, cas.observed_at desc nulls last;

grant select on public.public_court_availability to anon, authenticated;

-- Seed top West LA courts (safe upsert by name)
insert into public.court_sources (name, area, address, latitude, longitude, source_url, booking_url, parser_type, is_active)
values
  ('Cheviot Hills Tennis Center', 'West LA', '2551 Motor Ave, Los Angeles, CA 90064', 34.0364, -118.4062, 'https://www.laparks.org/reccenter/cheviot-hills', 'https://www.laparks.org/sports/tennis', 'generic', true),
  ('Memorial Park Tennis Courts (Santa Monica)', 'West LA', '1401 Olympic Blvd, Santa Monica, CA 90404', 34.0230, -118.4812, 'https://www.smgov.net/Departments/CCS/content.aspx?id=53687091874', 'https://reserve.smgov.net/', 'generic', true),
  ('Beverly Hills Tennis at La Cienega Park', 'West LA', '325 S La Cienega Blvd, Beverly Hills, CA 90211', 34.0567, -118.3762, 'https://www.beverlyhills.org/departments/communityservices/recreationprogramsandservices/tennis/', 'https://beverlyhills.org/', 'generic', true),
  ('Westwood Tennis Center', 'West LA', '1350 S Sepulveda Blvd, Los Angeles, CA 90025', 34.0495, -118.4367, 'https://www.laparks.org/sports/tennis', 'https://www.laparks.org/sports/tennis', 'generic', true),
  ('Penmar Recreation Center Tennis Courts', 'West LA', '1341 Lake St, Venice, CA 90291', 33.9934, -118.4508, 'https://www.laparks.org/reccenter/penmar', 'https://www.laparks.org/sports/tennis', 'generic', true)
on conflict do nothing;