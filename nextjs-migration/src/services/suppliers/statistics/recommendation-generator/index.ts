/**
 * Recommendation Generator - Barrel Export
 * Centralized exports for all recommendation generation functionality
 */

export { CoreRecommendationEngine } from './core-recommendations';
export { RecommendationPriorityAnalyzer } from './priority-analyzer';
export { RecommendationIndustrySpecialist } from './industry-specialist';

export type {
  RecommendationItem,
  ImprovementPlan,
  RecommendationAnalysis,
  ComplianceInfo
} from './recommendation-types';

export {
  RECOMMENDATION_THRESHOLDS,
  TIMELINE_CATEGORIES,
  INDUSTRY_CATEGORIES
} from './recommendation-types';