/**
 * Supplier Trend Analysis Types
 * Type definitions for performance tracking and trend analysis
 */

export interface PerformanceTrend {
  period: string;
  delivery: {
    average: number;
    trend: 'up' | 'down' | 'stable';
  };
  quality: {
    average: number;
    trend: 'up' | 'down' | 'stable';
  };
  price: {
    average: number;
    trend: 'up' | 'down' | 'stable';
  };
  service: {
    average: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface GrowthTrend {
  period: string;
  newSuppliers: number;
  activeSuppliers: number;
  suspendedSuppliers: number;
  growthRate: number;
}

export interface ReviewVolumeTrend {
  period: string;
  totalReviews: number;
  averageReviewsPerSupplier: number;
  newReviewers: number;
  trend: 'up' | 'down' | 'stable';
}

export interface BenchmarkTrendPoint {
  period: string;
  score: number;
  rank: number;
  industryAverage: number;
  percentile: number;
}

export interface TrendAnalysisOptions {
  months?: number;
  includeCorrelations?: boolean;
  includePredictions?: boolean;
  granularity?: 'monthly' | 'quarterly' | 'yearly';
}

export interface CorrelationMatrix {
  deliveryQuality: number;
  deliveryService: number;
  qualityPrice: number;
  servicePrice: number;
  overallCoherence: number;
}

export interface TrendPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
}

export interface SeasonalPattern {
  metric: string;
  pattern: number[];
  strength: number;
  description: string;
}

export interface TrendSummary {
  performanceTrends: PerformanceTrend[];
  growthTrends: GrowthTrend[];
  reviewTrends: ReviewVolumeTrend[];
  correlations: CorrelationMatrix;
  seasonalPatterns: SeasonalPattern[];
  predictions?: TrendPrediction[];
  insights: string[];
}

export interface RatingTrend {
  period: string;
  averageRating: number;
  supplierCount: number;
  newReviews: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface TrendMetrics {
  slope: number;
  variance: number;
  correlation: number;
  seasonality: boolean;
  confidence: number;
}

export interface CategoryTrend {
  period: string;
  averageRating: number;
  supplierCount: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TrendSummaryReport {
  overallTrend: 'improving' | 'declining' | 'stable';
  ratingTrends: RatingTrend[];
  performanceTrends: PerformanceTrend[];
  growthTrends: GrowthTrend[];
  keyInsights: string[];
  recommendations: string[];
}

export interface ForecastData {
  metric: string;
  periods: string[];
  values: number[];
  confidence: number[];
  trendLine: number[];
}