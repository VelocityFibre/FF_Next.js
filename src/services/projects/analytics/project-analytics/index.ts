/**
 * Project Analytics - Barrel Export
 * Centralized exports for all project analytics functionality
 */

export { ProjectSummaryAnalytics } from './summary-analytics';
export { ProjectPerformanceAnalytics } from './performance-analytics';
export { ProjectTrendAnalytics } from './trend-analytics';

export type {
  ProjectSummary,
  ProjectStatusStats,
  ClientProjectStats,
  MonthlyTrend,
  BudgetAnalysis,
  OverdueProject,
  ProjectPerformanceMetrics,
  TimelineData,
  AnalyticsQuery,
  PerformanceKPI
} from './analytics-types';