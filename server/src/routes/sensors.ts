import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { checkThresholds } from '../lib/thresholds.js';
import { runTemperatureControl } from '../lib/runTemperatureControl.js';
import { runHumidityControl } from '../lib/runHumidityControl.js';
import { runShadeControl } from '../lib/runShadeControl.js';
import { runVentControl } from '../lib/runVentControl.js';
import { runIrrigationControl } from '../lib/runIrrigationControl.js';
import { runFlushControl } from '../lib/runFlushControl.js';
import { runRefillControl } from '../lib/runRefillControl.js';
import { runUvControl } from '../lib/runUvControl.js';
import { runPHControl } from '../lib/runPHControl.js';
import { runSystemOverrides } from '../lib/runSystemOverrides.js';

export const sensorsRouter = Router();

/** POST /api/sensors/ingest – receive sensor readings (e.g. from devices/gateways) */
sensorsRouter.post('/ingest', async (req, res) => {
  try {
    const body = req.body;
    const deviceId = body?.device_id ?? body?.deviceId;
    const type = body?.type;
    const value = body?.value;

    if (!deviceId || type == null || value == null) {
      res.status(400).json({
        error: 'Missing required fields: device_id, type, value',
      });
      return;
    }

    const deviceIdStr = String(deviceId);
    const typeStr = String(type);
    const valueNum = Number(value);

    const { error } = await supabase.from('sensor_readings').insert({
      device_id: deviceIdStr,
      type: typeStr,
      value: valueNum,
      unit: body?.unit ?? null,
    });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await checkThresholds(deviceIdStr, typeStr, valueNum).catch(() => {});

    if (typeStr.toLowerCase() === 'temperature') {
      await runTemperatureControl(valueNum).catch(() => {});
      await runSystemOverrides().catch(() => {});
    }
    if (typeStr.toLowerCase() === 'humidity') {
      await runHumidityControl(valueNum).catch(() => {});
      await runVentControl({ humidity: valueNum }).catch(() => {});
    }
    if (typeStr.toLowerCase() === 'temperature') {
      await runVentControl({ temperature: valueNum }).catch(() => {});
    }
    if (typeStr.toLowerCase() === 'wind') {
      await runVentControl({ wind: valueNum }).catch(() => {});
    }
    if (typeStr.toLowerCase() === 'rain') {
      await runVentControl({ rain: valueNum }).catch(() => {});
    }
    if (typeStr.toLowerCase() === 'tank_level' || typeStr.toLowerCase() === 'reservoir_level' || typeStr.toLowerCase() === 'level') {
      await runIrrigationControl({ tank_level: valueNum }).catch(() => {});
      await runRefillControl({ tank_level: valueNum }).catch(() => {});
      await runSystemOverrides().catch(() => {});
    }
    if (typeStr.toLowerCase() === 'ec' || typeStr.toLowerCase() === 'electrical_conductivity') {
      await runFlushControl({ ec: valueNum }).catch(() => {});
      await runPHControl({ ec: valueNum }).catch(() => {});
    }
    if (typeStr.toLowerCase() === 'ph' || typeStr.toLowerCase() === 'ph_value') {
      await runPHControl({ ph: valueNum }).catch(() => {});
    }
    if (typeStr.toLowerCase() === 'sensor_error') {
      await runSystemOverrides({ sensor_error: valueNum > 0 }).catch(() => {});
    }
    if (typeStr.toLowerCase() === 'power_recovery') {
      await runSystemOverrides({ power_recovery: true }).catch(() => {});
    }
    if (typeStr.toLowerCase() === 'circulation_pump' || typeStr.toLowerCase() === 'pump') {
      await runUvControl({ circulation_pump: valueNum > 0 }).catch(() => {});
    }
    if (typeStr.toLowerCase() === 'flow') {
      await runUvControl({ flow_ok: valueNum > 0 }).catch(() => {});
    }
    if (typeStr.toLowerCase() === 'no_flow') {
      await runUvControl({ flow_ok: valueNum <= 0 }).catch(() => {});
    }
    if (typeStr.toLowerCase() === 'light') {
      await runShadeControl({ light: valueNum }).catch(() => {});
    }
    if (typeStr.toLowerCase() === 'temperature') {
      await runShadeControl({ temperature: valueNum }).catch(() => {});
    }

    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
});
