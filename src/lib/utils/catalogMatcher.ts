/**
 * Catalog Matcher Utility for BOQ Import
 * Implements fuzzy matching algorithm for catalog item mapping
 */

import { z } from 'zod';

// Catalog item structure
export interface CatalogItem {
  id: string;
  code: string;
  description: string;
  category: string;
  subcategory?: string;
  uom: string;
  specifications?: Record<string, any>;
  aliases?: string[]; // Alternative names/codes
  keywords?: string[]; // Search keywords
  status: 'active' | 'inactive' | 'discontinued';
}

// Matching result
export interface MatchResult {
  catalogItem: CatalogItem;
  confidence: number; // 0-1 scale
  matchType: 'exact' | 'fuzzy' | 'partial' | 'keyword';
  matchedFields: string[]; // Fields that contributed to the match
  reason: string; // Human-readable explanation
}

// Matching configuration
export interface MatchConfig {
  minConfidence: number; // Minimum confidence threshold (default: 0.6)
  maxResults: number; // Maximum results to return (default: 5)
  exactMatchBoost: number; // Boost for exact matches (default: 0.3)
  codeWeight: number; // Weight for code matching (default: 0.4)
  descriptionWeight: number; // Weight for description matching (default: 0.6)
  enableFuzzyMatching: boolean; // Enable fuzzy string matching (default: true)
  enableKeywordMatching: boolean; // Enable keyword matching (default: true)
  strictUomMatching: boolean; // Require UOM to match (default: false)
}

// BOQ item for matching
export interface BOQItemForMatching {
  itemCode?: string;
  description: string;
  uom: string;
  category?: string;
  subcategory?: string;
  keywords?: string[];
}

// Exception for manual review
export interface MappingException {
  id: string;
  boqItem: BOQItemForMatching;
  suggestions: MatchResult[];
  status: 'pending' | 'resolved' | 'ignored';
  resolution?: {
    selectedCatalogItemId?: string;
    action: 'map' | 'create_new' | 'ignore';
    notes?: string;
    resolvedBy: string;
    resolvedAt: Date;
  };
  createdAt: Date;
  priority: 'high' | 'medium' | 'low';
}

// Pre-processing for text normalization
export class TextProcessor {
  private static stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'mm', 'cm', 'm', 'kg', 'g', 'ton', 'pcs', 'nos', 'each', 'pair', 'set', 'length', 'width',
    'diameter', 'thickness', 'size', 'grade', 'type', 'model', 'brand', 'make'
  ]);

  /**
   * Normalize text for better matching
   */
  static normalize(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, ' ') // Remove special characters except hyphens
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\b\d+\w*\b/g, '') // Remove standalone numbers with units
      .trim();
  }

  /**
   * Extract keywords from text
   */
  static extractKeywords(text: string): string[] {
    const normalized = this.normalize(text);
    const words = normalized.split(/\s+/);
    
    return words
      .filter(word => word.length > 2) // Remove short words
      .filter(word => !this.stopWords.has(word)) // Remove stop words
      .filter(word => !/^\d+$/.test(word)) // Remove pure numbers
      .map(word => word.replace(/s$/, '')) // Simple stemming (remove plural 's')
      .filter((word, index, array) => array.indexOf(word) === index); // Remove duplicates
  }

  /**
   * Generate search variations for a term
   */
  static generateVariations(text: string): string[] {
    const variations = new Set<string>();
    const normalized = this.normalize(text);
    
    variations.add(normalized);
    variations.add(text.toLowerCase().trim());
    
    // Add acronym if text has multiple words
    const words = normalized.split(/\s+/);
    if (words.length > 1) {
      const acronym = words.map(word => word[0]).join('');
      if (acronym.length > 1) {
        variations.add(acronym);
      }
    }
    
    // Add without common suffixes
    const withoutSuffixes = normalized
      .replace(/\b(cable|wire|cord|tube|pipe|fitting|joint|connector)s?\b/g, '')
      .trim();
    if (withoutSuffixes && withoutSuffixes !== normalized) {
      variations.add(withoutSuffixes);
    }
    
    return Array.from(variations).filter(v => v.length > 0);
  }
}

export class CatalogMatcher {
  private config: MatchConfig;
  private catalogItems: CatalogItem[];
  private searchIndex: Map<string, Set<string>> = new Map(); // keyword -> catalog item IDs

  constructor(catalogItems: CatalogItem[], config: Partial<MatchConfig> = {}) {
    this.config = {
      minConfidence: 0.6,
      maxResults: 5,
      exactMatchBoost: 0.3,
      codeWeight: 0.4,
      descriptionWeight: 0.6,
      enableFuzzyMatching: true,
      enableKeywordMatching: true,
      strictUomMatching: false,
      ...config
    };
    
    this.catalogItems = catalogItems.filter(item => item.status === 'active');
    this.buildSearchIndex();
  }

  /**
   * Build search index for fast keyword lookup
   */
  private buildSearchIndex(): void {
    this.searchIndex.clear();
    
    this.catalogItems.forEach(item => {
      const keywords = new Set<string>();
      
      // Add keywords from description
      TextProcessor.extractKeywords(item.description).forEach(keyword => 
        keywords.add(keyword)
      );
      
      // Add keywords from code
      if (item.code) {
        TextProcessor.extractKeywords(item.code).forEach(keyword => 
          keywords.add(keyword)
        );
      }
      
      // Add predefined keywords
      item.keywords?.forEach(keyword => 
        keywords.add(TextProcessor.normalize(keyword))
      );
      
      // Add aliases
      item.aliases?.forEach(alias => 
        TextProcessor.extractKeywords(alias).forEach(keyword => 
          keywords.add(keyword)
        )
      );
      
      // Add category keywords
      TextProcessor.extractKeywords(item.category).forEach(keyword => 
        keywords.add(keyword)
      );
      
      if (item.subcategory) {
        TextProcessor.extractKeywords(item.subcategory).forEach(keyword => 
          keywords.add(keyword)
        );
      }
      
      // Store in index
      keywords.forEach(keyword => {
        if (!this.searchIndex.has(keyword)) {
          this.searchIndex.set(keyword, new Set());
        }
        this.searchIndex.get(keyword)!.add(item.id);
      });
    });
  }

  /**
   * Find matching catalog items for a BOQ item
   */
  async findMatches(boqItem: BOQItemForMatching): Promise<MatchResult[]> {
    const candidates = new Set<string>();
    const matches: MatchResult[] = [];
    
    // 1. Exact code match
    if (boqItem.itemCode) {
      const exactCodeMatch = this.catalogItems.find(item => 
        item.code.toLowerCase() === boqItem.itemCode!.toLowerCase()
      );
      
      if (exactCodeMatch) {
        matches.push({
          catalogItem: exactCodeMatch,
          confidence: 1.0,
          matchType: 'exact',
          matchedFields: ['code'],
          reason: `Exact code match: ${boqItem.itemCode}`
        });
      }
    }
    
    // 2. Keyword-based candidate selection
    if (this.config.enableKeywordMatching) {
      const keywords = TextProcessor.extractKeywords(boqItem.description);
      keywords.forEach(keyword => {
        const itemIds = this.searchIndex.get(keyword);
        if (itemIds) {
          itemIds.forEach(id => candidates.add(id));
        }
      });
      
      // Add category-based candidates
      if (boqItem.category) {
        const categoryKeywords = TextProcessor.extractKeywords(boqItem.category);
        categoryKeywords.forEach(keyword => {
          const itemIds = this.searchIndex.get(keyword);
          if (itemIds) {
            itemIds.forEach(id => candidates.add(id));
          }
        });
      }
    }
    
    // 3. Calculate match scores for candidates
    const candidateItems = this.catalogItems.filter(item => candidates.has(item.id));
    
    for (const catalogItem of candidateItems) {
      const matchResult = this.calculateMatch(boqItem, catalogItem);
      if (matchResult.confidence >= this.config.minConfidence) {
        matches.push(matchResult);
      }
    }
    
    // 4. Fuzzy matching if not enough results
    if (matches.length < this.config.maxResults && this.config.enableFuzzyMatching) {
      const fuzzyMatches = await this.performFuzzyMatching(boqItem, candidates);
      matches.push(...fuzzyMatches);
    }
    
    // 5. Sort by confidence and return top results
    const sortedMatches = matches
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.config.maxResults);
    
    // Remove duplicates
    const uniqueMatches = sortedMatches.filter((match, index, array) => 
      array.findIndex(m => m.catalogItem.id === match.catalogItem.id) === index
    );
    
    return uniqueMatches;
  }

  /**
   * Calculate match score between BOQ item and catalog item
   */
  private calculateMatch(boqItem: BOQItemForMatching, catalogItem: CatalogItem): MatchResult {
    let totalScore = 0;
    let maxScore = 0;
    const matchedFields: string[] = [];
    const reasons: string[] = [];
    
    // Code matching
    if (boqItem.itemCode && catalogItem.code) {
      const codeScore = this.calculateStringScore(boqItem.itemCode, catalogItem.code);
      totalScore += codeScore * this.config.codeWeight;
      maxScore += this.config.codeWeight;
      
      if (codeScore > 0.8) {
        matchedFields.push('code');
        reasons.push(`Code similarity: ${Math.round(codeScore * 100)}%`);
      }
    }
    
    // Description matching
    const descScore = this.calculateStringScore(boqItem.description, catalogItem.description);
    totalScore += descScore * this.config.descriptionWeight;
    maxScore += this.config.descriptionWeight;
    
    if (descScore > 0.6) {
      matchedFields.push('description');
      reasons.push(`Description similarity: ${Math.round(descScore * 100)}%`);
    }
    
    // UOM matching
    const uomMatch = boqItem.uom.toLowerCase() === catalogItem.uom.toLowerCase();
    if (this.config.strictUomMatching && !uomMatch) {
      return {
        catalogItem,
        confidence: 0,
        matchType: 'partial',
        matchedFields: [],
        reason: 'UOM mismatch (strict mode)'
      };
    }
    
    if (uomMatch) {
      totalScore += 0.1; // Small boost for UOM match
      matchedFields.push('uom');
      reasons.push('UOM match');
    }
    
    // Category matching
    if (boqItem.category && catalogItem.category) {
      const categoryScore = this.calculateStringScore(boqItem.category, catalogItem.category);
      if (categoryScore > 0.8) {
        totalScore += 0.1; // Small boost for category match
        matchedFields.push('category');
        reasons.push('Category match');
      }
    }
    
    // Calculate final confidence
    const confidence = maxScore > 0 ? totalScore / maxScore : 0;
    
    // Apply exact match boost
    if (confidence > 0.95) {
      totalScore += this.config.exactMatchBoost;
    }
    
    const finalConfidence = Math.min(confidence, 1.0);
    
    // Determine match type
    let matchType: MatchResult['matchType'] = 'fuzzy';
    if (finalConfidence >= 0.95) matchType = 'exact';
    else if (finalConfidence >= 0.8) matchType = 'partial';
    else if (matchedFields.length > 0) matchType = 'keyword';
    
    return {
      catalogItem,
      confidence: finalConfidence,
      matchType,
      matchedFields,
      reason: reasons.join(', ') || 'Fuzzy match'
    };
  }

  /**
   * Perform fuzzy matching for low-result cases
   */
  private async performFuzzyMatching(
    boqItem: BOQItemForMatching,
    excludeIds: Set<string>
  ): Promise<MatchResult[]> {
    const matches: MatchResult[] = [];
    
    // Generate description variations
    const variations = TextProcessor.generateVariations(boqItem.description);
    
    for (const catalogItem of this.catalogItems) {
      if (excludeIds.has(catalogItem.id)) continue;
      
      let bestScore = 0;
      let bestVariation = '';
      
      // Test against description variations
      for (const variation of variations) {
        const score = this.calculateStringScore(variation, catalogItem.description);
        if (score > bestScore) {
          bestScore = score;
          bestVariation = variation;
        }
        
        // Test against aliases
        if (catalogItem.aliases) {
          for (const alias of catalogItem.aliases) {
            const aliasScore = this.calculateStringScore(variation, alias);
            if (aliasScore > bestScore) {
              bestScore = aliasScore;
              bestVariation = `${variation} (alias: ${alias})`;
            }
          }
        }
      }
      
      if (bestScore >= this.config.minConfidence) {
        matches.push({
          catalogItem,
          confidence: bestScore,
          matchType: 'fuzzy',
          matchedFields: ['description'],
          reason: `Fuzzy match: ${bestVariation}`
        });
      }
    }
    
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate string similarity score using multiple algorithms
   */
  private calculateStringScore(str1: string, str2: string): number {
    const normalized1 = TextProcessor.normalize(str1);
    const normalized2 = TextProcessor.normalize(str2);
    
    // Exact match
    if (normalized1 === normalized2) return 1.0;
    
    // Jaccard similarity (word-based)
    const words1 = new Set(normalized1.split(/\s+/));
    const words2 = new Set(normalized2.split(/\s+/));
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    const jaccardScore = intersection.size / union.size;
    
    // Levenshtein similarity
    const levenshteinScore = 1 - (this.levenshteinDistance(normalized1, normalized2) / 
      Math.max(normalized1.length, normalized2.length));
    
    // Substring matching
    const substringScore = this.calculateSubstringScore(normalized1, normalized2);
    
    // Weighted combination
    return (jaccardScore * 0.5) + (levenshteinScore * 0.3) + (substringScore * 0.2);
  }

  /**
   * Calculate substring matching score
   */
  private calculateSubstringScore(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.includes(shorter)) {
      return shorter.length / longer.length;
    }
    
    // Find longest common substring
    let maxLength = 0;
    for (let i = 0; i < shorter.length; i++) {
      for (let j = i + 1; j <= shorter.length; j++) {
        const substring = shorter.slice(i, j);
        if (longer.includes(substring) && substring.length > maxLength) {
          maxLength = substring.length;
        }
      }
    }
    
    return maxLength / Math.max(str1.length, str2.length);
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Create mapping exception for items that couldn't be auto-matched
   */
  createException(
    boqItem: BOQItemForMatching,
    suggestions: MatchResult[],
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): MappingException {
    return {
      id: `exc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      boqItem,
      suggestions: suggestions.slice(0, 3), // Limit to top 3 suggestions
      status: 'pending',
      createdAt: new Date(),
      priority
    };
  }

  /**
   * Batch process multiple BOQ items
   */
  async batchMatch(
    boqItems: BOQItemForMatching[],
    onProgress?: (progress: number, processed: number, total: number) => void
  ): Promise<{
    matches: { boqItem: BOQItemForMatching; results: MatchResult[] }[];
    exceptions: MappingException[];
    stats: {
      total: number;
      autoMapped: number;
      needsReview: number;
      failed: number;
      confidence: {
        high: number; // > 0.9
        medium: number; // 0.7 - 0.9
        low: number; // 0.6 - 0.7
      };
    };
  }> {
    const matches: { boqItem: BOQItemForMatching; results: MatchResult[] }[] = [];
    const exceptions: MappingException[] = [];
    
    const stats = {
      total: boqItems.length,
      autoMapped: 0,
      needsReview: 0,
      failed: 0,
      confidence: { high: 0, medium: 0, low: 0 }
    };

    for (let i = 0; i < boqItems.length; i++) {
      const boqItem = boqItems[i];
      
      try {
        const results = await this.findMatches(boqItem);
        matches.push({ boqItem, results });
        
        if (results.length > 0) {
          const bestMatch = results[0];
          
          if (bestMatch.confidence >= 0.9) {
            stats.autoMapped++;
            stats.confidence.high++;
          } else if (bestMatch.confidence >= 0.7) {
            stats.needsReview++;
            stats.confidence.medium++;
            
            // Create exception for manual review
            const priority = bestMatch.confidence >= 0.8 ? 'low' : 'medium';
            exceptions.push(this.createException(boqItem, results, priority));
          } else {
            stats.needsReview++;
            stats.confidence.low++;
            
            // Create high-priority exception
            exceptions.push(this.createException(boqItem, results, 'high'));
          }
        } else {
          stats.failed++;
          
          // Create exception with no suggestions
          exceptions.push(this.createException(boqItem, [], 'high'));
        }
      } catch (error) {
        stats.failed++;
        console.error(`Error matching BOQ item:`, error);
      }
      
      // Report progress
      onProgress?.(((i + 1) / boqItems.length) * 100, i + 1, boqItems.length);
    }

    return { matches, exceptions, stats };
  }

  /**
   * Update catalog items and rebuild index
   */
  updateCatalog(catalogItems: CatalogItem[]): void {
    this.catalogItems = catalogItems.filter(item => item.status === 'active');
    this.buildSearchIndex();
  }

  /**
   * Get statistics about the catalog
   */
  getCatalogStats(): {
    totalItems: number;
    categories: Record<string, number>;
    indexSize: number;
    avgKeywordsPerItem: number;
  } {
    const categories: Record<string, number> = {};
    let totalKeywords = 0;

    this.catalogItems.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });

    this.searchIndex.forEach(itemIds => {
      totalKeywords += itemIds.size;
    });

    return {
      totalItems: this.catalogItems.length,
      categories,
      indexSize: this.searchIndex.size,
      avgKeywordsPerItem: totalKeywords / this.catalogItems.length
    };
  }
}