/**
 * Search Index Manager - Keyword indexing and search
 */

import { CatalogItem, BOQItemForMatching } from '../types';
import { TextProcessor } from '../textProcessor';

export class SearchIndexManager {
  private searchIndex: Map<string, Set<string>> = new Map(); // keyword -> catalog item IDs
  private catalogItems: CatalogItem[];

  constructor(catalogItems: CatalogItem[]) {
    this.catalogItems = catalogItems;
    this.buildSearchIndex();
  }

  /**
   * Build search index for fast keyword lookup
   */
  buildSearchIndex(): void {
    this.searchIndex.clear();
    
    this.catalogItems.forEach(item => {
      const keywords = this.extractAllKeywords(item);
      
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
   * Extract all keywords from a catalog item
   */
  private extractAllKeywords(item: CatalogItem): Set<string> {
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
    
    return keywords;
  }

  /**
   * Find candidate items based on BOQ item keywords
   */
  findCandidates(boqItem: BOQItemForMatching): Set<string> {
    const candidates = new Set<string>();
    
    // Description-based candidates
    const keywords = TextProcessor.extractKeywords(boqItem.description);
    keywords.forEach(keyword => {
      const itemIds = this.searchIndex.get(keyword);
      if (itemIds) {
        itemIds.forEach(id => candidates.add(id));
      }
    });
    
    // Category-based candidates
    if (boqItem.category) {
      const categoryKeywords = TextProcessor.extractKeywords(boqItem.category);
      categoryKeywords.forEach(keyword => {
        const itemIds = this.searchIndex.get(keyword);
        if (itemIds) {
          itemIds.forEach(id => candidates.add(id));
        }
      });
    }
    
    return candidates;
  }

  /**
   * Rebuild index with new catalog items
   */
  rebuild(catalogItems: CatalogItem[]): void {
    this.catalogItems = catalogItems;
    this.buildSearchIndex();
  }

  /**
   * Get search index statistics
   */
  getStats(): {
    totalItems: number;
    indexedKeywords: number;
    avgKeywordsPerItem: number;
  } {
    const totalKeywords = Array.from(this.searchIndex.values())
      .reduce((sum, itemSet) => sum + itemSet.size, 0);
    
    return {
      totalItems: this.catalogItems.length,
      indexedKeywords: this.searchIndex.size,
      avgKeywordsPerItem: this.catalogItems.length > 0 ? 
        totalKeywords / this.catalogItems.length : 0
    };
  }

  /**
   * Search for items by keyword
   */
  searchByKeyword(keyword: string): string[] {
    const normalizedKeyword = TextProcessor.normalize(keyword);
    const itemIds = this.searchIndex.get(normalizedKeyword);
    return itemIds ? Array.from(itemIds) : [];
  }

  /**
   * Get all indexed keywords
   */
  getAllKeywords(): string[] {
    return Array.from(this.searchIndex.keys());
  }

  /**
   * Get keywords for a specific item
   */
  getKeywordsForItem(itemId: string): string[] {
    const keywords: string[] = [];
    
    this.searchIndex.forEach((itemIds, keyword) => {
      if (itemIds.has(itemId)) {
        keywords.push(keyword);
      }
    });
    
    return keywords;
  }
}