-- Irrigation controller: schedule (day/night ON/OFF timing) + safety (tank low → stop)
-- Run after 007.

-- Schedule: per zone, day or night recipe (on_seconds, off_seconds)
create table if not exists public.irrigation_schedule (
  id smallint primary key,
  zone_id smallint not null default 1,
  time_condition text not null check (time_condition in ('day', 'night')),
  on_seconds integer not null,
  off_seconds integer not null,
  mode text default '1 pulse'
);

insert into public.irrigation_schedule (id, zone_id, time_condition, on_seconds, off_seconds, mode)
values
  (1, 1, 'day', 30, 240, '1 pulse'),
  (2, 1, 'night', 20, 600, '1 pulse')
on conflict (id) do nothing;

alter table public.irrigation_schedule enable row level security;
create policy "Authenticated can read irrigation_schedule"
  on public.irrigation_schedule for select to authenticated using (true);

-- Safety: tank_level <= low_low → stop irrigation
alter table public.control_setpoints
  add column if not exists tank_level_low_low double precision default 10;

update public.control_setpoints
set tank_level_low_low = coalesce(tank_level_low_low, 10)
where id = 'climate';

-- Irrigation state
alter table public.device_state
  add column if not exists irrigation_pump text not null default 'off' check (irrigation_pump in ('on', 'off')),
  add column if not exists irrigation_safety_stop boolean not null default false,
  add column if not exists irrigation_phase text not null default 'off' check (irrigation_phase in ('on', 'off')),
  add column if not exists irrigation_phase_started_at timestamptz default now(),
  add column if not exists last_tank_level double precision;

update public.device_state
set
  irrigation_pump = 'off',
  irrigation_safety_stop = coalesce(irrigation_safety_stop, false),
  irrigation_phase = 'off'
where id = 'climate' and irrigation_pump is null;
