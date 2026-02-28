import { useState } from 'react';
import { TrendingUp, Droplets, Zap, Thermometer, Beaker } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import type { TrendData } from '@/types/greenhouse';

interface AnalyticsPageProps {
  trendData: TrendData[];
}

const timeRanges = [
  { label: '1 Hour', value: '1h', hours: 1 },
  { label: '24 Hours', value: '24h', hours: 24 },
  { label: '7 Days', value: '7d', hours: 168 },
  { label: '30 Days', value: '30d', hours: 720 }
];

const chartColors = {
  temperature: '#f85149',
  humidity: '#58a6ff',
  ec: '#3fb950',
  ph: '#d29922',
  waterLevel: '#39d0d8',
  energy: '#a371f7'
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
        <p className="text-xs text-slate-500 mb-2">
          {new Date(label || '').toLocaleString()}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-slate-800" style={{ color: entry.color }}>
            {entry.name}: {entry.value?.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function AnalyticsPage({ trendData }: AnalyticsPageProps) {
  const [selectedRange, setSelectedRange] = useState('24h');
  const [activeCharts, setActiveCharts] = useState({
    temperature: true,
    humidity: true,
    ec: true,
    ph: true,
    waterLevel: false,
    energy: false
  });

  // Filter data based on selected range
  const filteredData = trendData.slice(-(
    selectedRange === '1h' ? 2 :
    selectedRange === '24h' ? 24 :
    selectedRange === '7d' ? 48 :
    72
  ));

  const formatXAxis = (timestamp: Date) => {
    const date = new Date(timestamp);
    if (selectedRange === '1h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (selectedRange === '24h') {
      return date.toLocaleTimeString([], { hour: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-0 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Analytics</h2>
          <p className="text-slate-500 mt-1 text-sm">Historical data and trends</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 rounded-xl p-1 border border-slate-200">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRange === range.value
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Toggles */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'temperature', label: 'Temperature', icon: Thermometer, color: chartColors.temperature },
          { key: 'humidity', label: 'Humidity', icon: Droplets, color: chartColors.humidity },
          { key: 'ec', label: 'EC', icon: Zap, color: chartColors.ec },
          { key: 'ph', label: 'pH', icon: Beaker, color: chartColors.ph },
          { key: 'waterLevel', label: 'Water Level', icon: Droplets, color: chartColors.waterLevel },
          { key: 'energy', label: 'Energy', icon: TrendingUp, color: chartColors.energy }
        ].map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setActiveCharts(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              activeCharts[key as keyof typeof activeCharts]
                ? 'border-teal-300 bg-teal-50 text-slate-800'
                : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
            }`}
          >
            <Icon className="w-4 h-4" style={{ color }} />
            <span className="text-sm font-medium">{label}</span>
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color, opacity: activeCharts[key as keyof typeof activeCharts] ? 1 : 0.3 }}
            />
          </button>
        ))}
      </div>

      {/* Main Trend Chart */}
      <div className="panel p-5">
        <h3 className="section-header mb-4">Parameter Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxis}
                stroke="#64748b"
                fontSize={12}
                tick={{ fill: '#475569' }}
              />
              <YAxis stroke="#64748b" fontSize={12} tick={{ fill: '#475569' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {activeCharts.temperature && (
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  name="Temperature (°C)"
                  stroke={chartColors.temperature}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              )}
              {activeCharts.humidity && (
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  name="Humidity (%)"
                  stroke={chartColors.humidity}
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {activeCharts.ec && (
                <Line 
                  type="monotone" 
                  dataKey="ec" 
                  name="EC (mS/cm)"
                  stroke={chartColors.ec}
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {activeCharts.ph && (
                <Line 
                  type="monotone" 
                  dataKey="ph" 
                  name="pH"
                  stroke={chartColors.ph}
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Water Level Chart */}
        <div className="panel p-5">
          <h3 className="section-header mb-4">Water Consumption</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis}
                  stroke="#64748b"
                  fontSize={10}
                  tick={{ fill: '#475569' }}
                />
                <YAxis stroke="#64748b" fontSize={10} tick={{ fill: '#475569' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="waterLevel" 
                  name="Water Level (%)"
                  stroke={chartColors.waterLevel}
                  fill={chartColors.waterLevel}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Usage Chart */}
        <div className="panel p-5">
          <h3 className="section-header mb-4">Energy Usage</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis}
                  stroke="#64748b"
                  fontSize={10}
                  tick={{ fill: '#475569' }}
                />
                <YAxis stroke="#64748b" fontSize={10} tick={{ fill: '#475569' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="energy" 
                  name="Energy (kWh)"
                  fill={chartColors.energy}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="panel p-5">
        <h3 className="section-header mb-4">Statistics Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Avg Temperature', value: '24.2°C', change: '+0.5', icon: Thermometer, color: 'text-red-500' },
            { label: 'Avg Humidity', value: '67.8%', change: '-2.1', icon: Droplets, color: 'text-sky-500' },
            { label: 'Avg EC', value: '1.95', change: '+0.05', icon: Zap, color: 'text-emerald-500' },
            { label: 'Avg pH', value: '6.15', change: '-0.02', icon: Beaker, color: 'text-amber-500' },
            { label: 'Water Used', value: '245L', change: '+12', icon: Droplets, color: 'text-cyan-500' },
            { label: 'Energy Used', value: '48.5kWh', change: '+3.2', icon: TrendingUp, color: 'text-violet-500' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            const isPositive = stat.change.startsWith('+');
            return (
              <div key={index} className="text-center p-4 rounded-xl bg-slate-50 border border-slate-200">
                <Icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                <p className={`text-xs ${isPositive ? 'text-red-500' : 'text-emerald-600'}`}>
                  {stat.change} vs last period
                </p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
