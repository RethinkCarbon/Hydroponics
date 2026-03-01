/**
 * UV lights for water treatment (from spec):
 * - UV ON when circulation pump runs
 * - UV OFF if no flow (safety interlock)
 * - Hour counter for lamp replacement
 */

/**
 * Compute UV lamp state: ON only when circulation pump is on and flow is detected.
 */
export function computeUvLamp(
  circulationPump: 'on' | 'off',
  flowOk: boolean
): 'on' | 'off' {
  return circulationPump === 'on' && flowOk ? 'on' : 'off';
}

/**
 * Add elapsed hours to the counter when UV was on (previous state). Returns new total and updated_at.
 */
export function addUvRuntime(
  currentCounterHours: number,
  counterUpdatedAt: Date | null,
  lampWasOn: boolean,
  now: Date
): { uv_hour_counter: number; uv_counter_updated_at: Date } {
  if (!lampWasOn) {
    return { uv_hour_counter: currentCounterHours, uv_counter_updated_at: now };
  }
  const from = counterUpdatedAt ?? now;
  const elapsedHours = (now.getTime() - from.getTime()) / (1000 * 60 * 60);
  return {
    uv_hour_counter: currentCounterHours + elapsedHours,
    uv_counter_updated_at: now,
  };
}
