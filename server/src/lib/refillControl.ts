/**
 * Refill control (from spec): maintain reservoir volume.
 * - Level <= low → inlet valve OPEN
 * - Level >= high → inlet valve CLOSE
 * - Refill time > max_duration → inlet CLOSE (fail-safe)
 */

/**
 * Compute whether inlet valve should be open or closed.
 * When opening, refill_started_at is set to now; when closing (for any reason), clear it.
 */
export function computeInletValve(
  tankLevel: number | null,
  currentValve: 'open' | 'closed',
  refillStartedAt: Date | null,
  now: Date,
  lowSetpoint: number,
  highSetpoint: number,
  maxDurationSec: number
): { inlet_valve: 'open' | 'closed'; refill_started_at: Date | null } {
  // Timeout fail-safe: if valve has been open too long, close
  if (currentValve === 'open' && refillStartedAt) {
    const elapsedSec = (now.getTime() - refillStartedAt.getTime()) / 1000;
    if (elapsedSec > maxDurationSec) {
      return { inlet_valve: 'closed', refill_started_at: null };
    }
  }

  if (tankLevel == null) {
    return {
      inlet_valve: currentValve,
      refill_started_at: currentValve === 'open' ? refillStartedAt : null,
    };
  }

  if (tankLevel <= lowSetpoint) {
    return {
      inlet_valve: 'open',
      refill_started_at: currentValve === 'open' ? refillStartedAt : now,
    };
  }
  if (tankLevel >= highSetpoint) {
    return { inlet_valve: 'closed', refill_started_at: null };
  }

  // Between low and high: keep current state
  return {
    inlet_valve: currentValve,
    refill_started_at: currentValve === 'open' ? refillStartedAt : null,
  };
}
