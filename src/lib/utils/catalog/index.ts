/**
 * Catalog Matching System
 * Exports for catalog item matching functionality
 */

export * from './types';
export * from './textProcessor';
export * from './catalogMatcher';

// Re-export main classes for convenience
export { TextProcessor } from './textProcessor';
export { CatalogMatcher } from './catalogMatcher';

// Default matcher configuration
export const DEFAULT_MATCH_CONFIG = {
  minConfidence: 0.6,
  maxResults: 5,
  exactMatchBoost: 0.3,
  codeWeight: 0.4,
  descriptionWeight: 0.6,
  enableFuzzyMatching: true,
  enableKeywordMatching: true,
  strictUomMatching: false,
};