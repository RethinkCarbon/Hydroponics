import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  GreenhouseState, 
  ClimateData, 
  ClimateSetpoints,
  IrrigationZone,
  ReservoirData,
  FlushSystem,
  ECController,
  pHController,
  UVTreatment,
  VentilationSystem,
  LightingSystem,
  Alert,
  DataPoint,
  TrendData,
  TowerData,
  TowerPlant,
  BatchCertificationData,
  BatchCertification,
  MarketPriceData,
  MarketPrice,
  SalesPipelineData,
  SalesLead,
  CropEconomicsData,
  InventoryData,
  InventoryItem
} from '@/types/greenhouse';

// Generate initial history for sensors
const generateInitialHistory = (baseValue: number, variance: number, points: number = 20): DataPoint[] => {
  const history: DataPoint[] = [];
  const now = new Date();
  for (let i = points - 1; i >= 0; i--) {
    history.push({
      timestamp: new Date(now.getTime() - i * 60000),
      value: baseValue + (Math.random() - 0.5) * variance
    });
  }
  return history;
};

// Generate tower plants
const generateTowerPlants = (towerId: string, count: number = 6): TowerPlant[] => {
  const varieties = ['Romaine Lettuce', 'Butterhead', 'Arugula', 'Basil', 'Kale', 'Spinach'];
  const stages: TowerPlant['growthStage'][] = ['seedling', 'vegetative', 'flowering', 'harvest'];
  const healths: TowerPlant['health'][] = ['normal', 'normal', 'normal', 'warning', 'normal'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${towerId}-plant-${i}`,
    position: i,
    variety: varieties[Math.floor(Math.random() * varieties.length)],
    plantedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    expectedHarvest: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
    health: healths[Math.floor(Math.random() * healths.length)],
    growthStage: stages[Math.floor(Math.random() * stages.length)]
  }));
};

// Generate 50 towers per group (A1..A50, B1..B50)
const generateTowers = (): TowerData[] => {
  const towers: TowerData[] = [];
  const groups = [
    { prefix: 'A', base: 0 },
    { prefix: 'B', base: 50 }
  ] as const;
  for (const { prefix, base } of groups) {
    for (let i = 1; i <= 50; i++) {
      const idx = base + i - 1;
      const id = `tower-${prefix.toLowerCase()}-${i}`;
      const status: TowerData['status'] = idx % 17 === 0 ? 'warning' : idx % 23 === 0 ? 'critical' : 'normal';
      const ec = 1.6 + (idx % 7) * 0.1;
      const ph = 5.9 + (idx % 5) * 0.15;
      towers.push({
        id,
        name: `${prefix}${i}`,
        status,
        plants: generateTowerPlants(id),
        sensors: { ec, ph, temperature: 22 + (idx % 3) * 0.5, flowRate: 2.2 + (idx % 4) * 0.2 },
        lastIrrigation: new Date(Date.now() - (5 + idx % 10) * 60000),
        nextIrrigation: new Date(Date.now() + (8 + idx % 8) * 60000),
        totalYield: 30 + idx * 0.8,
        expectedYield: 45 + idx
      });
    }
  }
  return towers;
};

// Generate UK Organic Batch Certification Data
const generateBatchCertificationData = (): BatchCertificationData => {
  const batches: BatchCertification[] = [
    {
      id: 'cert-batch-1',
      batchId: 'B-2024-001',
      batchName: 'Romaine Lettuce - Tower A',
      cropType: 'Leafy Greens',
      variety: 'Romaine',
      ukOrganic: {
        waterSource: 'rainwater',
        waterTestDate: new Date('2024-01-15'),
        waterTestResult: 'pass',
        permittedInputs: ['Organic Nutrient A', 'Organic Nutrient B', 'pH Buffer'],
        prohibitedInputs: ['Synthetic Pesticides', 'Chemical Fertilizers'],
        inputLogVerified: true,
        pestControlMethod: 'biological',
        lastPestTreatment: new Date('2024-09-01'),
        nutrientSource: 'organic',
        organicNutrientPercentage: 100
      },
      operationalData: {
        avgTemperature: 23.5,
        avgHumidity: 68,
        avgEC: 1.8,
        avgPH: 6.1,
        lightHours: 16,
        waterUsage: 245,
        nutrientUsage: { organic: 12.5, synthetic: 0 },
        pestIncidents: 0,
        daysToHarvest: 45
      },
      status: 'approved',
      badges: ['organic_soil_assoc', 'qc_passed', 'premium_grade'],
      complianceScore: 96,
      qrCode: 'https://planetive.co.uk/trace/B-2024-001',
      traceUrl: 'https://planetive.co.uk/trace/B-2024-001',
      createdAt: new Date('2024-09-01'),
      reviewedAt: new Date('2024-10-15'),
      reviewedBy: 'Sarah Mitchell - Soil Association Auditor',
      notes: 'Excellent compliance with UK organic standards. All inputs verified organic.'
    },
    {
      id: 'cert-batch-2',
      batchId: 'B-2024-002',
      batchName: 'Genovese Basil - Tower B',
      cropType: 'Herbs',
      variety: 'Genovese',
      ukOrganic: {
        waterSource: 'rainwater',
        waterTestDate: new Date('2024-02-01'),
        waterTestResult: 'pass',
        permittedInputs: ['Organic Nutrient A', 'Compost Tea'],
        prohibitedInputs: ['Synthetic Pesticides'],
        inputLogVerified: true,
        pestControlMethod: 'biological',
        nutrientSource: 'organic',
        organicNutrientPercentage: 100
      },
      operationalData: {
        avgTemperature: 24.0,
        avgHumidity: 65,
        avgEC: 1.6,
        avgPH: 6.0,
        lightHours: 14,
        waterUsage: 180,
        nutrientUsage: { organic: 8.2, synthetic: 0 },
        pestIncidents: 1,
        daysToHarvest: 35
      },
      status: 'approved',
      badges: ['organic_defra', 'qc_passed'],
      complianceScore: 92,
      qrCode: 'https://planetive.co.uk/trace/B-2024-002',
      traceUrl: 'https://planetive.co.uk/trace/B-2024-002',
      createdAt: new Date('2024-09-10'),
      reviewedAt: new Date('2024-10-18'),
      reviewedBy: 'James Wilson - DEFRA Inspector',
      notes: 'Minor pest incident resolved with biological control. Full organic compliance.'
    },
    {
      id: 'cert-batch-3',
      batchId: 'B-2024-003',
      batchName: 'Cherry Tomatoes - Tower C',
      cropType: 'Vegetables',
      variety: 'Cherry',
      ukOrganic: {
        waterSource: 'rainwater',
        waterTestDate: new Date('2024-08-15'),
        waterTestResult: 'pass',
        permittedInputs: ['Organic Nutrient A', 'Organic Nutrient B', 'Calcium Supplement'],
        prohibitedInputs: ['Synthetic Pesticides', 'Growth Hormones'],
        inputLogVerified: true,
        pestControlMethod: 'physical',
        nutrientSource: 'organic',
        organicNutrientPercentage: 95
      },
      operationalData: {
        avgTemperature: 24.5,
        avgHumidity: 70,
        avgEC: 2.2,
        avgPH: 6.3,
        lightHours: 18,
        waterUsage: 320,
        nutrientUsage: { organic: 18.5, synthetic: 1.2 },
        pestIncidents: 2,
        daysToHarvest: 65
      },
      status: 'pending_review',
      badges: [],
      complianceScore: 84,
      qrCode: 'https://planetive.co.uk/trace/B-2024-003',
      traceUrl: 'https://planetive.co.uk/trace/B-2024-003',
      createdAt: new Date('2024-09-20'),
      notes: 'Awaiting final review. Minor synthetic input detected (5% emergency use).'
    },
    {
      id: 'cert-batch-4',
      batchId: 'B-2024-004',
      batchName: 'Butterhead Lettuce - Tower A',
      cropType: 'Leafy Greens',
      variety: 'Butterhead',
      ukOrganic: {
        waterSource: 'rainwater',
        waterTestDate: new Date('2024-09-01'),
        waterTestResult: 'pass',
        permittedInputs: ['Organic Nutrient A', 'Organic Nutrient B'],
        prohibitedInputs: ['Synthetic Pesticides', 'Chemical Fertilizers'],
        inputLogVerified: true,
        pestControlMethod: 'none',
        nutrientSource: 'organic',
        organicNutrientPercentage: 100
      },
      operationalData: {
        avgTemperature: 22.8,
        avgHumidity: 66,
        avgEC: 1.7,
        avgPH: 6.0,
        lightHours: 16,
        waterUsage: 210,
        nutrientUsage: { organic: 10.5, synthetic: 0 },
        pestIncidents: 0,
        daysToHarvest: 40
      },
      status: 'in_progress',
      badges: [],
      complianceScore: 0,
      qrCode: '',
      traceUrl: '',
      createdAt: new Date('2024-10-01'),
      notes: 'Batch in growing phase. Certification process will begin at harvest.'
    }
  ];

  return {
    batches,
    pendingReview: batches.filter(b => b.status === 'pending_review'),
    approvedThisMonth: batches.filter(b => b.status === 'approved' && b.reviewedAt && b.reviewedAt.getMonth() === new Date().getMonth()).length,
    complianceRate: Math.round(batches.filter(b => b.status === 'approved').reduce((sum, b) => sum + b.complianceScore, 0) / Math.max(1, batches.filter(b => b.status === 'approved').length)),
    ukStandards: {
      name: 'UK Organic Standards',
      version: '2024.1',
      lastUpdated: new Date('2024-01-01'),
      keyRequirements: [
        'No synthetic pesticides or fertilizers',
        'Water source must be tested annually',
        'Pest control must use biological/physical methods',
        'Minimum 95% organic inputs',
        'Full traceability required',
        'Annual Soil Association inspection'
      ]
    }
  };
};

// Generate Live Market Price Data
const generateMarketPriceData = (): MarketPriceData => {
  const today = new Date();
  
  const prices: MarketPrice[] = [
    {
      id: 'mp-1',
      produceName: 'Romaine Lettuce',
      variety: 'Green Tower',
      category: 'leafy_greens',
      wholesalePrice: 2.85,
      retailPrice: 4.50,
      unit: 'head',
      currency: 'PKR',
      marketLocation: 'New Covent Garden Market, London',
      marketType: 'wholesale',
      supplier: 'Various UK Growers',
      priceDate: today,
      lastUpdated: new Date(today.getTime() - 2 * 60 * 60 * 1000),
      priceChange: 5.2,
      priceChangeDirection: 'up',
      history: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000),
        wholesale: 2.50 + Math.random() * 0.80,
        retail: 4.00 + Math.random() * 1.20
      })),
      demandLevel: 'high',
      seasonality: 'peak'
    },
    {
      id: 'mp-2',
      produceName: 'Butterhead Lettuce',
      variety: 'Salanova',
      category: 'leafy_greens',
      wholesalePrice: 3.20,
      retailPrice: 5.25,
      unit: 'head',
      currency: 'PKR',
      marketLocation: 'Birmingham Wholesale Market',
      marketType: 'wholesale',
      supplier: 'Midlands Organic Farms',
      priceDate: today,
      lastUpdated: new Date(today.getTime() - 4 * 60 * 60 * 1000),
      priceChange: -2.1,
      priceChangeDirection: 'down',
      history: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000),
        wholesale: 2.80 + Math.random() * 0.90,
        retail: 4.50 + Math.random() * 1.50
      })),
      demandLevel: 'medium',
      seasonality: 'shoulder'
    },
    {
      id: 'mp-3',
      produceName: 'Genovese Basil',
      variety: 'Sweet',
      category: 'herbs',
      wholesalePrice: 28.50,
      retailPrice: 45.00,
      unit: 'kg',
      currency: 'PKR',
      marketLocation: 'Spitalfields Market, London',
      marketType: 'wholesale',
      supplier: 'UK Herb Growers Association',
      priceDate: today,
      lastUpdated: new Date(today.getTime() - 1 * 60 * 60 * 1000),
      priceChange: 8.5,
      priceChangeDirection: 'up',
      history: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000),
        wholesale: 24.00 + Math.random() * 8.00,
        retail: 38.00 + Math.random() * 12.00
      })),
      demandLevel: 'high',
      seasonality: 'peak'
    },
    {
      id: 'mp-4',
      produceName: 'Flat Leaf Parsley',
      variety: 'Italian',
      category: 'herbs',
      wholesalePrice: 18.75,
      retailPrice: 32.00,
      unit: 'kg',
      currency: 'PKR',
      marketLocation: 'New Covent Garden Market, London',
      marketType: 'wholesale',
      supplier: 'Various UK Growers',
      priceDate: today,
      lastUpdated: new Date(today.getTime() - 3 * 60 * 60 * 1000),
      priceChange: 1.2,
      priceChangeDirection: 'stable',
      history: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000),
        wholesale: 16.00 + Math.random() * 6.00,
        retail: 28.00 + Math.random() * 10.00
      })),
      demandLevel: 'medium',
      seasonality: 'shoulder'
    },
    {
      id: 'mp-5',
      produceName: 'Cherry Tomatoes',
      variety: 'Sakura',
      category: 'vegetables',
      wholesalePrice: 4.95,
      retailPrice: 7.99,
      unit: 'pack',
      currency: 'PKR',
      marketLocation: 'Bristol Fruit Market',
      marketType: 'wholesale',
      supplier: 'South West Growers Co-op',
      priceDate: today,
      lastUpdated: new Date(today.getTime() - 5 * 60 * 60 * 1000),
      priceChange: -4.3,
      priceChangeDirection: 'down',
      history: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000),
        wholesale: 4.20 + Math.random() * 1.50,
        retail: 6.50 + Math.random() * 2.50
      })),
      demandLevel: 'low',
      seasonality: 'off_peak'
    },
    {
      id: 'mp-6',
      produceName: 'Arugula / Rocket',
      variety: 'Wild',
      category: 'leafy_greens',
      wholesalePrice: 22.00,
      retailPrice: 35.00,
      unit: 'kg',
      currency: 'PKR',
      marketLocation: 'New Covent Garden Market, London',
      marketType: 'wholesale',
      supplier: 'Premium Leafy Greens Ltd',
      priceDate: today,
      lastUpdated: new Date(today.getTime() - 2 * 60 * 60 * 1000),
      priceChange: 12.8,
      priceChangeDirection: 'up',
      history: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000),
        wholesale: 18.00 + Math.random() * 8.00,
        retail: 28.00 + Math.random() * 14.00
      })),
      demandLevel: 'high',
      seasonality: 'peak'
    },
    {
      id: 'mp-7',
      produceName: 'Kale',
      variety: 'Curly',
      category: 'leafy_greens',
      wholesalePrice: 3.50,
      retailPrice: 5.99,
      unit: 'bunch',
      currency: 'PKR',
      marketLocation: 'Leeds Wholesale Market',
      marketType: 'wholesale',
      supplier: 'Yorkshire Organic Farms',
      priceDate: today,
      lastUpdated: new Date(today.getTime() - 6 * 60 * 60 * 1000),
      priceChange: -1.5,
      priceChangeDirection: 'down',
      history: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000),
        wholesale: 2.80 + Math.random() * 1.20,
        retail: 4.50 + Math.random() * 2.50
      })),
      demandLevel: 'medium',
      seasonality: 'shoulder'
    },
    {
      id: 'mp-8',
      produceName: 'Coriander / Cilantro',
      variety: 'Santo',
      category: 'herbs',
      wholesalePrice: 24.50,
      retailPrice: 40.00,
      unit: 'kg',
      currency: 'PKR',
      marketLocation: 'New Covent Garden Market, London',
      marketType: 'wholesale',
      supplier: 'UK Herb Growers Association',
      priceDate: today,
      lastUpdated: new Date(today.getTime() - 1 * 60 * 60 * 1000),
      priceChange: 6.7,
      priceChangeDirection: 'up',
      history: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000),
        wholesale: 20.00 + Math.random() * 8.00,
        retail: 32.00 + Math.random() * 16.00
      })),
      demandLevel: 'high',
      seasonality: 'peak'
    }
  ];

  const avgWholesale = prices.reduce((sum, p) => sum + p.wholesalePrice, 0) / prices.length;
  const avgRetail = prices.reduce((sum, p) => sum + p.retailPrice, 0) / prices.length;
  
  const priceChanges = prices.map(p => Math.abs(p.priceChange));
  const volatility = priceChanges.reduce((sum, c) => sum + c, 0) / priceChanges.length;

  return {
    prices,
    lastUpdated: today,
    overview: {
      avgWholesalePrice: avgWholesale,
      avgRetailPrice: avgRetail,
      priceVolatility: volatility,
      topGainers: prices.filter(p => p.priceChangeDirection === 'up').sort((a, b) => b.priceChange - a.priceChange).slice(0, 3),
      topLosers: prices.filter(p => p.priceChangeDirection === 'down').sort((a, b) => a.priceChange - b.priceChange).slice(0, 3)
    },
    insights: {
      recommendedCrops: ['Genovese Basil', 'Arugula / Rocket', 'Coriander / Cilantro'],
      avoidCrops: ['Cherry Tomatoes'],
      marketTrend: 'bullish'
    }
  };
};

// Generate sales pipeline data
const generateSalesData = (): SalesPipelineData => {
  const leads = [
    { id: 'lead-1', customerName: 'FreshMart Supermarkets', contact: 'Mike Chen', cropType: 'Lettuce Mix', quantity: 500, unit: 'kg', estimatedValue: 8500, stage: 'negotiation' as const, probability: 75, expectedCloseDate: new Date('2024-12-01'), notes: 'Interested in weekly supply', createdAt: new Date('2024-10-01') },
    { id: 'lead-2', customerName: 'Green Plate Restaurant', contact: 'Lisa Wong', cropType: 'Basil', quantity: 50, unit: 'kg', estimatedValue: 1200, stage: 'qualified' as const, probability: 60, expectedCloseDate: new Date('2024-11-15'), notes: 'Needs organic certified', createdAt: new Date('2024-10-05') },
    { id: 'lead-3', customerName: 'City Hospital', contact: 'Dr. Patel', cropType: 'Mixed Greens', quantity: 200, unit: 'kg', estimatedValue: 3800, stage: 'prospect' as const, probability: 30, expectedCloseDate: new Date('2024-12-20'), notes: 'Large volume potential', createdAt: new Date('2024-10-10') },
    { id: 'lead-4', customerName: 'Farm-to-Table Co-op', contact: 'Tom Wilson', cropType: 'Cherry Tomatoes', quantity: 150, unit: 'kg', estimatedValue: 4500, stage: 'closed_won' as const, probability: 100, expectedCloseDate: new Date('2024-10-20'), notes: 'Contract signed', createdAt: new Date('2024-09-15') },
    { id: 'lead-5', customerName: 'Quick Mart Chain', contact: 'John Smith', cropType: 'Spinach', quantity: 300, unit: 'kg', estimatedValue: 5200, stage: 'closed_lost' as const, probability: 0, expectedCloseDate: new Date('2024-10-15'), notes: 'Went with cheaper supplier', createdAt: new Date('2024-09-01') }
  ];

  const orders = [
    { id: 'order-1', customerName: 'FreshMart Supermarkets', items: [{ cropType: 'Romaine', variety: 'Green Tower', quantity: 100, unit: 'kg', unitPrice: 12 }], totalValue: 1200, status: 'delivered' as const, orderDate: new Date('2024-10-01'), deliveryDate: new Date('2024-10-03') },
    { id: 'order-2', customerName: 'Green Plate Restaurant', items: [{ cropType: 'Basil', variety: 'Genovese', quantity: 20, unit: 'kg', unitPrice: 28 }], totalValue: 560, status: 'ready' as const, orderDate: new Date('2024-10-15'), deliveryDate: new Date('2024-10-18') },
    { id: 'order-3', customerName: 'City Grocer', items: [{ cropType: 'Lettuce Mix', variety: 'Spring Mix', quantity: 75, unit: 'kg', unitPrice: 15 }], totalValue: 1125, status: 'in_production' as const, orderDate: new Date('2024-10-20'), deliveryDate: new Date('2024-10-25') }
  ];

  const totalPipeline = leads.filter(l => l.stage !== 'closed_won' && l.stage !== 'closed_lost').reduce((sum, l) => sum + l.estimatedValue, 0);
  const weightedPipeline = leads.filter(l => l.stage !== 'closed_won' && l.stage !== 'closed_lost').reduce((sum, l) => sum + l.estimatedValue * (l.probability / 100), 0);
  const wonDeals = leads.filter(l => l.stage === 'closed_won').length;
  const totalDeals = leads.filter(l => l.stage === 'closed_won' || l.stage === 'closed_lost').length;

  return {
    leads,
    orders,
    metrics: {
      totalPipeline,
      weightedPipeline,
      conversionRate: totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0,
      avgDealSize: leads.reduce((sum, l) => sum + l.estimatedValue, 0) / leads.length,
      monthlyRevenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalValue, 0)
    }
  };
};

// Generate crop economics data
const generateEconomicsData = (): CropEconomicsData => {
  const batches = [
    { id: 'batch-1', name: 'Lettuce Batch A', cropType: 'Lettuce', variety: 'Romaine', plantedDate: new Date('2024-09-01'), expectedHarvest: new Date('2024-10-15'), actualHarvest: new Date('2024-10-14'), quantity: 250, unit: 'kg', costs: { seeds: 150, nutrients: 280, energy: 420, labor: 600, other: 100 }, revenue: 3750, status: 'sold' as const },
    { id: 'batch-2', name: 'Tomato Batch B', cropType: 'Tomato', variety: 'Cherry', plantedDate: new Date('2024-08-15'), expectedHarvest: new Date('2024-11-01'), quantity: 180, unit: 'kg', costs: { seeds: 200, nutrients: 350, energy: 480, labor: 750, other: 120 }, status: 'growing' as const },
    { id: 'batch-3', name: 'Herb Batch C', cropType: 'Basil', variety: 'Genovese', plantedDate: new Date('2024-09-20'), expectedHarvest: new Date('2024-10-25'), actualHarvest: new Date('2024-10-24'), quantity: 45, unit: 'kg', costs: { seeds: 80, nutrients: 120, energy: 180, labor: 300, other: 50 }, revenue: 1260, status: 'sold' as const },
    { id: 'batch-4', name: 'Pepper Batch D', cropType: 'Pepper', variety: 'Bell', plantedDate: new Date('2024-09-10'), expectedHarvest: new Date('2024-12-01'), quantity: 120, unit: 'kg', costs: { seeds: 180, nutrients: 290, energy: 380, labor: 550, other: 80 }, status: 'growing' as const }
  ];

  const totalRevenue = batches.filter(b => b.revenue).reduce((sum, b) => sum + (b.revenue || 0), 0);
  const totalCosts = batches.reduce((sum, b) => sum + Object.values(b.costs).reduce((a, c) => a + c, 0), 0);

  return {
    batches,
    financials: {
      totalRevenue,
      totalCosts,
      grossProfit: totalRevenue - totalCosts,
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0,
      costPerUnit: totalCosts / batches.reduce((sum, b) => sum + b.quantity, 0),
      revenuePerUnit: totalRevenue / batches.filter(b => b.revenue).reduce((sum, b) => sum + b.quantity, 0)
    },
    monthlyTrend: [
      { month: 'Jul', revenue: 8200, costs: 5800, profit: 2400 },
      { month: 'Aug', revenue: 9500, costs: 6200, profit: 3300 },
      { month: 'Sep', revenue: 11200, costs: 7100, profit: 4100 },
      { month: 'Oct', revenue: 12800, costs: 7800, profit: 5000 }
    ]
  };
};

// Generate inventory data
const generateInventoryData = (): InventoryData => {
  const items = [
    { id: 'inv-1', name: 'Romaine Lettuce Seeds', category: 'seeds' as const, sku: 'SEED-ROM-001', quantity: 25, unit: 'packets', minStock: 10, maxStock: 50, reorderPoint: 15, unitCost: 12, location: 'Storage A', supplier: 'GreenSeeds Co.', lastRestocked: new Date('2024-09-15') },
    { id: 'inv-2', name: 'Nutrient A - Grow', category: 'nutrients' as const, sku: 'NUT-A-001', quantity: 45, unit: 'L', minStock: 20, maxStock: 100, reorderPoint: 30, unitCost: 18, location: 'Chemical Store', expiryDate: new Date('2025-06-01'), supplier: 'HydroNutrients', lastRestocked: new Date('2024-10-01') },
    { id: 'inv-3', name: 'Nutrient B - Bloom', category: 'nutrients' as const, sku: 'NUT-B-001', quantity: 38, unit: 'L', minStock: 20, maxStock: 100, reorderPoint: 30, unitCost: 22, location: 'Chemical Store', expiryDate: new Date('2025-06-01'), supplier: 'HydroNutrients', lastRestocked: new Date('2024-10-01') },
    { id: 'inv-4', name: 'pH Up Solution', category: 'nutrients' as const, sku: 'PH-UP-001', quantity: 12, unit: 'L', minStock: 5, maxStock: 30, reorderPoint: 8, unitCost: 15, location: 'Chemical Store', supplier: 'AquaChem', lastRestocked: new Date('2024-09-20') },
    { id: 'inv-5', name: 'pH Down Solution', category: 'nutrients' as const, sku: 'PH-DN-001', quantity: 8, unit: 'L', minStock: 5, maxStock: 30, reorderPoint: 8, unitCost: 15, location: 'Chemical Store', supplier: 'AquaChem', lastRestocked: new Date('2024-09-20') },
    { id: 'inv-6', name: 'Grow Bags', category: 'packaging' as const, sku: 'PKG-BAG-001', quantity: 500, unit: 'pcs', minStock: 200, maxStock: 1000, reorderPoint: 300, unitCost: 0.5, location: 'Packaging Area', supplier: 'PackPro', lastRestocked: new Date('2024-10-05') },
    { id: 'inv-7', name: 'Water Pump - 1000L/h', category: 'equipment' as const, sku: 'EQ-PMP-001', quantity: 3, unit: 'pcs', minStock: 2, maxStock: 10, reorderPoint: 2, unitCost: 180, location: 'Equipment Room', supplier: 'HydroEquip', lastRestocked: new Date('2024-08-10') },
    { id: 'inv-8', name: 'LED Grow Light Strip', category: 'equipment' as const, sku: 'EQ-LED-001', quantity: 2, unit: 'pcs', minStock: 2, maxStock: 20, reorderPoint: 3, unitCost: 85, location: 'Equipment Room', supplier: 'LightGrow', lastRestocked: new Date('2024-07-15') }
  ];

  const lowStock = items.filter(i => i.quantity <= i.reorderPoint);
  const expiring = items.filter(i => i.expiryDate && (i.expiryDate.getTime() - Date.now()) < 90 * 24 * 60 * 60 * 1000);
  const overstock = items.filter(i => i.quantity > i.maxStock * 0.9);

  return {
    items,
    movements: [
      { id: 'mov-1', itemId: 'inv-2', type: 'out' as const, quantity: 5, date: new Date('2024-10-20'), reference: 'Batch-2', notes: 'Nutrient dosing' },
      { id: 'mov-2', itemId: 'inv-1', type: 'out' as const, quantity: 2, date: new Date('2024-10-18'), reference: 'Tower-3', notes: 'New planting' }
    ],
    alerts: { lowStock, expiring, overstock },
    valuation: {
      totalValue: items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0),
      byCategory: {
        seeds: items.filter(i => i.category === 'seeds').reduce((sum, i) => sum + i.quantity * i.unitCost, 0),
        nutrients: items.filter(i => i.category === 'nutrients').reduce((sum, i) => sum + i.quantity * i.unitCost, 0),
        equipment: items.filter(i => i.category === 'equipment').reduce((sum, i) => sum + i.quantity * i.unitCost, 0),
        packaging: items.filter(i => i.category === 'packaging').reduce((sum, i) => sum + i.quantity * i.unitCost, 0)
      }
    }
  };
};

// Initial climate data
const initialClimate: ClimateData = {
  airTemperature: {
    value: 24.5,
    setpoint: 25.0,
    unit: '°C',
    timestamp: new Date(),
    status: 'normal',
    history: generateInitialHistory(24.5, 1.5)
  },
  humidity: {
    value: 68,
    setpoint: 70,
    unit: '%',
    timestamp: new Date(),
    status: 'normal',
    history: generateInitialHistory(68, 5)
  },
  waterTemperature: {
    value: 22.3,
    setpoint: 23.0,
    unit: '°C',
    timestamp: new Date(),
    status: 'normal',
    history: generateInitialHistory(22.3, 1)
  },
  lightLevel: {
    value: 850,
    setpoint: 1000,
    unit: 'μmol/m²/s',
    timestamp: new Date(),
    status: 'normal',
    history: generateInitialHistory(850, 100)
  }
};

const initialClimateSetpoints: ClimateSetpoints = {
  temperature: {
    target: 25.0,
    highThreshold: 28.0,
    lowThreshold: 20.0,
    hysteresis: 1.0,
    mode: 'auto'
  },
  humidity: {
    target: 70,
    highThreshold: 80,
    mode: 'auto'
  }
};

const initialIrrigationZones: IrrigationZone[] = [
  {
    id: 'zone1',
    name: 'Zone A - Tomatoes',
    enabled: true,
    dayRecipe: { onSeconds: 30, offMinutes: 15 },
    nightRecipe: { onSeconds: 20, offMinutes: 30 },
    lastIrrigation: new Date(Date.now() - 5 * 60000),
    nextIrrigation: new Date(Date.now() + 10 * 60000)
  },
  {
    id: 'zone2',
    name: 'Zone B - Lettuce',
    enabled: true,
    dayRecipe: { onSeconds: 45, offMinutes: 10 },
    nightRecipe: { onSeconds: 30, offMinutes: 20 },
    lastIrrigation: new Date(Date.now() - 3 * 60000),
    nextIrrigation: new Date(Date.now() + 7 * 60000)
  },
  {
    id: 'zone3',
    name: 'Zone C - Herbs',
    enabled: false,
    dayRecipe: { onSeconds: 25, offMinutes: 20 },
    nightRecipe: { onSeconds: 15, offMinutes: 40 },
    lastIrrigation: new Date(Date.now() - 60 * 60000),
    nextIrrigation: new Date(Date.now() + 60 * 60000)
  }
];

const initialReservoir: ReservoirData = {
  level: {
    value: 78,
    setpoint: 80,
    unit: '%',
    timestamp: new Date(),
    status: 'normal',
    history: generateInitialHistory(78, 5)
  },
  lowThreshold: 30,
  highThreshold: 95,
  refillTimeout: 300,
  flowRate: 12.5,
  isRefilling: false
};

const initialFlush: FlushSystem = {
  isFlushing: false,
  manualFlushActive: false,
  ecTriggeredFlush: false,
  drainValveOpen: false,
  flushTimer: 0,
  lastFlush: new Date(Date.now() - 24 * 60 * 60000)
};

const initialEC: ECController = {
  current: 1.8,
  setpoint: 2.0,
  deadband: 0.1,
  autoDosing: true,
  doseDuration: 3,
  mixingDelay: 60,
  lastDoseTime: new Date(Date.now() - 30 * 60000),
  nutrientA: { id: 'nutA', name: 'Nutrient A', status: 'off', manualOverride: false, lastActivated: new Date() },
  nutrientB: { id: 'nutB', name: 'Nutrient B', status: 'off', manualOverride: false, lastActivated: new Date() }
};

const initialPH: pHController = {
  current: 6.2,
  targetMin: 5.8,
  targetMax: 6.3,
  autoMode: true,
  doseDelay: 45,
  safetyLockout: false,
  lastAdjustment: new Date(Date.now() - 45 * 60000),
  phUp: { id: 'phUp', name: 'pH Up', status: 'off', manualOverride: false, lastActivated: new Date() },
  phDown: { id: 'phDown', name: 'pH Down', status: 'off', manualOverride: false, lastActivated: new Date() }
};

const initialUV: UVTreatment = {
  status: 'on',
  lampHours: 2450,
  maxLampHours: 8000,
  flowDetected: true,
  maintenanceDue: false,
  lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60000)
};

const initialVentilation: VentilationSystem = {
  exhaustFan: { id: 'exhaust', name: 'Exhaust Fan', status: 'auto', manualOverride: false, lastActivated: new Date() },
  intakeFan: { id: 'intake', name: 'Intake Fan', status: 'auto', manualOverride: false, lastActivated: new Date() },
  circulationFan: { id: 'circulation', name: 'Circulation Fan', status: 'on', manualOverride: false, lastActivated: new Date() },
  coolingPad: { id: 'cooling', name: 'Cooling Pad', status: 'off', manualOverride: false, lastActivated: new Date() },
  fogger: { id: 'fogger', name: 'Fogger', status: 'off', manualOverride: false, lastActivated: new Date() },
  dehumidifier: { id: 'dehumidifier', name: 'Dehumidifier', status: 'off', manualOverride: false, lastActivated: new Date() },
  roofVentPosition: 15,
  shadePosition: 0,
  circulationMode: 'continuous',
  dutyCycleOn: 10,
  dutyCycleOff: 5
};

const initialLighting: LightingSystem = {
  par: {
    value: 450,
    setpoint: 600,
    unit: 'μmol/m²/s',
    timestamp: new Date(),
    status: 'normal',
    history: generateInitialHistory(450, 50)
  },
  lux: {
    value: 28500,
    setpoint: 35000,
    unit: 'lux',
    timestamp: new Date(),
    status: 'normal',
    history: generateInitialHistory(28500, 3000)
  },
  shadeScreen: {
    mode: 'auto',
    openPercentage: 100,
    closePercentage: 0,
    lightBased: true,
    tempBased: true,
    timeBased: false
  },
  cropStage: 'vegetative'
};

const initialAlerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    message: 'UV lamp approaching maintenance (2450/8000 hrs)',
    timestamp: new Date(Date.now() - 2 * 60000),
    acknowledged: false,
    device: 'uv-system',
    actionTarget: { view: 'uv', label: 'UV system' }
  },
  {
    id: '2',
    type: 'info',
    message: 'Zone C irrigation disabled for maintenance',
    timestamp: new Date(Date.now() - 30 * 60000),
    acknowledged: true,
    device: 'irrigation-zone3',
    actionTarget: { view: 'irrigation', label: 'Irrigation' }
  },
  {
    id: '3',
    type: 'critical',
    message: 'EC drift high in main reservoir – consider flush',
    timestamp: new Date(Date.now() - 8 * 60000),
    acknowledged: false,
    device: 'ec-controller',
    actionTarget: { view: 'ec', label: 'EC / nutrients', secondaryActionKey: 'startFlush' }
  },
  {
    id: '4',
    type: 'warning',
    message: 'Reservoir level below 30%',
    timestamp: new Date(Date.now() - 15 * 60000),
    acknowledged: false,
    device: 'reservoir-sensor',
    actionTarget: { view: 'irrigation', label: 'Reservoir', secondaryActionKey: 'stopIrrigation' }
  },
  {
    id: '5',
    type: 'warning',
    message: 'pH drift critical in Zone B',
    timestamp: new Date(Date.now() - 5 * 60000),
    acknowledged: false,
    device: 'ph-probe-b',
    actionTarget: { view: 'ph', label: 'pH', secondaryActionKey: 'startFlush' }
  }
];

const initialState: GreenhouseState = {
  connected: true,
  lastUpdate: new Date(),
  towers: generateTowers(),
  climate: initialClimate,
  climateSetpoints: initialClimateSetpoints,
  irrigation: {
    zones: initialIrrigationZones,
    reservoir: initialReservoir,
    flush: initialFlush
  },
  ec: initialEC,
  ph: initialPH,
  uv: initialUV,
  ventilation: initialVentilation,
  lighting: initialLighting,
  alerts: initialAlerts,
  emergencyMode: false,
  // Workstreams
  certification: generateBatchCertificationData(),
  market: generateMarketPriceData(),
  sales: generateSalesData(),
  economics: generateEconomicsData(),
  inventory: generateInventoryData()
};

export function useGreenhouseData() {
  const [state, setState] = useState<GreenhouseState>(initialState);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate real-time data updates
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setState(prev => {
        const now = new Date();
        
        // Update sensor values with small random fluctuations
        const newAirTemp = Math.max(18, Math.min(32, prev.climate.airTemperature.value + (Math.random() - 0.5) * 0.3));
        const newHumidity = Math.max(40, Math.min(90, prev.climate.humidity.value + (Math.random() - 0.5) * 1));
        const newWaterTemp = Math.max(18, Math.min(28, prev.climate.waterTemperature.value + (Math.random() - 0.5) * 0.2));
        const newLightLevel = Math.max(0, Math.min(2000, prev.climate.lightLevel.value + (Math.random() - 0.5) * 20));
        const newReservoirLevel = Math.max(0, Math.min(100, prev.irrigation.reservoir.level.value + (prev.irrigation.reservoir.isRefilling ? 0.2 : -0.05)));
        const newEC = Math.max(0.5, Math.min(4.0, prev.ec.current + (Math.random() - 0.5) * 0.02));
        const newPH = Math.max(5.0, Math.min(8.0, prev.ph.current + (Math.random() - 0.5) * 0.01));
        const newPAR = Math.max(0, Math.min(1500, prev.lighting.par.value + (Math.random() - 0.5) * 10));
        
        // Update tower sensors
        const updatedTowers = prev.towers.map(tower => ({
          ...tower,
          sensors: {
            ec: Math.max(1.0, Math.min(3.0, tower.sensors.ec + (Math.random() - 0.5) * 0.05)),
            ph: Math.max(5.5, Math.min(7.0, tower.sensors.ph + (Math.random() - 0.5) * 0.02)),
            temperature: Math.max(20, Math.min(26, tower.sensors.temperature + (Math.random() - 0.5) * 0.2)),
            flowRate: Math.max(1.5, Math.min(4.0, tower.sensors.flowRate + (Math.random() - 0.5) * 0.1))
          }
        }));
        
        // Determine status based on thresholds
        const getTempStatus = (val: number): 'normal' | 'warning' | 'critical' | 'offline' => {
          if (val > 30 || val < 16) return 'critical';
          if (val > 28 || val < 18) return 'warning';
          return 'normal';
        };
        
        const getHumidityStatus = (val: number): 'normal' | 'warning' | 'critical' | 'offline' => {
          if (val > 85 || val < 35) return 'critical';
          if (val > 80 || val < 40) return 'warning';
          return 'normal';
        };
        
        const getReservoirStatus = (val: number): 'normal' | 'warning' | 'critical' | 'offline' => {
          if (val < 20) return 'critical';
          if (val < 30) return 'warning';
          return 'normal';
        };
        
        // Update history arrays
        const updateHistory = (history: DataPoint[], newValue: number): DataPoint[] => {
          const newHistory = [...history, { timestamp: now, value: newValue }];
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
        };

        return {
          ...prev,
          lastUpdate: now,
          towers: updatedTowers,
          climate: {
            ...prev.climate,
            airTemperature: {
              ...prev.climate.airTemperature,
              value: newAirTemp,
              timestamp: now,
              status: getTempStatus(newAirTemp),
              history: updateHistory(prev.climate.airTemperature.history, newAirTemp)
            },
            humidity: {
              ...prev.climate.humidity,
              value: newHumidity,
              timestamp: now,
              status: getHumidityStatus(newHumidity),
              history: updateHistory(prev.climate.humidity.history, newHumidity)
            },
            waterTemperature: {
              ...prev.climate.waterTemperature,
              value: newWaterTemp,
              timestamp: now,
              status: 'normal',
              history: updateHistory(prev.climate.waterTemperature.history, newWaterTemp)
            },
            lightLevel: {
              ...prev.climate.lightLevel,
              value: newLightLevel,
              timestamp: now,
              status: 'normal',
              history: updateHistory(prev.climate.lightLevel.history, newLightLevel)
            }
          },
          irrigation: {
            ...prev.irrigation,
            reservoir: {
              ...prev.irrigation.reservoir,
              level: {
                ...prev.irrigation.reservoir.level,
                value: newReservoirLevel,
                timestamp: now,
                status: getReservoirStatus(newReservoirLevel)
              },
              isRefilling: newReservoirLevel < prev.irrigation.reservoir.lowThreshold + 10
            }
          },
          ec: {
            ...prev.ec,
            current: newEC
          },
          ph: {
            ...prev.ph,
            current: newPH
          },
          lighting: {
            ...prev.lighting,
            par: {
              ...prev.lighting.par,
              value: newPAR,
              timestamp: now,
              history: updateHistory(prev.lighting.par.history, newPAR)
            }
          }
        };
      });
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Generate trend data for analytics
  useEffect(() => {
    const generateTrendData = () => {
      const data: TrendData[] = [];
      const now = new Date();
      for (let i = 24; i >= 0; i--) {
        data.push({
          timestamp: new Date(now.getTime() - i * 60 * 60000),
          temperature: 23 + Math.sin(i * 0.3) * 3 + (Math.random() - 0.5),
          humidity: 65 + Math.cos(i * 0.25) * 10 + (Math.random() - 0.5) * 3,
          ec: 1.9 + Math.sin(i * 0.2) * 0.2 + (Math.random() - 0.5) * 0.05,
          ph: 6.1 + Math.cos(i * 0.15) * 0.3 + (Math.random() - 0.5) * 0.03,
          waterLevel: 75 + Math.sin(i * 0.1) * 10 + (Math.random() - 0.5) * 2,
          energy: 2.5 + Math.sin(i * 0.4) * 1.5 + (Math.random() - 0.5) * 0.3
        });
      }
      setTrendData(data);
    };
    
    generateTrendData();
    const trendInterval = setInterval(generateTrendData, 60000);
    return () => clearInterval(trendInterval);
  }, []);

  // Control actions
  const toggleDevice = useCallback((deviceId: string, deviceType: 'ventilation') => {
    setState(prev => {
      if (deviceType === 'ventilation') {
        const device = prev.ventilation[deviceId as keyof VentilationSystem] as ControlDevice | undefined;
        if (device && typeof device === 'object' && 'status' in device) {
          return {
            ...prev,
            ventilation: {
              ...prev.ventilation,
              [deviceId]: {
                ...device,
                status: device.status === 'on' ? 'off' : 'on' as 'on' | 'off' | 'auto',
                lastActivated: new Date()
              }
            }
          };
        }
      }
      return prev;
    });
  }, []);

  const updateSetpoint = useCallback((parameter: string, value: number) => {
    setState(prev => {
      if (parameter === 'temperature') {
        return {
          ...prev,
          climateSetpoints: {
            ...prev.climateSetpoints,
            temperature: { ...prev.climateSetpoints.temperature, target: value }
          }
        };
      }
      if (parameter === 'humidity') {
        return {
          ...prev,
          climateSetpoints: {
            ...prev.climateSetpoints,
            humidity: { ...prev.climateSetpoints.humidity, target: value }
          }
        };
      }
      if (parameter === 'ec') {
        return { ...prev, ec: { ...prev.ec, setpoint: value } };
      }
      return prev;
    });
  }, []);

  const setVentPosition = useCallback((position: number) => {
    setState(prev => ({
      ...prev,
      ventilation: { ...prev.ventilation, roofVentPosition: Math.max(0, Math.min(100, position)) }
    }));
  }, []);

  const setTemperatureMode = useCallback((mode: 'auto' | 'manual') => {
    setState(prev => ({
      ...prev,
      climateSetpoints: {
        ...prev.climateSetpoints,
        temperature: { ...prev.climateSetpoints.temperature, mode }
      }
    }));
  }, []);

  const setHumidityMode = useCallback((mode: 'auto' | 'manual') => {
    setState(prev => ({
      ...prev,
      climateSetpoints: {
        ...prev.climateSetpoints,
        humidity: { ...prev.climateSetpoints.humidity, mode }
      }
    }));
  }, []);

  const setCirculationMode = useCallback((mode: 'continuous' | 'duty_cycle') => {
    setState(prev => ({
      ...prev,
      ventilation: { ...prev.ventilation, circulationMode: mode }
    }));
  }, []);

  const setShadeScreenMode = useCallback((mode: 'auto' | 'manual') => {
    setState(prev => ({
      ...prev,
      lighting: {
        ...prev.lighting,
        shadeScreen: { ...prev.lighting.shadeScreen, mode }
      }
    }));
  }, []);

  const setShadeScreenLightBased = useCallback((value: boolean) => {
    setState(prev => ({
      ...prev,
      lighting: {
        ...prev.lighting,
        shadeScreen: { ...prev.lighting.shadeScreen, lightBased: value }
      }
    }));
  }, []);

  const setShadeScreenTempBased = useCallback((value: boolean) => {
    setState(prev => ({
      ...prev,
      lighting: {
        ...prev.lighting,
        shadeScreen: { ...prev.lighting.shadeScreen, tempBased: value }
      }
    }));
  }, []);

  const setShadeScreenTimeBased = useCallback((value: boolean) => {
    setState(prev => ({
      ...prev,
      lighting: {
        ...prev.lighting,
        shadeScreen: { ...prev.lighting.shadeScreen, timeBased: value }
      }
    }));
  }, []);

  const setCropStage = useCallback((stage: 'seedling' | 'vegetative' | 'flowering' | 'harvest') => {
    setState(prev => ({
      ...prev,
      lighting: { ...prev.lighting, cropStage: stage }
    }));
  }, []);

  const setShadePosition = useCallback((position: number) => {
    setState(prev => ({
      ...prev,
      ventilation: { ...prev.ventilation, shadePosition: Math.max(0, Math.min(100, position)) },
      lighting: { 
        ...prev.lighting, 
        shadeScreen: { ...prev.lighting.shadeScreen, openPercentage: 100 - position }
      }
    }));
  }, []);

  const triggerDose = useCallback((type: 'nutrientA' | 'nutrientB' | 'phUp' | 'phDown') => {
    setState(prev => {
      if (type === 'nutrientA' || type === 'nutrientB') {
        return {
          ...prev,
          ec: {
            ...prev.ec,
            [type]: {
              ...prev.ec[type],
              status: 'on' as 'on' | 'off' | 'auto',
              lastActivated: new Date()
            }
          }
        };
      }
      return {
        ...prev,
        ph: {
          ...prev.ph,
          [type]: {
            ...prev.ph[type],
            status: 'on' as 'on' | 'off' | 'auto',
            lastActivated: new Date()
          }
        }
      };
    });
    
    setTimeout(() => {
      setState(prev => {
        if (type === 'nutrientA' || type === 'nutrientB') {
          return {
            ...prev,
            ec: {
              ...prev.ec,
              [type]: { ...prev.ec[type], status: 'off' as 'on' | 'off' | 'auto' }
            }
          };
        }
        return {
          ...prev,
          ph: {
            ...prev.ph,
            [type]: { ...prev.ph[type], status: 'off' as 'on' | 'off' | 'auto' }
          }
        };
      });
    }, 3000);
  }, []);

  const toggleZone = useCallback((zoneId: string) => {
    setState(prev => ({
      ...prev,
      irrigation: {
        ...prev.irrigation,
        zones: prev.irrigation.zones.map(z =>
          z.id === zoneId ? { ...z, enabled: !z.enabled } : z
        )
      }
    }));
  }, []);

  const setEcAutoDosing = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, ec: { ...prev.ec, autoDosing: value } }));
  }, []);

  const setEcDoseDuration = useCallback((seconds: number) => {
    setState(prev => ({ ...prev, ec: { ...prev.ec, doseDuration: seconds } }));
  }, []);

  const setEcTriggeredFlush = useCallback((value: boolean) => {
    setState(prev => ({
      ...prev,
      irrigation: {
        ...prev.irrigation,
        flush: { ...prev.irrigation.flush, ecTriggeredFlush: value }
      }
    }));
  }, []);

  const setManualFlush = useCallback((active: boolean) => {
    setState(prev => ({
      ...prev,
      irrigation: {
        ...prev.irrigation,
        flush: {
          ...prev.irrigation.flush,
          isFlushing: active,
          manualFlushActive: active,
          flushTimer: active ? 300 : 0
        }
      }
    }));
  }, []);

  const setPhAutoMode = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, ph: { ...prev.ph, autoMode: value } }));
  }, []);

  const setPhDoseDelay = useCallback((seconds: number) => {
    setState(prev => ({ ...prev, ph: { ...prev.ph, doseDelay: seconds } }));
  }, []);

  const logUVMaintenance = useCallback(() => {
    setState(prev => ({
      ...prev,
      uv: {
        ...prev.uv,
        lastMaintenance: new Date(),
        lampHours: 0,
        maintenanceDue: false
      }
    }));
  }, []);

  const addLead = useCallback((lead: Omit<SalesLead, 'id' | 'createdAt'>) => {
    const id = `lead-${Date.now()}`;
    const createdAt = new Date();
    const newLead: SalesLead = { ...lead, id, createdAt };
    setState(prev => {
      const leads = [...prev.sales.leads, newLead];
      const totalPipeline = leads.filter(l => l.stage !== 'closed_won' && l.stage !== 'closed_lost').reduce((sum, l) => sum + l.estimatedValue, 0);
      const weightedPipeline = leads.filter(l => l.stage !== 'closed_won' && l.stage !== 'closed_lost').reduce((sum, l) => sum + l.estimatedValue * (l.probability / 100), 0);
      const wonDeals = leads.filter(l => l.stage === 'closed_won').length;
      const totalDeals = leads.filter(l => l.stage === 'closed_won' || l.stage === 'closed_lost').length;
      return {
        ...prev,
        sales: {
          ...prev.sales,
          leads,
          metrics: {
            ...prev.sales.metrics,
            totalPipeline,
            weightedPipeline,
            conversionRate: totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0,
            avgDealSize: leads.length > 0 ? leads.reduce((sum, l) => sum + l.estimatedValue, 0) / leads.length : prev.sales.metrics.avgDealSize
          }
        }
      };
    });
  }, []);

  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id' | 'lastRestocked'>) => {
    const id = `inv-${Date.now()}`;
    const lastRestocked = new Date();
    const newItem: InventoryItem = { ...item, id, lastRestocked };
    setState(prev => {
      const items = [...prev.inventory.items, newItem];
      const lowStock = items.filter(i => i.quantity <= i.reorderPoint);
      const expiring = items.filter(i => i.expiryDate && (i.expiryDate.getTime() - Date.now()) < 90 * 24 * 60 * 60 * 1000);
      const overstock = items.filter(i => i.quantity > i.maxStock * 0.9);
      const byCategory = { ...prev.inventory.valuation.byCategory };
      const cat = newItem.category;
      byCategory[cat] = (byCategory[cat] || 0) + newItem.quantity * newItem.unitCost;
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          items,
          alerts: { ...prev.inventory.alerts, lowStock, expiring, overstock },
          valuation: {
            totalValue: items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0),
            byCategory
          }
        }
      };
    });
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => 
        a.id === alertId ? { ...a, acknowledged: true } : a
      )
    }));
  }, []);

  const triggerEmergencyStop = useCallback(() => {
    setState(prev => ({
      ...prev,
      emergencyMode: true,
      ec: { ...prev.ec, autoDosing: false },
      ph: { ...prev.ph, autoMode: false },
      ventilation: {
        ...prev.ventilation,
        exhaustFan: { ...prev.ventilation.exhaustFan, status: 'on' },
        intakeFan: { ...prev.ventilation.intakeFan, status: 'on' }
      }
    }));
  }, []);

  const resetEmergency = useCallback(() => {
    setState(prev => ({ ...prev, emergencyMode: false }));
  }, []);

  const stopIrrigation = useCallback(() => {
    setState(prev => ({
      ...prev,
      irrigation: {
        ...prev.irrigation,
        zones: prev.irrigation.zones.map(z => ({ ...z, enabled: false }))
      }
    }));
  }, []);

  const closeAllVents = useCallback(() => {
    setState(prev => ({
      ...prev,
      ventilation: {
        ...prev.ventilation,
        roofVentPosition: 0,
        exhaustFan: { ...prev.ventilation.exhaustFan, status: 'off' },
        intakeFan: { ...prev.ventilation.intakeFan, status: 'off' },
        coolingPad: { ...prev.ventilation.coolingPad, status: 'off' }
      }
    }));
  }, []);

  const activeAlertsCount = state.alerts.filter(a => !a.acknowledged).length;
  const criticalAlertsCount = state.alerts.filter(a => !a.acknowledged && a.type === 'critical').length;

  return {
    state,
    trendData,
    activeAlertsCount,
    criticalAlertsCount,
    actions: {
      toggleDevice,
      updateSetpoint,
      setVentPosition,
      setTemperatureMode,
      setHumidityMode,
      setCirculationMode,
      setShadeScreenMode,
      setShadeScreenLightBased,
      setShadeScreenTempBased,
      setShadeScreenTimeBased,
      setCropStage,
      setShadePosition,
      triggerDose,
      toggleZone,
      setEcAutoDosing,
      setEcDoseDuration,
      setEcTriggeredFlush,
      setManualFlush,
      setPhAutoMode,
      setPhDoseDelay,
      logUVMaintenance,
      addLead,
      addInventoryItem,
      acknowledgeAlert,
      triggerEmergencyStop,
      resetEmergency,
      stopIrrigation,
      closeAllVents
    }
  };
}

// Type import for ControlDevice
import type { ControlDevice } from '@/types/greenhouse';
