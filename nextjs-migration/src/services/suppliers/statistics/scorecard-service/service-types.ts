/**
 * Scorecard Service Types
 * Type definitions for scorecard service operations
 */

export interface ScorecardConfig {
  includeDetailedRatings?: boolean;
  includeTrendAnalysis?: boolean;
  includeBenchmarks?: boolean;
  includeRecommendations?: boolean;
}

export interface ScorecardGenerationResult {
  scorecard: any; // SupplierScorecard
  warnings: string[];
  dataQuality: {
    completeness: number;
    reliability: number;
  };
}

export interface BatchScorecardOptions {
  batchSize?: number;
  includeFailures?: boolean;
  sortBy?: 'score' | 'name' | 'category';
  filters?: {
    minScore?: number;
    categories?: string[];
    statuses?: string[];
  };
}

export interface ScorecardSummary {
  totalScorecards: number;
  averageScore: number;
  scoreDistribution: Record<string, number>;
  topPerformers: Array<{ supplierId: string; supplierName: string; score: number }>;
  improvementCandidates: Array<{ supplierId: string; supplierName: string; score: number }>;
}

export interface EnhancedScorecardResult extends ScorecardGenerationResult {
  regionalBenchmarks?: any;
  categoryBenchmarks?: any;
  priorityRecommendations?: any;
}

export const DEFAULT_SCORE_WEIGHTS = {
  rating: 0.30,
  performance: 0.25,
  compliance: 0.25,
  preferred: 0.10,
  response: 0.10
};