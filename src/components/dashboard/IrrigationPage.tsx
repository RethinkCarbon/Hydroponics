import { useState, useEffect } from 'react';
import { Droplets, Battery, Play, Pause, RotateCcw, Timer, AlertTriangle, Waves, Circle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { GreenhouseState, IrrigationZone } from '@/types/greenhouse';

interface IrrigationPageProps {
  state: GreenhouseState;
  actions: {
    toggleZone: (zoneId: string) => void;
    setEcTriggeredFlush: (value: boolean) => void;
    setManualFlush: (active: boolean) => void;
  };
}

function ZoneCard({ zone, onToggle }: { zone: IrrigationZone; onToggle: () => void }) {
  const isActive = zone.enabled;
  const timeToNext = Math.max(0, Math.floor((zone.nextIrrigation.getTime() - Date.now()) / 60000));

  return (
    <div className={`p-4 rounded-xl border-2 transition-all ${
      isActive
        ? 'border-emerald-300 bg-emerald-50'
        : 'border-slate-200 bg-slate-50'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive ? 'bg-emerald-100' : 'bg-slate-200'
          }`}>
            <Droplets className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{zone.name}</p>
            <p className="text-xs text-slate-500">{isActive ? 'Active' : 'Disabled'}</p>
          </div>
        </div>
        <Switch checked={isActive} onCheckedChange={onToggle} />
      </div>

      {isActive && (
        <div className="space-y-2 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Day Recipe</span>
            <span className="text-sm font-medium text-slate-900">
              {zone.dayRecipe.onSeconds}s ON / {zone.dayRecipe.offMinutes}m OFF
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Night Recipe</span>
            <span className="text-sm font-medium text-slate-900">
              {zone.nightRecipe.onSeconds}s ON / {zone.nightRecipe.offMinutes}m OFF
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Next Irrigation</span>
            <span className="text-sm font-medium text-teal-600">
              {timeToNext < 1 ? '< 1 min' : `${timeToNext} min`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function IrrigationPage({ state, actions }: IrrigationPageProps) {
  const [flushTimer, setFlushTimer] = useState(() =>
    state.irrigation.flush.isFlushing ? (state.irrigation.flush.flushTimer || 300) : 0
  );
  const isFlushing = state.irrigation.flush.isFlushing;

  const startFlush = () => {
    actions.setManualFlush(true);
    setFlushTimer(300);
  };

  const stopFlush = () => {
    actions.setManualFlush(false);
    setFlushTimer(0);
  };

  useEffect(() => {
    if (!isFlushing || flushTimer <= 0) return;
    const id = setTimeout(() => setFlushTimer((prev) => (prev <= 1 ? 0 : prev - 1)), 1000);
    return () => clearTimeout(id);
  }, [isFlushing, flushTimer]);

  useEffect(() => {
    if (flushTimer === 0 && isFlushing) actions.setManualFlush(false);
  }, [flushTimer, isFlushing, actions]);

  return (
    <div className="p-0 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Irrigation & Fertigation</h2>
        <p className="text-slate-500 mt-1">Zone control and reservoir management</p>
      </div>

      {/* Reservoir Status */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <Battery className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Reservoir Status</h3>
              <p className="text-xs text-slate-500">Main nutrient tank</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            state.irrigation.reservoir.level.value < 30
              ? 'bg-red-100 text-red-600'
              : state.irrigation.reservoir.level.value < 50
                ? 'bg-amber-100 text-amber-600'
                : 'bg-emerald-100 text-emerald-600'
          }`}>
            {state.irrigation.reservoir.level.value.toFixed(0)}%
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-slate-100">
            <p className="text-2xl font-bold text-slate-900">{state.irrigation.reservoir.flowRate.toFixed(1)}</p>
            <p className="text-xs text-slate-500">L/min Flow</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-100">
            <p className="text-2xl font-bold text-red-500">{state.irrigation.reservoir.lowThreshold}%</p>
            <p className="text-xs text-slate-500">Low Threshold</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-100">
            <p className="text-2xl font-bold text-emerald-600">{state.irrigation.reservoir.highThreshold}%</p>
            <p className="text-xs text-slate-500">High Threshold</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-100">
            <p className="text-2xl font-bold text-teal-600">{state.irrigation.reservoir.refillTimeout}s</p>
            <p className="text-xs text-slate-500">Timeout</p>
          </div>
        </div>

        {/* Refill Status */}
        {state.irrigation.reservoir.isRefilling && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 border border-teal-200">
            <Waves className="w-5 h-5 text-teal-600 animate-pulse" />
            <span className="text-sm text-teal-700">Refilling in progress...</span>
          </div>
        )}

        {state.irrigation.reservoir.level.value < state.irrigation.reservoir.lowThreshold && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 mt-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700">Low reservoir level - refill required</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Irrigation Zones */}
        <div className="panel p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Irrigation Zones</h3>
              <p className="text-xs text-slate-500">Zone-based control</p>
            </div>
          </div>

          <div className="space-y-3">
            {state.irrigation.zones.map((zone) => (
              <ZoneCard 
                key={zone.id} 
                zone={zone} 
                onToggle={() => actions.toggleZone(zone.id)} 
              />
            ))}
          </div>

          {/* Manual Pulse */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-900 mb-3">Manual Control</p>
            <div className="grid grid-cols-3 gap-3">
              {state.irrigation.zones.map((zone) => (
                <button
                  key={zone.id}
                  disabled={!zone.enabled}
                  className="btn-touch btn-secondary disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  {zone.name.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Flush System */}
        <div className="panel p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Flush System</h3>
              <p className="text-xs text-slate-500">System flushing and drain</p>
            </div>
          </div>

          {/* Flush Timer */}
          {isFlushing ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <Timer className="w-8 h-8 text-amber-600 mx-auto mb-2 animate-pulse" />
              <p className="text-3xl font-bold text-amber-700">
                {Math.floor(flushTimer / 60)}:{(flushTimer % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-sm text-slate-500 mt-1">Flush in progress</p>
              <button
                onClick={stopFlush}
                className="btn-touch btn-secondary mt-3"
              >
                <Pause className="w-4 h-4" />
                Stop Flush
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={startFlush}
                className="w-full btn-touch btn-primary"
              >
                <RotateCcw className="w-4 h-4" />
                Start Manual Flush
              </button>

              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-100 cursor-pointer">
                <span className="text-sm text-slate-900">EC-triggered flush</span>
                <Switch
                  checked={state.irrigation.flush.ecTriggeredFlush}
                  onCheckedChange={(checked) => actions.setEcTriggeredFlush(checked)}
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-100 cursor-pointer">
                <span className="text-sm text-slate-900">Scheduled flush</span>
                <Switch />
              </label>
            </div>
          )}

          {/* Drain Valve Status */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100">
              <div className="flex items-center gap-3">
                <Circle className="w-5 h-5 text-slate-500" />
                <span className="text-sm text-slate-900">Drain Valve</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                state.irrigation.flush.drainValveOpen
                  ? 'bg-red-100 text-red-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}>
                {state.irrigation.flush.drainValveOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          </div>

          {/* Last Flush */}
          <div className="text-center">
            <p className="text-xs text-slate-500">Last Flush</p>
            <p className="text-sm text-slate-900">
              {state.irrigation.flush.lastFlush.toLocaleDateString()} at{' '}
              {state.irrigation.flush.lastFlush.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
