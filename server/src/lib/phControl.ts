/**
 * pH controller (from spec): keep pH within crop target range (e.g. 5.5–6.5).
 * Must run after EC stable. If pH > PH_Max → dose_ph_down; if pH < PH_Min → dose_ph_up.
 * After each pulse: Mix → Wait stabilization delay → Recheck.
 */

export type PhPhase = 'idle' | 'dosing_up' | 'dosing_down' | 'mixing' | 'waiting_stabilization';

/**
 * EC is considered stable when we have a recent EC reading (within grace period), or when we don't require it.
 */
export function isEcStable(
  lastEcAt: Date | null,
  requireEcStable: boolean,
  ecGraceMinutes: number,
  now: Date
): boolean {
  if (!requireEcStable) return true;
  if (lastEcAt == null) return false;
  const graceMs = ecGraceMinutes * 60 * 1000;
  return now.getTime() - lastEcAt.getTime() <= graceMs;
}

/**
 * Compute next pH phase and outputs from current phase and elapsed time.
 */
export function computeNextPhPhase(
  now: Date,
  phaseStartedAt: Date | null,
  currentPhase: PhPhase,
  pulseDurationSec: number,
  mixingDurationSec: number,
  stabilizationDelaySec: number
): {
  phase: PhPhase;
  phase_started_at: Date;
  ph_dosing_up: 'on' | 'off';
  ph_dosing_down: 'on' | 'off';
  mixing_pump: 'on' | 'off';
} {
  const started = phaseStartedAt ?? now;
  const elapsedSec = (now.getTime() - started.getTime()) / 1000;

  switch (currentPhase) {
    case 'idle':
      return {
        phase: 'idle',
        phase_started_at: started,
        ph_dosing_up: 'off',
        ph_dosing_down: 'off',
        mixing_pump: 'off',
      };
    case 'dosing_up':
      if (elapsedSec >= pulseDurationSec) {
        return {
          phase: 'mixing',
          phase_started_at: now,
          ph_dosing_up: 'off',
          ph_dosing_down: 'off',
          mixing_pump: 'on',
        };
      }
      return {
        phase: 'dosing_up',
        phase_started_at: started,
        ph_dosing_up: 'on',
        ph_dosing_down: 'off',
        mixing_pump: 'off',
      };
    case 'dosing_down':
      if (elapsedSec >= pulseDurationSec) {
        return {
          phase: 'mixing',
          phase_started_at: now,
          ph_dosing_up: 'off',
          ph_dosing_down: 'off',
          mixing_pump: 'on',
        };
      }
      return {
        phase: 'dosing_down',
        phase_started_at: started,
        ph_dosing_up: 'off',
        ph_dosing_down: 'on',
        mixing_pump: 'off',
      };
    case 'mixing':
      if (elapsedSec >= mixingDurationSec) {
        return {
          phase: 'waiting_stabilization',
          phase_started_at: now,
          ph_dosing_up: 'off',
          ph_dosing_down: 'off',
          mixing_pump: 'off',
        };
      }
      return {
        phase: 'mixing',
        phase_started_at: started,
        ph_dosing_up: 'off',
        ph_dosing_down: 'off',
        mixing_pump: 'on',
      };
    case 'waiting_stabilization':
      if (elapsedSec >= stabilizationDelaySec) {
        return {
          phase: 'idle',
          phase_started_at: now,
          ph_dosing_up: 'off',
          ph_dosing_down: 'off',
          mixing_pump: 'off',
        };
      }
      return {
        phase: 'waiting_stabilization',
        phase_started_at: started,
        ph_dosing_up: 'off',
        ph_dosing_down: 'off',
        mixing_pump: 'off',
      };
    default:
      return {
        phase: 'idle',
        phase_started_at: now,
        ph_dosing_up: 'off',
        ph_dosing_down: 'off',
        mixing_pump: 'off',
      };
  }
}
