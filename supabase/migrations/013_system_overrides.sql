-- System-wide overrides (override everything): low_low → stop all pumps; temp > 45 → force ventilation; sensor_error → disable dosing; power_recovery → self-check
-- Run after 012.

-- Setpoints: temperature above which we force ventilation
alter table public.control_setpoints
  add column if not exists force_ventilation_temp double precision default 45;

update public.control_setpoints
set force_ventilation_temp = coalesce(force_ventilation_temp, 45)
where id = 'climate';

-- Device state: sensor error flag (disable dosing), last power recovery (for self-check)
alter table public.device_state
  add column if not exists sensor_error boolean not null default false,
  add column if not exists last_power_recovery_at timestamptz;

update public.device_state
set sensor_error = coalesce(sensor_error, false)
where id = 'climate' and sensor_error is null;
