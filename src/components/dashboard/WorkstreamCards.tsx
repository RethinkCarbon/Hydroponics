import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  ShoppingCart,
  TrendingDown,
  QrCode,
  TrendingUp as TrendingUpIcon,
  Shield
} from 'lucide-react';
import type { 
  BatchCertificationData, 
  MarketPriceData,
  SalesPipelineData, 
  CropEconomicsData, 
  InventoryData 
} from '@/types/greenhouse';

interface WorkstreamCardsProps {
  certification: BatchCertificationData;
  market: MarketPriceData;
  sales: SalesPipelineData;
  economics: CropEconomicsData;
  inventory: InventoryData;
  onSelectWorkstream: (workstream: string) => void;
}

export function WorkstreamCards({ certification, market, sales, economics, inventory, onSelectWorkstream }: WorkstreamCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 responsive-grid-5">
      {/* Batch Certification Card */}
      <div 
        onClick={() => onSelectWorkstream('certification')}
        className="workstream-card group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-1 text-teal-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View <ChevronRight className="w-4 h-4" />
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-1">Batch Certification</h3>
        <p className="text-sm text-slate-500 mb-4">UK Organic Standards</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Compliance</span>
            <span className="text-lg font-bold text-emerald-600">{certification.complianceRate}%</span>
          </div>
          
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              style={{ width: `${certification.complianceRate}%` }}
            />
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span className="text-slate-600">
                {certification.batches.filter(c => c.status === 'approved').length} Certified
              </span>
            </div>
            <div className="flex items-center gap-1">
              <QrCode className="w-3 h-3 text-teal-500" />
              <span className="text-slate-600">
                QR Ready
              </span>
            </div>
          </div>
          
          {certification.pendingReview.length > 0 && (
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-amber-700">
                  {certification.pendingReview.length} pending review
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Market Prices Card */}
      <div 
        onClick={() => onSelectWorkstream('market')}
        className="workstream-card group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <TrendingUpIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-1 text-teal-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View <ChevronRight className="w-4 h-4" />
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-1">Live Market Prices</h3>
        <p className="text-sm text-slate-500 mb-4">UK Wholesale & Retail</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Avg Wholesale</span>
            <span className="text-lg font-bold text-blue-600">
              Rs {market.overview.avgWholesalePrice.toFixed(2)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-center">
              <p className="text-lg font-bold text-emerald-600">{market.overview.topGainers.length}</p>
              <p className="text-[10px] text-emerald-500 uppercase tracking-wide">Gainers</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-center">
              <p className="text-lg font-bold text-red-600">{market.overview.topLosers.length}</p>
              <p className="text-[10px] text-red-500 uppercase tracking-wide">Losers</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-slate-400" />
              <span className="text-slate-500">Trend</span>
            </div>
            <span className={`font-medium capitalize ${
              market.insights.marketTrend === 'bullish' ? 'text-emerald-600' :
              market.insights.marketTrend === 'bearish' ? 'text-red-600' :
              'text-slate-600'
            }`}>
              {market.insights.marketTrend}
            </span>
          </div>
          
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-blue-700">
                {market.prices.length} produce tracked
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Pipeline Card */}
      <div 
        onClick={() => onSelectWorkstream('sales')}
        className="workstream-card group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-1 text-teal-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View <ChevronRight className="w-4 h-4" />
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-1">Sales Pipeline</h3>
        <p className="text-sm text-slate-500 mb-4">Leads & Orders</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Pipeline Value</span>
            <span className="text-lg font-bold text-purple-600">
              Rs {(sales.metrics.totalPipeline / 1000).toFixed(1)}k
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-purple-50 rounded-lg text-center">
              <p className="text-lg font-bold text-purple-600">{sales.leads.filter(l => l.stage !== 'closed_won' && l.stage !== 'closed_lost').length}</p>
              <p className="text-[10px] text-purple-500 uppercase tracking-wide">Active Leads</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-center">
              <p className="text-lg font-bold text-emerald-600">{sales.leads.filter(l => l.stage === 'closed_won').length}</p>
              <p className="text-[10px] text-emerald-500 uppercase tracking-wide">Closed Won</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-slate-400" />
              <span className="text-slate-500">Conversion</span>
            </div>
            <span className="font-medium text-slate-700">{sales.metrics.conversionRate.toFixed(0)}%</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <ShoppingCart className="w-3 h-3 text-slate-400" />
              <span className="text-slate-500">Active Orders</span>
            </div>
            <span className="font-medium text-slate-700">
              {sales.orders.filter(o => o.status !== 'delivered').length}
            </span>
          </div>
        </div>
      </div>

      {/* Crop Economics Card */}
      <div 
        onClick={() => onSelectWorkstream('economics')}
        className="workstream-card group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-1 text-teal-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View <ChevronRight className="w-4 h-4" />
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-1">Crop Economics</h3>
        <p className="text-sm text-slate-500 mb-4">Profit & Costs</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Gross Profit</span>
            <span className={`text-lg font-bold ${economics.financials.grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              Rs {(economics.financials.grossProfit / 1000).toFixed(1)}k
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] text-emerald-600 uppercase tracking-wide">Revenue</span>
              </div>
              <p className="text-sm font-bold text-emerald-700">
                Rs {(economics.financials.totalRevenue / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <TrendingDown className="w-3 h-3 text-red-500" />
                <span className="text-[10px] text-red-600 uppercase tracking-wide">Costs</span>
              </div>
              <p className="text-sm font-bold text-red-700">
                Rs {(economics.financials.totalCosts / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Profit Margin</span>
            <span className={`font-medium ${economics.financials.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {economics.financials.profitMargin.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Active Batches</span>
            <span className="font-medium text-slate-700">
              {economics.batches.filter(b => b.status === 'growing').length}
            </span>
          </div>
        </div>
      </div>

      {/* Inventory Management Card */}
      <div 
        onClick={() => onSelectWorkstream('inventory')}
        className="workstream-card group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-200">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-1 text-teal-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View <ChevronRight className="w-4 h-4" />
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-1">Inventory</h3>
        <p className="text-sm text-slate-500 mb-4">Stock & Supplies</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Total Value</span>
            <span className="text-lg font-bold text-pink-600">
              Rs {(inventory.valuation.totalValue / 1000).toFixed(1)}k
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-slate-50 rounded-lg text-center">
              <p className="text-lg font-bold text-slate-700">{inventory.items.length}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">SKUs</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-center">
              <p className="text-lg font-bold text-slate-700">
                {inventory.items.filter(i => i.quantity <= i.reorderPoint).length}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Low Stock</p>
            </div>
          </div>
          
          {inventory.alerts.lowStock.length > 0 && (
            <div className="p-2 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-xs text-red-700">
                  {inventory.alerts.lowStock.length} item{inventory.alerts.lowStock.length > 1 ? 's' : ''} need reordering
                </span>
              </div>
            </div>
          )}
          
          {inventory.alerts.expiring.length > 0 && (
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-amber-700">
                  {inventory.alerts.expiring.length} item{inventory.alerts.expiring.length > 1 ? 's' : ''} expiring soon
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
