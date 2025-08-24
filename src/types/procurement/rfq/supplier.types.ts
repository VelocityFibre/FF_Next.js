// ============= Supplier & Invitation Types =============

import { SupplierInvitationStatusType } from './enums.types';

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