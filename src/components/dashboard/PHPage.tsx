import { useState } from 'react';
import { Scale, ArrowUp, ArrowDown, Timer, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import type { GreenhouseState } from '@/types/greenhouse';

interface PHPageProps {
  state: GreenhouseState;
  actions: {
    triggerDose: (type: 'phUp' | 'phDown') => void;
    setPhAutoMode: (value: boolean) => void;
    setPhDoseDelay: (seconds: number) => void;
  };
}

export function PHPage({ state, actions }: PHPageProps) {
  const [isDosingUp, setIsDosingUp] = useState(false);
  const [isDosingDown, setIsDosingDown] = useState(false);
  const doseDelay = state.ph.doseDelay;

  const handleDoseUp = () => {
    setIsDosingUp(true);
    actions.triggerDose('phUp');
    setTimeout(() => setIsDosingUp(false), 2000);
  };

  const handleDoseDown = () => {
    setIsDosingDown(true);
    actions.triggerDose('phDown');
    setTimeout(() => setIsDosingDown(false), 2000);
  };

  const phTarget = (state.ph.targetMin + state.ph.targetMax) / 2;
  const phDeviation = state.ph.current - phTarget;
  
  let phStatus: 'normal' | 'warning' | 'critical' = 'normal';
  if (state.ph.current < state.ph.targetMin - 0.3 || state.ph.current > state.ph.targetMax + 0.3) {
    phStatus = 'critical';
  } else if (state.ph.current < state.ph.targetMin || state.ph.current > state.ph.targetMax) {
    phStatus = 'warning';
  }

  const isLocked = state.ph.safetyLockout || state.ec.autoDosing;

  return (
    <div className="p-0 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">pH Controller</h2>
        <p className="text-slate-500 mt-1">pH monitoring and adjustment system</p>
      </div>

      {/* pH Display */}
      <div className="panel p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
              phStatus === 'normal' ? 'bg-emerald-100' :
              phStatus === 'warning' ? 'bg-amber-100' : 'bg-red-100'
            }`}>
              <Scale className={`w-10 h-10 ${
                phStatus === 'normal' ? 'text-emerald-600' :
                phStatus === 'warning' ? 'text-amber-600' : 'text-red-500'
              }`} />
            </div>
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wider">Current pH</p>
              <p className={`text-5xl font-bold ${
                phStatus === 'normal' ? 'text-emerald-600' :
                phStatus === 'warning' ? 'text-amber-600' : 'text-red-500'
              }`}>
                {state.ph.current.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="text-right space-y-3">
            <div>
              <p className="text-sm text-slate-500">Target Range</p>
              <p className="text-xl font-bold text-teal-600">
                {state.ph.targetMin.toFixed(1)} - {state.ph.targetMax.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Deviation</p>
              <p className={`text-xl font-semibold ${
                phDeviation > 0 ? 'text-red-500' : 'text-emerald-600'
              }`}>
                {phDeviation > 0 ? '+' : ''}{phDeviation.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* pH Scale Visualization */}
        <div className="mt-6">
          <div className="relative h-4 rounded-full overflow-hidden">
            {/* pH gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)'
              }}
            />
            {/* Target range indicator */}
            <div
              className="absolute top-0 bottom-0 bg-white/40 border-x-2 border-white"
              style={{
                left: `${((state.ph.targetMin - 4) / 4) * 100}%`,
                right: `${100 - ((state.ph.targetMax - 4) / 4) * 100}%`
              }}
            />
            {/* Current pH marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-6 bg-white rounded shadow-lg border-2 border-slate-800"
              style={{
                left: `${Math.max(0, Math.min(100, ((state.ph.current - 4) / 4) * 100))}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>4.0 (Acid)</span>
            <span>6.0 (Neutral)</span>
            <span>8.0 (Base)</span>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${
            phStatus === 'normal' ? 'bg-emerald-100 text-emerald-700' :
            phStatus === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
          }`}>
            {phStatus}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Auto Mode</span>
            <Switch
              checked={state.ph.autoMode}
              onCheckedChange={(checked) => actions.setPhAutoMode(checked)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* pH Up Control */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <ArrowUp className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">pH Up</p>
                <p className="text-xs text-slate-500">Base solution</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              isDosingUp ? 'bg-red-500 animate-pulse' : 'bg-slate-400'
            }`} />
          </div>

          <button
            onClick={handleDoseUp}
            disabled={isDosingUp || isLocked || state.ph.current >= 7.5}
            className="w-full btn-touch btn-danger disabled:opacity-50"
          >
            <ArrowUp className="w-5 h-5" />
            {isDosingUp ? 'Dosing...' : 'Dose pH Up'}
          </button>

          <div className="mt-3 p-3 rounded-lg bg-slate-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Last dose</span>
              <span className="text-slate-900">
                {state.ph.lastAdjustment.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* pH Down Control */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <ArrowDown className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">pH Down</p>
                <p className="text-xs text-slate-500">Acid solution</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              isDosingDown ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`} />
          </div>

          <button
            onClick={handleDoseDown}
            disabled={isDosingDown || isLocked || state.ph.current <= 4.5}
            className="w-full btn-touch btn-success disabled:opacity-50"
          >
            <ArrowDown className="w-5 h-5" />
            {isDosingDown ? 'Dosing...' : 'Dose pH Down'}
          </button>

          <div className="mt-3 p-3 rounded-lg bg-slate-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Last dose</span>
              <span className="text-slate-900">
                {state.ph.lastAdjustment.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="panel p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Timer className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Dosing Configuration</h3>
              <p className="text-xs text-slate-500">pH adjustment parameters</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {state.ph.safetyLockout ? (
              <Lock className="w-5 h-5 text-red-500" />
            ) : (
              <Unlock className="w-5 h-5 text-emerald-600" />
            )}
            <span className={`text-sm ${state.ph.safetyLockout ? 'text-red-600' : 'text-emerald-600'}`}>
              {state.ph.safetyLockout ? 'Locked' : 'Unlocked'}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Dose Delay</span>
            <span className="text-lg font-bold text-amber-600">{doseDelay}s</span>
          </div>
          <Slider
            value={[doseDelay]}
            onValueChange={(v) => actions.setPhDoseDelay(v[0])}
            min={15}
            max={120}
            step={5}
            className="w-full"
          />
        </div>

        {/* Safety Info */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700 mb-1">Safety Requirements</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Always stabilize EC before pH adjustment</li>
                <li>• Dose in micro pulses (2 second max)</li>
                <li>• Include mixing delay between doses</li>
                <li>• Safety lockout prevents concurrent dosing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
