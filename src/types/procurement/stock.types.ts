// ============= Stock/Inventory Types =============
// Updated to match Drizzle database schema

// Stock Status enumeration matching database schema
export enum StockStatus {
  NORMAL = 'normal',
  LOW = 'low',
  CRITICAL = 'critical',
  EXCESS = 'excess',
  OBSOLETE = 'obsolete'
}

export type StockStatusType = 'normal' | 'low' | 'critical' | 'excess' | 'obsolete';

// Movement Type enumeration
export enum MovementType {
  ASN = 'ASN',           // Advanced Shipping Notice
  GRN = 'GRN',           // Goods Receipt Note
  ISSUE = 'ISSUE',       // Material Issue
  RETURN = 'RETURN',     // Material Return
  TRANSFER = 'TRANSFER', // Inter-project Transfer
  ADJUSTMENT = 'ADJUSTMENT' // Stock Adjustment
}

export type MovementTypeType = 'ASN' | 'GRN' | 'ISSUE' | 'RETURN' | 'TRANSFER' | 'ADJUSTMENT';

// Movement Status enumeration
export enum MovementStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export type MovementStatusType = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Item Status for movement items
export enum ItemStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  DAMAGED = 'damaged',
  REJECTED = 'rejected'
}

export type ItemStatusType = 'pending' | 'confirmed' | 'completed' | 'damaged' | 'rejected';

// Quality Check Status
export enum QualityCheckStatus {
  PENDING = 'pending',
  PASSED = 'passed',
  FAILED = 'failed',
  WAIVED = 'waived'
}

export type QualityCheckStatusType = 'pending' | 'passed' | 'failed' | 'waived';

// Drum Condition enumeration
export enum DrumCondition {
  GOOD = 'good',
  DAMAGED = 'damaged',
  RETURNABLE = 'returnable'
}

export type DrumConditionType = 'good' | 'damaged' | 'returnable';

// Installation Status for drums
export enum InstallationStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  COMPLETED = 'completed',
  RETURNED = 'returned'
}

export type InstallationStatusType = 'available' | 'in_use' | 'completed' | 'returned';

// Installation Type
export type InstallationType = 'overhead' | 'underground' | 'building';

// Currency type
export type Currency = 'ZAR' | 'USD' | 'EUR' | 'GBP';

// Stock Position interface matching database schema
export interface StockPosition {
  id: string;
  projectId: string;
  
  // Item Details
  itemCode: string;
  itemName: string;
  description?: string;
  category?: string;
  uom: string;
  
  // Stock Quantities
  onHandQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  inTransitQuantity: number;
  
  // Valuation
  averageUnitCost?: number;
  totalValue?: number;
  
  // Location
  warehouseLocation?: string;
  binLocation?: string;
  
  // Reorder Information
  reorderLevel?: number;
  maxStockLevel?: number;
  economicOrderQuantity?: number;
  
  // Tracking
  lastMovementDate?: Date;
  lastCountDate?: Date;
  nextCountDue?: Date;
  
  // Status
  isActive: boolean;
  stockStatus: StockStatusType;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Stock Movement interface matching database schema
export interface StockMovement {
  id: string;
  projectId: string;
  
  // Movement Details
  movementType: MovementTypeType;
  referenceNumber: string;
  referenceType?: string; // PO, RFQ, WORK_ORDER, MANUAL
  referenceId?: string;
  
  // Locations
  fromLocation?: string;
  toLocation?: string;
  fromProjectId?: string;
  toProjectId?: string;
  
  // Status and Dates
  status: MovementStatusType;
  movementDate: Date;
  confirmedAt?: Date;
  
  // Personnel
  requestedBy?: string;
  authorizedBy?: string;
  processedBy?: string;
  
  // Notes and Documentation
  notes?: string;
  reason?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Stock Movement Item interface matching database schema
export interface StockMovementItem {
  id: string;
  movementId: string;
  stockPositionId?: string;
  projectId: string;
  
  // Item Details
  itemCode: string;
  itemName: string;
  description?: string;
  uom: string;
  
  // Quantities
  plannedQuantity: number;
  actualQuantity?: number;
  receivedQuantity?: number;
  
  // Costing
  unitCost?: number;
  totalCost?: number;
  
  // Lot/Serial Tracking
  lotNumbers?: string[]; // Array of lot numbers
  serialNumbers?: string[]; // Array of serial numbers
  
  // Status
  itemStatus: ItemStatusType;
  
  // Quality Control
  qualityCheckRequired: boolean;
  qualityCheckStatus?: QualityCheckStatusType;
  qualityNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Cable Drum interface matching database schema
export interface CableDrum {
  id: string;
  projectId: string;
  stockPositionId?: string;
  
  // Drum Identification
  drumNumber: string;
  serialNumber?: string;
  supplierDrumId?: string;
  
  // Cable Details
  cableType: string;
  cableSpecification?: string;
  manufacturerName?: string;
  partNumber?: string;
  
  // Drum Measurements
  originalLength: number; // meters
  currentLength: number;
  usedLength: number;
  
  // Physical Properties
  drumWeight?: number; // kg
  cableWeight?: number; // kg
  drumDiameter?: number; // mm
  
  // Location and Status
  currentLocation?: string;
  drumCondition: DrumConditionType;
  installationStatus: InstallationStatusType;
  
  // Tracking History
  lastMeterReading?: number;
  lastReadingDate?: Date;
  lastUsedDate?: Date;
  
  // Quality and Testing
  testCertificate?: string;
  installationNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Drum Usage History interface matching database schema
export interface DrumUsageHistory {
  id: string;
  drumId: string;
  projectId: string;
  
  // Usage Details
  usageDate: Date;
  poleNumber?: string;
  sectionId?: string;
  workOrderId?: string;
  
  // Measurements
  previousReading: number;
  currentReading: number;
  usedLength: number;
  
  // Personnel and Equipment
  technicianId?: string;
  technicianName?: string;
  equipmentUsed?: string;
  
  // Installation Details
  installationType?: InstallationType;
  installationNotes?: string;
  qualityNotes?: string;
  
  // GPS Coordinates
  startCoordinates?: { lat: number; lng: number };
  endCoordinates?: { lat: number; lng: number };
  
  // Timestamps
  createdAt: Date;
}

// Money type matching the spec
export interface Money {
  amount: number;
  currency: Currency;
}

// Project scope type matching the spec
export interface ProjectScope {
  projectId: string;
  siteIds?: string[];
  phaseIds?: string[];
}

// Stock statistics for dashboard
export interface StockStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  criticalStockItems: number;
  excessStockItems: number;
  obsoleteItems: number;
  totalMovements: number;
  pendingMovements: number;
  completedMovements: number;
  averageMovementsPerDay: number;
  topMovingItems: Array<{
    itemCode: string;
    itemName: string;
    movementCount: number;
    totalQuantity: number;
  }>;
}

// Stock alert interface
export interface StockAlert {
  id: string;
  projectId: string;
  stockPositionId: string;
  itemCode: string;
  itemName: string;
  alertType: 'low_stock' | 'critical_stock' | 'excess_stock' | 'obsolete' | 'no_movement';
  alertLevel: 'info' | 'warning' | 'critical';
  message: string;
  currentQuantity: number;
  thresholdQuantity?: number;
  recommendedAction?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

// Stock count/cycle count interface
export interface StockCount {
  id: string;
  projectId: string;
  stockPositionId: string;
  
  // Count Details
  countType: 'cycle' | 'full' | 'spot' | 'adjustment';
  scheduledDate: Date;
  countedDate?: Date;
  
  // Quantities
  systemQuantity: number;
  countedQuantity?: number;
  variance?: number;
  variancePercentage?: number;
  
  // Personnel
  countedBy?: string;
  verifiedBy?: string;
  approvedBy?: string;
  
  // Status
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  
  // Adjustment
  adjustmentRequired: boolean;
  adjustmentProcessed: boolean;
  adjustmentMovementId?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Form data for creating stock movements
export interface StockMovementFormData {
  movementType: MovementTypeType;
  referenceNumber: string;
  referenceType?: string;
  referenceId?: string;
  fromLocation?: string;
  toLocation?: string;
  fromProjectId?: string;
  toProjectId?: string;
  movementDate: Date;
  notes?: string;
  reason?: string;
  items: Array<{
    itemCode: string;
    plannedQuantity: number;
    unitCost?: number;
    lotNumbers?: string[];
    serialNumbers?: string[];
    qualityCheckRequired?: boolean;
  }>;
}

// Form data for cable drum tracking
export interface DrumTrackingFormData {
  drumNumber: string;
  cableType: string;
  originalLength: number;
  currentLocation: string;
  previousReading: number;
  currentReading: number;
  poleNumber?: string;
  sectionId?: string;
  workOrderId?: string;
  technicianId?: string;
  installationType?: InstallationType;
  installationNotes?: string;
  qualityNotes?: string;
  startCoordinates?: { lat: number; lng: number };
  endCoordinates?: { lat: number; lng: number };
}

// Advanced Shipping Notice (ASN) interface
export interface ASN {
  id: string;
  asnNumber: string;
  supplierId: string;
  supplierName: string;
  projectId: string;
  purchaseOrderId?: string;
  
  // Shipping Details
  shippedDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  trackingNumber?: string;
  carrier?: string;
  
  // Items
  items: Array<{
    itemCode: string;
    itemName: string;
    shippedQuantity: number;
    uom: string;
    lotNumbers?: string[];
    serialNumbers?: string[];
  }>;
  
  // Status
  status: 'shipped' | 'in_transit' | 'delivered' | 'cancelled';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Goods Receipt Note (GRN) interface
export interface GRN {
  id: string;
  grnNumber: string;
  asnId?: string;
  purchaseOrderId?: string;
  supplierId: string;
  supplierName: string;
  projectId: string;
  
  // Receipt Details
  receivedDate: Date;
  receivedBy: string;
  
  // Items
  items: Array<{
    itemCode: string;
    itemName: string;
    orderedQuantity: number;
    receivedQuantity: number;
    acceptedQuantity: number;
    rejectedQuantity: number;
    rejectionReason?: string;
    uom: string;
    unitCost: number;
    totalCost: number;
    lotNumbers?: string[];
    serialNumbers?: string[];
    qualityStatus: QualityCheckStatusType;
    qualityNotes?: string;
  }>;
  
  // Totals
  totalValue: number;
  currency: Currency;
  
  // Status
  status: 'draft' | 'completed' | 'partially_received' | 'cancelled';
  
  // Notes
  notes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Type exports that match Drizzle inferred types
export type { StockPosition as DrizzleStockPosition, NewStockPosition as NewDrizzleStockPosition } from '../../lib/neon/schema';
export type { StockMovement as DrizzleStockMovement, NewStockMovement as NewDrizzleStockMovement } from '../../lib/neon/schema';
export type { StockMovementItem as DrizzleStockMovementItem, NewStockMovementItem as NewDrizzleStockMovementItem } from '../../lib/neon/schema';
export type { CableDrum as DrizzleCableDrum, NewCableDrum as NewDrizzleCableDrum } from '../../lib/neon/schema';
export type { DrumUsageHistory as DrizzleDrumUsageHistory, NewDrumUsageHistory as NewDrizzleDrumUsageHistory } from '../../lib/neon/schema';

// Legacy exports for backward compatibility
export type UnitOfMeasure = string;
export type MaterialCategory = string;
export type StockItem = StockPosition;
export type StockTake = StockCount;