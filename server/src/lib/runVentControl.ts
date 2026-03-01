import { supabase } from './supabase.js';
import { computeVentState } from './ventControl.js';
import type { VentSetpoints } from './ventControl.js';

const DEFAULT_SETPOINTS: VentSetpoints = {
  vent_temp_setpoint: 26,
  vent_rh_setpoint: 80,
  wind_safe_limit: 50,
};

export interface VentControlInput {
  temperature?: number | null;
  humidity?: number | null;
  wind?: number | null;
  rain?: number | null;
}

/**
 * Run vent automation logic and persist state.
 * Open when temp or RH above setpoint; close when wind or rain unsafe.
 */
export async function runVentControl(input: VentControlInput = {}): Promise<void> {
  const [{ data: setpointsRow }, { data: stateRow }] = await Promise.all([
    supabase
      .from('control_setpoints')
      .select('vent_temp_setpoint, vent_rh_setpoint, wind_safe_limit')
      .eq('id', 'climate')
      .single(),
    supabase
      .from('device_state')
      .select('vent_open, last_temperature, last_humidity, last_wind, last_rain')
      .eq('id', 'climate')
      .single(),
  ]);

  const setpoints: VentSetpoints =
    setpointsRow?.vent_temp_setpoint != null
      ? {
          vent_temp_setpoint: setpointsRow.vent_temp_setpoint,
          vent_rh_setpoint: setpointsRow.vent_rh_setpoint ?? 80,
          wind_safe_limit: setpointsRow.wind_safe_limit ?? 50,
        }
      : DEFAULT_SETPOINTS;

  const temperature = input.temperature ?? stateRow?.last_temperature ?? null;
  const humidity = input.humidity ?? stateRow?.last_humidity ?? null;
  const wind = input.wind ?? stateRow?.last_wind ?? null;
  const rain = input.rain ?? stateRow?.last_rain ?? null;

  const next = computeVentState(setpoints, temperature, humidity, wind, rain);

  const updates: Record<string, unknown> = {
    id: 'climate',
    vent_open: next,
    updated_at: new Date().toISOString(),
  };
  if (input.temperature != null) updates.last_temperature = input.temperature;
  if (input.humidity != null) updates.last_humidity = input.humidity;
  if (input.wind != null) updates.last_wind = input.wind;
  if (input.rain != null) updates.last_rain = input.rain;

  await supabase.from('device_state').upsert(updates, { onConflict: 'id' });
}
