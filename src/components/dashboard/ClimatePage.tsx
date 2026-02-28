import { useState, useEffect } from 'react';
import { Thermometer, Droplets, Wind, Fan, CloudFog, ArrowUpRight, Power, Timer } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { GreenhouseState } from '@/types/greenhouse';

interface ClimatePageProps {
  state: GreenhouseState;
  actions: {
    toggleDevice: (deviceId: string, deviceType: 'ventilation') => void;
    updateSetpoint: (parameter: string, value: number) => void;
    setVentPosition: (position: number) => void;
    setTemperatureMode: (mode: 'auto' | 'manual') => void;
    setHumidityMode: (mode: 'auto' | 'manual') => void;
    setCirculationMode: (mode: 'continuous' | 'duty_cycle') => void;
  };
}

export function ClimatePage({ state, actions }: ClimatePageProps) {
  const [tempTarget, setTempTarget] = useState(state.climateSetpoints.temperature.target);
  const [humidityTarget, setHumidityTarget] = useState(state.climateSetpoints.humidity.target);
  const [ventPosition, setVentPosition] = useState(state.ventilation.roofVentPosition);

  useEffect(() => {
    setTempTarget(state.climateSetpoints.temperature.target);
    setHumidityTarget(state.climateSetpoints.humidity.target);
    setVentPosition(state.ventilation.roofVentPosition);
  }, [state.climateSetpoints.temperature.target, state.climateSetpoints.humidity.target, state.ventilation.roofVentPosition]);

  const handleTempChange = (value: number[]) => {
    setTempTarget(value[0]);
    actions.updateSetpoint('temperature', value[0]);
  };

  const handleHumidityChange = (value: number[]) => {
    setHumidityTarget(value[0]);
    actions.updateSetpoint('humidity', value[0]);
  };

  const handleVentChange = (value: number[]) => {
    setVentPosition(value[0]);
    actions.setVentPosition(value[0]);
  };

  return (
    <div className="p-0 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Climate Control</h2>
        <p className="text-slate-500 mt-1">Temperature, humidity and ventilation management</p>
      </div>

      {/* Current Readings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="panel p-4 text-center">
          <Thermometer className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-slate-900">{state.climate.airTemperature.value.toFixed(1)}°C</p>
          <p className="text-xs text-slate-500 mt-1">Air Temperature</p>
        </div>
        <div className="panel p-4 text-center">
          <Droplets className="w-6 h-6 text-teal-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-slate-900">{state.climate.humidity.value.toFixed(0)}%</p>
          <p className="text-xs text-slate-500 mt-1">Humidity</p>
        </div>
        <div className="panel p-4 text-center">
          <Wind className="w-6 h-6 text-slate-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-slate-900">{state.ventilation.roofVentPosition}%</p>
          <p className="text-xs text-slate-500 mt-1">Vent Position</p>
        </div>
        <div className="panel p-4 text-center">
          <Fan className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-slate-900">
            {state.ventilation.circulationFan.status === 'on' ? 'ON' : 'OFF'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Circulation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Temperature Control */}
        <div className="panel p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Temperature Control</h3>
                <p className="text-xs text-slate-500">Air temperature management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Auto</span>
              <Switch
                checked={state.climateSetpoints.temperature.mode === 'auto'}
                onCheckedChange={(checked) => actions.setTemperatureMode(checked ? 'auto' : 'manual')}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">Target Temperature</span>
                <span className="text-lg font-bold text-teal-600">{Math.round(tempTarget)}°C</span>
              </div>
              <Slider
                value={[tempTarget]}
                onValueChange={handleTempChange}
                min={15}
                max={35}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>15°C</span>
                <span>35°C</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500">High Threshold</span>
                <p className="text-lg font-semibold text-amber-600">
                  {state.climateSetpoints.temperature.highThreshold}°C
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Hysteresis</span>
                <p className="text-lg font-semibold text-slate-900">
                  ±{state.climateSetpoints.temperature.hysteresis}°C
                </p>
              </div>
            </div>
          </div>

          {/* Fan Controls */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <p className="text-sm font-medium text-slate-900">Fan Controls</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => actions.toggleDevice('exhaustFan', 'ventilation')}
                className={`btn-touch ${state.ventilation.exhaustFan.status === 'on' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Exhaust
              </button>
              <button
                onClick={() => actions.toggleDevice('intakeFan', 'ventilation')}
                className={`btn-touch ${state.ventilation.intakeFan.status === 'on' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Wind className="w-4 h-4" />
                Intake
              </button>
              <button
                onClick={() => actions.toggleDevice('coolingPad', 'ventilation')}
                className={`btn-touch ${state.ventilation.coolingPad.status === 'on' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Power className="w-4 h-4" />
                Cooling
              </button>
            </div>
          </div>

          {/* Roof Vent Position */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Roof Vent Position</span>
              <span className="text-lg font-bold text-teal-600">{ventPosition}%</span>
            </div>
            <Slider
              value={[ventPosition]}
              onValueChange={handleVentChange}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Humidity Control */}
        <div className="panel p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Humidity Control</h3>
                <p className="text-xs text-slate-500">Relative humidity management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Auto</span>
              <Switch
                checked={state.climateSetpoints.humidity.mode === 'auto'}
                onCheckedChange={(checked) => actions.setHumidityMode(checked ? 'auto' : 'manual')}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">Target Humidity</span>
                <span className="text-lg font-bold text-teal-600">{Math.round(humidityTarget)}%</span>
              </div>
              <Slider
                value={[humidityTarget]}
                onValueChange={handleHumidityChange}
                min={30}
                max={90}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>30%</span>
                <span>90%</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500">High RH Threshold</span>
              <p className="text-lg font-semibold text-amber-600">
                {state.climateSetpoints.humidity.highThreshold}%
              </p>
            </div>
          </div>

          {/* Humidity Controls */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <p className="text-sm font-medium text-slate-900">Humidity Controls</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => actions.toggleDevice('fogger', 'ventilation')}
                className={`btn-touch ${state.ventilation.fogger.status === 'on' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <CloudFog className="w-4 h-4" />
                Fogger
              </button>
              <button
                onClick={() => actions.toggleDevice('dehumidifier', 'ventilation')}
                className={`btn-touch ${state.ventilation.dehumidifier.status === 'on' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Wind className="w-4 h-4" />
                Dehumidify
              </button>
            </div>
          </div>

          {/* Circulation Fans */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">Circulation Fans</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{state.ventilation.circulationMode.replace('_', ' ')}</span>
                <Switch
                  checked={state.ventilation.circulationMode === 'continuous'}
                  onCheckedChange={(checked) => actions.setCirculationMode(checked ? 'continuous' : 'duty_cycle')}
                />
              </div>
            </div>
            
            {state.ventilation.circulationMode === 'duty_cycle' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500">ON Time (min)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Timer className="w-4 h-4 text-teal-600" />
                    <span className="font-semibold text-slate-900">{state.ventilation.dutyCycleOn}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">OFF Time (min)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Timer className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold text-slate-900">{state.ventilation.dutyCycleOff}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
