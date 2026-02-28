import { useState } from 'react';
import { TrendingUp, Users, DollarSign, ShoppingCart, Target } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { SalesPipelineData, SalesLead } from '@/types/greenhouse';

interface SalesPageProps {
  data: SalesPipelineData;
  actions?: {
    addLead: (lead: Omit<SalesLead, 'id' | 'createdAt'>) => void;
  };
}

const stageColors = {
  prospect: '#94a3b8',
  qualified: '#3b82f6',
  negotiation: '#f59e0b',
  closed_won: '#10b981',
  closed_lost: '#ef4444'
};

const defaultNewLead: Omit<SalesLead, 'id' | 'createdAt'> = {
  customerName: '',
  contact: '',
  cropType: '',
  quantity: 0,
  unit: 'kg',
  estimatedValue: 0,
  stage: 'prospect',
  probability: 25,
  expectedCloseDate: new Date(),
  notes: ''
};

export function SalesPage({ data, actions }: SalesPageProps) {
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [form, setForm] = useState<Omit<SalesLead, 'id' | 'createdAt'>>(defaultNewLead);

  const handleAddLead = () => {
    if (!form.customerName.trim() || !actions?.addLead) return;
    actions.addLead({
      ...form,
      quantity: Number(form.quantity) || 0,
      estimatedValue: Number(form.estimatedValue) || 0,
      probability: Number(form.probability) || 0,
      expectedCloseDate: form.expectedCloseDate instanceof Date ? form.expectedCloseDate : new Date(String(form.expectedCloseDate))
    });
    setForm(defaultNewLead);
    setAddLeadOpen(false);
  };

  const pipelineByStage = [
    { name: 'Prospect', value: data.leads.filter(l => l.stage === 'prospect').reduce((sum, l) => sum + l.estimatedValue, 0), count: data.leads.filter(l => l.stage === 'prospect').length },
    { name: 'Qualified', value: data.leads.filter(l => l.stage === 'qualified').reduce((sum, l) => sum + l.estimatedValue, 0), count: data.leads.filter(l => l.stage === 'qualified').length },
    { name: 'Negotiation', value: data.leads.filter(l => l.stage === 'negotiation').reduce((sum, l) => sum + l.estimatedValue, 0), count: data.leads.filter(l => l.stage === 'negotiation').length },
    { name: 'Closed Won', value: data.leads.filter(l => l.stage === 'closed_won').reduce((sum, l) => sum + l.estimatedValue, 0), count: data.leads.filter(l => l.stage === 'closed_won').length }
  ];

  return (
    <div className="p-0 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sales Pipeline</h2>
          <p className="text-slate-500 mt-1">Lead management and order tracking</p>
        </div>
        <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
          <DialogTrigger asChild>
            <button type="button" className="btn-touch btn-primary">
              <Users className="w-4 h-4" />
              Add Lead
            </button>
          </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={form.customerName}
                  onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                  placeholder="e.g. FreshMart Supermarkets"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={form.contact}
                  onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                  placeholder="Contact person"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type</Label>
                <Input
                  id="cropType"
                  value={form.cropType}
                  onChange={e => setForm(f => ({ ...f, cropType: e.target.value }))}
                  placeholder="e.g. Lettuce Mix"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={0}
                  value={form.quantity || ''}
                  onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  placeholder="kg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Estimated Value (Rs)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  min={0}
                  value={form.estimatedValue || ''}
                  onChange={e => setForm(f => ({ ...f, estimatedValue: Number(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <select
                  id="stage"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.stage}
                  onChange={e => setForm(f => ({ ...f, stage: e.target.value as SalesLead['stage'] }))}
                >
                  <option value="prospect">Prospect</option>
                  <option value="qualified">Qualified</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed_won">Closed Won</option>
                  <option value="closed_lost">Closed Lost</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="probability">Probability (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min={0}
                  max={100}
                  value={form.probability ?? ''}
                  onChange={e => setForm(f => ({ ...f, probability: Number(e.target.value) || 0 }))}
                  placeholder="25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                <Input
                  id="expectedCloseDate"
                  type="date"
                  value={form.expectedCloseDate instanceof Date ? form.expectedCloseDate.toISOString().slice(0, 10) : form.expectedCloseDate}
                  onChange={e => setForm(f => ({ ...f, expectedCloseDate: new Date(e.target.value) }))}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional notes"
                  rows={2}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAddLeadOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddLead} disabled={!form.customerName.trim() || !actions?.addLead}>
              Add Lead
            </Button>
          </div>
        </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Total Pipeline</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">Rs {(data.metrics.totalPipeline / 1000).toFixed(1)}k</p>
          <p className="text-xs text-slate-400 mt-1">Across {data.leads.length} leads</p>
        </div>
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Weighted Pipeline</span>
            <Target className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">Rs {(data.metrics.weightedPipeline / 1000).toFixed(1)}k</p>
          <p className="text-xs text-slate-400 mt-1">Probability adjusted</p>
        </div>
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Conversion Rate</span>
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{data.metrics.conversionRate.toFixed(0)}%</p>
          <p className="text-xs text-slate-400 mt-1">Leads to closed</p>
        </div>
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Avg Deal Size</span>
            <ShoppingCart className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">Rs {(data.metrics.avgDealSize / 1000).toFixed(1)}k</p>
          <p className="text-xs text-slate-400 mt-1">Per opportunity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Pipeline Chart */}
        <div className="panel p-5">
          <h3 className="section-header mb-4">Pipeline by Stage</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineByStage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `Rs ${v/1000}k`} />
                <Tooltip 
                  formatter={(value: number) => [`Rs ${value.toLocaleString()}`, 'Value']}
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {pipelineByStage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={stageColors[entry.name.toLowerCase().replace(' ', '_') as keyof typeof stageColors] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Leads */}
        <div className="panel p-5">
          <h3 className="section-header mb-4">Active Leads</h3>
          <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar">
            {data.leads.filter(l => l.stage !== 'closed_won' && l.stage !== 'closed_lost').map((lead) => (
              <div key={lead.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-teal-300 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-800">{lead.customerName}</h4>
                    <p className="text-sm text-slate-500">{lead.cropType} • {lead.quantity} {lead.unit}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    lead.stage === 'negotiation' ? 'bg-amber-100 text-amber-700' :
                    lead.stage === 'qualified' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {lead.stage.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Rs {lead.estimatedValue.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {lead.probability}%
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Close: {lead.expectedCloseDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="panel p-5">
        <h3 className="section-header mb-4">Active Orders</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.orders.map((order) => (
            <div key={order.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-slate-800">{order.customerName}</h4>
                  <p className="text-sm text-slate-500">Order #{order.id}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                  order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'in_production' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-1 mb-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm text-slate-600">
                    {item.quantity} {item.unit} × {item.cropType}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-800">Rs {order.totalValue.toLocaleString()}</span>
                <span className="text-xs text-slate-500">
                  Delivery: {order.deliveryDate.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
