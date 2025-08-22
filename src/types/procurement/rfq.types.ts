// ============= RFQ (Request for Quote) Types =============
// Updated to match Drizzle database schema

// RFQ Status enumeration matching database schema
export enum RFQStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  RESPONSES_RECEIVED = 'responses_received',
  EVALUATED = 'evaluated',
  AWARDED = 'awarded',
  CANCELLED = 'cancelled'
}

export type RFQStatusType = 'draft' | 'issued' | 'responses_received' | 'evaluated' | 'awarded' | 'cancelled';

// Quote Status enumeration
export enum QuoteStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export type QuoteStatusType = 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'expired';

// Supplier Invitation Status
export enum SupplierInvitationStatus {
  SENT = 'sent',
  VIEWED = 'viewed',
  RESPONDED = 'responded',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

export type SupplierInvitationStatusType = 'sent' | 'viewed' | 'responded' | 'declined' | 'expired';

// Main RFQ interface matching database schema exactly
export interface RFQ {
  id: string;
  projectId: string;
  
  // RFQ Details
  rfqNumber: string;
  title: string;
  description?: string;
  
  // Status and Timeline
  status: RFQStatusType;
  issueDate?: Date;
  responseDeadline: Date;
  extendedDeadline?: Date;
  closedAt?: Date;
  
  // Created By
  createdBy: string;
  issuedBy?: string;
  
  // Terms and Conditions
  paymentTerms?: string;
  deliveryTerms?: string;
  validityPeriod?: number; // days
  currency: string; // Default 'ZAR'
  
  // Evaluation Criteria
  evaluationCriteria?: Record<string, any>; // Weighted criteria object
  technicalRequirements?: string;
  
  // Supplier Management
  invitedSuppliers?: string[]; // Array of supplier IDs
  respondedSuppliers?: string[]; // Array of supplier IDs who responded
  
  // Totals and Statistics
  itemCount: number;
  totalBudgetEstimate?: number;
  lowestQuoteValue?: number;
  highestQuoteValue?: number;
  averageQuoteValue?: number;
  
  // Award Information
  awardedAt?: Date;
  awardedTo?: string; // Supplier ID
  awardNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// RFQ Item interface matching database schema
export interface RFQItem {
  id: string;
  rfqId: string;
  boqItemId?: string;
  projectId: string;
  
  // Item Details (copied from BOQ for historical record)
  lineNumber: number;
  itemCode?: string;
  description: string;
  category?: string;
  
  // Quantities
  quantity: number;
  uom: string;
  budgetPrice?: number;
  
  // Technical Requirements
  specifications?: Record<string, any>;
  technicalRequirements?: string;
  acceptableAlternatives?: any[];
  
  // Evaluation
  evaluationWeight: number; // Default 1.0
  isCriticalItem: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Supplier Invitation interface matching database schema
export interface SupplierInvitation {
  id: string;
  rfqId: string;
  supplierId: string;
  projectId: string;
  
  // Invitation Details
  supplierName: string;
  supplierEmail: string;
  contactPerson?: string;
  
  // Status Tracking
  invitationStatus: SupplierInvitationStatusType;
  invitedAt: Date;
  viewedAt?: Date;
  respondedAt?: Date;
  declinedAt?: Date;
  
  // Authentication for supplier portal
  accessToken?: string;
  tokenExpiresAt?: Date;
  magicLinkToken?: string;
  lastLoginAt?: Date;
  
  // Communication
  invitationMessage?: string;
  declineReason?: string;
  remindersSent: number;
  lastReminderAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Quote interface matching database schema
export interface Quote {
  id: string;
  rfqId: string;
  supplierId: string;
  supplierInvitationId?: string;
  projectId: string;
  
  // Quote Details
  quoteNumber?: string;
  quoteReference?: string;
  
  // Status and Dates
  status: QuoteStatusType;
  submissionDate: Date;
  validUntil: Date;
  
  // Financial Summary
  totalValue: number;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  currency: string; // Default 'ZAR'
  
  // Terms
  leadTime?: number; // days
  paymentTerms?: string;
  deliveryTerms?: string;
  warrantyTerms?: string;
  validityPeriod?: number; // days
  
  // Additional Information
  notes?: string;
  terms?: string;
  conditions?: string;
  
  // Evaluation
  evaluationScore?: number;
  technicalScore?: number;
  commercialScore?: number;
  evaluationNotes?: string;
  isWinner: boolean;
  
  // Award Information
  awardedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Quote Item interface matching database schema
export interface QuoteItem {
  id: string;
  quoteId: string;
  rfqItemId: string;
  projectId: string;
  
  // Item Reference (from RFQ)
  lineNumber: number;
  itemCode?: string;
  description: string;
  
  // Quoted Quantities and Pricing
  quotedQuantity?: number;
  unitPrice: number;
  totalPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  
  // Alternative Offerings
  alternateOffered: boolean;
  alternateDescription?: string;
  alternatePartNumber?: string;
  alternateUnitPrice?: number;
  
  // Delivery and Terms
  leadTime?: number; // days
  minimumOrderQuantity?: number;
  packagingUnit?: string;
  
  // Technical Information
  manufacturerName?: string;
  partNumber?: string;
  modelNumber?: string;
  technicalNotes?: string;
  complianceCertificates?: any[];
  
  // Evaluation
  technicalCompliance: boolean;
  commercialScore?: number;
  technicalScore?: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Quote Document interface matching database schema
export interface QuoteDocument {
  id: string;
  quoteId: string;
  quoteItemId?: string;
  
  // Document Details
  documentType: 'certificate' | 'datasheet' | 'warranty' | 'compliance' | 'other';
  documentName: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number; // bytes
  mimeType?: string;
  
  // Metadata
  description?: string;
  isRequired: boolean;
  validUntil?: Date;
  
  // Timestamps
  uploadedAt: Date;
  createdAt: Date;
}

// Evaluation criteria for RFQ
export interface EvaluationCriteria {
  priceWeight: number; // 0-100
  qualityWeight: number; // 0-100
  deliveryWeight: number; // 0-100
  technicalWeight: number; // 0-100
  serviceWeight: number; // 0-100
  customCriteria?: Array<{
    name: string;
    weight: number;
    description?: string;
  }>;
}

// Quote comparison for evaluation
export interface QuoteComparison {
  rfqId: string;
  rfqNumber: string;
  
  quotes: Array<{
    quoteId: string;
    supplierId: string;
    supplierName: string;
    totalValue: number;
    evaluationScore?: number;
    technicalScore?: number;
    commercialScore?: number;
    ranking?: number;
    isWinner: boolean;
  }>;
  
  itemComparisons: Array<{
    rfqItemId: string;
    itemDescription: string;
    quotes: Array<{
      quoteId: string;
      quoteItemId: string;
      supplierName: string;
      unitPrice: number;
      totalPrice: number;
      leadTime?: number;
      technicalCompliance: boolean;
      alternateOffered: boolean;
    }>;
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    recommendedQuoteItemId?: string;
  }>;
  
  // Overall recommendation
  recommendedQuoteId?: string;
  recommendationReason?: string;
  
  // Metadata
  comparedAt: Date;
  comparedBy: string;
}

// Form data for creating/updating RFQ
export interface RFQFormData {
  rfqNumber?: string;
  title: string;
  description?: string;
  projectId: string;
  responseDeadline: Date;
  paymentTerms?: string;
  deliveryTerms?: string;
  validityPeriod?: number;
  currency?: string;
  evaluationCriteria?: EvaluationCriteria;
  technicalRequirements?: string;
  supplierIds: string[];
}

// RFQ with populated items and suppliers (for display)
export interface RFQWithDetails extends RFQ {
  items: RFQItem[];
  suppliers: SupplierInvitation[];
  quotes: Quote[];
}

// RFQ statistics for dashboard
export interface RFQStats {
  totalRFQs: number;
  draftRFQs: number;
  issuedRFQs: number;
  awaitingResponses: number;
  responsesReceived: number;
  evaluated: number;
  awarded: number;
  cancelled: number;
  totalQuotes: number;
  averageQuotesPerRFQ: number;
  averageResponseTime: number; // days
  totalValue: number;
  averageValue: number;
}

// Supplier response data (for supplier portal)
export interface SupplierQuoteSubmission {
  rfqId: string;
  supplierId: string;
  quoteNumber: string;
  validUntil: Date;
  leadTime: number;
  paymentTerms: string;
  deliveryTerms: string;
  warrantyTerms?: string;
  notes?: string;
  terms?: string;
  conditions?: string;
  items: Array<{
    rfqItemId: string;
    unitPrice: number;
    quotedQuantity?: number;
    leadTime?: number;
    alternateOffered?: boolean;
    alternateDescription?: string;
    alternateUnitPrice?: number;
    manufacturerName?: string;
    partNumber?: string;
    technicalNotes?: string;
  }>;
  documents?: Array<{
    documentType: string;
    documentName: string;
    fileName: string;
    fileUrl: string;
    rfqItemId?: string;
  }>;
}

// Type exports that match Drizzle inferred types
export type { RFQ as DrizzleRFQ, NewRFQ as NewDrizzleRFQ } from '../../lib/neon/schema';
export type { RFQItem as DrizzleRFQItem, NewRFQItem as NewDrizzleRFQItem } from '../../lib/neon/schema';
export type { SupplierInvitation as DrizzleSupplierInvitation, NewSupplierInvitation as NewDrizzleSupplierInvitation } from '../../lib/neon/schema';
export type { Quote as DrizzleQuote, NewQuote as NewDrizzleQuote } from '../../lib/neon/schema';
export type { QuoteItem as DrizzleQuoteItem, NewQuoteItem as NewDrizzleQuoteItem } from '../../lib/neon/schema';
export type { QuoteDocument as DrizzleQuoteDocument, NewQuoteDocument as NewDrizzleQuoteDocument } from '../../lib/neon/schema';