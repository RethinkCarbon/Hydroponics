/**
 * Flush control (from spec): drain waste water.
 * Triggers: schedule (daily/weekly), EC > EC_Max, manual.
 * Sequence: drain valve OPEN → wait X sec → refill → resume normal.
 */

export type FlushPhase = 'idle' | 'drain' | 'wait' | 'refill' | 'resume';

const RESUME_DURATION_SEC = 10;

/**
 * True if schedule says we should start a flush now (only when idle).
 * weekly: last_flush_at + 7 days <= now (or never flushed and we're at/past schedule hour on schedule day).
 * daily: last_flush_at + 1 day <= now (or never flushed and we're at/past schedule hour).
 */
export function shouldStartFlushBySchedule(
  now: Date,
  scheduleType: 'off' | 'daily' | 'weekly',
  scheduleDay: number,
  scheduleHour: number,
  lastFlushAt: Date | null
): boolean {
  if (scheduleType === 'off') return false;
  const neverFlushed = lastFlushAt == null;
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 Sun .. 6 Sat
  const atOrPastScheduledTime =
    hour > scheduleHour || (hour === scheduleHour && now.getMinutes() >= 0);
  const onScheduledDay = scheduleType === 'daily' || dayOfWeek === scheduleDay;

  if (scheduleType === 'daily') {
    if (neverFlushed) return onScheduledDay && atOrPastScheduledTime;
    const dayMs = 24 * 60 * 60 * 1000;
    return onScheduledDay && atOrPastScheduledTime && now.getTime() - lastFlushAt.getTime() >= dayMs;
  }
  // weekly
  if (neverFlushed) return onScheduledDay && atOrPastScheduledTime;
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return onScheduledDay && atOrPastScheduledTime && now.getTime() - lastFlushAt.getTime() >= weekMs;
}

/**
 * Compute next flush phase from current phase and elapsed time.
 * Returns next phase, phase_started_at, drain_valve, and whether we just completed (so caller can set last_flush_at).
 */
export function computeNextFlushPhase(
  now: Date,
  phaseStartedAt: Date | null,
  currentPhase: FlushPhase,
  drainDurationSec: number,
  refillDurationSec: number
): {
  phase: FlushPhase;
  phase_started_at: Date;
  drain_valve: 'open' | 'closed';
  completed: boolean;
} {
  const started = phaseStartedAt ?? now;
  const elapsedSec = (now.getTime() - started.getTime()) / 1000;

  switch (currentPhase) {
    case 'idle':
      return { phase: 'idle', phase_started_at: started, drain_valve: 'closed', completed: false };
    case 'drain':
      // Move to wait immediately on next tick (valve already open)
      return { phase: 'wait', phase_started_at: now, drain_valve: 'open', completed: false };
    case 'wait':
      if (elapsedSec >= drainDurationSec) {
        return { phase: 'refill', phase_started_at: now, drain_valve: 'closed', completed: false };
      }
      return { phase: 'wait', phase_started_at: started, drain_valve: 'open', completed: false };
    case 'refill':
      if (elapsedSec >= refillDurationSec) {
        return { phase: 'resume', phase_started_at: now, drain_valve: 'closed', completed: false };
      }
      return { phase: 'refill', phase_started_at: started, drain_valve: 'closed', completed: false };
    case 'resume':
      if (elapsedSec >= RESUME_DURATION_SEC) {
        return { phase: 'idle', phase_started_at: now, drain_valve: 'closed', completed: true };
      }
      return { phase: 'resume', phase_started_at: started, drain_valve: 'closed', completed: false };
    default:
      return { phase: 'idle', phase_started_at: now, drain_valve: 'closed', completed: false };
  }
}
