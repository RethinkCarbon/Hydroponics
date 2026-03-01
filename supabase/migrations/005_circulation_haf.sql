-- Circulation fans (Horizontal Air Flow - HAF): duty cycle 10 min ON / 5 min OFF
-- Run after 004.

alter table public.control_setpoints
  add column if not exists haf_on_duration_sec integer default 600,
  add column if not exists haf_off_duration_sec integer default 300;

update public.control_setpoints
set haf_on_duration_sec = 600, haf_off_duration_sec = 300
where id = 'climate' and haf_on_duration_sec is null;

alter table public.device_state
  add column if not exists haf_fans text not null default 'off' check (haf_fans in ('on', 'off')),
  add column if not exists haf_phase_started_at timestamptz default now();

update public.device_state
set haf_fans = 'off', haf_phase_started_at = now()
where id = 'climate' and haf_fans is null;
