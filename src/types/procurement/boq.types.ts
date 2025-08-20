import { Timestamp } from 'firebase/firestore';
import { UnitOfMeasure, Currency } from './stock.types';

// ============= BOQ (Bill of Quantities) Types =============

export type BOQStatus = 'draft' | 'review' | 'approved' | 'revised' | 'cancelled';

export interface BOQ {
  id?: string;
  number: string; // Unique BOQ number
  title: string;
  projectId: string;
  projectName: string;
  projectCode?: string;
  
  // Version control
  version: number;
  isLatestVersion: boolean;
  previousVersionId?: string;
  
  // Status
  status: BOQStatus;
  
  // Items
  sections: BOQSection[];
  items: BOQItem[];
  
  // Totals
  totalItems: number;
  subtotal: number;
  vat: number;
  vatRate: number;
  total: number;
  currency: Currency;
  
  // Validity
  validFrom: Timestamp;
  validTo: Timestamp;
  
  // Metadata
  description?: string;
  terms?: string;
  notes?: string;
  tags: string[];
  attachments?: string[];
  
  // Workflow
  createdAt: Timestamp;
  createdBy: string;
  createdByName: string;
  
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Timestamp;
  reviewNotes?: string;
  
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Timestamp;
  approvalNotes?: string;
  
  revisedBy?: string;
  revisedByName?: string;
  revisedAt?: Timestamp;
  revisionReason?: string;
}

export interface BOQSection {
  id: string;
  name: string;
  description?: string;
  order: number;
  items: string[]; // Item IDs in this section
  subtotal: number;
}

export interface BOQItem {
  id: string;
  sectionId?: string;
  
  // Item details
  itemCode: string;
  itemName: string;
  description?: string;
  specifications?: string;
  
  // Quantities
  quantity: number;
  unit: UnitOfMeasure;
  wastagePercent?: number;
  totalQuantity: number; // Including wastage
  
  // Pricing
  unitRate: number;
  amount: number;
  currency: Currency;
  
  // Stock reference
  stockItemId?: string;
  isStockItem: boolean;
  
  // Status
  isOptional?: boolean;
  isIncluded: boolean;
  
  // Metadata
  supplierName?: string;
  supplierId?: string;
  leadTimeDays?: number;
  notes?: string;
  
  // Order in BOQ
  order: number;
}

export interface BOQTemplate {
  id?: string;
  name: string;
  description?: string;
  category: string;
  
  // Template items
  sections: BOQSection[];
  items: Omit<BOQItem, 'id'>[];
  
  // Usage
  usageCount: number;
  lastUsedAt?: Timestamp;
  
  // Metadata
  tags: string[];
  isActive: boolean;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface BOQRevision {
  id?: string;
  boqId: string;
  boqNumber: string;
  
  // Version info
  fromVersion: number;
  toVersion: number;
  
  // Changes
  changeType: 'price_update' | 'quantity_change' | 'item_addition' | 'item_removal' | 'specification_change' | 'other';
  changeSummary: string;
  changeDetails?: {
    itemsAdded?: string[];
    itemsRemoved?: string[];
    itemsModified?: string[];
    priceChanges?: Array<{
      itemId: string;
      oldPrice: number;
      newPrice: number;
    }>;
    quantityChanges?: Array<{
      itemId: string;
      oldQuantity: number;
      newQuantity: number;
    }>;
  };
  
  // Impact
  costImpact: number;
  costImpactPercent: number;
  
  // Metadata
  reason: string;
  requestedBy?: string;
  requestedByName?: string;
  
  createdAt: Timestamp;
  createdBy: string;
  createdByName: string;
  
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Timestamp;
}

export interface BOQComparison {
  boq1Id: string;
  boq1Number: string;
  boq1Version: number;
  
  boq2Id: string;
  boq2Number: string;
  boq2Version: number;
  
  // Differences
  itemsOnlyInBoq1: BOQItem[];
  itemsOnlyInBoq2: BOQItem[];
  itemsInBoth: Array<{
    item: BOQItem;
    boq1Quantity: number;
    boq2Quantity: number;
    quantityDiff: number;
    boq1Price: number;
    boq2Price: number;
    priceDiff: number;
  }>;
  
  // Totals comparison
  boq1Total: number;
  boq2Total: number;
  totalDifference: number;
  totalDifferencePercent: number;
  
  // Metadata
  comparedAt: Timestamp;
  comparedBy: string;
}