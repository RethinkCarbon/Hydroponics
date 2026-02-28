import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Power } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { SensorData, StatusLevel } from '@/types/greenhouse';

interface DataTileProps {
  title: string;
  icon: React.ElementType;
  sensor: SensorData;
  deviceStatus?: 'on' | 'off' | 'auto';
  onManualOverride?: () => void;
  showSparkline?: boolean;
}

const statusColors: Record<StatusLevel, string> = {
  normal: 'text-emerald-600',
  warning: 'text-amber-500',
  critical: 'text-red-500',
  offline: 'text-slate-400'
};

const statusBgColors: Record<StatusLevel, string> = {
  normal: 'bg-emerald-100 border-emerald-200',
  warning: 'bg-amber-100 border-amber-200',
  critical: 'bg-red-100 border-red-200',
  offline: 'bg-slate-100 border-slate-200'
};

export function DataTile({ 
  title, 
  icon: Icon, 
  sensor, 
  deviceStatus = 'auto',
  onManualOverride,
  showSparkline = true
}: DataTileProps) {
  const [showOverride, setShowOverride] = useState(false);
  
  const trend = sensor.history.length >= 2 
    ? sensor.value - sensor.history[sensor.history.length - 2].value 
    : 0;
  
  const TrendIcon = trend > 0.1 ? TrendingUp : trend < -0.1 ? TrendingDown : Minus;
  const trendColor = trend > 0.1 ? 'text-red-500' : trend < -0.1 ? 'text-emerald-500' : 'text-slate-400';

  const sparklineData = sensor.history.map((h, i) => ({ value: h.value, index: i }));

  const sparklineColor = sensor.status === 'normal' ? '#10b981' : 
                         sensor.status === 'warning' ? '#f59e0b' : '#ef4444';

  return (
    <div 
      className="data-tile bg-white"
      onMouseEnter={() => setShowOverride(true)}
      onMouseLeave={() => setShowOverride(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusBgColors[sensor.status]}`}>
            <Icon className={`w-5 h-5 ${statusColors[sensor.status]}`} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">{title}</p>
            <div className="flex items-center gap-2">
              <span className="value-display text-slate-800">
                {sensor.value.toFixed(sensor.unit === '%' ? 0 : 1)}
              </span>
              <span className="text-sm text-slate-500">{sensor.unit}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          <span className={`text-xs font-medium ${trendColor}`}>
            {Math.abs(trend).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Setpoint & Status */}
      <div className="flex items-center justify-between mb-3">
        {sensor.setpoint !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Set:</span>
            <span className="text-sm font-medium text-teal-600">
              {sensor.setpoint.toFixed(sensor.unit === '%' ? 0 : 1)} {sensor.unit}
            </span>
          </div>
        )}
        
        <div className={`px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wide ${statusBgColors[sensor.status]} ${statusColors[sensor.status]}`}>
          {sensor.status}
        </div>
      </div>

      {/* Sparkline */}
      {showSparkline && sparklineData.length > 1 && (
        <div className="h-12 w-full mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={sparklineColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Device Status & Override */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Power className={`w-4 h-4 ${
            deviceStatus === 'on' ? 'text-emerald-500' : 
            deviceStatus === 'off' ? 'text-slate-400' : 'text-teal-600'
          }`} />
          <span className={`text-xs font-medium uppercase ${
            deviceStatus === 'on' ? 'text-emerald-600' : 
            deviceStatus === 'off' ? 'text-slate-400' : 'text-teal-600'
          }`}>
            {deviceStatus}
          </span>
        </div>
        
        {onManualOverride && (
          <button
            onClick={onManualOverride}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
              showOverride 
                ? 'bg-teal-100 text-teal-700 opacity-100' 
                : 'opacity-0'
            }`}
          >
            Override
          </button>
        )}
      </div>
    </div>
  );
}
