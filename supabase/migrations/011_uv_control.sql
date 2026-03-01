-- UV lights for water treatment: ON when circulation pump runs, OFF if no flow; hour counter for lamp replacement
-- Run after 010.

-- Device state: circulation pump (from sensor/API), flow detected, UV lamp, hour counter
alter table public.device_state
  add column if not exists circulation_pump text not null default 'off' check (circulation_pump in ('on', 'off')),
  add column if not exists flow_ok boolean not null default false,
  add column if not exists uv_lamp text not null default 'off' check (uv_lamp in ('on', 'off')),
  add column if not exists uv_hour_counter double precision not null default 0,
  add column if not exists uv_counter_updated_at timestamptz;

update public.device_state
set
  circulation_pump = coalesce(circulation_pump, 'off'),
  flow_ok = coalesce(flow_ok, false),
  uv_lamp = coalesce(uv_lamp, 'off')
where id = 'climate' and circulation_pump is null;
