import { DollarSign, TrendingUp, TrendingDown, Package, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import type { CropEconomicsData } from '@/types/greenhouse';

interface EconomicsPageProps {
  data: CropEconomicsData;
}

export function EconomicsPage({ data }: EconomicsPageProps) {
  const costBreakdown = [
    { name: 'Seeds', value: data.batches.reduce((sum, b) => sum + b.costs.seeds, 0) },
    { name: 'Nutrients', value: data.batches.reduce((sum, b) => sum + b.costs.nutrients, 0) },
    { name: 'Energy', value: data.batches.reduce((sum, b) => sum + b.costs.energy, 0) },
    { name: 'Labor', value: data.batches.reduce((sum, b) => sum + b.costs.labor, 0) },
    { name: 'Other', value: data.batches.reduce((sum, b) => sum + b.costs.other, 0) }
  ];

  return (
    <div className="p-0 sm:p-6 space-y-4 sm:space-y-6 min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">Crop Economics</h2>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Financial performance and cost analysis</p>
        </div>
        <div className={`px-3 py-2 rounded-xl shrink-0 ${data.financials.grossProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
          <span className={`text-xs sm:text-sm font-semibold ${data.financials.grossProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            Margin: {data.financials.profitMargin.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="panel p-3 sm:p-4 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-1">
            <span className="text-xs sm:text-sm text-slate-500 truncate">Total Revenue</span>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
          </div>
          <p className="text-base sm:text-2xl font-bold text-emerald-600 truncate">Rs {data.financials.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">From harvested crops</p>
        </div>
        <div className="panel p-3 sm:p-4 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-1">
            <span className="text-xs sm:text-sm text-slate-500 truncate">Total Costs</span>
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
          </div>
          <p className="text-base sm:text-2xl font-bold text-red-600 truncate">Rs {data.financials.totalCosts.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Production expenses</p>
        </div>
        <div className="panel p-3 sm:p-4 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-1">
            <span className="text-xs sm:text-sm text-slate-500 truncate">Gross Profit</span>
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
          </div>
          <p className={`text-base sm:text-2xl font-bold truncate ${data.financials.grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            Rs {data.financials.grossProfit.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Revenue minus costs</p>
        </div>
        <div className="panel p-3 sm:p-4 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-1">
            <span className="text-xs sm:text-sm text-slate-500 truncate">Cost per Unit</span>
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
          </div>
          <p className="text-base sm:text-2xl font-bold text-slate-800 truncate">Rs {data.financials.costPerUnit.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">Per kg produced</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {/* Monthly Trend */}
        <div className="panel p-4 sm:p-5 min-w-0 overflow-hidden">
          <h3 className="section-header mb-4">Monthly Financial Trend</h3>
          <div className="h-48 sm:h-56 min-h-[12rem]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `Rs ${v/1000}k`} />
                <Tooltip 
                  formatter={(value: number) => [`Rs ${value.toLocaleString()}`]}
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="costs" name="Costs" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#0d9488" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="panel p-4 sm:p-5 min-w-0 overflow-hidden">
          <h3 className="section-header mb-4">Cost Breakdown</h3>
          <div className="h-48 sm:h-56 min-h-[12rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `Rs ${v}`} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={70} />
                <Tooltip 
                  formatter={(value: number) => [`Rs ${value.toLocaleString()}`]}
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Batches */}
      <div className="panel p-4 sm:p-5 min-w-0 overflow-hidden">
        <h3 className="section-header mb-4">Crop Batches</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {data.batches.map((batch) => {
            const totalCost = Object.values(batch.costs).reduce((sum, c) => sum + c, 0);
            const profit = (batch.revenue || 0) - totalCost;
            
            return (
              <div key={batch.id} className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
                <div className="flex items-start justify-between gap-2 mb-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-slate-800 truncate">{batch.name}</h4>
                    <p className="text-sm text-slate-500 truncate">{batch.variety} {batch.cropType}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold shrink-0 ${
                    batch.status === 'sold' ? 'bg-emerald-100 text-emerald-700' :
                    batch.status === 'harvested' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {batch.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 min-w-0">
                  <div className="text-center p-1.5 sm:p-2 bg-white rounded-lg min-w-0">
                    <p className="text-sm sm:text-lg font-bold text-slate-800 truncate">{batch.quantity}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{batch.unit}</p>
                  </div>
                  <div className="text-center p-1.5 sm:p-2 bg-white rounded-lg min-w-0">
                    <p className="text-sm sm:text-lg font-bold text-red-600 truncate">Rs {totalCost}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Cost</p>
                  </div>
                  <div className="text-center p-1.5 sm:p-2 bg-white rounded-lg min-w-0">
                    <p className={`text-sm sm:text-lg font-bold truncate ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      Rs {profit}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">Profit</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-slate-500 min-w-0">
                  <span className="flex items-center gap-1 truncate">
                    <Calendar className="w-3 h-3 shrink-0" />
                    Planted: {batch.plantedDate.toLocaleDateString()}
                  </span>
                  <span className="shrink-0">
                    Harvest: {batch.expectedHarvest.toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
