/**
 * Temperature control logic (from spec):
 * - Exhaust fan: ON when temp > Temp_Setpoint, OFF when temp <= Temp_Setpoint - deadband
 * - Cooling pad + Intake fan: ON when temp > High_Temp_Setpoint, OFF when temp <= High_Temp_Setpoint - deadband
 * In the deadband we keep previous state to avoid rapid cycling.
 */

export interface ControlSetpoints {
  temp_setpoint: number;
  high_temp_setpoint: number;
  deadband: number;
}

export interface DeviceState {
  exhaust_fan: 'on' | 'off';
  cooling_pad: 'on' | 'off';
  intake_fan: 'on' | 'off';
}

export function computeTemperatureControl(
  temperature: number,
  setpoints: ControlSetpoints,
  previous: DeviceState
): DeviceState {
  const { temp_setpoint, high_temp_setpoint, deadband } = setpoints;

  const exhaust_fan: 'on' | 'off' =
    temperature > temp_setpoint
      ? 'on'
      : temperature <= temp_setpoint - deadband
        ? 'off'
        : previous.exhaust_fan;

  const cooling_pad: 'on' | 'off' =
    temperature > high_temp_setpoint
      ? 'on'
      : temperature <= high_temp_setpoint - deadband
        ? 'off'
        : previous.cooling_pad;

  const intake_fan: 'on' | 'off' =
    temperature > high_temp_setpoint
      ? 'on'
      : temperature <= high_temp_setpoint - deadband
        ? 'off'
        : previous.intake_fan;

  return { exhaust_fan, cooling_pad, intake_fan };
}
