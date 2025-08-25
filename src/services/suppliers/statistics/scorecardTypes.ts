/**
 * Scorecard Type Definitions
 * Shared types and interfaces for supplier scorecard system
 */

import { Supplier } from '@/types/supplier/base.types';

export interface SupplierRatings {
  quality: number;
  delivery: number;
  communication: number;
  pricing: number;
  reliability: number;
}

export interface SupplierPerformance {
  onTimeDelivery: number;
  qualityScore: number;
  responseTime: number;
  issueResolution: number;
}

export interface SupplierCompliance {
  score: number;
  status: string;
  lastCheck: Date;
}

export interface SupplierTrends {
  last3Months: number;
  last6Months: number;
  last12Months: number;
}

export interface SupplierBenchmarks {
  industryPercentile: number;
  categoryPercentile: number;
  peerComparison: 'above' | 'at' | 'below';
}

export interface SupplierScorecard {
  supplierId: string;
  supplierName: string;
  overallScore: number;
  ratings: SupplierRatings;
  performance: SupplierPerformance;
  compliance: SupplierCompliance;
  trends: SupplierTrends;
  benchmarks: SupplierBenchmarks;
  recommendations: string[];
  lastUpdated: Date;
}

export interface ScoreCalculationWeights {
  rating: number;
  performance: number;
  compliance: number;
  preferredStatus: number;
  responseTime: number;
}

export interface ScoreCalculationResult {
  totalScore: number;
  weightedSum: number;
  breakdown: {
    rating: number;
    performance: number;
    compliance: number;
    preferredBonus: number;
    responseTime: number;
  };
}

export interface ComplianceStatusMap {
  excellent: number;
  good: number;
  acceptable: number;
  needsImprovement: number;
  critical: number;
}

export interface PercentileCalculation {
  value: number;
  ranking: number;
  totalCount: number;
  percentile: number;
}

export interface RecommendationCriteria {
  overallScore: number;
  rating: number;
  complianceScore: number;
  performanceMetrics: SupplierPerformance;
  isPreferred: boolean;
  hasCompleteContact: boolean;
}

export interface ScorecardGenerationOptions {
  includeTrends?: boolean;
  includeBenchmarks?: boolean;
  includeRecommendations?: boolean;
  calculateHistoricalData?: boolean;
}

export interface ScorecardBatchResult {
  successful: SupplierScorecard[];
  failed: { supplierId: string; error: string }[];
  totalProcessed: number;
  successRate: number;
}

// Type guards
export function isValidSupplier(supplier: any): supplier is Supplier {
  return supplier && 
         typeof supplier === 'object' &&
         (supplier.id || supplier._id) &&
         (supplier.companyName || supplier.name);
}

export function isValidRating(rating: any): boolean {
  if (typeof rating === 'number') {
    return rating >= 0 && rating <= 5;
  }
  if (rating && typeof rating === 'object') {
    return typeof rating.overall === 'number' && 
           rating.overall >= 0 && 
           rating.overall <= 5;
  }
  return false;
}

export function isValidPerformance(performance: any): boolean {
  return performance &&
         typeof performance === 'object' &&
         typeof performance.overallScore === 'number';
}

export function isValidCompliance(compliance: any): boolean {
  return compliance &&
         typeof compliance === 'object' &&
         typeof compliance/* .complianceScore - property doesn't exist */ === 'number';
}

// Constants
export const DEFAULT_SCORE_WEIGHTS: ScoreCalculationWeights = {
  rating: 30,
  performance: 25,
  compliance: 25,
  preferredStatus: 10,
  responseTime: 10
};

export const COMPLIANCE_STATUS_THRESHOLDS: ComplianceStatusMap = {
  excellent: 90,
  good: 80,
  acceptable: 60,
  needsImprovement: 40,
  critical: 0
};

export const PEER_COMPARISON_THRESHOLDS = {
  above: 75,
  below: 25
};

export const DEFAULT_SCORECARD_OPTIONS: ScorecardGenerationOptions = {
  includeTrends: true,
  includeBenchmarks: true,
  includeRecommendations: true,
  calculateHistoricalData: false
};

// Helper type for supplier rating extraction
export type SupplierRatingValue = number | { overall: number; breakdown?: Partial<SupplierRatings> };

// Type for batch processing configuration
export interface BatchProcessingConfig {
  batchSize: number;
  concurrencyLimit: number;
  retryAttempts: number;
  timeoutMs: number;
}