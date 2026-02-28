import { useState } from 'react';
import { Package, AlertCircle, Clock, TrendingDown, Plus, Search, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { InventoryData, InventoryItem } from '@/types/greenhouse';

interface InventoryPageProps {
  data: InventoryData;
  actions?: {
    addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastRestocked'>) => void;
  };
}

const categoryColors: Record<string, string> = {
  seeds: '#10b981',
  nutrients: '#0d9488',
  equipment: '#3b82f6',
  packaging: '#f59e0b',
  other: '#64748b'
};

const defaultNewItem: Omit<InventoryItem, 'id' | 'lastRestocked'> = {
  name: '',
  category: 'other',
  sku: '',
  quantity: 0,
  unit: 'pcs',
  minStock: 0,
  maxStock: 100,
  reorderPoint: 0,
  unitCost: 0,
  location: '',
  supplier: ''
};

export function InventoryPage({ data, actions }: InventoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [form, setForm] = useState<Omit<InventoryItem, 'id' | 'lastRestocked'>>(defaultNewItem);

  const filteredItems = searchQuery.trim()
    ? data.items.filter(
        item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data.items;

  const handleAddItem = () => {
    if (!form.name.trim() || !form.sku.trim() || !actions?.addInventoryItem) return;
    actions.addInventoryItem({
      ...form,
      quantity: Number(form.quantity) || 0,
      minStock: Number(form.minStock) || 0,
      maxStock: Number(form.maxStock) || 100,
      reorderPoint: Number(form.reorderPoint) || 0,
      unitCost: Number(form.unitCost) || 0
    });
    setForm(defaultNewItem);
    setAddItemOpen(false);
  };

  const categoryData = Object.entries(data.valuation.byCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  return (
    <div className="p-0 sm:p-6 space-y-4 sm:space-y-6 min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:flex-wrap">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">Inventory Management</h2>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Stock tracking and supply management</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:flex-1 sm:min-w-0 sm:max-w-2xl">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <Input
              placeholder="Search by name, SKU, or supplier..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-10 sm:h-12 bg-white min-w-0"
            />
          </div>
          <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
            <DialogTrigger asChild>
              <button type="button" className="btn-touch btn-primary shrink-0 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="itemName">Name</Label>
                    <Input
                      id="itemName"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Romaine Lettuce Seeds"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemSku">SKU</Label>
                    <Input
                      id="itemSku"
                      value={form.sku}
                      onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                      placeholder="e.g. SEED-ROM-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemCategory">Category</Label>
                    <select
                      id="itemCategory"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value as InventoryItem['category'] }))}
                    >
                      <option value="seeds">Seeds</option>
                      <option value="nutrients">Nutrients</option>
                      <option value="equipment">Equipment</option>
                      <option value="packaging">Packaging</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemQuantity">Quantity</Label>
                    <Input
                      id="itemQuantity"
                      type="number"
                      min={0}
                      value={form.quantity || ''}
                      onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemUnit">Unit</Label>
                    <Input
                      id="itemUnit"
                      value={form.unit}
                      onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                      placeholder="pcs, L, kg..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemUnitCost">Unit Cost (Rs)</Label>
                    <Input
                      id="itemUnitCost"
                      type="number"
                      min={0}
                      step={0.01}
                      value={form.unitCost || ''}
                      onChange={e => setForm(f => ({ ...f, unitCost: Number(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemMinStock">Min Stock</Label>
                    <Input
                      id="itemMinStock"
                      type="number"
                      min={0}
                      value={form.minStock ?? ''}
                      onChange={e => setForm(f => ({ ...f, minStock: Number(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemMaxStock">Max Stock</Label>
                    <Input
                      id="itemMaxStock"
                      type="number"
                      min={0}
                      value={form.maxStock ?? ''}
                      onChange={e => setForm(f => ({ ...f, maxStock: Number(e.target.value) || 100 }))}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemReorderPoint">Reorder Point</Label>
                    <Input
                      id="itemReorderPoint"
                      type="number"
                      min={0}
                      value={form.reorderPoint ?? ''}
                      onChange={e => setForm(f => ({ ...f, reorderPoint: Number(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemLocation">Location</Label>
                    <Input
                      id="itemLocation"
                      value={form.location}
                      onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                      placeholder="e.g. Storage A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemSupplier">Supplier</Label>
                    <Input
                      id="itemSupplier"
                      value={form.supplier}
                      onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                      placeholder="Supplier name"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAddItemOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddItem} disabled={!form.name.trim() || !form.sku.trim() || !actions?.addInventoryItem}>
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerts Banner */}
      {(data.alerts.lowStock.length > 0 || data.alerts.expiring.length > 0) && (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 min-w-0">
          {data.alerts.lowStock.length > 0 && (
            <div className="flex-1 min-w-0 p-3 sm:p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-3 min-w-0">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-red-700 text-sm sm:text-base">Low Stock Alert</p>
                  <p className="text-xs sm:text-sm text-red-600 truncate">{data.alerts.lowStock.length} items below reorder point</p>
                </div>
              </div>
            </div>
          )}
          {data.alerts.expiring.length > 0 && (
            <div className="flex-1 min-w-0 p-3 sm:p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-3 min-w-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-amber-700 text-sm sm:text-base">Expiring Soon</p>
                  <p className="text-xs sm:text-sm text-amber-600 truncate">{data.alerts.expiring.length} items expiring within 90 days</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="panel p-3 sm:p-4 text-center min-w-0">
          <Package className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 mx-auto mb-1 sm:mb-2 shrink-0" />
          <p className="text-xl sm:text-3xl font-bold text-slate-800 truncate">{data.items.length}</p>
          <p className="text-xs sm:text-sm text-slate-500">Total SKUs</p>
        </div>
        <div className="panel p-3 sm:p-4 text-center min-w-0">
          <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mx-auto mb-1 sm:mb-2 shrink-0" />
          <p className="text-xl sm:text-3xl font-bold text-slate-800 truncate">{data.alerts.lowStock.length}</p>
          <p className="text-xs sm:text-sm text-slate-500">Low Stock</p>
        </div>
        <div className="panel p-3 sm:p-4 text-center min-w-0">
          <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 mx-auto mb-1 sm:mb-2 shrink-0" />
          <p className="text-xl sm:text-3xl font-bold text-slate-800 truncate">{data.alerts.expiring.length}</p>
          <p className="text-xs sm:text-sm text-slate-500">Expiring Soon</p>
        </div>
        <div className="panel p-3 sm:p-4 text-center min-w-0">
          <p className="text-xl sm:text-3xl font-bold text-teal-600 truncate">Rs {(data.valuation.totalValue / 1000).toFixed(1)}k</p>
          <p className="text-xs sm:text-sm text-slate-500">Total Value</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
        {/* Inventory List */}
        <div className="lg:col-span-2 panel p-4 sm:p-5 min-w-0 overflow-hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 min-w-0">
            <h3 className="section-header mb-0">Inventory Items</h3>
            <div className="flex items-center gap-2 min-w-0">
              <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
              <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white min-w-0 flex-1 sm:flex-initial">
                <option>All Categories</option>
                <option>Seeds</option>
                <option>Nutrients</option>
                <option>Equipment</option>
                <option>Packaging</option>
              </select>
            </div>
          </div>
          
          {searchQuery && (
            <p className="text-sm text-slate-500 mb-2">
              Showing {filteredItems.length} of {data.items.length} items
            </p>
          )}
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar min-w-0">
            {filteredItems.map((item) => {
              const isLow = item.quantity <= item.reorderPoint;
              const isExpiring = item.expiryDate && (item.expiryDate.getTime() - Date.now()) < 90 * 24 * 60 * 60 * 1000;
              
              return (
                <div 
                  key={item.id} 
                  className={`p-2.5 sm:p-3 rounded-xl border transition-colors min-w-0 overflow-hidden ${
                    isLow ? 'bg-red-50 border-red-200' :
                    isExpiring ? 'bg-amber-50 border-amber-200' :
                    'bg-slate-50 border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        item.category === 'seeds' ? 'bg-emerald-100' :
                        item.category === 'nutrients' ? 'bg-teal-100' :
                        item.category === 'equipment' ? 'bg-blue-100' :
                        'bg-amber-100'
                      }`}>
                        <Package className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          item.category === 'seeds' ? 'text-emerald-600' :
                          item.category === 'nutrients' ? 'text-teal-600' :
                          item.category === 'equipment' ? 'text-blue-600' :
                          'text-amber-600'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800 truncate text-sm sm:text-base">{item.name}</p>
                        <p className="text-xs text-slate-500 truncate">{item.sku} • {item.supplier}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-slate-800 text-sm sm:text-base">{item.quantity} {item.unit}</p>
                      <p className="text-xs text-slate-500">Rs {item.unitCost}/{item.unit}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        item.category === 'seeds' ? 'bg-emerald-100 text-emerald-700' :
                        item.category === 'nutrients' ? 'bg-teal-100 text-teal-700' :
                        item.category === 'equipment' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {item.category}
                      </span>
                      {isLow && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1 shrink-0">
                          <AlertCircle className="w-3 h-3" />
                          Reorder
                        </span>
                      )}
                      {isExpiring && item.expiryDate && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          Expires {item.expiryDate.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {/* Stock Level Bar */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-16 sm:w-24 h-2 bg-slate-200 rounded-full overflow-hidden shrink-0">
                        <div 
                          className={`h-full rounded-full ${
                            isLow ? 'bg-red-500' :
                            item.quantity < item.minStock * 1.5 ? 'bg-amber-500' :
                            'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (item.quantity / item.maxStock) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 truncate">{item.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="panel p-4 sm:p-5 min-w-0 overflow-hidden">
            <h3 className="section-header mb-4">Value by Category</h3>
            <div className="h-40 sm:h-48 min-h-[10rem]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[entry.name.toLowerCase()] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`Rs ${value.toLocaleString()}`]} />
                  <Legend fontSize={11} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Movements */}
          <div className="panel p-4 sm:p-5 min-w-0 overflow-hidden">
            <h3 className="section-header mb-4">Recent Movements</h3>
            <div className="space-y-2">
              {data.movements.map((movement) => {
                const item = data.items.find(i => i.id === movement.itemId);
                return (
                  <div key={movement.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        movement.type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {movement.type === 'in' ? '+' : '-'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{item?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{movement.notes}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-slate-800">{movement.quantity} {item?.unit}</p>
                      <p className="text-xs text-slate-500">{movement.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
