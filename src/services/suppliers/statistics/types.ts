/**
 * Supplier Statistics Types and Interfaces
 */

import { Supplier } from '@/types/supplier.types';

/**
 * Overall supplier statistics
 */
export interface SupplierStatistics {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  blacklisted: number;
  preferred: number;
  averageRating: number;
  averagePerformance: number;
  categoryCounts: Record<string, number>;
  topRated: Supplier[];
  recentlyAdded: Supplier[];
  complianceStats: {
    compliant: number;
    nonCompliant: number;
    expiringSoon: number;
  };
}

/**
 * Category-based analytics
 */
export interface CategoryAnalytics {
  category: string;
  totalSuppliers: number;
  activeSuppliers: number;
  preferredSuppliers: number;
  averageRating: number;
  averagePerformance: number;
  topSuppliers: Array<{
    id: string;
    name: string;
    rating: number;
    isPreferred: boolean;
  }>;
}

/**
 * Performance trends over time
 */
export interface PerformanceTrends {
  month: string;
  year: number;
  averageRating: number;
  averagePerformance: number;
  newSuppliers: number;
  activeSuppliers: number;
  complianceRate: number;
}

/**
 * Location distribution data
 */
export interface LocationDistribution {
  city: string;
  province: string;
  country: string;
  count: number;
  percentage: number;
}

/**
 * Performance benchmarks
 */
export interface PerformanceBenchmarks {
  overall: {
    topQuartile: number;
    median: number;
    bottomQuartile: number;
  };
  byCategory: Record<string, {
    topQuartile: number;
    median: number;
    bottomQuartile: number;
    sampleSize: number;
  }>;
  byBusinessType: Record<string, {
    topQuartile: number;
    median: number;
    bottomQuartile: number;
    sampleSize: number;
  }>;
  trends: {
    improving: number;
    stable: number;
    declining: number;
  };
}

/**
 * Supplier scorecard data
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

/**
 * Statistics calculation options
 */
export interface StatisticsOptions {
  includeInactive?: boolean;
  filterByCategory?: string[];
  filterByBusinessType?: string[];
  filterByLocation?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Trend analysis result
 */
export interface TrendAnalysis {
  metric: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  significance: 'high' | 'medium' | 'low';
}