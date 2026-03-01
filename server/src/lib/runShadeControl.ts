import { supabase } from './supabase.js';
import { computeShadeState } from './shadeControl.js';
import type { ShadeSetpoints } from './shadeControl.js';

const DEFAULT_SETPOINTS: ShadeSetpoints = {
  light_setpoint: 50000,
  light_deadband: 5000,
  shade_temp_setpoint: 28,
  evening_start_hour: 18,
  evening_end_hour: 6,
};

export interface ShadeControlInput {
  light?: number | null;
  temperature?: number | null;
}

/**
 * Run shade logic and persist state. Call when light or temperature is ingested, or on a tick for evening rule.
 * Pass the latest sensor values; we also read last_light and last_temperature from state for hysteresis when only one is updated.
 */
export async function runShadeControl(input: ShadeControlInput = {}): Promise<void> {
  const now = new Date();

  const [{ data: setpointsRow }, { data: stateRow }] = await Promise.all([
    supabase
      .from('control_setpoints')
      .select('light_setpoint, light_deadband, shade_temp_setpoint, evening_start_hour, evening_end_hour')
      .eq('id', 'climate')
      .single(),
    supabase
      .from('device_state')
      .select('shade, last_light, last_temperature')
      .eq('id', 'climate')
      .single(),
  ]);

  const setpoints: ShadeSetpoints =
    setpointsRow?.light_setpoint != null
      ? {
          light_setpoint: setpointsRow.light_setpoint,
          light_deadband: setpointsRow.light_deadband ?? 5000,
          shade_temp_setpoint: setpointsRow.shade_temp_setpoint ?? 28,
          evening_start_hour: setpointsRow.evening_start_hour ?? 18,
          evening_end_hour: setpointsRow.evening_end_hour ?? 6,
        }
      : DEFAULT_SETPOINTS;

  const previousShade = (stateRow?.shade ?? 'open') as 'open' | 'closed';
  const lastLight = input.light ?? stateRow?.last_light ?? null;
  const lastTemp = input.temperature ?? stateRow?.last_temperature ?? null;

  const nextShade = computeShadeState(now, setpoints, previousShade, lastLight, lastTemp);

  const updates: Record<string, unknown> = {
    id: 'climate',
    shade: nextShade,
    updated_at: now.toISOString(),
  };
  if (input.light != null) updates.last_light = input.light;
  if (input.temperature != null) updates.last_temperature = input.temperature;

  await supabase.from('device_state').upsert(updates, { onConflict: 'id' });
}
