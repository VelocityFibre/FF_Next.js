/**
 * Trend Types
 * Type definitions for supplier trend analysis
 */

export interface RatingTrend {
  period: string;
  averageRating: number;
  supplierCount: number;
  newReviews: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface PerformanceTrend {
  period: string;
  delivery: { average: number; trend: 'up' | 'down' | 'stable' };
  quality: { average: number; trend: 'up' | 'down' | 'stable' };
  price: { average: number; trend: 'up' | 'down' | 'stable' };
  service: { average: number; trend: 'up' | 'down' | 'stable' };
}

export interface GrowthTrend {
  period: string;
  newSuppliers: number;
  activeSuppliers: number;
  suspendedSuppliers: number;
  growthRate: number;
}

export interface CategoryTrend {
  period: string;
  averageRating: number;
  supplierCount: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ReviewVolumeTrend {
  period: string;
  totalReviews: number;
  averageReviewsPerSupplier: number;
  newReviewers: number;
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

export interface TrendAnalysisOptions {
  months: number;
  includeProjections?: boolean;
  categories?: string[];
  granularity: 'weekly' | 'monthly' | 'quarterly';
}

export interface TrendMetrics {
  slope: number;
  variance: number;
  correlation: number;
  seasonality: boolean;
  confidence: number;
}

export interface ForecastData {
  period: string;
  predictedValue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  factors: string[];
}