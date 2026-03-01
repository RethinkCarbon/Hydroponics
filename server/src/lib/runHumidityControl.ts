import { supabase } from './supabase.js';
import { computeHumidityControl } from './humidityControl.js';
import type { HumiditySetpoints, HumidityState } from './humidityControl.js';

const DEFAULT_SETPOINTS: HumiditySetpoints = {
  rh_setpoint: 60,
  rh_high_setpoint: 85,
  rh_deadband: 3,
};

const DEFAULT_STATE: HumidityState = {
  fogger: 'off',
  vent_open: 'off',
};

/** Run humidity control logic and persist device state. Call when a humidity reading is ingested. */
export async function runHumidityControl(humidity: number): Promise<void> {
  const [{ data: setpointsRow }, { data: stateRow }] = await Promise.all([
    supabase
      .from('control_setpoints')
      .select('rh_setpoint, rh_high_setpoint, rh_deadband')
      .eq('id', 'climate')
      .single(),
    supabase.from('device_state').select('fogger, vent_open').eq('id', 'climate').single(),
  ]);

  const setpoints: HumiditySetpoints =
    setpointsRow?.rh_setpoint != null
      ? {
          rh_setpoint: setpointsRow.rh_setpoint,
          rh_high_setpoint: setpointsRow.rh_high_setpoint ?? 85,
          rh_deadband: setpointsRow.rh_deadband ?? 3,
        }
      : DEFAULT_SETPOINTS;

  const previous: HumidityState =
    stateRow?.fogger != null
      ? {
          fogger: stateRow.fogger as 'on' | 'off',
          vent_open: (stateRow.vent_open ?? 'off') as 'on' | 'off',
        }
      : DEFAULT_STATE;

  const next = computeHumidityControl(humidity, setpoints, previous);

  await supabase
    .from('device_state')
    .upsert(
      {
        id: 'climate',
        fogger: next.fogger,
        vent_open: next.vent_open,
        last_humidity: humidity,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
}
