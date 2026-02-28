// ============================================================================
// Greenhouse Control System - Type Definitions
// ============================================================================

export type UserRole = 'admin' | 'operator';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export type StatusLevel = 'normal' | 'warning' | 'critical' | 'offline';

export interface SensorData {
  value: number;
  setpoint?: number;
  unit: string;
  timestamp: Date;
  status: StatusLevel;
  history: DataPoint[];
}

export interface DataPoint {
  timestamp: Date;
  value: number;
}

export interface ControlDevice {
  id: string;
  name: string;
  status: 'on' | 'off' | 'auto';
  manualOverride: boolean;
  lastActivated: Date;
}

// Hydroponic Tower
export interface TowerPlant {
  id: string;
  position: number;
  variety: string;
  plantedDate: Date;
  expectedHarvest: Date;
  health: StatusLevel;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
}

export interface TowerData {
  id: string;
  name: string;
  status: StatusLevel;
  plants: TowerPlant[];
  sensors: {
    ec: number;
    ph: number;
    temperature: number;
    flowRate: number;
  };
  lastIrrigation: Date;
  nextIrrigation: Date;
  totalYield: number;
  expectedYield: number;
}

// Climate Control
export interface ClimateData {
  airTemperature: SensorData;
  humidity: SensorData;
  waterTemperature: SensorData;
  lightLevel: SensorData;
}

export interface ClimateSetpoints {
  temperature: {
    target: number;
    highThreshold: number;
    lowThreshold: number;
    hysteresis: number;
    mode: 'auto' | 'manual';
  };
  humidity: {
    target: number;
    highThreshold: number;
    mode: 'auto' | 'manual';
  };
}

// Irrigation & Fertigation
export interface IrrigationZone {
  id: string;
  name: string;
  enabled: boolean;
  dayRecipe: { onSeconds: number; offMinutes: number };
  nightRecipe: { onSeconds: number; offMinutes: number };
  lastIrrigation: Date;
  nextIrrigation: Date;
}

export interface ReservoirData {
  level: SensorData;
  lowThreshold: number;
  highThreshold: number;
  refillTimeout: number;
  flowRate: number;
  isRefilling: boolean;
}

export interface FlushSystem {
  isFlushing: boolean;
  manualFlushActive: boolean;
  ecTriggeredFlush: boolean;
  drainValveOpen: boolean;
  flushTimer: number;
  lastFlush: Date;
}

// EC & pH Control
export interface ECController {
  current: number;
  setpoint: number;
  deadband: number;
  autoDosing: boolean;
  doseDuration: number;
  mixingDelay: number;
  lastDoseTime: Date;
  nutrientA: ControlDevice;
  nutrientB: ControlDevice;
}

export interface pHController {
  current: number;
  targetMin: number;
  targetMax: number;
  autoMode: boolean;
  doseDelay: number;
  safetyLockout: boolean;
  lastAdjustment: Date;
  phUp: ControlDevice;
  phDown: ControlDevice;
}

// UV Treatment
export interface UVTreatment {
  status: 'on' | 'off' | 'standby';
  lampHours: number;
  maxLampHours: number;
  flowDetected: boolean;
  maintenanceDue: boolean;
  lastMaintenance: Date;
}

// Ventilation & Shading
export interface VentilationSystem {
  exhaustFan: ControlDevice;
  intakeFan: ControlDevice;
  circulationFan: ControlDevice;
  coolingPad: ControlDevice;
  fogger: ControlDevice;
  dehumidifier: ControlDevice;
  roofVentPosition: number;
  shadePosition: number;
  circulationMode: 'continuous' | 'duty_cycle';
  dutyCycleOn: number;
  dutyCycleOff: number;
}

// Lighting
export interface LightingSystem {
  par: SensorData;
  lux: SensorData;
  shadeScreen: {
    mode: 'auto' | 'manual';
    openPercentage: number;
    closePercentage: number;
    lightBased: boolean;
    tempBased: boolean;
    timeBased: boolean;
  };
  cropStage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
}

// Alerts
export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  device?: string;
  /** Where to go or what to do from this alert */
  actionTarget?: {
    view: string;
    label: string;
    /** e.g. 'startFlush' – triggers an immediate action on the target page */
    secondaryActionKey?: 'startFlush' | 'stopIrrigation';
  };
}

export interface AlertConfig {
  smsEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  criticalAlerts: string[];
}

// ============================================================================
// UK ORGANIC BATCH CERTIFICATION
// ============================================================================

// UK Organic Standards Compliance Parameters
export interface UKOrganicParameters {
  // Soil Association / DEFRA Organic Standards
  waterSource: 'mains' | 'rainwater' | 'recycled';
  waterTestDate: Date;
  waterTestResult: 'pass' | 'fail' | 'pending';
  
  // Input Restrictions
  permittedInputs: string[];
  prohibitedInputs: string[];
  inputLogVerified: boolean;
  
  // Pest Management
  pestControlMethod: 'biological' | 'physical' | 'none';
  lastPestTreatment?: Date;
  
  // Nutrient Management
  nutrientSource: 'organic' | 'synthetic' | 'mixed';
  organicNutrientPercentage: number;
}

// Batch Certification Status
export type CertificationBadge = 'organic_soil_assoc' | 'organic_defra' | 'qc_passed' | 'premium_grade' | 'sustainable';

export interface BatchCertification {
  id: string;
  batchId: string;
  batchName: string;
  cropType: string;
  variety: string;
  
  // UK Organic Compliance
  ukOrganic: UKOrganicParameters;
  
  // Operational Parameters (auto-logged from system)
  operationalData: {
    avgTemperature: number;
    avgHumidity: number;
    avgEC: number;
    avgPH: number;
    lightHours: number;
    waterUsage: number;
    nutrientUsage: {
      organic: number;
      synthetic: number;
    };
    pestIncidents: number;
    daysToHarvest: number;
  };
  
  // Certification Status
  status: 'in_progress' | 'pending_review' | 'approved' | 'rejected';
  badges: CertificationBadge[];
  complianceScore: number; // 0-100
  
  // QR Code for packaging
  qrCode: string;
  traceUrl: string;
  
  // Audit Trail
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes: string;
}

export interface BatchCertificationData {
  batches: BatchCertification[];
  pendingReview: BatchCertification[];
  approvedThisMonth: number;
  complianceRate: number;
  
  // UK Standards Reference
  ukStandards: {
    name: string;
    version: string;
    lastUpdated: Date;
    keyRequirements: string[];
  };
}

// ============================================================================
// LIVE MARKET PRICES
// ============================================================================

export type MarketType = 'wholesale' | 'retail' | 'farmers_market';
export type ProduceCategory = 'leafy_greens' | 'herbs' | 'microgreens' | 'vegetables' | 'fruits';

export interface MarketPrice {
  id: string;
  produceName: string;
  variety: string;
  category: ProduceCategory;
  
  // Pricing
  wholesalePrice: number;
  retailPrice: number;
  unit: 'kg' | 'bunch' | 'pack' | 'head';
  currency: string;
  
  // Market Info
  marketLocation: string;
  marketType: MarketType;
  supplier: string;
  
  // Timestamps
  priceDate: Date;
  lastUpdated: Date;
  
  // Trends
  priceChange: number; // percentage change
  priceChangeDirection: 'up' | 'down' | 'stable';
  
  // Historical data for charts
  history: {
    date: Date;
    wholesale: number;
    retail: number;
  }[];
  
  // Demand indicators
  demandLevel: 'high' | 'medium' | 'low';
  seasonality: 'peak' | 'shoulder' | 'off_peak';
}

export interface MarketPriceData {
  prices: MarketPrice[];
  lastUpdated: Date;
  
  // Market Overview
  overview: {
    avgWholesalePrice: number;
    avgRetailPrice: number;
    priceVolatility: number;
    topGainers: MarketPrice[];
    topLosers: MarketPrice[];
  };
  
  // Supply/Demand Insights
  insights: {
    recommendedCrops: string[];
    avoidCrops: string[];
    marketTrend: 'bullish' | 'bearish' | 'neutral';
  };
}

// ============================================================================
// SALES PIPELINE
// ============================================================================

export interface SalesLead {
  id: string;
  customerName: string;
  contact: string;
  cropType: string;
  quantity: number;
  unit: string;
  estimatedValue: number;
  stage: 'prospect' | 'qualified' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expectedCloseDate: Date;
  notes: string;
  createdAt: Date;
}

export interface SalesOrder {
  id: string;
  customerName: string;
  items: OrderItem[];
  totalValue: number;
  status: 'pending' | 'confirmed' | 'in_production' | 'ready' | 'delivered';
  orderDate: Date;
  deliveryDate: Date;
}

export interface OrderItem {
  cropType: string;
  variety: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface SalesPipelineData {
  leads: SalesLead[];
  orders: SalesOrder[];
  metrics: {
    totalPipeline: number;
    weightedPipeline: number;
    conversionRate: number;
    avgDealSize: number;
    monthlyRevenue: number;
  };
}

// ============================================================================
// CROP ECONOMICS
// ============================================================================

export interface CropBatch {
  id: string;
  name: string;
  cropType: string;
  variety: string;
  plantedDate: Date;
  expectedHarvest: Date;
  actualHarvest?: Date;
  quantity: number;
  unit: string;
  costs: {
    seeds: number;
    nutrients: number;
    energy: number;
    labor: number;
    other: number;
  };
  revenue?: number;
  status: 'growing' | 'harvested' | 'sold';
}

export interface CropEconomicsData {
  batches: CropBatch[];
  financials: {
    totalRevenue: number;
    totalCosts: number;
    grossProfit: number;
    profitMargin: number;
    costPerUnit: number;
    revenuePerUnit: number;
  };
  monthlyTrend: {
    month: string;
    revenue: number;
    costs: number;
    profit: number;
  }[];
}

// ============================================================================
// INVENTORY MANAGEMENT
// ============================================================================

export interface InventoryItem {
  id: string;
  name: string;
  category: 'seeds' | 'nutrients' | 'equipment' | 'packaging' | 'other';
  sku: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitCost: number;
  location: string;
  expiryDate?: Date;
  supplier: string;
  lastRestocked: Date;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out';
  quantity: number;
  date: Date;
  reference: string;
  notes: string;
}

export interface InventoryData {
  items: InventoryItem[];
  movements: InventoryMovement[];
  alerts: {
    lowStock: InventoryItem[];
    expiring: InventoryItem[];
    overstock: InventoryItem[];
  };
  valuation: {
    totalValue: number;
    byCategory: Record<string, number>;
  };
}

// System State
export interface GreenhouseState {
  connected: boolean;
  lastUpdate: Date;
  towers: TowerData[];
  climate: ClimateData;
  climateSetpoints: ClimateSetpoints;
  irrigation: {
    zones: IrrigationZone[];
    reservoir: ReservoirData;
    flush: FlushSystem;
  };
  ec: ECController;
  ph: pHController;
  uv: UVTreatment;
  ventilation: VentilationSystem;
  lighting: LightingSystem;
  alerts: Alert[];
  emergencyMode: boolean;
  // Workstreams
  certification: BatchCertificationData;
  market: MarketPriceData;
  sales: SalesPipelineData;
  economics: CropEconomicsData;
  inventory: InventoryData;
}

// Chart Data
export interface ChartRange {
  label: string;
  value: '1h' | '24h' | '7d' | '30d';
  hours: number;
}

export interface TrendData {
  timestamp: Date;
  temperature?: number;
  humidity?: number;
  ec?: number;
  ph?: number;
  waterLevel?: number;
  energy?: number;
}
