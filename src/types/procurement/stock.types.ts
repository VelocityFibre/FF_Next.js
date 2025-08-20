import { Timestamp } from 'firebase/firestore';

// ============= Stock/Inventory Types =============

export type StockStatus = 'available' | 'low' | 'out_of_stock' | 'discontinued';

export type MaterialCategory = 
  | 'cable'
  | 'connector'
  | 'enclosure'
  | 'hardware'
  | 'tool'
  | 'consumable'
  | 'equipment'
  | 'safety'
  | 'other';

export type UnitOfMeasure = 
  | 'meter'
  | 'kilometer'
  | 'piece'
  | 'box'
  | 'roll'
  | 'pack'
  | 'kilogram'
  | 'liter'
  | 'hour'
  | 'day';

export type Currency = 'ZAR' | 'USD' | 'EUR' | 'GBP';

export interface StockItem {
  id?: string;
  code: string; // Unique item code
  name: string;
  description?: string;
  category: MaterialCategory;
  unit: UnitOfMeasure;
  
  // Stock levels
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  
  // Financial
  unitCost: number;
  currency: Currency;
  lastPurchasePrice?: number;
  averageCost?: number;
  
  // Supplier information
  preferredSupplierId?: string;
  alternativeSupplierIds?: string[];
  leadTimeDays: number;
  
  // Warehouse
  location?: string;
  binNumber?: string;
  
  // Status
  status: StockStatus;
  isActive: boolean;
  
  // Tracking
  lastStockTakeDate?: Timestamp;
  lastPurchaseDate?: Timestamp;
  expiryDate?: Timestamp;
  
  // Metadata
  specifications?: string;
  tags: string[];
  notes?: string;
  images?: string[];
  
  // Audit
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface StockMovement {
  id?: string;
  stockItemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  
  // Reference
  referenceType: 'purchase_order' | 'project' | 'transfer' | 'adjustment' | 'return';
  referenceId?: string;
  referenceNumber?: string;
  
  // Details
  reason?: string;
  projectId?: string;
  projectName?: string;
  fromLocation?: string;
  toLocation?: string;
  
  // Metadata
  date: Timestamp;
  performedBy: string;
  performedByName: string;
  notes?: string;
  
  // Approval (for adjustments)
  requiresApproval?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: Timestamp;
}

export interface StockTake {
  id?: string;
  date: Timestamp;
  location?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  
  items: StockTakeItem[];
  
  // Summary
  totalItems: number;
  totalValue: number;
  discrepancyCount: number;
  discrepancyValue: number;
  
  // Metadata
  performedBy: string;
  performedByName: string;
  startTime?: Timestamp;
  endTime?: Timestamp;
  notes?: string;
  
  // Approval
  requiresApproval: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: Timestamp;
}

export interface StockTakeItem {
  stockItemId: string;
  stockItemCode: string;
  stockItemName: string;
  
  // Counts
  systemCount: number;
  physicalCount: number;
  discrepancy: number;
  
  // Values
  unitCost: number;
  systemValue: number;
  physicalValue: number;
  discrepancyValue: number;
  
  // Status
  status: 'pending' | 'counted' | 'verified' | 'adjusted';
  notes?: string;
  countedBy?: string;
  countedAt?: Timestamp;
  verifiedBy?: string;
  verifiedAt?: Timestamp;
}