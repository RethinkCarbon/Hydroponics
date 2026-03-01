/**
 * Humidity control logic (from spec):
 *
 * 1. Humidification (Fogger):
 *    - Fogger ON when humidity < RH_Setpoint
 *    - Fogger OFF when humidity >= RH_Setpoint + deadband (3% default)
 *
 * 2. Dehumidification (Vent):
 *    - Vent OPEN when humidity > RH_High_Setpoint
 *    - Vent CLOSE when humidity <= RH_High_Setpoint - deadband
 *
 * In the deadband we keep previous state to avoid rapid cycling.
 */

export interface HumiditySetpoints {
  rh_setpoint: number;
  rh_high_setpoint: number;
  rh_deadband: number;
}

export interface HumidityState {
  fogger: 'on' | 'off';
  vent_open: 'on' | 'off';
}

export function computeHumidityControl(
  humidity: number,
  setpoints: HumiditySetpoints,
  previous: HumidityState
): HumidityState {
  const { rh_setpoint, rh_high_setpoint, rh_deadband } = setpoints;

  const fogger: 'on' | 'off' =
    humidity < rh_setpoint
      ? 'on'
      : humidity >= rh_setpoint + rh_deadband
        ? 'off'
        : previous.fogger;

  const vent_open: 'on' | 'off' =
    humidity > rh_high_setpoint
      ? 'on'
      : humidity <= rh_high_setpoint - rh_deadband
        ? 'off'
        : previous.vent_open;

  return { fogger, vent_open };
}
