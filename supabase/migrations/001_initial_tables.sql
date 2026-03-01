-- Step 2: Initial tables (run in Supabase SQL Editor)
-- Dashboard → SQL Editor → New query → paste and Run

-- Profiles (extends Supabase auth.users; role for admin/operator)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'operator' check (role in ('admin', 'operator')),
  display_name text,
  avatar_url text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, display_name)
  values (new.id, 'operator', coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sensor readings (incoming data from devices/gateways)
create table if not exists public.sensor_readings (
  id bigint generated always as identity primary key,
  device_id text not null,
  type text not null,
  value double precision not null,
  unit text,
  created_at timestamptz default now()
);

create index if not exists idx_sensor_readings_device_created
  on public.sensor_readings (device_id, created_at desc);

alter table public.sensor_readings enable row level security;

create policy "Authenticated users can read sensor_readings"
  on public.sensor_readings for select
  to authenticated
  using (true);

-- Alerts (system alerts; dashboard + control)
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('critical', 'warning', 'info')),
  message text not null,
  device text,
  acknowledged boolean not null default false,
  action_target jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_alerts_acknowledged_created
  on public.alerts (acknowledged, created_at desc);

alter table public.alerts enable row level security;

create policy "Authenticated users can read alerts"
  on public.alerts for select
  to authenticated
  using (true);

-- Backend uses service_role key (bypasses RLS) for insert/update/delete.
