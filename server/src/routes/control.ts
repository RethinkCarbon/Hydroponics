import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { runCirculationTick } from '../lib/runCirculationTick.js';
import { runShadeControl } from '../lib/runShadeControl.js';
import { runVentControl } from '../lib/runVentControl.js';
import { runIrrigationControl } from '../lib/runIrrigationControl.js';
import { runFlushControl } from '../lib/runFlushControl.js';
import { runRefillControl } from '../lib/runRefillControl.js';
import { runUvControl } from '../lib/runUvControl.js';
import { runPHControl } from '../lib/runPHControl.js';
import { runSystemOverrides } from '../lib/runSystemOverrides.js';

export const controlRouter = Router();

async function createControlAlert(
  message: string,
  level: 'info' | 'warning' | 'critical' = 'info',
  device?: string
) {
  await supabase.from('alerts').insert({
    type: level,
    message,
    device: device ?? 'backend',
    acknowledged: false,
  });
}

controlRouter.post('/flush', async (req, res) => {
  try {
    const active = req.body?.active ?? req.body?.start ?? true;
    await runFlushControl(active ? { manual_start: true } : { manual_stop: true }).catch(() => {});
    await createControlAlert(
      active ? 'Manual flush started from API' : 'Manual flush stopped from API',
      'info',
      'flush-system'
    );
    res.json({ ok: true, flush_active: active });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
});

controlRouter.post('/irrigation/stop', async (req, res) => {
  try {
    await createControlAlert('Irrigation stopped from API', 'warning', 'irrigation');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
});

controlRouter.post('/emergency/stop', async (req, res) => {
  try {
    await createControlAlert('Emergency stop triggered from API', 'critical', 'system');
    res.json({ ok: true, emergency: true });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
});

controlRouter.post('/emergency/reset', async (req, res) => {
  try {
    await createControlAlert('Emergency reset from API', 'info', 'system');
    res.json({ ok: true, emergency: false });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
});

/** GET /api/control/climate/state – current device state (temp + humidity + HAF) */
controlRouter.get('/climate/state', async (_req, res) => {
  try {
    await runCirculationTick().catch(() => {});
    await runShadeControl().catch(() => {});
    await runVentControl().catch(() => {});
    await runIrrigationControl().catch(() => {});
    await runFlushControl().catch(() => {});
    await runRefillControl().catch(() => {});
    await runUvControl().catch(() => {});
    await runPHControl().catch(() => {});
    await runSystemOverrides().catch(() => {});

    const { data, error } = await supabase
      .from('device_state')
      .select('exhaust_fan, cooling_pad, intake_fan, last_temperature, fogger, vent_open, last_humidity, last_wind, last_rain, haf_fans, haf_phase_started_at, shade, last_light, irrigation_pump, irrigation_safety_stop, irrigation_phase, irrigation_phase_started_at, last_tank_level, drain_valve, flush_phase, flush_phase_started_at, last_flush_at, inlet_valve, refill_started_at, circulation_pump, flow_ok, uv_lamp, uv_hour_counter, uv_counter_updated_at, last_ec, last_ec_at, last_ph, ph_dosing_up, ph_dosing_down, mixing_pump, ph_phase, ph_phase_started_at, sensor_error, last_power_recovery_at, updated_at')
      .eq('id', 'climate')
      .single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(
      data ?? {
        exhaust_fan: 'off',
        cooling_pad: 'off',
        intake_fan: 'off',
        last_temperature: null,
        fogger: 'off',
        vent_open: 'off',
        last_humidity: null,
        haf_fans: 'off',
        haf_phase_started_at: null,
        shade: 'open',
        last_light: null,
        last_wind: null,
        last_rain: null,
        irrigation_pump: 'off',
        irrigation_safety_stop: false,
        irrigation_phase: 'off',
        irrigation_phase_started_at: null,
        last_tank_level: null,
        drain_valve: 'closed',
        flush_phase: 'idle',
        flush_phase_started_at: null,
        last_flush_at: null,
        inlet_valve: 'closed',
        refill_started_at: null,
        circulation_pump: 'off',
        flow_ok: false,
        uv_lamp: 'off',
        uv_hour_counter: 0,
        uv_counter_updated_at: null,
        last_ec: null,
        last_ec_at: null,
        last_ph: null,
        ph_dosing_up: 'off',
        ph_dosing_down: 'off',
        mixing_pump: 'off',
        ph_phase: 'idle',
        ph_phase_started_at: null,
        sensor_error: false,
        last_power_recovery_at: null,
        updated_at: null,
      }
    );
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
});

/** GET /api/control/climate/setpoints – temp + humidity setpoints */
controlRouter.get('/climate/setpoints', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('control_setpoints')
      .select('temp_setpoint, high_temp_setpoint, deadband, rh_setpoint, rh_high_setpoint, rh_deadband, haf_on_duration_sec, haf_off_duration_sec, light_setpoint, light_deadband, shade_temp_setpoint, evening_start_hour, evening_end_hour, vent_temp_setpoint, vent_rh_setpoint, wind_safe_limit, tank_level_low_low, ec_max, flush_drain_duration_sec, flush_refill_duration_sec, flush_schedule_type, flush_schedule_day, flush_schedule_hour, refill_low_setpoint, refill_high_setpoint, refill_max_duration_sec, ph_min, ph_max, ph_pulse_duration_sec, ph_mixing_duration_sec, ph_stabilization_delay_sec, ph_require_ec_stable, ec_grace_minutes, force_ventilation_temp, updated_at')
      .eq('id', 'climate')
      .single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(
      data ?? {
        temp_setpoint: 24,
        high_temp_setpoint: 28,
        deadband: 1,
        rh_setpoint: 60,
        rh_high_setpoint: 85,
        rh_deadband: 3,
        haf_on_duration_sec: 600,
        haf_off_duration_sec: 300,
        light_setpoint: 50000,
        light_deadband: 5000,
        shade_temp_setpoint: 28,
        evening_start_hour: 18,
        evening_end_hour: 6,
        vent_temp_setpoint: 26,
        vent_rh_setpoint: 80,
        wind_safe_limit: 50,
        tank_level_low_low: 10,
        ec_max: 2.2,
        flush_drain_duration_sec: 300,
        flush_refill_duration_sec: 120,
        flush_schedule_type: 'off',
        flush_schedule_day: 0,
        flush_schedule_hour: 8,
        refill_low_setpoint: 30,
        refill_high_setpoint: 90,
        refill_max_duration_sec: 1800,
        ph_min: 5.5,
        ph_max: 6.5,
        ph_pulse_duration_sec: 5,
        ph_mixing_duration_sec: 60,
        ph_stabilization_delay_sec: 120,
        ph_require_ec_stable: true,
        ec_grace_minutes: 60,
        force_ventilation_temp: 45,
        updated_at: null,
      }
    );
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
});

/** PATCH /api/control/climate/setpoints – update setpoints (body: temp_setpoint?, ... flush_drain_duration_sec?, ec_max?, flush_schedule_type?, etc.) */
controlRouter.patch('/climate/setpoints', async (req, res) => {
  try {
    const body = req.body;
    const updates: Record<string, number | string | boolean> = {};
    if (typeof body?.temp_setpoint === 'number') updates.temp_setpoint = body.temp_setpoint;
    if (typeof body?.high_temp_setpoint === 'number') updates.high_temp_setpoint = body.high_temp_setpoint;
    if (typeof body?.deadband === 'number') updates.deadband = body.deadband;
    if (typeof body?.rh_setpoint === 'number') updates.rh_setpoint = body.rh_setpoint;
    if (typeof body?.rh_high_setpoint === 'number') updates.rh_high_setpoint = body.rh_high_setpoint;
    if (typeof body?.rh_deadband === 'number') updates.rh_deadband = body.rh_deadband;
    if (typeof body?.haf_on_duration_sec === 'number') updates.haf_on_duration_sec = body.haf_on_duration_sec;
    if (typeof body?.haf_off_duration_sec === 'number') updates.haf_off_duration_sec = body.haf_off_duration_sec;
    if (typeof body?.light_setpoint === 'number') updates.light_setpoint = body.light_setpoint;
    if (typeof body?.light_deadband === 'number') updates.light_deadband = body.light_deadband;
    if (typeof body?.shade_temp_setpoint === 'number') updates.shade_temp_setpoint = body.shade_temp_setpoint;
    if (typeof body?.evening_start_hour === 'number') updates.evening_start_hour = body.evening_start_hour;
    if (typeof body?.evening_end_hour === 'number') updates.evening_end_hour = body.evening_end_hour;
    if (typeof body?.vent_temp_setpoint === 'number') updates.vent_temp_setpoint = body.vent_temp_setpoint;
    if (typeof body?.vent_rh_setpoint === 'number') updates.vent_rh_setpoint = body.vent_rh_setpoint;
    if (typeof body?.wind_safe_limit === 'number') updates.wind_safe_limit = body.wind_safe_limit;
    if (typeof body?.tank_level_low_low === 'number') updates.tank_level_low_low = body.tank_level_low_low;
    if (typeof body?.ec_max === 'number') updates.ec_max = body.ec_max;
    if (typeof body?.flush_drain_duration_sec === 'number') updates.flush_drain_duration_sec = body.flush_drain_duration_sec;
    if (typeof body?.flush_refill_duration_sec === 'number') updates.flush_refill_duration_sec = body.flush_refill_duration_sec;
    if (typeof body?.flush_schedule_type === 'string' && ['off', 'daily', 'weekly'].includes(body.flush_schedule_type)) updates.flush_schedule_type = body.flush_schedule_type;
    if (typeof body?.flush_schedule_day === 'number' && body.flush_schedule_day >= 0 && body.flush_schedule_day <= 6) updates.flush_schedule_day = body.flush_schedule_day;
    if (typeof body?.flush_schedule_hour === 'number' && body.flush_schedule_hour >= 0 && body.flush_schedule_hour <= 23) updates.flush_schedule_hour = body.flush_schedule_hour;
    if (typeof body?.refill_low_setpoint === 'number') updates.refill_low_setpoint = body.refill_low_setpoint;
    if (typeof body?.refill_high_setpoint === 'number') updates.refill_high_setpoint = body.refill_high_setpoint;
    if (typeof body?.refill_max_duration_sec === 'number') updates.refill_max_duration_sec = body.refill_max_duration_sec;
    if (typeof body?.ph_min === 'number') updates.ph_min = body.ph_min;
    if (typeof body?.ph_max === 'number') updates.ph_max = body.ph_max;
    if (typeof body?.ph_pulse_duration_sec === 'number') updates.ph_pulse_duration_sec = body.ph_pulse_duration_sec;
    if (typeof body?.ph_mixing_duration_sec === 'number') updates.ph_mixing_duration_sec = body.ph_mixing_duration_sec;
    if (typeof body?.ph_stabilization_delay_sec === 'number') updates.ph_stabilization_delay_sec = body.ph_stabilization_delay_sec;
    if (typeof body?.ph_require_ec_stable === 'boolean') updates.ph_require_ec_stable = body.ph_require_ec_stable;
    if (typeof body?.ec_grace_minutes === 'number') updates.ec_grace_minutes = body.ec_grace_minutes;
    if (typeof body?.force_ventilation_temp === 'number') updates.force_ventilation_temp = body.force_ventilation_temp;
    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        error:
          'Provide at least one of temp_setpoint, high_temp_setpoint, deadband, rh_setpoint, rh_high_setpoint, rh_deadband, haf_on_duration_sec, haf_off_duration_sec, light_setpoint, light_deadband, shade_temp_setpoint, evening_start_hour, evening_end_hour, vent_temp_setpoint, vent_rh_setpoint, wind_safe_limit, tank_level_low_low, ec_max, flush_drain_duration_sec, flush_refill_duration_sec, flush_schedule_type, flush_schedule_day, flush_schedule_hour, refill_low_setpoint, refill_high_setpoint, refill_max_duration_sec, ph_min, ph_max, ph_pulse_duration_sec, ph_mixing_duration_sec, ph_stabilization_delay_sec, ph_require_ec_stable, ec_grace_minutes, force_ventilation_temp',
      });
      return;
    }
    const { data, error } = await supabase
      .from('control_setpoints')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', 'climate')
      .select()
      .single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
});
