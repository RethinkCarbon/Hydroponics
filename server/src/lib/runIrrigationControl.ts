import { supabase } from './supabase.js';
import { getIsNight, computeIrrigationPhase } from './irrigationControl.js';
import type { IrrigationRecipe } from './irrigationControl.js';

/**
 * Run irrigation logic: apply safety (tank low → stop) and duty cycle (ON/OFF from schedule).
 * Call when tank_level is ingested (to set safety) and on a timer or GET state (to advance phase).
 */
export async function runIrrigationControl(input?: { tank_level?: number }): Promise<void> {
  const now = new Date();

  const [
    { data: setpointsRow },
    { data: scheduleRows },
    { data: stateRow },
  ] = await Promise.all([
    supabase
      .from('control_setpoints')
      .select('tank_level_low_low, evening_start_hour, evening_end_hour')
      .eq('id', 'climate')
      .single(),
    supabase.from('irrigation_schedule').select('time_condition, on_seconds, off_seconds').order('id'),
    supabase
      .from('device_state')
      .select('irrigation_pump, irrigation_safety_stop, irrigation_phase, irrigation_phase_started_at, last_tank_level')
      .eq('id', 'climate')
      .single(),
  ]);

  const tankLevelLowLow = setpointsRow?.tank_level_low_low ?? 10;
  const eveningStart = setpointsRow?.evening_start_hour ?? 18;
  const eveningEnd = setpointsRow?.evening_end_hour ?? 6;

  let safetyStop = stateRow?.irrigation_safety_stop ?? false;
  let lastTankLevel = stateRow?.last_tank_level ?? null;
  if (input?.tank_level != null) {
    lastTankLevel = input.tank_level;
    if (input.tank_level <= tankLevelLowLow) safetyStop = true;
    else safetyStop = false;
  }

  const updates: Record<string, unknown> = {
    id: 'climate',
    irrigation_safety_stop: safetyStop,
    last_tank_level: lastTankLevel,
    updated_at: now.toISOString(),
  };

  if (safetyStop) {
    updates.irrigation_pump = 'off';
    updates.irrigation_phase = 'off';
    updates.irrigation_phase_started_at = now.toISOString();
    await supabase.from('device_state').upsert(updates, { onConflict: 'id' });
    return;
  }

  const isNight = getIsNight(now, eveningStart, eveningEnd);
  const timeCondition = isNight ? 'night' : 'day';
  const recipeRow = (scheduleRows ?? []).find((r: { time_condition: string }) => r.time_condition === timeCondition);
  const recipe: IrrigationRecipe = recipeRow
    ? { on_seconds: recipeRow.on_seconds, off_seconds: recipeRow.off_seconds }
    : { on_seconds: 30, off_seconds: 240 };

  const currentPhase = (stateRow?.irrigation_phase ?? 'off') as 'on' | 'off';
  const phaseStartedAt = stateRow?.irrigation_phase_started_at
    ? new Date(stateRow.irrigation_phase_started_at)
    : now;

  const next = computeIrrigationPhase(now, phaseStartedAt, currentPhase, recipe);

  updates.irrigation_pump = next.phase;
  updates.irrigation_phase = next.phase;
  updates.irrigation_phase_started_at = next.phase_started_at.toISOString();

  await supabase.from('device_state').upsert(updates, { onConflict: 'id' });
}
