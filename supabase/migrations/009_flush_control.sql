-- Flushing / drain waste water: triggers (schedule, EC > max, manual) and sequence (drain → wait → refill → resume)
-- Run after 008.

-- Setpoints: EC max for auto-flush, drain wait duration, refill duration, schedule
alter table public.control_setpoints
  add column if not exists ec_max double precision default 2.2,
  add column if not exists flush_drain_duration_sec integer not null default 300,
  add column if not exists flush_refill_duration_sec integer not null default 120,
  add column if not exists flush_schedule_type text not null default 'off' check (flush_schedule_type in ('off', 'daily', 'weekly')),
  add column if not exists flush_schedule_day smallint default 0 check (flush_schedule_day >= 0 and flush_schedule_day <= 6),
  add column if not exists flush_schedule_hour smallint default 8 check (flush_schedule_hour >= 0 and flush_schedule_hour <= 23);

update public.control_setpoints
set
  ec_max = coalesce(ec_max, 2.2),
  flush_drain_duration_sec = coalesce(flush_drain_duration_sec, 300),
  flush_refill_duration_sec = coalesce(flush_refill_duration_sec, 120),
  flush_schedule_type = coalesce(flush_schedule_type, 'off'),
  flush_schedule_day = coalesce(flush_schedule_day, 0),
  flush_schedule_hour = coalesce(flush_schedule_hour, 8)
where id = 'climate';

-- Device state: drain valve, flush phase, last completed flush
alter table public.device_state
  add column if not exists drain_valve text not null default 'closed' check (drain_valve in ('open', 'closed')),
  add column if not exists flush_phase text not null default 'idle' check (flush_phase in ('idle', 'drain', 'wait', 'refill', 'resume')),
  add column if not exists flush_phase_started_at timestamptz,
  add column if not exists last_flush_at timestamptz;

update public.device_state
set
  drain_valve = coalesce(drain_valve, 'closed'),
  flush_phase = coalesce(flush_phase, 'idle')
where id = 'climate' and drain_valve is null;
