import { Lightbulb, Waves, Wrench, Clock, AlertTriangle, Power, CheckCircle } from 'lucide-react';
import type { GreenhouseState } from '@/types/greenhouse';

interface UVPageProps {
  state: GreenhouseState;
  actions?: {
    logUVMaintenance: () => void;
  };
}

export function UVPage({ state, actions }: UVPageProps) {
  const { uv } = state;
  const hoursRemaining = uv.maxLampHours - uv.lampHours;
  const percentUsed = (uv.lampHours / uv.maxLampHours) * 100;

  const maintenanceDue = percentUsed >= 80;
  const maintenanceCritical = percentUsed >= 90;

  return (
    <div className="p-0 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">UV Water Treatment</h2>
        <p className="text-slate-500 mt-1">Sterilization and water quality control</p>
      </div>

      {/* UV Status Display */}
      <div className="panel p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${
              uv.status === 'on' ? 'bg-emerald-100' :
              uv.status === 'standby' ? 'bg-amber-100' : 'bg-slate-200'
            }`}>
              <Lightbulb className={`w-12 h-12 ${
                uv.status === 'on' ? 'text-emerald-600' :
                uv.status === 'standby' ? 'text-amber-600' : 'text-slate-500'
              }`} />
            </div>
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wider">UV Status</p>
              <p className={`text-4xl font-bold ${
                uv.status === 'on' ? 'text-emerald-600' :
                uv.status === 'standby' ? 'text-amber-600' : 'text-slate-500'
              }`}>
                {uv.status.toUpperCase()}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Power className={`w-4 h-4 ${uv.status === 'on' ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span className="text-sm text-slate-500">
                  {uv.status === 'on' ? 'Active sterilization' : 'System standby'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right space-y-3">
            <div>
              <p className="text-sm text-slate-500">Lamp Hours</p>
              <p className={`text-2xl font-bold ${maintenanceCritical ? 'text-red-500' : maintenanceDue ? 'text-amber-600' : 'text-emerald-600'}`}>
                {uv.lampHours.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">of {uv.maxLampHours.toLocaleString()} hrs</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Lamp Life</span>
            <span className={`text-sm font-semibold ${maintenanceCritical ? 'text-red-600' : maintenanceDue ? 'text-amber-600' : 'text-emerald-600'}`}>
              {percentUsed.toFixed(1)}% used
            </span>
          </div>
          <div className="h-4 rounded-full overflow-hidden bg-slate-200">
            <div
              className={`h-full transition-all duration-500 ${
                percentUsed < 60 ? 'bg-emerald-500' :
                percentUsed < 80 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, percentUsed)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>New</span>
            <span>Maintenance Due</span>
            <span>Replace</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Flow Status */}
        <div className="panel p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <Waves className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Flow Status</h3>
              <p className="text-xs text-slate-500">Water circulation sensor</p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border-2 ${
            uv.flowDetected
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                uv.flowDetected ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                {uv.flowDetected ? (
                  <Waves className="w-6 h-6 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                )}
              </div>
              <div>
                <p className={`text-lg font-semibold ${uv.flowDetected ? 'text-emerald-700' : 'text-red-700'}`}>
                  {uv.flowDetected ? 'Flow Detected' : 'No Flow'}
                </p>
                <p className="text-xs text-slate-500">
                  {uv.flowDetected
                    ? 'Water circulating normally'
                    : 'UV lamp will auto-shutoff'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-100">
            <p className="text-xs text-slate-500 mb-2">Safety Logic</p>
            <ul className="text-sm text-slate-900 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                UV ON only if flow detected
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Auto shutoff if no circulation
              </li>
            </ul>
          </div>
        </div>

        {/* Maintenance */}
        <div className="panel p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Maintenance</h3>
              <p className="text-xs text-slate-500">Lamp replacement tracking</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-slate-100 text-center">
              <Clock className="w-5 h-5 text-teal-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-slate-900">{hoursRemaining.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Hours Remaining</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-100 text-center">
              <Wrench className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900">
                {uv.lastMaintenance.toLocaleDateString()}
              </p>
              <p className="text-xs text-slate-500">Last Service</p>
            </div>
          </div>

          {maintenanceDue && (
            <div className={`p-4 rounded-xl border-2 ${
              maintenanceCritical
                ? 'border-red-200 bg-red-50'
                : 'border-amber-200 bg-amber-50'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  maintenanceCritical ? 'text-red-500' : 'text-amber-600'
                }`} />
                <div>
                  <p className={`text-sm font-semibold ${
                    maintenanceCritical ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    Maintenance {maintenanceCritical ? 'Required' : 'Due Soon'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {maintenanceCritical
                      ? 'Lamp has exceeded recommended lifespan. Replace immediately.'
                      : 'Lamp approaching end of life. Schedule replacement.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => actions?.logUVMaintenance()}
            className="w-full btn-touch btn-secondary"
          >
            <Wrench className="w-4 h-4" />
            Log Maintenance
          </button>
        </div>
      </div>

      {/* UV Information */}
      <div className="panel p-5">
        <h3 className="section-header mb-4">UV System Information</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-100">
            <p className="text-xs text-slate-500 mb-1">Wavelength</p>
            <p className="text-xl font-bold text-slate-900">254 nm</p>
            <p className="text-xs text-slate-500">UVC Germicidal</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-100">
            <p className="text-xs text-slate-500 mb-1">Flow Rate</p>
            <p className="text-xl font-bold text-slate-900">15 L/min</p>
            <p className="text-xs text-slate-500">Max Capacity</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-100">
            <p className="text-xs text-slate-500 mb-1">Lamp Power</p>
            <p className="text-xl font-bold text-slate-900">40W</p>
            <p className="text-xs text-slate-500">Low Pressure</p>
          </div>
        </div>
      </div>
    </div>
  );
}
