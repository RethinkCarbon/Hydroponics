-- pH controller: dose up/down by range (PH_Min, PH_Max), mix → wait → recheck; must run after EC stable
-- Run after 011.

-- Setpoints: pH range, pulse duration, mixing and stabilization delay, EC prerequisite
alter table public.control_setpoints
  add column if not exists ph_min double precision default 5.5,
  add column if not exists ph_max double precision default 6.5,
  add column if not exists ph_pulse_duration_sec integer not null default 5,
  add column if not exists ph_mixing_duration_sec integer not null default 60,
  add column if not exists ph_stabilization_delay_sec integer not null default 120,
  add column if not exists ph_require_ec_stable boolean not null default true,
  add column if not exists ec_grace_minutes integer not null default 60;

update public.control_setpoints
set
  ph_min = coalesce(ph_min, 5.5),
  ph_max = coalesce(ph_max, 6.5),
  ph_pulse_duration_sec = coalesce(ph_pulse_duration_sec, 5),
  ph_mixing_duration_sec = coalesce(ph_mixing_duration_sec, 60),
  ph_stabilization_delay_sec = coalesce(ph_stabilization_delay_sec, 120),
  ph_require_ec_stable = coalesce(ph_require_ec_stable, true),
  ec_grace_minutes = coalesce(ec_grace_minutes, 60)
where id = 'climate';

-- Device state: last EC (for stability), last pH, dosing pumps, mixing pump, phase
alter table public.device_state
  add column if not exists last_ec double precision,
  add column if not exists last_ec_at timestamptz,
  add column if not exists last_ph double precision,
  add column if not exists ph_dosing_up text not null default 'off' check (ph_dosing_up in ('on', 'off')),
  add column if not exists ph_dosing_down text not null default 'off' check (ph_dosing_down in ('on', 'off')),
  add column if not exists mixing_pump text not null default 'off' check (mixing_pump in ('on', 'off')),
  add column if not exists ph_phase text not null default 'idle' check (ph_phase in ('idle', 'dosing_up', 'dosing_down', 'mixing', 'waiting_stabilization')),
  add column if not exists ph_phase_started_at timestamptz;

update public.device_state
set
  ph_dosing_up = coalesce(ph_dosing_up, 'off'),
  ph_dosing_down = coalesce(ph_dosing_down, 'off'),
  mixing_pump = coalesce(mixing_pump, 'off'),
  ph_phase = coalesce(ph_phase, 'idle')
where id = 'climate' and ph_dosing_up is null;
