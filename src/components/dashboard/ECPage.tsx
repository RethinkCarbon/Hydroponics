import { useState, useEffect } from 'react';
import { Beaker, Plus, Timer, AlertTriangle, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { GreenhouseState } from '@/types/greenhouse';

interface ECPageProps {
  state: GreenhouseState;
  actions: {
    updateSetpoint: (parameter: string, value: number) => void;
    triggerDose: (type: 'nutrientA' | 'nutrientB') => void;
    setEcAutoDosing: (value: boolean) => void;
    setEcDoseDuration: (seconds: number) => void;
  };
}

export function ECPage({ state, actions }: ECPageProps) {
  const [ecSetpoint, setEcSetpoint] = useState(state.ec.setpoint);
  const [isDosingA, setIsDosingA] = useState(false);
  const [isDosingB, setIsDosingB] = useState(false);
  const doseDuration = state.ec.doseDuration;

  useEffect(() => {
    setEcSetpoint(state.ec.setpoint);
  }, [state.ec.setpoint]);

  const handleSetpointChange = (value: number[]) => {
    setEcSetpoint(value[0]);
    actions.updateSetpoint('ec', value[0]);
  };

  const handleDoseA = () => {
    setIsDosingA(true);
    actions.triggerDose('nutrientA');
    setTimeout(() => setIsDosingA(false), doseDuration * 1000);
  };

  const handleDoseB = () => {
    setIsDosingB(true);
    actions.triggerDose('nutrientB');
    setTimeout(() => setIsDosingB(false), doseDuration * 1000);
  };

  const ecDeviation = state.ec.current - state.ec.setpoint;
  const ecStatus = Math.abs(ecDeviation) <= state.ec.deadband ? 'normal' :
                   Math.abs(ecDeviation) <= 0.3 ? 'warning' : 'critical';

  return (
    <div className="p-0 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">EC Controller</h2>
        <p className="text-slate-500 mt-1">Electrical conductivity and nutrient dosing</p>
      </div>

      {/* EC Display */}
      <div className="panel p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
              ecStatus === 'normal' ? 'bg-emerald-100' :
              ecStatus === 'warning' ? 'bg-amber-100' : 'bg-red-100'
            }`}>
              <Beaker className={`w-10 h-10 ${
                ecStatus === 'normal' ? 'text-emerald-600' :
                ecStatus === 'warning' ? 'text-amber-600' : 'text-red-500'
              }`} />
            </div>
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wider">Current EC</p>
              <p className={`text-5xl font-bold ${
                ecStatus === 'normal' ? 'text-emerald-600' :
                ecStatus === 'warning' ? 'text-amber-600' : 'text-red-500'
              }`}>
                {state.ec.current.toFixed(2)}
              </p>
              <p className="text-lg text-slate-500">mS/cm</p>
            </div>
          </div>

          <div className="text-right space-y-2">
            <div>
              <p className="text-sm text-slate-500">Setpoint</p>
              <p className="text-2xl font-bold text-teal-600">{state.ec.setpoint.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Deviation</p>
              <p className={`text-xl font-semibold ${
                ecDeviation > 0 ? 'text-red-500' : 'text-emerald-600'
              }`}>
                {ecDeviation > 0 ? '+' : ''}{ecDeviation.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-3 rounded-full overflow-hidden bg-slate-200">
            <div
              className={`h-full transition-all duration-500 ${
                ecStatus === 'normal' ? 'bg-emerald-500' :
                ecStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (state.ec.current / 4) * 100)}%` }}
            />
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${
            ecStatus === 'normal' ? 'bg-emerald-100 text-emerald-700' :
            ecStatus === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
          }`}>
            {ecStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Setpoint Control */}
        <div className="panel p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Setpoint Control</h3>
                <p className="text-xs text-slate-500">Target EC value</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Auto Dose</span>
              <Switch
                checked={state.ec.autoDosing}
                onCheckedChange={(checked) => actions.setEcAutoDosing(checked)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">EC Setpoint</span>
              <span className="text-2xl font-bold text-teal-600">{ecSetpoint.toFixed(2)} mS/cm</span>
            </div>
            <Slider
              value={[ecSetpoint]}
              onValueChange={handleSetpointChange}
              min={0.5}
              max={4.0}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0.5</span>
              <span>4.0</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div>
              <span className="text-xs text-slate-500">Deadband</span>
              <p className="text-lg font-semibold text-slate-900">±{state.ec.deadband.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Mixing Delay</span>
              <p className="text-lg font-semibold text-slate-900">{state.ec.mixingDelay}s</p>
            </div>
          </div>
        </div>

        {/* Dose Configuration */}
        <div className="panel p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Timer className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Dose Configuration</h3>
              <p className="text-xs text-slate-500">Nutrient dosing parameters</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Dose Duration</span>
              <span className="text-lg font-bold text-amber-600">{doseDuration}s</span>
            </div>
            <Slider
              value={[doseDuration]}
              onValueChange={(v) => actions.setEcDoseDuration(v[0])}
              min={1}
              max={10}
              step={0.5}
              className="w-full"
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Dosing Logic</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Dose in small increments</li>
              <li>• Wait for mixing delay</li>
              <li>• Recheck EC value</li>
              <li>• Prevent overshoot</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Nutrient Dosing Controls */}
      <div className="panel p-5">
        <h3 className="section-header mb-4">Manual Nutrient Dosing</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Nutrient A */}
          <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-600">A</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Nutrient A</p>
                  <p className="text-xs text-slate-500">Grow formula</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                isDosingA ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`} />
            </div>

            <button
              onClick={handleDoseA}
              disabled={isDosingA || state.ec.nutrientA.manualOverride}
              className="w-full btn-touch btn-success disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              {isDosingA ? 'Dosing...' : 'Dose Nutrient A'}
            </button>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className={state.ec.nutrientA.status === 'on' ? 'text-emerald-600' : 'text-slate-500'}>
                {state.ec.nutrientA.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Nutrient B */}
          <div className="p-4 rounded-xl border-2 border-teal-200 bg-teal-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-teal-600">B</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Nutrient B</p>
                  <p className="text-xs text-slate-500">Bloom formula</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                isDosingB ? 'bg-teal-500 animate-pulse' : 'bg-slate-400'
              }`} />
            </div>

            <button
              onClick={handleDoseB}
              disabled={isDosingB || state.ec.nutrientB.manualOverride}
              className="w-full btn-touch btn-primary disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              {isDosingB ? 'Dosing...' : 'Dose Nutrient B'}
            </button>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className={state.ec.nutrientB.status === 'on' ? 'text-teal-600' : 'text-slate-500'}>
                {state.ec.nutrientB.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
