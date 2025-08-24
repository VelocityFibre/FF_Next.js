// ============= Form & Display Types =============

import { RFQ, RFQItem } from './core.types';
import { SupplierInvitation } from './supplier.types';
import { Quote } from './quote.types';
import { EvaluationCriteria } from './evaluation.types';

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