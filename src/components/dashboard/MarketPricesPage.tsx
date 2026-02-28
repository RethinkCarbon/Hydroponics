import { TrendingUp, TrendingDown, Minus, MapPin, ShoppingCart, AlertCircle, Lightbulb, Calendar, Filter, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import type { MarketPriceData, MarketPrice } from '@/types/greenhouse';

interface MarketPricesPageProps {
  data: MarketPriceData;
}

const categoryColors: Record<string, string> = {
  leafy_greens: 'bg-emerald-100 text-emerald-700',
  herbs: 'bg-teal-100 text-teal-700',
  microgreens: 'bg-blue-100 text-blue-700',
  vegetables: 'bg-amber-100 text-amber-700',
  fruits: 'bg-purple-100 text-purple-700'
};

function PriceCard({ price }: { price: MarketPrice }) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="panel p-3 sm:p-4 hover:shadow-lg transition-shadow min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3 min-w-0">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-slate-800 truncate">{price.produceName}</h4>
          <p className="text-sm text-slate-500 truncate">{price.variety}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${categoryColors[price.category] || 'bg-slate-100 text-slate-700'}`}>
          {price.category.replace('_', ' ')}
        </span>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 min-w-0">
        <div className="p-2 sm:p-3 bg-slate-50 rounded-lg min-w-0">
          <p className="text-xs text-slate-500 mb-1">Wholesale</p>
          <p className="text-base sm:text-xl font-bold text-slate-800 truncate">Rs {price.wholesalePrice.toFixed(2)}</p>
          <p className="text-xs text-slate-400">per {price.unit}</p>
        </div>
        <div className="p-2 sm:p-3 bg-slate-50 rounded-lg min-w-0">
          <p className="text-xs text-slate-500 mb-1">Retail</p>
          <p className="text-base sm:text-xl font-bold text-slate-800 truncate">Rs {price.retailPrice.toFixed(2)}</p>
          <p className="text-xs text-slate-400">per {price.unit}</p>
        </div>
      </div>

      {/* Price Change */}
      <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
        <div className={`flex items-center gap-1 min-w-0 ${
          price.priceChangeDirection === 'up' ? 'text-emerald-600' :
          price.priceChangeDirection === 'down' ? 'text-red-600' :
          'text-slate-500'
        }`}>
          {price.priceChangeDirection === 'up' ? <TrendingUp className="w-4 h-4 shrink-0" /> :
           price.priceChangeDirection === 'down' ? <TrendingDown className="w-4 h-4 shrink-0" /> :
           <Minus className="w-4 h-4 shrink-0" />}
          <span className="font-medium">{Math.abs(price.priceChange).toFixed(1)}%</span>
          <span className="text-xs shrink-0">vs last week</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 min-w-0 shrink overflow-hidden">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{price.marketLocation.split(',')[0]}</span>
        </div>
      </div>

      {/* Demand & Seasonality */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`text-xs px-2 py-1 rounded-full ${
          price.demandLevel === 'high' ? 'bg-emerald-100 text-emerald-700' :
          price.demandLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        }`}>
          {price.demandLevel} demand
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          price.seasonality === 'peak' ? 'bg-emerald-100 text-emerald-700' :
          price.seasonality === 'shoulder' ? 'bg-amber-100 text-amber-700' :
          'bg-slate-100 text-slate-600'
        }`}>
          {price.seasonality.replace('_', ' ')}
        </span>
      </div>

      {/* Mini Chart */}
      <button 
        onClick={() => setShowHistory(!showHistory)}
        className="w-full text-xs text-teal-600 hover:text-teal-700 flex items-center justify-center gap-1 py-2 bg-teal-50 rounded-lg"
      >
        {showHistory ? 'Hide' : 'Show'} Price History
      </button>

      {showHistory && (
        <div className="mt-3 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={price.history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                stroke="#94a3b8"
                fontSize={10}
              />
              <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `Rs ${v}`} />
              <Tooltip 
                formatter={(value: number) => [`Rs ${value.toFixed(2)}`]}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB')}
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="wholesale" stroke="#0d9488" strokeWidth={2} dot={false} name="Wholesale" />
              <Line type="monotone" dataKey="retail" stroke="#64748b" strokeWidth={2} dot={false} name="Retail" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function MarketPricesPage({ data }: MarketPricesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrices = data.prices.filter(price => {
    const matchesCategory = selectedCategory === 'all' || price.category === selectedCategory;
    const matchesSearch = price.produceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         price.variety.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', 'leafy_greens', 'herbs', 'microgreens', 'vegetables', 'fruits'];

  return (
    <div className="p-0 sm:p-6 space-y-4 sm:space-y-6 min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">Live Market Prices</h2>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Wholesale & retail prices for organic produce (Rs)</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 shrink-0">
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="truncate">Last updated: {data.lastUpdated.toLocaleString('en-GB')}</span>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="panel p-3 sm:p-4 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-1">
            <span className="text-xs sm:text-sm text-slate-500 truncate">Avg Wholesale</span>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500 shrink-0" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-slate-800 truncate">Rs {data.overview.avgWholesalePrice.toFixed(2)}</p>
          <p className="text-xs text-slate-400">Across all produce</p>
        </div>
        <div className="panel p-3 sm:p-4 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-1">
            <span className="text-xs sm:text-sm text-slate-500 truncate">Avg Retail</span>
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-slate-800 truncate">Rs {data.overview.avgRetailPrice.toFixed(2)}</p>
          <p className="text-xs text-slate-400">Consumer price</p>
        </div>
        <div className="panel p-3 sm:p-4 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-1">
            <span className="text-xs sm:text-sm text-slate-500 truncate">Price Volatility</span>
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-slate-800 truncate">{data.overview.priceVolatility.toFixed(1)}%</p>
          <p className="text-xs text-slate-400">30-day average</p>
        </div>
        <div className="panel p-3 sm:p-4 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-1">
            <span className="text-xs sm:text-sm text-slate-500 truncate">Market Trend</span>
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
          </div>
          <p className={`text-lg sm:text-2xl font-bold truncate ${
            data.insights.marketTrend === 'bullish' ? 'text-emerald-600' :
            data.insights.marketTrend === 'bearish' ? 'text-red-600' :
            'text-slate-600'
          }`}>
            {data.insights.marketTrend.charAt(0).toUpperCase() + data.insights.marketTrend.slice(1)}
          </p>
          <p className="text-xs text-slate-400">Current outlook</p>
        </div>
      </div>

      {/* Market Insights */}
      <div className="panel p-4 sm:p-5 min-w-0 overflow-hidden">
        <h3 className="section-header mb-4">Supply & Demand Insights</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h4 className="font-semibold text-emerald-800">Recommended Crops</h4>
            </div>
            <p className="text-sm text-emerald-600 mb-3">
              Based on current market prices and demand, these crops show strong profitability:
            </p>
            <div className="flex flex-wrap gap-2">
              {data.insights.recommendedCrops.map((crop, i) => (
                <span key={i} className="px-3 py-1.5 bg-white text-emerald-700 rounded-lg text-sm font-medium">
                  {crop}
                </span>
              ))}
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-red-800">Crops to Avoid</h4>
            </div>
            <p className="text-sm text-red-600 mb-3">
              These crops are currently experiencing low demand or oversupply:
            </p>
            <div className="flex flex-wrap gap-2">
              {data.insights.avoidCrops.map((crop, i) => (
                <span key={i} className="px-3 py-1.5 bg-white text-red-700 rounded-lg text-sm font-medium">
                  {crop}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Gainers & Losers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        <div className="panel p-4 sm:p-5 min-w-0 overflow-hidden">
          <h3 className="section-header mb-4">Top Gainers (7 Days)</h3>
          <div className="space-y-2">
            {data.overview.topGainers.map((price) => (
              <div key={price.id} className="flex items-center justify-between gap-2 p-3 bg-emerald-50 rounded-lg min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800 truncate">{price.produceName}</p>
                  <p className="text-xs text-slate-500 truncate">{price.variety}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-emerald-600">+{price.priceChange.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">Rs {price.wholesalePrice.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-4 sm:p-5 min-w-0 overflow-hidden">
          <h3 className="section-header mb-4">Top Losers (7 Days)</h3>
          <div className="space-y-2">
            {data.overview.topLosers.map((price) => (
              <div key={price.id} className="flex items-center justify-between gap-2 p-3 bg-red-50 rounded-lg min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800 truncate">{price.produceName}</p>
                  <p className="text-xs text-slate-500 truncate">{price.variety}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-red-600">{price.priceChange.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">Rs {price.wholesalePrice.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 min-w-0 flex-1 sm:flex-initial sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search produce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm outline-none min-w-0 w-full sm:w-48"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Price Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-0">
        {filteredPrices.map(price => (
          <PriceCard key={price.id} price={price} />
        ))}
      </div>
    </div>
  );
}
