-- Refilling of clean water: level-based (low → open inlet, high → close) + timeout fail-safe
-- Run after 009.

-- Setpoints: refill low/high level (%), max refill duration (sec) for timeout
alter table public.control_setpoints
  add column if not exists refill_low_setpoint double precision default 30,
  add column if not exists refill_high_setpoint double precision default 90,
  add column if not exists refill_max_duration_sec integer not null default 1800;

update public.control_setpoints
set
  refill_low_setpoint = coalesce(refill_low_setpoint, 30),
  refill_high_setpoint = coalesce(refill_high_setpoint, 90),
  refill_max_duration_sec = coalesce(refill_max_duration_sec, 1800)
where id = 'climate';

-- Device state: inlet valve, when refill started (for timeout)
alter table public.device_state
  add column if not exists inlet_valve text not null default 'closed' check (inlet_valve in ('open', 'closed')),
  add column if not exists refill_started_at timestamptz;

update public.device_state
set inlet_valve = coalesce(inlet_valve, 'closed')
where id = 'climate' and inlet_valve is null;
