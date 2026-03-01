-- Temperature control: setpoints and device state (exhaust fan, cooling pad, intake fan)
-- Run in Supabase SQL Editor after 001 and 002.

-- Single row of setpoints for temperature control (Temp_Setpoint, High_Temp_Setpoint, deadband °C)
create table if not exists public.control_setpoints (
  id text primary key default 'climate',
  temp_setpoint double precision not null default 24,
  high_temp_setpoint double precision not null default 28,
  deadband double precision not null default 1.0,
  updated_at timestamptz default now()
);

insert into public.control_setpoints (id, temp_setpoint, high_temp_setpoint, deadband)
values ('climate', 24, 28, 1.0)
on conflict (id) do nothing;

alter table public.control_setpoints enable row level security;

create policy "Authenticated can read setpoints"
  on public.control_setpoints for select to authenticated using (true);

-- Current device state (output of temperature control logic)
create table if not exists public.device_state (
  id text primary key default 'climate',
  exhaust_fan text not null default 'off' check (exhaust_fan in ('on', 'off')),
  cooling_pad text not null default 'off' check (cooling_pad in ('on', 'off')),
  intake_fan text not null default 'off' check (intake_fan in ('on', 'off')),
  last_temperature double precision,
  updated_at timestamptz default now()
);

insert into public.device_state (id, exhaust_fan, cooling_pad, intake_fan)
values ('climate', 'off', 'off', 'off')
on conflict (id) do nothing;

alter table public.device_state enable row level security;

create policy "Authenticated can read device_state"
  on public.device_state for select to authenticated using (true);
