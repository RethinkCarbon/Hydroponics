/**
 * Run flush logic: triggers (manual, EC > max, schedule) and phase sequence (drain → wait → refill → resume).
 */

import { supabase } from './supabase.js';
import {
  shouldStartFlushBySchedule,
  computeNextFlushPhase,
  type FlushPhase,
} from './flushControl.js';

export interface FlushControlInput {
  manual_start?: boolean;
  manual_stop?: boolean;
  ec?: number;
}

export async function runFlushControl(input: FlushControlInput = {}): Promise<void> {
  const now = new Date();

  const [
    { data: setpointsRow },
    { data: stateRow },
  ] = await Promise.all([
    supabase
      .from('control_setpoints')
      .select(
        'ec_max, flush_drain_duration_sec, flush_refill_duration_sec, flush_schedule_type, flush_schedule_day, flush_schedule_hour'
      )
      .eq('id', 'climate')
      .single(),
    supabase
      .from('device_state')
      .select(
        'drain_valve, flush_phase, flush_phase_started_at, last_flush_at'
      )
      .eq('id', 'climate')
      .single(),
  ]);

  const ecMax = setpointsRow?.ec_max ?? 2.2;
  const drainDurationSec = setpointsRow?.flush_drain_duration_sec ?? 300;
  const refillDurationSec = setpointsRow?.flush_refill_duration_sec ?? 120;
  const scheduleType = (setpointsRow?.flush_schedule_type ?? 'off') as 'off' | 'daily' | 'weekly';
  const scheduleDay = setpointsRow?.flush_schedule_day ?? 0;
  const scheduleHour = setpointsRow?.flush_schedule_hour ?? 8;

  let phase = (stateRow?.flush_phase ?? 'idle') as FlushPhase;
  let phaseStartedAt = stateRow?.flush_phase_started_at
    ? new Date(stateRow.flush_phase_started_at)
    : null;
  let drainValve = (stateRow?.drain_valve === 'open' ? 'open' : 'closed') as 'open' | 'closed';
  let lastFlushAt = stateRow?.last_flush_at ? new Date(stateRow.last_flush_at) : null;

  // Manual stop: force idle and close valve
  if (input.manual_stop) {
    phase = 'idle';
    drainValve = 'closed';
    phaseStartedAt = null;
    const updates = {
      id: 'climate',
      drain_valve: 'closed',
      flush_phase: 'idle',
      flush_phase_started_at: null,
      updated_at: now.toISOString(),
    };
    await supabase.from('device_state').upsert(updates, { onConflict: 'id' });
    return;
  }

  // Manual start or EC trigger or schedule: start flush when idle
  if (phase === 'idle') {
    let start = input.manual_start === true;
    if (!start && input.ec != null && input.ec > ecMax) start = true;
    if (!start && scheduleType !== 'off') {
      start = shouldStartFlushBySchedule(now, scheduleType, scheduleDay, scheduleHour, lastFlushAt);
    }
    if (start) {
      phase = 'drain';
      drainValve = 'open';
      phaseStartedAt = now;
      const updates = {
        id: 'climate',
        drain_valve: 'open',
        flush_phase: 'drain',
        flush_phase_started_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      await supabase.from('device_state').upsert(updates, { onConflict: 'id' });
      return;
    }
    // Stay idle
    const updates = {
      id: 'climate',
      drain_valve: 'closed',
      flush_phase: 'idle',
      updated_at: now.toISOString(),
    };
    await supabase.from('device_state').upsert(updates, { onConflict: 'id' });
    return;
  }

  // Advance phase by time
  const next = computeNextFlushPhase(
    now,
    phaseStartedAt,
    phase,
    drainDurationSec,
    refillDurationSec
  );

  const updates: Record<string, unknown> = {
    id: 'climate',
    drain_valve: next.drain_valve,
    flush_phase: next.phase,
    flush_phase_started_at: next.phase_started_at.toISOString(),
    updated_at: now.toISOString(),
  };
  if (next.completed) {
    updates.last_flush_at = now.toISOString();
  }
  await supabase.from('device_state').upsert(updates, { onConflict: 'id' });
}
