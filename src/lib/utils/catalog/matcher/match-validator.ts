/**
 * Match Validator - Validation and filtering logic
 */

import { MatchResult, MatchConfig, CatalogItem, BOQItemForMatching } from '../types';

export class MatchValidator {
  private config: MatchConfig;

  constructor(config: MatchConfig) {
    this.config = config;
  }

  /**
   * Validate if a match meets minimum requirements
   */
  isValidMatch(matchResult: MatchResult): boolean {
    return matchResult.confidence >= this.config.minConfidence;
  }

  /**
   * Validate UOM compatibility
   */
  validateUOM(boqItem: BOQItemForMatching, catalogItem: CatalogItem): boolean {
    if (!this.config.strictUomMatching) return true;
    
    return boqItem.uom.toLowerCase() === catalogItem.uom.toLowerCase();
  }

  /**
   * Validate category compatibility
   */
  validateCategory(boqItem: BOQItemForMatching, catalogItem: CatalogItem): boolean {
    if (!boqItem.category || !catalogItem.category) return true;
    
    const boqCategory = boqItem.category.toLowerCase();
    const catalogCategory = catalogItem.category.toLowerCase();
    
    // Exact match
    if (boqCategory === catalogCategory) return true;
    
    // Check if one contains the other
    if (boqCategory.includes(catalogCategory) || catalogCategory.includes(boqCategory)) {
      return true;
    }
    
    return false;
  }

  /**
   * Validate price range if applicable
   */
  validatePriceRange(
    boqItem: BOQItemForMatching, 
    catalogItem: CatalogItem,
    maxPriceDeviation?: number
  ): boolean {
    if (!boqItem.estimatedPrice || !catalogItem.price || !maxPriceDeviation) {
      return true; // No price validation
    }
    
    const deviation = Math.abs(boqItem.estimatedPrice - catalogItem.price) / boqItem.estimatedPrice;
    return deviation <= maxPriceDeviation;
  }

  /**
   * Filter matches based on business rules
   */
  filterMatches(matches: MatchResult[], boqItem: BOQItemForMatching): MatchResult[] {
    return matches.filter(match => {
      // Basic confidence check
      if (!this.isValidMatch(match)) return false;
      
      // UOM validation
      if (!this.validateUOM(boqItem, match.catalogItem)) return false;
      
      // Category validation
      if (!this.validateCategory(boqItem, match.catalogItem)) return false;
      
      return true;
    });
  }

  /**
   * Sort matches by quality score
   */
  sortMatchesByQuality(matches: MatchResult[]): MatchResult[] {
    return matches.sort((a, b) => {
      // Primary sort by confidence
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }
      
      // Secondary sort by match type priority
      const typeOrder = { exact: 4, fuzzy: 3, keyword: 2, partial: 1 };
      const aTypeScore = typeOrder[a.matchType] || 0;
      const bTypeScore = typeOrder[b.matchType] || 0;
      
      if (aTypeScore !== bTypeScore) {
        return bTypeScore - aTypeScore;
      }
      
      // Tertiary sort by number of matched fields
      return b.matchedFields.length - a.matchedFields.length;
    });
  }

  /**
   * Remove duplicate matches
   */
  removeDuplicates(matches: MatchResult[]): MatchResult[] {
    const seenIds = new Set<string>();
    return matches.filter(match => {
      if (seenIds.has(match.catalogItem.id)) {
        return false;
      }
      seenIds.add(match.catalogItem.id);
      return true;
    });
  }

  /**
   * Limit results to maximum count
   */
  limitResults(matches: MatchResult[]): MatchResult[] {
    return matches.slice(0, this.config.maxResults);
  }

  /**
   * Apply all validation and filtering rules
   */
  processMatches(matches: MatchResult[], boqItem: BOQItemForMatching): MatchResult[] {
    let processedMatches = matches;
    
    // Filter by business rules
    processedMatches = this.filterMatches(processedMatches, boqItem);
    
    // Sort by quality
    processedMatches = this.sortMatchesByQuality(processedMatches);
    
    // Remove duplicates
    processedMatches = this.removeDuplicates(processedMatches);
    
    // Limit results
    processedMatches = this.limitResults(processedMatches);
    
    return processedMatches;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MatchConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}