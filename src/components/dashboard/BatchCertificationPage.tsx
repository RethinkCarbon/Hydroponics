import { Award, CheckCircle, Clock, QrCode, ExternalLink, Droplets, Thermometer, Beaker, Zap, Sun, Shield, Leaf, TrendingUp, FileCheck } from 'lucide-react';
import type { BatchCertificationData, BatchCertification } from '@/types/greenhouse';

interface BatchCertificationPageProps {
  data: BatchCertificationData;
}

const badgeConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Award }> = {
  organic_soil_assoc: { label: 'Soil Association Organic', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: Award },
  organic_defra: { label: 'DEFRA Organic', color: 'text-teal-700', bg: 'bg-teal-100', icon: Shield },
  qc_passed: { label: 'QC Passed', color: 'text-blue-700', bg: 'bg-blue-100', icon: FileCheck },
  premium_grade: { label: 'Premium Grade', color: 'text-amber-700', bg: 'bg-amber-100', icon: TrendingUp },
  sustainable: { label: 'Sustainable', color: 'text-green-700', bg: 'bg-green-100', icon: Leaf }
};

function QRCodePlaceholder({ url: _url }: { url: string }) {
  return (
    <div className="w-32 h-32 bg-white border-2 border-slate-200 rounded-xl flex flex-col items-center justify-center p-2">
      <div className="grid grid-cols-5 gap-0.5 w-20 h-20">
        {Array.from({ length: 25 }).map((_, i) => (
          <div 
            key={i} 
            className={`${Math.random() > 0.5 ? 'bg-slate-800' : 'bg-white'} ${
              i === 0 || i === 4 || i === 20 || i === 24 ? 'bg-slate-800' : ''
            }`}
          />
        ))}
      </div>
      <p className="text-[8px] text-slate-400 mt-1 text-center truncate w-full">Scan to trace</p>
    </div>
  );
}

function BatchDetailCard({ batch }: { batch: BatchCertification }) {
  return (
    <div className="panel p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{batch.batchName}</h3>
          <p className="text-sm text-slate-500">Batch ID: {batch.batchId}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          batch.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
          batch.status === 'pending_review' ? 'bg-amber-100 text-amber-700' :
          batch.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
          'bg-red-100 text-red-700'
        }`}>
          {batch.status.replace('_', ' ').toUpperCase()}
        </div>
      </div>

      {/* Badges */}
      {batch.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {batch.badges.map(badge => {
            const config = badgeConfig[badge];
            const Icon = config.icon;
            return (
              <div key={badge} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Compliance Score */}
      <div className="p-4 bg-slate-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">UK Organic Compliance Score</span>
          <span className="text-2xl font-bold text-teal-600">{batch.complianceScore}%</span>
        </div>
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all"
            style={{ width: `${batch.complianceScore}%` }}
          />
        </div>
      </div>

      {/* Operational Data */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-50 rounded-lg text-center">
          <Thermometer className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-800">{batch.operationalData.avgTemperature}°C</p>
          <p className="text-xs text-slate-500">Avg Temp</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg text-center">
          <Droplets className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-800">{batch.operationalData.avgHumidity}%</p>
          <p className="text-xs text-slate-500">Avg Humidity</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg text-center">
          <Beaker className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-800">{batch.operationalData.avgEC}</p>
          <p className="text-xs text-slate-500">Avg EC</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg text-center">
          <Zap className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-800">{batch.operationalData.avgPH}</p>
          <p className="text-xs text-slate-500">Avg pH</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg text-center">
          <Sun className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-800">{batch.operationalData.lightHours}h</p>
          <p className="text-xs text-slate-500">Light/Day</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg text-center">
          <Leaf className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-800">{batch.operationalData.daysToHarvest}</p>
          <p className="text-xs text-slate-500">Days to Harvest</p>
        </div>
      </div>

      {/* UK Organic Compliance */}
      <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
        <h4 className="font-semibold text-teal-800 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          UK Organic Compliance Details
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-teal-700">Water Source</span>
            <span className="font-medium text-teal-800 capitalize">{batch.ukOrganic.waterSource}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-teal-700">Water Test Result</span>
            <span className={`font-medium capitalize ${
              batch.ukOrganic.waterTestResult === 'pass' ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {batch.ukOrganic.waterTestResult}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-teal-700">Nutrient Source</span>
            <span className="font-medium text-teal-800 capitalize">{batch.ukOrganic.nutrientSource}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-teal-700">Organic Nutrient %</span>
            <span className="font-medium text-teal-800">{batch.ukOrganic.organicNutrientPercentage}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-teal-700">Pest Control</span>
            <span className="font-medium text-teal-800 capitalize">{batch.ukOrganic.pestControlMethod}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-teal-700">Pest Incidents</span>
            <span className="font-medium text-teal-800">{batch.operationalData.pestIncidents}</span>
          </div>
        </div>
      </div>

      {/* QR Code */}
      {batch.qrCode && (
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
          <QRCodePlaceholder url={batch.traceUrl} />
          <div className="flex-1">
            <h4 className="font-semibold text-slate-800 mb-1">Product Traceability</h4>
            <p className="text-sm text-slate-500 mb-2">
              Scan this QR code to view the complete growing history of this batch.
            </p>
            <a 
              href={batch.traceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
            >
              View Trace Page <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Audit Info */}
      {batch.reviewedBy && (
        <div className="text-sm text-slate-500">
          <p>Reviewed by: <span className="font-medium text-slate-700">{batch.reviewedBy}</span></p>
          <p>Reviewed on: <span className="font-medium text-slate-700">{batch.reviewedAt?.toLocaleDateString()}</span></p>
        </div>
      )}
    </div>
  );
}

export function BatchCertificationPage({ data }: BatchCertificationPageProps) {
  const approvedBatches = data.batches.filter(b => b.status === 'approved');
  const pendingBatches = data.batches.filter(b => b.status === 'pending_review' || b.status === 'in_progress');

  return (
    <div className="p-0 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Batch Certification</h2>
          <p className="text-slate-500 mt-1">UK Organic Standards compliance & traceability</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-100 rounded-xl">
            <span className="text-sm font-semibold text-emerald-700">Compliance Rate: {data.complianceRate}%</span>
          </div>
        </div>
      </div>

      {/* UK Standards Info */}
      <div className="panel p-5 bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-teal-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-teal-800 mb-1">{data.ukStandards.name} v{data.ukStandards.version}</h3>
            <p className="text-sm text-teal-600 mb-3">
              Certification follows UK organic regulations for leafy greens and herbs, 
              including Soil Association and DEFRA standards.
            </p>
            <div className="flex flex-wrap gap-2">
              {data.ukStandards.keyRequirements.map((req, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-white/70 text-teal-700 rounded-full">
                  {req}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="panel p-4 text-center">
          <Award className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-slate-800">{approvedBatches.length}</p>
          <p className="text-sm text-slate-500">Certified Batches</p>
        </div>
        <div className="panel p-4 text-center">
          <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-slate-800">{data.pendingReview.length}</p>
          <p className="text-sm text-slate-500">Pending Review</p>
        </div>
        <div className="panel p-4 text-center">
          <CheckCircle className="w-8 h-8 text-teal-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-slate-800">{data.approvedThisMonth}</p>
          <p className="text-sm text-slate-500">Approved This Month</p>
        </div>
        <div className="panel p-4 text-center">
          <QrCode className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-slate-800">{approvedBatches.length}</p>
          <p className="text-sm text-slate-500">QR Codes Generated</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Certified Batches */}
        <div>
          <h3 className="section-header mb-4">Certified Batches</h3>
          <div className="space-y-4">
            {approvedBatches.map(batch => (
              <BatchDetailCard key={batch.id} batch={batch} />
            ))}
          </div>
        </div>

        {/* Pending/In Progress */}
        <div>
          <h3 className="section-header mb-4">In Progress / Pending</h3>
          <div className="space-y-4">
            {pendingBatches.map(batch => (
              <BatchDetailCard key={batch.id} batch={batch} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
