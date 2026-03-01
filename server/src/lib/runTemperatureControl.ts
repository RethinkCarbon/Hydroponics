import { supabase } from './supabase.js';
import { computeTemperatureControl } from './temperatureControl.js';
import type { ControlSetpoints, DeviceState } from './temperatureControl.js';

const DEFAULT_SETPOINTS: ControlSetpoints = {
  temp_setpoint: 24,
  high_temp_setpoint: 28,
  deadband: 1,
};

const DEFAULT_STATE: DeviceState = {
  exhaust_fan: 'off',
  cooling_pad: 'off',
  intake_fan: 'off',
};

/** Run temperature control logic and persist device state. Call when a temperature reading is ingested. */
export async function runTemperatureControl(temperature: number): Promise<void> {
  const [{ data: setpointsRow }, { data: stateRow }] = await Promise.all([
    supabase.from('control_setpoints').select('temp_setpoint, high_temp_setpoint, deadband').eq('id', 'climate').single(),
    supabase.from('device_state').select('exhaust_fan, cooling_pad, intake_fan').eq('id', 'climate').single(),
  ]);

  const setpoints: ControlSetpoints = setpointsRow
    ? {
        temp_setpoint: setpointsRow.temp_setpoint,
        high_temp_setpoint: setpointsRow.high_temp_setpoint,
        deadband: setpointsRow.deadband,
      }
    : DEFAULT_SETPOINTS;

  const previous: DeviceState = stateRow
    ? {
        exhaust_fan: stateRow.exhaust_fan as 'on' | 'off',
        cooling_pad: stateRow.cooling_pad as 'on' | 'off',
        intake_fan: stateRow.intake_fan as 'on' | 'off',
      }
    : DEFAULT_STATE;

  const next = computeTemperatureControl(temperature, setpoints, previous);

  await supabase
    .from('device_state')
    .upsert(
      {
        id: 'climate',
        exhaust_fan: next.exhaust_fan,
        cooling_pad: next.cooling_pad,
        intake_fan: next.intake_fan,
        last_temperature: temperature,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
}
