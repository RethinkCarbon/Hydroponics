import { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Bell, 
  MessageSquare, 
  Mail,
  PowerOff,
  Droplets,
  Wind,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { GreenhouseState, Alert } from '@/types/greenhouse';

/** Derive where an alert should link when actionTarget is not set */
function getAlertAction(alert: Alert): { view: string; label: string; secondaryActionKey?: 'startFlush' | 'stopIrrigation' } | null {
  if (alert.actionTarget) {
    return {
      view: alert.actionTarget.view,
      label: alert.actionTarget.label,
      secondaryActionKey: alert.actionTarget.secondaryActionKey
    };
  }
  const msg = alert.message.toLowerCase();
  const dev = (alert.device || '').toLowerCase();
  if (dev.includes('uv') || msg.includes('uv')) return { view: 'uv', label: 'UV system' };
  if (dev.includes('irrigation') || dev.includes('zone') || msg.includes('irrigation') || msg.includes('zone')) return { view: 'irrigation', label: 'Irrigation' };
  if (dev.includes('ec') || msg.includes('ec drift') || msg.includes('electrical conductivity')) return { view: 'ec', label: 'EC / nutrients', secondaryActionKey: 'startFlush' };
  if (dev.includes('ph') || msg.includes('ph drift') || msg.includes('ph critical')) return { view: 'ph', label: 'pH', secondaryActionKey: 'startFlush' };
  if (msg.includes('reservoir') || msg.includes('refill') || msg.includes('low')) return { view: 'irrigation', label: 'Reservoir / irrigation', secondaryActionKey: 'stopIrrigation' };
  if (msg.includes('temperature') || msg.includes('climate')) return { view: 'climate', label: 'Climate' };
  if (msg.includes('light')) return { view: 'lighting', label: 'Lighting' };
  return null;
}

interface AlertsPageProps {
  state: GreenhouseState;
  onViewChange?: (view: string) => void;
  actions: {
    acknowledgeAlert: (alertId: string) => void;
    triggerEmergencyStop: () => void;
    resetEmergency: () => void;
    stopIrrigation: () => void;
    closeAllVents: () => void;
    setManualFlush?: (active: boolean) => void;
  };
}

const alertIcons = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info
};

const alertColors = {
  critical: 'text-red-700 bg-red-50 border-red-200',
  warning: 'text-amber-700 bg-amber-50 border-amber-200',
  info: 'text-teal-700 bg-teal-50 border-teal-200'
};

interface AlertItemProps {
  alert: Alert;
  onAcknowledge: () => void;
  onViewChange?: (view: string) => void;
  onStartFlush?: () => void;
  onStopIrrigation?: () => void;
}

function AlertItem({ alert, onAcknowledge, onViewChange, onStartFlush, onStopIrrigation }: AlertItemProps) {
  const Icon = alertIcons[alert.type];
  const action = getAlertAction(alert);

  return (
    <div className={`p-4 rounded-xl border-2 ${alertColors[alert.type]} ${alert.acknowledged ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          alert.type === 'critical' ? 'text-red-500' :
          alert.type === 'warning' ? 'text-amber-500' : 'text-teal-600'
        }`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
              alert.type === 'critical' ? 'bg-red-100 text-red-700' :
              alert.type === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
            }`}>
              {alert.type}
            </span>
            <span className="text-xs text-slate-500">
              {alert.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm text-slate-900">{alert.message}</p>
          {alert.device && (
            <p className="text-xs text-slate-500 mt-1">Device: {alert.device}</p>
          )}
          {!alert.acknowledged && action && (onViewChange || onStartFlush || onStopIrrigation) && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {onViewChange && (
                <button
                  type="button"
                  onClick={() => onViewChange(action.view)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-slate-300 text-slate-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-colors"
                >
                  Go to {action.label}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {action.secondaryActionKey === 'startFlush' && onStartFlush && (
                <button
                  type="button"
                  onClick={() => { onStartFlush(); onViewChange?.('irrigation'); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Start flush
                </button>
              )}
              {action.secondaryActionKey === 'stopIrrigation' && onStopIrrigation && (
                <button
                  type="button"
                  onClick={onStopIrrigation}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  Stop irrigation
                </button>
              )}
            </div>
          )}
        </div>
        {!alert.acknowledged && (
          <button
            type="button"
            onClick={onAcknowledge}
            className="p-2 rounded-lg bg-slate-200 hover:bg-emerald-100 text-slate-600 hover:text-emerald-600 transition-colors shrink-0"
            title="Acknowledge"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function AlertsPage({ state, onViewChange, actions }: AlertsPageProps) {
  const [notifications, setNotifications] = useState({
    sms: false,
    push: true,
    email: true
  });

  const activeAlerts = state.alerts.filter(a => !a.acknowledged);
  const acknowledgedAlerts = state.alerts.filter(a => a.acknowledged);

  return (
    <div className="p-0 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Alerts & Safety</h2>
          <p className="text-slate-500 mt-1">System monitoring and emergency controls</p>
        </div>

        {state.emergencyMode && (
          <div className="flex items-center gap-3 px-4 py-2 bg-red-100 border border-red-300 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-semibold">EMERGENCY MODE</span>
          </div>
        )}
      </div>

      {/* Emergency Controls */}
      <div className="panel p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Emergency Controls</h3>
            <p className="text-xs text-slate-500">Immediate system shutdown options</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={actions.triggerEmergencyStop}
            disabled={state.emergencyMode}
            className="emergency-btn disabled:opacity-50 disabled:animate-none"
          >
            <PowerOff className="w-5 h-5" />
            STOP ALL DOSING
          </button>

          <button
            type="button"
            onClick={actions.stopIrrigation}
            className="btn-touch btn-danger"
          >
            <Droplets className="w-5 h-5" />
            STOP IRRIGATION
          </button>

          <button
            type="button"
            onClick={actions.closeAllVents}
            className="btn-touch btn-danger"
          >
            <Wind className="w-5 h-5" />
            CLOSE ALL VENTS
          </button>
        </div>

        {state.emergencyMode && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Emergency Mode Active</p>
                  <p className="text-xs text-slate-500">All dosing systems have been stopped</p>
                </div>
              </div>
              <button
                type="button"
                onClick={actions.resetEmergency}
                className="btn-touch btn-success"
              >
                <RotateCcw className="w-4 h-4" />
                Reset System
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Active Alerts */}
        <div className="panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Active Alerts</h3>
                <p className="text-xs text-slate-500">
                  {activeAlerts.length} unacknowledged
                </p>
              </div>
            </div>
            {activeAlerts.length > 0 && (
              <button
                type="button"
                onClick={() => activeAlerts.forEach(a => actions.acknowledgeAlert(a.id))}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Acknowledge All
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="text-slate-500">No active alerts</p>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={() => actions.acknowledgeAlert(alert.id)}
                  onViewChange={onViewChange}
                  onStartFlush={actions.setManualFlush ? () => actions.setManualFlush?.(true) : undefined}
                  onStopIrrigation={actions.stopIrrigation}
                />
              ))
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="panel p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">Alert delivery methods</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 rounded-lg bg-slate-100 cursor-pointer">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">SMS Alerts</p>
                  <p className="text-xs text-slate-500">Text message notifications</p>
                </div>
              </div>
              <Switch
                checked={notifications.sms}
                onCheckedChange={(v) => setNotifications(p => ({ ...p, sms: v }))}
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-lg bg-slate-100 cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Push Notifications</p>
                  <p className="text-xs text-slate-500">In-app alerts</p>
                </div>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(v) => setNotifications(p => ({ ...p, push: v }))}
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-lg bg-slate-100 cursor-pointer">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Email Alerts</p>
                  <p className="text-xs text-slate-500">Email notifications</p>
                </div>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(v) => setNotifications(p => ({ ...p, email: v }))}
              />
            </label>
          </div>

          {/* Critical Alert Types */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-900 mb-3">Critical Alert Types</p>
            <div className="space-y-2">
              {[
                'Reservoir Low-Low',
                'Pump Failure',
                'High Temperature',
                'EC Drift High',
                'pH Drift Critical',
                'Refill Timeout',
                'Communication Loss'
              ].map((alertType) => (
                <label key={alertType} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 bg-white text-teal-600" />
                  <span className="text-sm text-slate-600">{alertType}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alert History */}
      {acknowledgedAlerts.length > 0 && (
        <div className="panel p-5">
          <h3 className="section-header mb-4">Alert History</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {acknowledgedAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 opacity-80">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-slate-500">{alert.timestamp.toLocaleString()}</span>
                <span className="text-sm text-slate-800">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
