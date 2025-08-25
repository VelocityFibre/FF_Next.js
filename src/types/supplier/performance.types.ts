/**
 * Supplier performance and contract types
 */

// Import shared types to avoid duplicates

export interface SupplierPerformance {
  overallScore: number; // 0-100
  deliveryScore: number; // 0-100
  qualityScore: number; // 0-100
  priceScore: number; // 0-100
  serviceScore: number; // 0-100
  complianceScore: number; // 0-100
  metrics: {
    totalOrders: number;
    completedOrders: number;
    onTimeDeliveries: number;
    lateDeliveries: number;
    defectiveItems: number;
    returnedItems: number;
    averageLeadTime: number; // in days
    averageResponseTime: number; // in hours
  };
  issues: {
    type: IssueType;
    description: string;
    date: Date | string;
    resolved: boolean;
    resolutionDate?: Date | string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
  reviews?: SupplierReview[];
  lastEvaluationDate?: Date | string;
  nextEvaluationDate?: Date | string;
  evaluationPeriod: PerformancePeriod;
  trends?: {
    period: string;
    overallScore: number;
    deliveryScore: number;
    qualityScore: number;
  }[];
  recommendations?: string[];
  improvementPlan?: {
    area: string;
    target: string;
    deadline: Date | string;
    status: 'pending' | 'in_progress' | 'completed';
  }[];
}

export interface SupplierRating {
  supplierId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  date: Date | string;
  orderId?: string;
  comment?: string;
  
  // Component ratings
  overall?: number;
  quality?: number;
  delivery?: number;
  pricing?: number;
  communication?: number;
  flexibility?: number;
  
  // Summary data
  totalReviews?: number;
}

export interface SupplierReview {
  id: string;
  supplierId: string;
  reviewerId: string;
  reviewerName: string;
  reviewDate: Date | string;
  rating: {
    overall: number; // 1-5
    delivery: number;
    quality: number;
    price: number;
    service: number;
  };
  pros?: string[];
  cons?: string[];
  comment?: string;
  recommendation: 'recommend' | 'neutral' | 'not_recommend';
  verifiedPurchase: boolean;
  orderId?: string;
  response?: {
    from: string;
    date: Date | string;
    message: string;
  };
  helpful?: {
    yes: number;
    no: number;
  };
  createdBy: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// ServiceLevelAgreement interface moved to base.types.ts to avoid duplication

// Enums
export enum ContractType {
  SUPPLY = 'supply',
  SERVICE = 'service',
  MAINTENANCE = 'maintenance',
  FRAMEWORK = 'framework',
  NDA = 'nda',
  SLA = 'sla',
  PARTNERSHIP = 'partnership',
  OTHER = 'other'
}

export enum ContractStatus {
  DRAFT = 'draft',
  NEGOTIATION = 'negotiation',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended',
  RENEWED = 'renewed'
}

export enum IssueType {
  DELIVERY_DELAY = 'delivery_delay',
  QUALITY_ISSUE = 'quality_issue',
  WRONG_ITEM = 'wrong_item',
  DAMAGED_GOODS = 'damaged_goods',
  INCOMPLETE_ORDER = 'incomplete_order',
  PRICING_ERROR = 'pricing_error',
  DOCUMENTATION = 'documentation',
  COMMUNICATION = 'communication',
  COMPLIANCE = 'compliance',
  OTHER = 'other'
}

export enum PerformancePeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual'
}

// Re-export Currency and PaymentTerms from base types
export type { Currency, PaymentTerms } from './base.types';