/**
 * Catalog Matcher - Backward Compatibility Layer
 * @deprecated Use './matcher/index.ts' for improved modular matching system
 * 
 * This file provides backward compatibility for existing imports.
 * New code should use the modular matcher system in ./matcher/
 */

import { CatalogItem, MatchResult, MatchConfig, BOQItemForMatching } from './types';
import { CatalogMatcherEngine } from './matcher';

/**
 * @deprecated Use CatalogMatcherEngine from './matcher' instead
 */
export class CatalogMatcher {
  private engine: CatalogMatcherEngine;

  constructor(catalogItems: CatalogItem[], config: Partial<MatchConfig> = {}) {
    this.engine = new CatalogMatcherEngine(catalogItems, config);
  }

  /**
   * Find matching catalog items for a BOQ item
   * @deprecated Use engine.findMatches() directly
   */
  async findMatches(boqItem: BOQItemForMatching): Promise<MatchResult[]> {
    return this.engine.findMatches(boqItem);
  }

  /**
   * Update catalog items and rebuild index
   * @deprecated Use engine.updateCatalog() directly
   */
  updateCatalog(catalogItems: CatalogItem[]): void {
    this.engine.updateCatalog(catalogItems);
  }

  /**
   * Get matching statistics
   * @deprecated Use engine.getStats() directly
   */
  getStats(): {
    totalItems: number;
    indexedKeywords: number;
    avgKeywordsPerItem: number;
  } {
    return this.engine.getStats();
  }
}

// Re-export the new modular components for convenience
export { CatalogMatcherEngine } from './matcher';