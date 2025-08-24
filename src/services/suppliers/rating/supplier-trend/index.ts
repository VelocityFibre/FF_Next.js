/**
 * Supplier Trend - Barrel Export
 * Centralized exports for all supplier trend analysis functionality
 */

export { SupplierRatingAnalyzer } from './rating-analyzer';
export { SupplierPerformanceTracker } from './performance-tracker';
export { SupplierTrendReporter } from './trend-reporter';

export type {
  RatingTrend,
  PerformanceTrend,
  GrowthTrend,
  CategoryTrend,
  ReviewVolumeTrend,
  TrendSummaryReport,
  TrendAnalysisOptions,
  TrendMetrics,
  ForecastData
} from './trend-types';