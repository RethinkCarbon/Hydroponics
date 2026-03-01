/**
 * Run pH control: dose up/down by range, mix → wait → recheck; only when EC stable.
 */

import { supabase } from './supabase.js';
import { isEcStable, computeNextPhPhase, type PhPhase } from './phControl.js';

export interface PhControlInput {
  ph?: number;
  ec?: number;
}

export async function runPHControl(input: PhControlInput = {}): Promise<void> {
  const now = new Date();

  const [
    { data: setpointsRow },
    { data: stateRow },
  ] = await Promise.all([
    supabase
      .from('control_setpoints')
      .select(
        'ph_min, ph_max, ph_pulse_duration_sec, ph_mixing_duration_sec, ph_stabilization_delay_sec, ph_require_ec_stable, ec_grace_minutes'
      )
      .eq('id', 'climate')
      .single(),
    supabase
      .from('device_state')
      .select(
        'last_ec, last_ec_at, last_ph, ph_dosing_up, ph_dosing_down, mixing_pump, ph_phase, ph_phase_started_at, sensor_error'
      )
      .eq('id', 'climate')
      .single(),
  ]);

  const phMin = setpointsRow?.ph_min ?? 5.5;
  const phMax = setpointsRow?.ph_max ?? 6.5;
  const pulseDurationSec = setpointsRow?.ph_pulse_duration_sec ?? 5;
  const mixingDurationSec = setpointsRow?.ph_mixing_duration_sec ?? 60;
  const stabilizationDelaySec = setpointsRow?.ph_stabilization_delay_sec ?? 120;
  const requireEcStable = setpointsRow?.ph_require_ec_stable ?? true;
  const ecGraceMinutes = setpointsRow?.ec_grace_minutes ?? 60;

  let lastPh = input.ph ?? stateRow?.last_ph ?? null;
  let lastEc = input.ec ?? stateRow?.last_ec ?? null;
  let lastEcAt = stateRow?.last_ec_at ? new Date(stateRow.last_ec_at) : null;
  if (input.ec != null) {
    lastEc = input.ec;
    lastEcAt = now;
  }

  let phase = (stateRow?.ph_phase ?? 'idle') as PhPhase;
  let phaseStartedAt = stateRow?.ph_phase_started_at
    ? new Date(stateRow.ph_phase_started_at)
    : null;

  if (input.ph != null) {
    lastPh = input.ph;
  }

  const ecStable = isEcStable(lastEcAt, requireEcStable, ecGraceMinutes, now);
  const dosingDisabled = stateRow?.sensor_error === true;

  if (!dosingDisabled && phase === 'idle' && lastPh != null && ecStable) {
    if (lastPh > phMax) {
      phase = 'dosing_down';
      phaseStartedAt = now;
    } else if (lastPh < phMin) {
      phase = 'dosing_up';
      phaseStartedAt = now;
    }
  }

  const next = computeNextPhPhase(
    now,
    phaseStartedAt,
    phase,
    pulseDurationSec,
    mixingDurationSec,
    stabilizationDelaySec
  );

  const updates: Record<string, unknown> = {
    id: 'climate',
    last_ph: lastPh,
    last_ec: lastEc,
    last_ec_at: lastEcAt?.toISOString() ?? null,
    ph_dosing_up: dosingDisabled ? 'off' : next.ph_dosing_up,
    ph_dosing_down: dosingDisabled ? 'off' : next.ph_dosing_down,
    mixing_pump: dosingDisabled ? 'off' : next.mixing_pump,
    ph_phase: next.phase,
    ph_phase_started_at: next.phase_started_at.toISOString(),
    updated_at: now.toISOString(),
  };

  await supabase.from('device_state').upsert(updates, { onConflict: 'id' });
}
