/**
 * Simple threshold checks for sensor readings.
 * When a reading crosses a threshold, we create an alert in the DB.
 */

import { supabase } from './supabase.js';

/** Safe range: alert when value < min or value > max */
const RULES: Array<{
  type: string;
  min?: number;
  max?: number;
  alertType: 'critical' | 'warning' | 'info';
  message: string;
  deviceLabel?: string;
}> = [
  { type: 'ec', min: 0.5, alertType: 'warning', message: 'EC very low – check nutrients', deviceLabel: 'ec' },
  { type: 'ec', max: 2.2, alertType: 'critical', message: 'EC drift high – consider flush', deviceLabel: 'ec' },
  { type: 'ph', min: 5.2, alertType: 'warning', message: 'pH too low', deviceLabel: 'ph' },
  { type: 'ph', max: 6.8, alertType: 'warning', message: 'pH too high', deviceLabel: 'ph' },
  { type: 'temperature', min: 15, alertType: 'warning', message: 'Temperature low', deviceLabel: 'climate' },
  { type: 'temperature', max: 32, alertType: 'critical', message: 'Temperature high – check cooling', deviceLabel: 'climate' },
  { type: 'reservoir_level', min: 20, alertType: 'warning', message: 'Reservoir level low', deviceLabel: 'reservoir' },
  { type: 'level', min: 20, alertType: 'warning', message: 'Reservoir level low', deviceLabel: 'reservoir' },
];

export async function checkThresholds(deviceId: string, type: string, value: number): Promise<void> {
  const normalizedType = type.toLowerCase().replace(/\s/g, '_');
  for (const rule of RULES) {
    if (rule.type !== normalizedType) continue;
    const outOfRange =
      (rule.min != null && value < rule.min) ||
      (rule.max != null && value > rule.max);
    if (!outOfRange) continue;

    await supabase.from('alerts').insert({
      type: rule.alertType,
      message: rule.message,
      device: rule.deviceLabel ?? deviceId,
      acknowledged: false,
    });
    break;
  }
}
