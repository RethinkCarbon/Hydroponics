-- Light / Shading control: light-based, temperature override, evening rule
-- Run after 005.

alter table public.control_setpoints
  add column if not exists light_setpoint double precision default 50000,
  add column if not exists light_deadband double precision default 5000,
  add column if not exists shade_temp_setpoint double precision default 28,
  add column if not exists evening_start_hour integer default 18,
  add column if not exists evening_end_hour integer default 6;

update public.control_setpoints
set
  light_setpoint = coalesce(light_setpoint, 50000),
  light_deadband = coalesce(light_deadband, 5000),
  shade_temp_setpoint = coalesce(shade_temp_setpoint, 28),
  evening_start_hour = coalesce(evening_start_hour, 18),
  evening_end_hour = coalesce(evening_end_hour, 6)
where id = 'climate';

alter table public.device_state
  add column if not exists shade text not null default 'open' check (shade in ('open', 'closed')),
  add column if not exists last_light double precision;

update public.device_state
set shade = 'open'
where id = 'climate' and shade is null;
