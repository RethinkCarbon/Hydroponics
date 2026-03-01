/**
 * Light / Shading control (from spec):
 *
 * 1. Light-based:
 *    - Shade CLOSE when light > Light_Setpoint
 *    - Shade OPEN when light <= Light_Setpoint - deadband
 *    - Hysteresis in between: keep previous
 *
 * 2. Temperature override:
 *    - Shade CLOSE when temperature > Shade_Temp_Setpoint (reduce heat stress)
 *
 * 3. Evening rule (time-based):
 *    - Shade OPEN when night (between evening_start_hour and evening_end_hour)
 *
 * Priority: evening (open) > temp override (close) > light-based
 */

export interface ShadeSetpoints {
  light_setpoint: number;
  light_deadband: number;
  shade_temp_setpoint: number;
  evening_start_hour: number;
  evening_end_hour: number;
}

export type ShadeState = 'open' | 'closed';

function isNight(now: Date, startHour: number, endHour: number): boolean {
  const h = now.getHours();
  if (startHour > endHour) {
    return h >= startHour || h < endHour;
  }
  return h >= startHour && h < endHour;
}

export function computeShadeState(
  now: Date,
  setpoints: ShadeSetpoints,
  previousShade: ShadeState,
  light: number | null,
  temperature: number | null
): ShadeState {
  const { light_setpoint, light_deadband, shade_temp_setpoint, evening_start_hour, evening_end_hour } = setpoints;

  if (isNight(now, evening_start_hour, evening_end_hour)) {
    return 'open';
  }

  if (temperature != null && temperature > shade_temp_setpoint) {
    return 'closed';
  }

  if (light != null) {
    if (light > light_setpoint) return 'closed';
    if (light <= light_setpoint - light_deadband) return 'open';
  }

  return previousShade;
}
