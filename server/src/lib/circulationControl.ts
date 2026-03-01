/**
 * Circulation fans (HAF - Horizontal Air Flow) logic:
 * Duty cycle: ON for on_duration_sec (default 600 = 10 min), OFF for off_duration_sec (default 300 = 5 min).
 * Equalize temperature & humidity, prevent condensation, improve transpiration.
 */

export interface CirculationSetpoints {
  haf_on_duration_sec: number;
  haf_off_duration_sec: number;
}

export interface CirculationState {
  haf_fans: 'on' | 'off';
  haf_phase_started_at: Date;
}

/**
 * Given current time, when the phase started, current state, and durations,
 * return the state we should be in now (flip if the current phase has lasted long enough).
 */
export function computeCirculationState(
  now: Date,
  phaseStartedAt: Date,
  currentState: 'on' | 'off',
  setpoints: CirculationSetpoints
): { haf_fans: 'on' | 'off'; phase_started_at: Date } {
  const elapsedSec = (now.getTime() - phaseStartedAt.getTime()) / 1000;
  const { haf_on_duration_sec, haf_off_duration_sec } = setpoints;

  if (currentState === 'on') {
    if (elapsedSec >= haf_on_duration_sec) {
      return { haf_fans: 'off', phase_started_at: now };
    }
    return { haf_fans: 'on', phase_started_at: phaseStartedAt };
  }

  if (elapsedSec >= haf_off_duration_sec) {
    return { haf_fans: 'on', phase_started_at: now };
  }
  return { haf_fans: 'off', phase_started_at: phaseStartedAt };
}
