import { Droplets, Thermometer, Beaker, Zap, TrendingUp, Calendar, Leaf } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { TowerData } from '@/types/greenhouse';

export interface NurseryGlobalMetrics {
  ph: number;
  ec: number;
  temperature: number;
  humidity?: number;
}

interface NurseryVisualizationProps {
  towers: TowerData[];
  onSelectTower: (towerId: string) => void;
  selectedTower: string | null;
  globalMetrics?: NurseryGlobalMetrics;
}

const getHealthColor = (health: TowerData['status']) => {
  switch (health) {
    case 'normal': return 'bg-emerald-500';
    case 'warning': return 'bg-amber-500';
    case 'critical': return 'bg-red-500';
    default: return 'bg-slate-400';
  }
};

const getHealthRing = (health: TowerData['status']) => {
  switch (health) {
    case 'normal': return 'shadow-emerald-300/60';
    case 'warning': return 'shadow-amber-300/60';
    case 'critical': return 'shadow-red-300/60';
    default: return 'shadow-slate-300/60';
  }
};

/** Animated circle representing one tower; click to show details */
function TowerCircle({ tower, isSelected, onClick }: { tower: TowerData; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer group ${
        isSelected ? 'scale-110' : 'hover:scale-105'
      }`}
      aria-label={`Tower ${tower.name}`}
    >
      {/* Circle: gradient base + status glow, like the old tower visual */}
      <div
        className={`relative w-11 h-11 rounded-full border-2 flex items-center justify-center overflow-hidden
          transition-all duration-300
          ${isSelected ? 'border-teal-500 ring-4 ring-teal-100 drop-shadow-lg' : 'border-slate-300 group-hover:border-teal-300'}
          bg-gradient-to-br from-slate-200 to-slate-300
          shadow-md ${getHealthRing(tower.status)}`}
      >
        {/* Inner teal tint (water column feel) */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-b from-teal-400/25 to-teal-600/40" />
        {/* Status dot – animated pulse */}
        <span
          className={`relative z-10 w-2.5 h-2.5 rounded-full border-2 border-white ${getHealthColor(tower.status)} animate-pulse shadow-md`}
          aria-hidden
        />
      </div>
      {/* Tower label */}
      <span className="text-[10px] font-semibold text-slate-700 group-hover:text-teal-700 transition-colors leading-tight">
        {tower.name}
      </span>
    </button>
  );
}

function TowerAnalytics({ tower }: { tower: TowerData }) {
  const sparklineData = Array.from({ length: 10 }, () => ({
    value: tower.sensors.ec + (Math.random() - 0.5) * 0.2
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold text-slate-800">{tower.name}</h4>
          <p className="text-sm text-slate-500">{tower.plants.length} plants • {tower.plants.filter(p => p.growthStage === 'harvest').length} ready for harvest</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
          tower.status === 'normal' ? 'bg-emerald-100 text-emerald-700' :
          tower.status === 'warning' ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        }`}>
          {tower.status.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Beaker className="w-4 h-4 text-teal-600" />
            <span className="text-xs text-slate-500">EC</span>
          </div>
          <p className="text-xl font-bold text-slate-800">{tower.sensors.ec.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400">mS/cm</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-teal-600" />
            <span className="text-xs text-slate-500">pH</span>
          </div>
          <p className="text-xl font-bold text-slate-800">{tower.sensors.ph.toFixed(1)}</p>
          <p className="text-[10px] text-slate-400">pH level</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="w-4 h-4 text-teal-600" />
            <span className="text-xs text-slate-500">Temp</span>
          </div>
          <p className="text-xl font-bold text-slate-800">{tower.sensors.temperature.toFixed(1)}°</p>
          <p className="text-[10px] text-slate-400">Celsius</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-4 h-4 text-teal-600" />
            <span className="text-xs text-slate-500">Flow</span>
          </div>
          <p className="text-xl font-bold text-slate-800">{tower.sensors.flowRate.toFixed(1)}</p>
          <p className="text-[10px] text-slate-400">L/min</p>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">EC Trend</span>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
        <h5 className="text-sm font-medium text-slate-600 mb-3">Plant Status</h5>
        <div className="space-y-2">
          {tower.plants.slice(0, 4).map(plant => (
            <div key={plant.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Leaf className={`w-4 h-4 ${
                  plant.health === 'normal' ? 'text-emerald-500' :
                  plant.health === 'warning' ? 'text-amber-500' : 'text-red-500'
                }`} />
                <span className="text-slate-700">{plant.variety}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="capitalize">{plant.growthStage}</span>
                <Calendar className="w-3 h-3" />
                <span>{plant.expectedHarvest.toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">Yield Progress</span>
          <span className="text-sm font-bold text-teal-600">
            {((tower.totalYield / tower.expectedYield) * 100).toFixed(0)}%
          </span>
        </div>
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (tower.totalYield / tower.expectedYield) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{tower.totalYield.toFixed(1)} kg harvested</span>
          <span>{tower.expectedYield.toFixed(1)} kg expected</span>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-teal-600" />
          <span className="text-sm text-slate-600">Next Irrigation</span>
        </div>
        <span className="text-sm font-medium text-slate-800">
          {Math.max(0, Math.floor((tower.nextIrrigation.getTime() - Date.now()) / 60000))} min
        </span>
      </div>
    </div>
  );
}

/** Separate metric card for one value (pH, EC, Water, Temp) */
function GroupMetricCard({
  label,
  value,
  unit,
  icon: Icon,
  iconClass
}: { label: string; value: string | number; unit?: string; icon: React.ComponentType<{ className?: string }>; iconClass: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-base font-bold text-slate-800">{value}{unit != null ? unit : ''}</p>
      </div>
    </div>
  );
}

/** Panel showing all four group metrics (pH, EC, Water, Temp) as separate cards */
function GroupDetailsPanel({
  ph,
  ec,
  waterLevel,
  temperature
}: { ph: number; ec: number; waterLevel: number; temperature: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
      <GroupMetricCard label="pH level" value={ph.toFixed(1)} icon={Beaker} iconClass="bg-teal-100 text-teal-600" />
      <GroupMetricCard label="EC level" value={ec.toFixed(2)} unit=" mS/cm" icon={Zap} iconClass="bg-teal-100 text-teal-600" />
      <GroupMetricCard label="Water level" value={waterLevel} unit="%" icon={Droplets} iconClass="bg-sky-100 text-sky-600" />
      <GroupMetricCard label="Temperature" value={`${temperature.toFixed(1)}°`} icon={Thermometer} iconClass="bg-sky-100 text-sky-600" />
    </div>
  );
}

export function NurseryVisualization({ towers, onSelectTower, selectedTower, globalMetrics }: NurseryVisualizationProps) {
  const groupA = towers.filter(t => t.id.startsWith('tower-a-'));
  const groupB = towers.filter(t => t.id.startsWith('tower-b-'));
  const selectedTowerData = towers.find(t => t.id === selectedTower);

  const ph = globalMetrics?.ph ?? 6.1;
  const ec = globalMetrics?.ec ?? 1.8;
  const temperature = globalMetrics?.temperature ?? 22.5;

  const avg = (arr: TowerData[], key: 'ph' | 'ec' | 'temperature') => {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((s, t) => s + (key === 'ph' ? t.sensors.ph : key === 'ec' ? t.sensors.ec : t.sensors.temperature), 0);
    return sum / arr.length;
  };
  const groupAPh = groupA.length ? avg(groupA, 'ph') : ph;
  const groupAEc = groupA.length ? avg(groupA, 'ec') : ec;
  const groupATemp = groupA.length ? avg(groupA, 'temperature') : temperature;
  const groupBPh = groupB.length ? avg(groupB, 'ph') : ph;
  const groupBEc = groupB.length ? avg(groupB, 'ec') : ec;
  const groupBTemp = groupB.length ? avg(groupB, 'temperature') : temperature;
  const groupAWaterLevel = 84;
  const groupBWaterLevel = 81;

  return (
    <div className="nursery-layout grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
      {/* Left: Monitoring + Hydroponic Nursery + Tanks + Nursery section */}
      <div className="space-y-6 min-w-0">
      {/* Row above nursery: Group A and Group B details (pH, EC, Water, Temp) – separate from nursery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 responsive-grid-2">
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-bold text-slate-800">Group A</h4>
            <span className="text-xs text-slate-500">A1–A50</span>
          </div>
          <GroupDetailsPanel ph={groupAPh} ec={groupAEc} waterLevel={groupAWaterLevel} temperature={groupATemp} />
        </div>
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-bold text-slate-800">Group B</h4>
            <span className="text-xs text-slate-500">B1–B50</span>
          </div>
          <GroupDetailsPanel ph={groupBPh} ec={groupBEc} waterLevel={groupBWaterLevel} temperature={groupBTemp} />
        </div>
      </div>

      {/* Hydroponic Nursery – towers only (no metrics inside) */}
      <div className="nursery-container p-4 sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">Hydroponic Nursery</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            {towers.length} Active Towers • {towers.reduce((sum, t) => sum + t.plants.length, 0)} Plants
          </p>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-500">Healthy</span>
          <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse ml-2" />
          <span className="text-xs text-slate-500">Warning</span>
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse ml-2" />
          <span className="text-xs text-slate-500">Critical</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-700">Group A</h4>
              <span className="text-xs text-slate-500">A1–A50</span>
            </div>
            <div className="flex flex-wrap gap-3 justify-start">
              {groupA.map((tower) => (
                <TowerCircle
                  key={tower.id}
                  tower={tower}
                  isSelected={selectedTower === tower.id}
                  onClick={() => onSelectTower(tower.id)}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-700">Group B</h4>
              <span className="text-xs text-slate-500">B1–B50</span>
            </div>
            <div className="flex flex-wrap gap-3 justify-start">
              {groupB.map((tower) => (
                <TowerCircle
                  key={tower.id}
                  tower={tower}
                  isSelected={selectedTower === tower.id}
                  onClick={() => onSelectTower(tower.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Floor / reservoir strip */}
        <div className="mt-6 h-8 bg-gradient-to-b from-slate-300 to-slate-400 rounded-lg mx-4" />
      </div>

      {/* Water tanks (Group A, Group B) with Nutrient tank in the middle */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 responsive-grid-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Group A – Water Tank</h3>
          <div className="panel p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
              <Droplets className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Group A Water Tank</p>
              <p className="text-xs text-slate-500">Water reservoir</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Nutrient Tank</h3>
          <div className="panel p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
              <Beaker className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Nutrient Tank</p>
              <p className="text-xs text-slate-500">Nutrient reservoir</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Group B – Water Tank</h3>
          <div className="panel p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
              <Droplets className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Group B Water Tank</p>
              <p className="text-xs text-slate-500">Water reservoir</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Nursery at end */}
      <div className="panel p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Nursery</h3>
            <p className="text-sm text-slate-500">Seedling & propagation area</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 responsive-grid-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500">Seedlings</p>
            <p className="text-xl font-bold text-slate-800">{towers.reduce((s, t) => s + t.plants.filter(p => p.growthStage === 'seedling').length, 0)}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500">Total plants</p>
            <p className="text-xl font-bold text-slate-800">{towers.reduce((s, t) => s + t.plants.length, 0)}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500">Active towers</p>
            <p className="text-xl font-bold text-slate-800">{towers.length}</p>
          </div>
        </div>
      </div>
      </div>

      {/* Right: Tower details – shows when a circle is clicked */}
      <div className="panel p-5 transition-all duration-300 lg:sticky lg:top-4">
        <h3 className="section-header mb-4">Tower details</h3>
        {selectedTowerData ? (
          <div className="animate-in fade-in-0 duration-300">
            <TowerAnalytics tower={selectedTowerData} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 transition-opacity duration-300">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Leaf className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm">Click a tower circle (A1–A50 or B1–B50) to view detailed analytics</p>
          </div>
        )}
                                                                                                                                      </div>
    </div>
  );
}
