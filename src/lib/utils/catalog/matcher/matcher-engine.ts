/**
 * Catalog Matcher Engine - Core matching logic
 */

import { CatalogItem, MatchResult, MatchConfig, BOQItemForMatching } from '../types';
import { SimilarityCalculator } from './similarity-calculator';
import { SearchIndexManager } from './search-index';

export class CatalogMatcherEngine {
  private config: MatchConfig;
  private catalogItems: CatalogItem[];
  private searchIndex: SearchIndexManager;
  private similarityCalculator: SimilarityCalculator;

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
    this.searchIndex = new SearchIndexManager(this.catalogItems);
    this.similarityCalculator = new SimilarityCalculator();
  }

  /**
   * Find matching catalog items for a BOQ item
   */
  async findMatches(boqItem: BOQItemForMatching): Promise<MatchResult[]> {
    const candidates = new Set<string>();
    const matches: MatchResult[] = [];
    
    // 1. Exact code match
    const exactMatch = this.findExactCodeMatch(boqItem);
    if (exactMatch) {
      matches.push(exactMatch);
    }
    
    // 2. Keyword-based candidate selection
    if (this.config.enableKeywordMatching) {
      const keywordCandidates = this.searchIndex.findCandidates(boqItem);
      keywordCandidates.forEach(id => candidates.add(id));
    }
    
    // 3. Calculate match scores for candidates
    const candidateMatches = this.calculateCandidateMatches(boqItem, candidates);
    matches.push(...candidateMatches);
    
    // 4. Fuzzy matching if not enough results
    if (matches.length < this.config.maxResults && this.config.enableFuzzyMatching) {
      const fuzzyMatches = await this.performFuzzyMatching(boqItem, candidates);
      matches.push(...fuzzyMatches);
    }
    
    // 5. Sort by confidence and return top results
    return this.finalizeResults(matches);
  }

  private findExactCodeMatch(boqItem: BOQItemForMatching): MatchResult | null {
    if (!boqItem.itemCode) return null;
    
    const exactCodeMatch = this.catalogItems.find(item => 
      item.code.toLowerCase() === boqItem.itemCode!.toLowerCase()
    );
    
    if (exactCodeMatch) {
      return {
        catalogItem: exactCodeMatch,
        confidence: 1.0,
        matchType: 'exact',
        matchedFields: ['code'],
        reason: `Exact code match: ${boqItem.itemCode}`
      };
    }
    
    return null;
  }

  private calculateCandidateMatches(boqItem: BOQItemForMatching, candidates: Set<string>): MatchResult[] {
    const candidateItems = this.catalogItems.filter(item => candidates.has(item.id));
    const matches: MatchResult[] = [];
    
    for (const catalogItem of candidateItems) {
      const matchResult = this.calculateMatch(boqItem, catalogItem);
      if (matchResult.confidence >= this.config.minConfidence) {
        matches.push(matchResult);
      }
    }
    
    return matches;
  }

  private calculateMatch(boqItem: BOQItemForMatching, catalogItem: CatalogItem): MatchResult {
    return this.similarityCalculator.calculateMatch(boqItem, catalogItem, this.config);
  }

  private async performFuzzyMatching(
    boqItem: BOQItemForMatching, 
    excludeCandidates: Set<string>
  ): Promise<MatchResult[]> {
    const fuzzyMatches: MatchResult[] = [];
    
    // Sample from remaining catalog items to avoid performance issues
    const remainingItems = this.catalogItems
      .filter(item => !excludeCandidates.has(item.id))
      .slice(0, 100); // Limit for performance
    
    for (const catalogItem of remainingItems) {
      const matchResult = this.calculateMatch(boqItem, catalogItem);
      if (matchResult.confidence >= this.config.minConfidence) {
        fuzzyMatches.push(matchResult);
      }
    }
    
    return fuzzyMatches.sort((a, b) => b.confidence - a.confidence);
  }

  private finalizeResults(matches: MatchResult[]): MatchResult[] {
    const sortedMatches = matches
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.config.maxResults);
    
    // Remove duplicates
    return sortedMatches.filter((match, index, array) => 
      array.findIndex(m => m.catalogItem.id === match.catalogItem.id) === index
    );
  }

  /**
   * Update catalog items and rebuild index
   */
  updateCatalog(catalogItems: CatalogItem[]): void {
    this.catalogItems = catalogItems.filter(item => item.status === 'active');
    this.searchIndex.rebuild(this.catalogItems);
  }

  /**
   * Get matching statistics
   */
  getStats(): {
    totalItems: number;
    indexedKeywords: number;
    avgKeywordsPerItem: number;
  } {
    return this.searchIndex.getStats();
  }
}