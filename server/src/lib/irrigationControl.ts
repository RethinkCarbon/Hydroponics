/**
 * Irrigation controller (from spec):
 * - Timer schedule: ON x seconds, OFF y seconds (pulse).
 * - Day vs night: different recipe (day: 30s on / 4 min off; night: 20s on / 10 min off).
 * - Safety: if tank_level <= low_low → stop pump.
 */

export interface IrrigationRecipe {
  on_seconds: number;
  off_seconds: number;
}

export function getIsNight(now: Date, eveningStartHour: number, eveningEndHour: number): boolean {
  const h = now.getHours();
  if (eveningStartHour > eveningEndHour) return h >= eveningStartHour || h < eveningEndHour;
  return h >= eveningStartHour && h < eveningEndHour;
}

/**
 * Given current time, phase start, current phase, and recipe, return next phase and phase_started_at.
 */
export function computeIrrigationPhase(
  now: Date,
  phaseStartedAt: Date,
  currentPhase: 'on' | 'off',
  recipe: IrrigationRecipe
): { phase: 'on' | 'off'; phase_started_at: Date } {
  const elapsedSec = (now.getTime() - phaseStartedAt.getTime()) / 1000;
  const { on_seconds, off_seconds } = recipe;

  if (currentPhase === 'on') {
    if (elapsedSec >= on_seconds) return { phase: 'off', phase_started_at: now };
    return { phase: 'on', phase_started_at: phaseStartedAt };
  }
  if (elapsedSec >= off_seconds) return { phase: 'on', phase_started_at: now };
  return { phase: 'off', phase_started_at: phaseStartedAt };
}
