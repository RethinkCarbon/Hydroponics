import { supabase } from './supabase.js';
import { computeCirculationState } from './circulationControl.js';

const DEFAULT_ON_SEC = 600;
const DEFAULT_OFF_SEC = 300;

/**
 * Evaluate HAF duty cycle and update device_state if the phase should have flipped.
 * Call periodically (e.g. from GET /climate/state or a timer) so the cycle runs.
 */
export async function runCirculationTick(): Promise<void> {
  const now = new Date();

  const [{ data: setpointsRow }, { data: stateRow }] = await Promise.all([
    supabase
      .from('control_setpoints')
      .select('haf_on_duration_sec, haf_off_duration_sec')
      .eq('id', 'climate')
      .single(),
    supabase
      .from('device_state')
      .select('haf_fans, haf_phase_started_at')
      .eq('id', 'climate')
      .single(),
  ]);

  const onSec = setpointsRow?.haf_on_duration_sec ?? DEFAULT_ON_SEC;
  const offSec = setpointsRow?.haf_off_duration_sec ?? DEFAULT_OFF_SEC;
  const currentState = (stateRow?.haf_fans ?? 'off') as 'on' | 'off';
  const phaseStartedAt = stateRow?.haf_phase_started_at
    ? new Date(stateRow.haf_phase_started_at)
    : now;

  const next = computeCirculationState(now, phaseStartedAt, currentState, {
    haf_on_duration_sec: onSec,
    haf_off_duration_sec: offSec,
  });

  await supabase
    .from('device_state')
    .upsert(
      {
        id: 'climate',
        haf_fans: next.haf_fans,
        haf_phase_started_at: next.phase_started_at.toISOString(),
        updated_at: now.toISOString(),
      },
      { onConflict: 'id' }
    );
}
