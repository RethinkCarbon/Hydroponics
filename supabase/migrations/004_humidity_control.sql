-- Humidity control: setpoints and device state (fogger, vent)
-- Run after 003_temperature_control.sql.

-- Add humidity setpoints to control_setpoints (single row 'climate')
alter table public.control_setpoints
  add column if not exists rh_setpoint double precision default 60,
  add column if not exists rh_high_setpoint double precision default 85,
  add column if not exists rh_deadband double precision default 3.0;

update public.control_setpoints
set rh_setpoint = 60, rh_high_setpoint = 85, rh_deadband = 3.0
where id = 'climate' and rh_setpoint is null;

-- Add humidity device state to device_state
alter table public.device_state
  add column if not exists fogger text not null default 'off' check (fogger in ('on', 'off')),
  add column if not exists vent_open text not null default 'off' check (vent_open in ('on', 'off')),
  add column if not exists last_humidity double precision;

update public.device_state
set fogger = 'off', vent_open = 'off'
where id = 'climate' and fogger is null;
