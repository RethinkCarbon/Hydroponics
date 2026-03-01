/**
 * Run refill logic: open inlet when level <= low, close when level >= high or timeout.
 */

import { supabase } from './supabase.js';
import { computeInletValve } from './refillControl.js';

export async function runRefillControl(input?: { tank_level?: number }): Promise<void> {
  const now = new Date();

  const [
    { data: setpointsRow },
    { data: stateRow },
  ] = await Promise.all([
    supabase
      .from('control_setpoints')
      .select('refill_low_setpoint, refill_high_setpoint, refill_max_duration_sec')
      .eq('id', 'climate')
      .single(),
    supabase
      .from('device_state')
      .select('inlet_valve, refill_started_at, last_tank_level')
      .eq('id', 'climate')
      .single(),
  ]);

  const lowSetpoint = setpointsRow?.refill_low_setpoint ?? 30;
  const highSetpoint = setpointsRow?.refill_high_setpoint ?? 90;
  const maxDurationSec = setpointsRow?.refill_max_duration_sec ?? 1800;

  const currentValve = (stateRow?.inlet_valve === 'open' ? 'open' : 'closed') as 'open' | 'closed';
  const refillStartedAt = stateRow?.refill_started_at
    ? new Date(stateRow.refill_started_at)
    : null;
  const tankLevel = input?.tank_level ?? stateRow?.last_tank_level ?? null;

  const next = computeInletValve(
    tankLevel,
    currentValve,
    refillStartedAt,
    now,
    lowSetpoint,
    highSetpoint,
    maxDurationSec
  );

  const updates: Record<string, unknown> = {
    id: 'climate',
    inlet_valve: next.inlet_valve,
    refill_started_at: next.refill_started_at?.toISOString() ?? null,
    updated_at: now.toISOString(),
  };
  if (input?.tank_level != null) {
    updates.last_tank_level = input.tank_level;
  }
  await supabase.from('device_state').upsert(updates, { onConflict: 'id' });
}
