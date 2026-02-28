import { useState, useEffect } from 'react';
import { Sun, Umbrella, Sprout, Leaf, Flower2, Wheat, Clock, Thermometer } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { GreenhouseState } from '@/types/greenhouse';

interface LightingPageProps {
  state: GreenhouseState;
  actions: {
    setShadePosition: (position: number) => void;
    setShadeScreenMode: (mode: 'auto' | 'manual') => void;
    setShadeScreenLightBased: (value: boolean) => void;
    setShadeScreenTempBased: (value: boolean) => void;
    setShadeScreenTimeBased: (value: boolean) => void;
    setCropStage: (stage: 'seedling' | 'vegetative' | 'flowering' | 'harvest') => void;
  };
}

const cropStages = [
  { id: 'seedling', label: 'Seedling', icon: Sprout, par: 200, duration: 'Week 1-2' },
  { id: 'vegetative', label: 'Vegetative', icon: Leaf, par: 400, duration: 'Week 3-5' },
  { id: 'flowering', label: 'Flowering', icon: Flower2, par: 600, duration: 'Week 6-8' },
  { id: 'harvest', label: 'Harvest', icon: Wheat, par: 300, duration: 'Final Week' },
] as const;

export function LightingPage({ state, actions }: LightingPageProps) {
  const [shadePosition, setShadePosition] = useState(state.ventilation.shadePosition);

  useEffect(() => {
    setShadePosition(state.ventilation.shadePosition);
  }, [state.ventilation.shadePosition]);

  const handleShadeChange = (value: number[]) => {
    setShadePosition(value[0]);
    actions.setShadePosition(value[0]);
  };

  return (
    <div className="p-0 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Light & Shading</h2>
        <p className="text-slate-500 mt-1">PAR monitoring and shade screen control</p>
      </div>

      {/* Current Readings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="panel p-4 text-center">
          <Sun className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-slate-900">{state.lighting.par.value.toFixed(0)}</p>
          <p className="text-xs text-slate-500 mt-1">PAR (μmol/m²/s)</p>
        </div>
        <div className="panel p-4 text-center">
          <Sun className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-slate-900">{(state.lighting.lux.value / 1000).toFixed(1)}k</p>
          <p className="text-xs text-slate-500 mt-1">Lux</p>
        </div>
        <div className="panel p-4 text-center">
          <Umbrella className="w-6 h-6 text-teal-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-slate-900">{state.ventilation.shadePosition}%</p>
          <p className="text-xs text-slate-500 mt-1">Shade Closed</p>
        </div>
        <div className="panel p-4 text-center">
          <Sprout className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-slate-900 capitalize">{state.lighting.cropStage}</p>
          <p className="text-xs text-slate-500 mt-1">Crop Stage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Shade Screen Control */}
        <div className="panel p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <Umbrella className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Shade Screen Control</h3>
                <p className="text-xs text-slate-500">Automated shading system</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Auto</span>
              <Switch
                checked={state.lighting.shadeScreen.mode === 'auto'}
                onCheckedChange={(checked) => actions.setShadeScreenMode(checked ? 'auto' : 'manual')}
              />
            </div>
          </div>

          {/* Shade Position */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Shade Position (Closed %)</span>
              <span className="text-lg font-bold text-teal-600">{shadePosition}%</span>
            </div>
            <Slider
              value={[shadePosition]}
              onValueChange={handleShadeChange}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Open (0%)</span>
              <span>Closed (100%)</span>
            </div>
          </div>

          {/* Control Logic */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <p className="text-sm font-medium text-slate-900">Control Logic</p>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-100 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-slate-900">Light-based control</span>
                </div>
                <Switch
                  checked={state.lighting.shadeScreen.lightBased}
                  onCheckedChange={(checked) => actions.setShadeScreenLightBased(checked)}
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-100 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-slate-900">Temperature-based control</span>
                </div>
                <Switch
                  checked={state.lighting.shadeScreen.tempBased}
                  onCheckedChange={(checked) => actions.setShadeScreenTempBased(checked)}
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-100 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span className="text-sm text-slate-900">Time-based control</span>
                </div>
                <Switch
                  checked={state.lighting.shadeScreen.timeBased}
                  onCheckedChange={(checked) => actions.setShadeScreenTimeBased(checked)}
                />
              </label>
            </div>
          </div>

          {/* Thresholds */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500">Open Threshold</span>
              <p className="text-lg font-semibold text-emerald-600">
                {state.lighting.shadeScreen.openPercentage}%
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Close Threshold</span>
              <p className="text-lg font-semibold text-red-500">
                {state.lighting.shadeScreen.closePercentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Crop Stage & Recipes */}
        <div className="panel p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Crop Stage Selector</h3>
              <p className="text-xs text-slate-500">Light recipes per growth stage</p>
            </div>
          </div>

          {/* Stage Selection */}
          <div className="grid grid-cols-2 gap-3">
            {cropStages.map((stage) => {
              const Icon = stage.icon;
              const isSelected = state.lighting.cropStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => actions.setCropStage(stage.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 bg-slate-50 hover:border-emerald-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <p className={`font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                    {stage.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{stage.duration}</p>
                </button>
              );
            })}
          </div>

          {/* Selected Stage Recipe */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-900 mb-3">Active Recipe</p>
            {(() => {
              const stage = cropStages.find(s => s.id === state.lighting.cropStage);
              return stage ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100">
                    <span className="text-sm text-slate-500">Target PAR</span>
                    <span className="text-lg font-bold text-amber-600">{stage.par} μmol/m²/s</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100">
                    <span className="text-sm text-slate-500">Photoperiod</span>
                    <span className="text-lg font-bold text-teal-600">18/6 hrs</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100">
                    <span className="text-sm text-slate-500">DLI Target</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {(stage.par * 18 * 0.0036).toFixed(1)} mol/m²/day
                    </span>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
