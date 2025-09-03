/**
 * BOQ Import Catalog Manager
 * Handles catalog loading and matcher initialization
 */

import { CatalogMatcher, CatalogItem } from '../../../../lib/utils/catalogMatcher';
import { log } from '@/lib/logger';

export class BOQImportCatalogManager {
  private catalogMatcher?: CatalogMatcher;
  private catalogItems: CatalogItem[] = [];
  private isLoaded = false;

  constructor() {
    this.loadCatalogItems();
  }

  /**
   * Load catalog items and initialize matcher
   */
  private async loadCatalogItems(): Promise<void> {
    try {
      this.catalogItems = await this.fetchCatalogItems();
      this.catalogMatcher = new CatalogMatcher(this.catalogItems, {
        minConfidence: 0.6,
        maxResults: 5,
        enableFuzzyMatching: true,
        enableKeywordMatching: true
      });
      this.isLoaded = true;
    } catch (error) {
      log.error('Error loading catalog items:', { data: error }, 'catalogManager');
      this.catalogItems = [];
      this.isLoaded = false;
    }
  }

  /**
   * Fetch catalog items from Neon database
   */
  private async fetchCatalogItems(): Promise<CatalogItem[]> {
    // TODO: Replace with actual Neon database call
    return [
      {
        id: 'cat-001',
        code: 'FBC-50-SM',
        description: 'Fiber Optic Cable, Single Mode, 50 Core',
        category: 'Cables',
        subcategory: 'Fiber Optic',
        uom: 'meter',
        status: 'active',
        keywords: ['fiber', 'optical', 'cable', 'singlemode'],
        aliases: ['Fiber Cable 50 Core', 'SM Fiber 50C']
      },
      {
        id: 'cat-002',
        code: 'ECC-4C-16',
        description: 'Electrical Control Cable, 4 Core, 16mm',
        category: 'Cables',
        subcategory: 'Electrical',
        uom: 'meter',
        status: 'active',
        keywords: ['electrical', 'control', 'cable', '4core'],
        aliases: ['Control Cable 4C', 'EC Cable 16mm']
      },
      {
        id: 'cat-003',
        code: 'FTJ-SC-12',
        description: 'Fiber Termination Joint, SC Connector, 12 Port',
        category: 'Terminations',
        subcategory: 'Fiber Optic',
        uom: 'each',
        status: 'active',
        keywords: ['fiber', 'termination', 'joint', 'connector', 'sc'],
        aliases: ['SC Termination 12P', 'Fiber Joint SC']
      }
    ];
  }

  /**
   * Get catalog matcher instance
   */
  getCatalogMatcher(): CatalogMatcher | undefined {
    return this.catalogMatcher;
  }

  /**
   * Check if catalog is loaded
   */
  isCatalogLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Get catalog items count
   */
  getCatalogItemsCount(): number {
    return this.catalogItems.length;
  }

  /**
   * Reload catalog items
   */
  async reloadCatalog(): Promise<void> {
    this.isLoaded = false;
    await this.loadCatalogItems();
  }

  /**
   * Get catalog items by category
   */
  getCatalogItemsByCategory(category: string): CatalogItem[] {
    return this.catalogItems.filter(item => 
      item.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Search catalog items
   */
  searchCatalogItems(searchTerm: string): CatalogItem[] {
    const term = searchTerm.toLowerCase();
    return this.catalogItems.filter(item =>
      item.description.toLowerCase().includes(term) ||
      item.code.toLowerCase().includes(term) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(term)) ||
      item.aliases?.some(alias => alias.toLowerCase().includes(term))
    );
  }
}