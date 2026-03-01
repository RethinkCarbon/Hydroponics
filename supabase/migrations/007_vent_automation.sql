-- Vent / Window automation: open on high temp or RH, close on wind/rain
-- Run after 006.

alter table public.control_setpoints
  add column if not exists vent_temp_setpoint double precision default 26,
  add column if not exists vent_rh_setpoint double precision default 80,
  add column if not exists wind_safe_limit double precision default 50;

update public.control_setpoints
set
  vent_temp_setpoint = coalesce(vent_temp_setpoint, 26),
  vent_rh_setpoint = coalesce(vent_rh_setpoint, 80),
  wind_safe_limit = coalesce(wind_safe_limit, 50)
where id = 'climate';

alter table public.device_state
  add column if not exists last_wind double precision,
  add column if not exists last_rain double precision default 0;
