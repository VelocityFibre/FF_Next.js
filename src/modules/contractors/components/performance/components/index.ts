/**
 * Performance Components - Barrel export for all performance visualization components
 * Following FibreFlow patterns with comprehensive component exports
 */

// 🟢 WORKING: Chart components
export { RAGScoreChart } from './RAGScoreChart';
export { TrendIndicators } from './TrendIndicators';
export { PerformanceLeaderboard } from './PerformanceLeaderboard';
export { ComparativeAnalysisChart } from './ComparativeAnalysisChart';

// 🟢 WORKING: Re-export types for convenience
export type {
  RAGScoreChartProps,
  TrendIndicatorsProps,
  PerformanceLeaderboardProps
} from '../types';