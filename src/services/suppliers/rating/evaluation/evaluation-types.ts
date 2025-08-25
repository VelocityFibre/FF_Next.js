/**
 * Evaluation Types
 * TypeScript interfaces and types for supplier evaluation
 */

import { PerformancePeriod } from '@/types/supplier/base.types';

/**
 * Evaluation action item
 */
export interface EvaluationActionItem {
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  dueDate: Date;
  category?: 'delivery' | 'quality' | 'price' | 'service' | 'compliance';
  assignedTo?: string;
  estimatedHours?: number;
  dependencies?: string[];
}

/**
 * Supplier evaluation report structure
 */
export interface SupplierEvaluationReport {
  performance: SupplierPerformanceMetrics;
  recommendations: string[];
  actionItems: EvaluationActionItem[];
  generatedDate: Date;
  evaluationPeriod: PerformancePeriod;
  evaluatedBy?: string;
  reviewStatus?: 'draft' | 'pending' | 'approved' | 'rejected';
  lastReviewDate?: Date;
}

/**
 * Performance metrics structure
 */
export interface SupplierPerformanceMetrics {
  overallScore: number;
  deliveryScore: number;
  qualityScore: number;
  priceScore: number;
  serviceScore: number;
  complianceScore?: number;
  sustainabilityScore?: number;
  innovationScore?: number;
  // Additional metrics
  onTimeDeliveryRate?: number;
  defectRate?: number;
  responseTime?: number; // hours
  costSavings?: number;
  riskScore?: number;
}

/**
 * Evaluation summary across multiple suppliers
 */
export interface EvaluationSummary {
  totalSuppliers: number;
  averageScores: {
    overall: number;
    delivery: number;
    quality: number;
    price: number;
    service: number;
    compliance?: number;
  };
  topPerformers: string[];
  underPerformers: string[];
  commonIssues: string[];
  recommendationsSummary: string[];
  evaluationPeriod: PerformancePeriod;
  trendsVsPreviousPeriod?: {
    overallChange: number; // percentage
    improvingSuppliers: string[];
    decliningSuppliers: string[];
  };
}

/**
 * Action items summary
 */
export interface ActionItemsSummary {
  totalActionItems: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  criticalPriority?: number;
  upcomingDueDates: Array<{
    supplierId: string;
    description: string;
    priority: string;
    dueDate: Date;
    daysUntilDue?: number;
    category?: string;
  }>;
  overdueTasks?: Array<{
    supplierId: string;
    description: string;
    priority: string;
    dueDate: Date;
    daysOverdue: number;
  }>;
  completionRate?: number; // percentage of completed tasks
}

/**
 * Evaluation criteria and weights
 */
export interface EvaluationCriteria {
  deliveryWeight: number; // 0-1
  qualityWeight: number; // 0-1
  priceWeight: number; // 0-1
  serviceWeight: number; // 0-1
  complianceWeight?: number; // 0-1
  sustainabilityWeight?: number; // 0-1
  customCriteria?: Array<{
    name: string;
    weight: number;
    description: string;
  }>;
}

/**
 * Evaluation thresholds for performance categorization
 */
export interface EvaluationThresholds {
  excellent: number; // e.g., 90+
  good: number; // e.g., 80+
  acceptable: number; // e.g., 70+
  needsImprovement: number; // e.g., 60+
  unacceptable: number; // below this threshold
}

/**
 * Evaluation configuration
 */
export interface EvaluationConfig {
  criteria: EvaluationCriteria;
  thresholds: EvaluationThresholds;
  period: PerformancePeriod;
  includeCompliance: boolean;
  includeSustainability: boolean;
  generateActionItems: boolean;
  notificationSettings?: {
    notifyOnLowPerformance: boolean;
    notifyOnImprovement: boolean;
    escalateToManagement: boolean;
    emailRecipients: string[];
  };
}

/**
 * Bulk evaluation request
 */
export interface BulkEvaluationRequest {
  supplierIds: string[];
  period: PerformancePeriod;
  config?: EvaluationConfig;
  batchSize?: number;
  priority?: 'low' | 'normal' | 'high';
  scheduledExecution?: Date;
}

/**
 * Bulk evaluation result
 */
export interface BulkEvaluationResult {
  reports: Map<string, SupplierEvaluationReport>;
  summary: EvaluationSummary;
  processingTime: number; // milliseconds
  successCount: number;
  failureCount: number;
  failures: Array<{
    supplierId: string;
    error: string;
  }>;
  executedAt: Date;
}

/**
 * Performance trend data
 */
export interface PerformanceTrend {
  supplierId: string;
  periods: Array<{
    period: PerformancePeriod;
    scores: SupplierPerformanceMetrics;
    date: Date;
  }>;
  trends: {
    overall: 'improving' | 'declining' | 'stable';
    delivery: 'improving' | 'declining' | 'stable';
    quality: 'improving' | 'declining' | 'stable';
    price: 'improving' | 'declining' | 'stable';
    service: 'improving' | 'declining' | 'stable';
  };
  projections?: {
    nextPeriodScore: number;
    confidence: number; // 0-1
    factors: string[]; // factors influencing the projection
  };
}

/**
 * Evaluation validation result
 */
export interface EvaluationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  completenessScore: number; // 0-100
  dataQualityScore: number; // 0-100
}