/**
 * Vent / Window automation (from spec):
 * - Open: temp > Vent_Temp_Setpoint OR humidity > Vent_RH_Setpoint (natural ventilation, reduce heat & humidity)
 * - Close: wind > Wind_Safe_Limit OR rain = detected (safety)
 *
 * Priority: safety first (close on wind/rain), then open on temp or RH.
 */

export interface VentSetpoints {
  vent_temp_setpoint: number;
  vent_rh_setpoint: number;
  wind_safe_limit: number;
}

export type VentState = 'on' | 'off';

export function computeVentState(
  setpoints: VentSetpoints,
  temperature: number | null,
  humidity: number | null,
  wind: number | null,
  rain: number | null
): VentState {
  const { vent_temp_setpoint, vent_rh_setpoint, wind_safe_limit } = setpoints;

  if (rain != null && rain > 0) return 'off';
  if (wind != null && wind > wind_safe_limit) return 'off';

  const openForTemp = temperature != null && temperature > vent_temp_setpoint;
  const openForRh = humidity != null && humidity > vent_rh_setpoint;
  if (openForTemp || openForRh) return 'on';

  return 'off';
}
