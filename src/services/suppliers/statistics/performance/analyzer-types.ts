/**
 * Performance Analyzer Types
 * Type definitions for supplier performance analysis
 */

export interface PerformanceTrends {
  month: string;
  year: number;
  totalSuppliers: number;
  newSuppliers: number;
  activeSuppliers: number;
  averageRating: number;
  averagePerformance: number;
  complianceRate: number;
  topPerformers: number;
  underPerformers: number;
  categoryBreakdown: Record<string, number>;
}

export interface PerformanceBenchmarks {
  overall: BenchmarkStats;
  byCategory: Record<string, BenchmarkStats>;
  byBusinessType: Record<string, BenchmarkStats>;
  trends: {
    improving: number;
    stable: number;
    declining: number;
  };
  lastUpdated: string;
}

export interface BenchmarkStats {
  mean: number;
  median: number;
  q1: number;
  q3: number;
  min: number;
  max: number;
  standardDeviation: number;
  sampleSize: number;
}

export interface TrendAnalysis {
  category: string;
  timeframe: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  significance: 'high' | 'medium' | 'low';
  changePercent: number;
  currentValue: number;
  previousValue: number;
  dataPoints: TrendDataPoint[];
}

export interface TrendDataPoint {
  date: string;
  value: number;
  supplierCount: number;
}

export interface PerformanceMetric {
  supplierId: string;
  rating: number;
  performance: number;
  category?: string;
  businessType?: string;
  calculatedAt: Date;
}

export interface QuartileStats {
  q1: number;
  median: number;
  q3: number;
  min: number;
  max: number;
}

export interface PerformanceAnalysisOptions {
  includeInactive?: boolean;
  minimumRatingCount?: number;
  excludeCategories?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface PerformanceTrendOptions {
  months?: number;
  granularity?: 'monthly' | 'quarterly' | 'yearly';
  includeForecasting?: boolean;
}

export interface BenchmarkOptions {
  includeHistorical?: boolean;
  segmentBy?: ('category' | 'businessType' | 'location')[];
  minimumSampleSize?: number;
}