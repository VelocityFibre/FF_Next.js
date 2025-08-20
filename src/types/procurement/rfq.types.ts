import { Timestamp } from 'firebase/firestore';
import { Currency, UnitOfMeasure } from './stock.types';

// ============= RFQ (Request for Quote) Types =============

export type RFQStatus = 'draft' | 'sent' | 'pending' | 'quoted' | 'expired' | 'cancelled';
export type QuoteStatus = 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'expired';

export interface RFQ {
  id?: string;
  number: string; // Unique RFQ number
  title: string;
  
  // Source
  boqId?: string;
  boqNumber?: string;
  projectId?: string;
  projectName?: string;
  
  // Status
  status: RFQStatus;
  
  // Suppliers
  supplierIds: string[];
  suppliers: RFQSupplier[];
  
  // Items
  items: RFQItem[];
  totalItems: number;
  
  // Dates
  issueDate: Timestamp;
  dueDate: Timestamp;
  validityPeriodDays: number;
  
  // Requirements
  deliveryDate?: Timestamp;
  deliveryLocation?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  specialRequirements?: string;
  
  // Evaluation criteria
  evaluationCriteria?: {
    priceWeight: number; // Percentage
    qualityWeight: number;
    deliveryWeight: number;
    paymentTermsWeight: number;
  };
  
  // Metadata
  description?: string;
  terms?: string;
  notes?: string;
  attachments?: string[];
  
  // Workflow
  createdAt: Timestamp;
  createdBy: string;
  createdByName: string;
  
  sentAt?: Timestamp;
  sentBy?: string;
  
  closedAt?: Timestamp;
  closedBy?: string;
  closureReason?: string;
}

export interface RFQItem {
  id: string;
  itemCode: string;
  itemName: string;
  description?: string;
  specifications?: string;
  
  // Quantities
  quantity: number;
  unit: UnitOfMeasure;
  
  // Reference
  boqItemId?: string;
  stockItemId?: string;
  
  // Requirements
  requiredBy?: Timestamp;
  qualityStandards?: string;
  
  // For comparison
  targetPrice?: number;
  lastPurchasePrice?: number;
  
  // Metadata
  notes?: string;
  attachments?: string[];
}

export interface RFQSupplier {
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  
  // Status
  inviteSent: boolean;
  inviteSentAt?: Timestamp;
  
  quoteReceived: boolean;
  quoteReceivedAt?: Timestamp;
  quoteId?: string;
  
  // Follow-up
  remindersSent: number;
  lastReminderAt?: Timestamp;
  
  // Response
  declined: boolean;
  declineReason?: string;
}

export interface Quote {
  id?: string;
  number: string; // Unique quote number
  
  // Reference
  rfqId: string;
  rfqNumber: string;
  
  // Supplier
  supplierId: string;
  supplierName: string;
  supplierContact?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  
  // Status
  status: QuoteStatus;
  
  // Items
  items: QuoteItem[];
  
  // Totals
  subtotal: number;
  discount?: number;
  discountPercent?: number;
  vat: number;
  vatRate: number;
  total: number;
  currency: Currency;
  
  // Terms
  validityDays: number;
  validUntil: Timestamp;
  deliveryDays: number;
  paymentTerms: string;
  deliveryTerms?: string;
  warranty?: string;
  
  // Evaluation
  score?: number;
  ranking?: number;
  evaluationNotes?: string;
  
  // Metadata
  notes?: string;
  termsAndConditions?: string;
  attachments?: string[];
  
  // Workflow
  receivedAt: Timestamp;
  receivedBy?: string;
  
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  reviewedByName?: string;
  
  acceptedAt?: Timestamp;
  acceptedBy?: string;
  acceptedByName?: string;
  
  rejectedAt?: Timestamp;
  rejectedBy?: string;
  rejectionReason?: string;
}

export interface QuoteItem {
  id: string;
  rfqItemId: string;
  itemCode: string;
  itemName: string;
  description?: string;
  
  // Quantities
  requestedQuantity: number;
  quotedQuantity: number;
  unit: UnitOfMeasure;
  
  // Pricing
  unitPrice: number;
  totalPrice: number;
  currency: Currency;
  
  // Comparison
  targetPrice?: number;
  priceVariance?: number;
  priceVariancePercent?: number;
  
  // Delivery
  leadTimeDays?: number;
  availableQuantity?: number;
  
  // Quality
  brand?: string;
  model?: string;
  compliance?: string;
  warranty?: string;
  
  // Status
  meetsSpecification: boolean;
  notes?: string;
}

export interface QuoteComparison {
  rfqId: string;
  rfqNumber: string;
  
  quotes: Array<{
    quoteId: string;
    supplierId: string;
    supplierName: string;
    total: number;
    score: number;
    ranking: number;
  }>;
  
  itemComparisons: Array<{
    itemId: string;
    itemName: string;
    quotes: Array<{
      quoteId: string;
      supplierName: string;
      unitPrice: number;
      totalPrice: number;
      leadTime?: number;
      meetsSpec: boolean;
    }>;
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    recommendedQuoteId?: string;
  }>;
  
  // Recommendation
  recommendedQuoteId?: string;
  recommendationReason?: string;
  
  // Metadata
  comparedAt: Timestamp;
  comparedBy: string;
  comparedByName: string;
}