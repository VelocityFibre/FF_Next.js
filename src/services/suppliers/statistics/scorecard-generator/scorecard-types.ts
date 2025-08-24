/**
 * Scorecard Types
 * Type definitions for supplier scorecard generation
 */

export interface SupplierScorecard {
  supplierId: string;
  supplierName: string;
  overallScore: number;
  ratings: {
    quality: number;
    delivery: number;
    communication: number;
    pricing: number;
    reliability: number;
  };
  performance: {
    onTimeDelivery: number;
    qualityScore: number;
    responseTime: number;
    issueResolution: number;
  };
  compliance: {
    score: number;
    status: string;
    lastCheck: Date;
  };
  trends: {
    last3Months: number;
    last6Months: number;
    last12Months: number;
  };
  benchmarks: {
    industryPercentile: number;
    categoryPercentile: number;
    peerComparison: 'above' | 'at' | 'below';
  };
  recommendations: string[];
  lastUpdated: Date;
}

export interface ScorecardMetrics {
  overallScore: number;
  ratings: {
    quality: number;
    delivery: number;
    communication: number;
    pricing: number;
    reliability: number;
  };
  performance: {
    onTimeDelivery: number;
    qualityScore: number;
    responseTime: number;
    issueResolution: number;
  };
}

export interface ComplianceData {
  score: number;
  status: string;
  lastCheck: Date;
}

export interface TrendData {
  last3Months: number;
  last6Months: number;
  last12Months: number;
}

export interface BenchmarkData {
  industryPercentile: number;
  categoryPercentile: number;
  peerComparison: 'above' | 'at' | 'below';
}