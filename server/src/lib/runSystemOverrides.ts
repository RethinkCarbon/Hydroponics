/**
 * System-wide overrides (from spec: "These override everything").
 * Run after all other controls so overrides take precedence.
 *
 * - tank_level <= low_low → stop_all_pumps (irrigation, dosing, mixing, refill inlet)
 * - temp > force_ventilation_temp → force_ventilation (vent, exhaust, cooling, intake)
 * - sensor_error → disable_dosing (ph dosing + mixing off)
 * - power_recovery → system_self_check (clear sensor_error, record timestamp)
 */

import { supabase } from './supabase.js';

export interface SystemOverridesInput {
  sensor_error?: boolean;
  power_recovery?: boolean;
}

export async function runSystemOverrides(input: SystemOverridesInput = {}): Promise<void> {
  const now = new Date();

  const [
    { data: setpointsRow },
    { data: stateRow },
  ] = await Promise.all([
    supabase
      .from('control_setpoints')
      .select('tank_level_low_low, force_ventilation_temp')
      .eq('id', 'climate')
      .single(),
    supabase
      .from('device_state')
      .select(
        'last_tank_level, last_temperature, sensor_error, irrigation_pump, ph_dosing_up, ph_dosing_down, mixing_pump, inlet_valve, vent_open, exhaust_fan, cooling_pad, intake_fan'
      )
      .eq('id', 'climate')
      .single(),
  ]);

  const lowLow = setpointsRow?.tank_level_low_low ?? 10;
  const forceVentTemp = setpointsRow?.force_ventilation_temp ?? 45;

  const lastTankLevel = stateRow?.last_tank_level ?? null;
  const lastTemperature = stateRow?.last_temperature ?? null;
  let sensorError = stateRow?.sensor_error ?? false;
  if (input.sensor_error !== undefined) sensorError = input.sensor_error;

  const lowLowActive = lastTankLevel != null && lastTankLevel <= lowLow;
  const forceVentActive = lastTemperature != null && lastTemperature > forceVentTemp;

  const updates: Record<string, unknown> = {
    id: 'climate',
    updated_at: now.toISOString(),
  };

  if (input.sensor_error !== undefined) {
    updates.sensor_error = input.sensor_error;
  }

  if (input.power_recovery) {
    updates.last_power_recovery_at = now.toISOString();
    updates.sensor_error = false;
  }

  if (lowLowActive) {
    updates.irrigation_pump = 'off';
    updates.irrigation_safety_stop = true;
    updates.ph_dosing_up = 'off';
    updates.ph_dosing_down = 'off';
    updates.mixing_pump = 'off';
    updates.inlet_valve = 'closed';
  }

  if (forceVentActive) {
    updates.vent_open = 'on';
    updates.exhaust_fan = 'on';
    updates.cooling_pad = 'on';
    updates.intake_fan = 'on';
  }

  if (sensorError) {
    updates.ph_dosing_up = 'off';
    updates.ph_dosing_down = 'off';
    updates.mixing_pump = 'off';
  }

  await supabase.from('device_state').upsert(updates, { onConflict: 'id' });
}
