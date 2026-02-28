import { useState } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Waves, 
  Zap, 
  Beaker, 
  Sun, 
  Battery,
  Wind,
  AlertTriangle,
  Leaf
} from 'lucide-react';
import { DataTile } from './DataTile';
import { NurseryVisualization } from './NurseryVisualization';
import { WorkstreamCards } from './WorkstreamCards';
import type { GreenhouseState, SensorData } from '@/types/greenhouse';
import type { LucideIcon } from 'lucide-react';

interface OverviewPageProps {
  state: GreenhouseState;
  onViewChange: (view: string) => void;
}

interface TileData {
  title: string;
  icon: LucideIcon;
  sensor: SensorData;
  deviceStatus: 'on' | 'off' | 'auto';
  view: string;
}

export function OverviewPage({ state, onViewChange }: OverviewPageProps) {
  const [selectedTower, setSelectedTower] = useState<string | null>(null);

  const tiles: TileData[] = [
    {
      title: 'Air Temperature',
      icon: Thermometer,
      sensor: state.climate.airTemperature,
      deviceStatus: state.ventilation.exhaustFan.status as 'on' | 'off' | 'auto',
      view: 'climate'
    },
    {
      title: 'Humidity',
      icon: Droplets,
      sensor: state.climate.humidity,
      deviceStatus: state.ventilation.fogger.status as 'on' | 'off' | 'auto',
      view: 'climate'
    },
    {
      title: 'Water Temperature',
      icon: Waves,
      sensor: state.climate.waterTemperature,
      deviceStatus: 'auto',
      view: 'climate'
    },
    {
      title: 'EC (TDS)',
      icon: Zap,
      sensor: {
        value: state.ec.current,
        setpoint: state.ec.setpoint,
        unit: 'mS/cm',
        timestamp: new Date(),
        status: (Math.abs(state.ec.current - state.ec.setpoint) > 0.3 ? 'warning' : 'normal') as 'normal' | 'warning' | 'critical' | 'offline',
        history: []
      },
      deviceStatus: state.ec.autoDosing ? 'auto' : 'off' as 'on' | 'off' | 'auto',
      view: 'ec'
    },
    {
      title: 'pH Level',
      icon: Beaker,
      sensor: {
        value: state.ph.current,
        setpoint: (state.ph.targetMin + state.ph.targetMax) / 2,
        unit: 'pH',
        timestamp: new Date(),
        status: (state.ph.current < state.ph.targetMin || state.ph.current > state.ph.targetMax ? 'warning' : 'normal') as 'normal' | 'warning' | 'critical' | 'offline',
        history: []
      },
      deviceStatus: (state.ph.autoMode ? 'auto' : 'off') as 'on' | 'off' | 'auto',
      view: 'ph'
    },
    {
      title: 'Light Level',
      icon: Sun,
      sensor: state.climate.lightLevel,
      deviceStatus: (state.lighting.shadeScreen.mode === 'auto' ? 'auto' : 'on') as 'on' | 'off' | 'auto',
      view: 'lighting'
    },
    {
      title: 'Reservoir Level',
      icon: Battery,
      sensor: state.irrigation.reservoir.level,
      deviceStatus: state.irrigation.reservoir.isRefilling ? 'on' : 'off' as 'on' | 'off' | 'auto',
      view: 'irrigation'
    },
    {
      title: 'Vent Status',
      icon: Wind,
      sensor: {
        value: state.ventilation.roofVentPosition,
        setpoint: 25,
        unit: '%',
        timestamp: new Date(),
        status: 'normal' as 'normal' | 'warning' | 'critical' | 'offline',
        history: []
      },
      deviceStatus: state.ventilation.exhaustFan.status as 'on' | 'off' | 'auto',
      view: 'climate'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">Real-time monitoring and workstreams</p>
        </div>
        
        {state.emergencyMode && (
          <div className="flex items-center gap-3 px-4 py-2 bg-red-100 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-600 font-semibold">EMERGENCY MODE ACTIVE</span>
          </div>
        )}
      </div>

      {/* Nursery Visualization */}
      <NurseryVisualization 
        towers={state.towers}
        onSelectTower={setSelectedTower}
        selectedTower={selectedTower}
        globalMetrics={{
          ph: state.ph.current,
          ec: state.ec.current,
          temperature: state.climate.airTemperature.value,
          humidity: state.climate.humidity.value
        }}
      />

      {/* Workstream Cards */}
      <WorkstreamCards 
        certification={state.certification}
        market={state.market}
        sales={state.sales}
        economics={state.economics}
        inventory={state.inventory}
        onSelectWorkstream={onViewChange}
      />

      {/* Sensor Tiles */}
      <div>
        <h3 className="section-header mb-4">System Sensors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 responsive-grid-4">
          {tiles.map((tile) => (
            <div 
              key={tile.title}
              onClick={() => onViewChange(tile.view)}
              className="cursor-pointer"
            >
              <DataTile
                title={tile.title}
                icon={tile.icon}
                sensor={tile.sensor}
                deviceStatus={tile.deviceStatus}
                onManualOverride={() => onViewChange(tile.view)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Status Summary */}
      <div className="panel p-5">
        <h3 className="section-header mb-4">System Status Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 responsive-grid-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600">
              {tiles.filter(t => t.sensor.status === 'normal').length}
            </p>
            <p className="text-sm text-slate-500 mt-1">Normal</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-500">
              {tiles.filter(t => t.sensor.status === 'warning').length}
            </p>
            <p className="text-sm text-slate-500 mt-1">Warning</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-500">
              {tiles.filter(t => t.sensor.status === 'critical').length}
            </p>
            <p className="text-sm text-slate-500 mt-1">Critical</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-teal-600">
              {state.towers.length}
            </p>
            <p className="text-sm text-slate-500 mt-1">Active Towers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600">
              {state.towers.reduce((sum, t) => sum + t.plants.filter(p => p.health === 'normal').length, 0)}
            </p>
            <p className="text-sm text-slate-500 mt-1">Healthy Plants</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {state.irrigation.zones.filter(z => z.enabled).length}/{state.irrigation.zones.length}
            </p>
            <p className="text-sm text-slate-500 mt-1">Zones Active</p>
          </div>
        </div>
      </div>

      {/* Tower Summary – Group A/B overview (full grid in Hydroponic Nursery above) */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-header mb-0">Tower Performance</h3>
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-slate-600">
              {state.towers.reduce((sum, t) => sum + t.plants.length, 0)} Total Plants
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Group A</span>
              <span className="text-xs text-slate-500">A1–A50</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{state.towers.filter(t => t.id.startsWith('tower-a-')).length} towers</p>
            <p className="text-xs text-slate-500 mt-1">
              {state.towers.filter(t => t.id.startsWith('tower-a-')).reduce((s, t) => s + t.plants.length, 0)} plants
            </p>
          </div>
          <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Group B</span>
              <span className="text-xs text-slate-500">B1–B50</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{state.towers.filter(t => t.id.startsWith('tower-b-')).length} towers</p>
            <p className="text-xs text-slate-500 mt-1">
              {state.towers.filter(t => t.id.startsWith('tower-b-')).reduce((s, t) => s + t.plants.length, 0)} plants
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
