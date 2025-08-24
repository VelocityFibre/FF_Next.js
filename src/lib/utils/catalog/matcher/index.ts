/**
 * Catalog Matcher - Modular matching system
 * Barrel export for all matcher components
 */

export { CatalogMatcherEngine } from './matcher-engine';
export { SimilarityCalculator } from './similarity-calculator';
export { SearchIndexManager } from './search-index';
export { MatchValidator } from './match-validator';

// Re-export types for convenience
export type {
  CatalogItem,
  MatchResult,
  MatchConfig,
  BOQItemForMatching
} from '../types';