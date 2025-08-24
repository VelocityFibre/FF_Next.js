/**
 * Supplier Search Service - Legacy Compatibility Layer
 * @deprecated Use './search' modular components instead
 * This file maintains backward compatibility for existing imports
 * New code should import from './search' directly
 */

// Re-export everything from the modular structure
export * from './search';

// Import services for legacy class compatibility
import { 
  SupplierSearchCore, 
  SupplierSuggestionsService,
  SupplierSearchFilters,
  CategorySearchOptions,
  PreferredSupplierOptions,
  RFQSearchCriteria,
  SupplierWithMatchScore,
  SearchSuggestionContext,
  SearchFacets
} from './search';
import { Supplier } from '@/types/supplier.types';

/**
 * Supplier search and filtering service
 * @deprecated Use SupplierSearchCore from './search' instead
 */
export class SupplierSearchService {
  /**
   * Advanced supplier search with multiple filters
   * @deprecated Use SupplierSearchCore.search() instead
   */
  static async search(filters: SupplierSearchFilters): Promise<Supplier[]> {
    return SupplierSearchCore.search(filters);
  }

  /**
   * Search suppliers by name with fuzzy matching
   * @deprecated Use SupplierSearchCore.searchByName() instead
   */
  static async searchByName(searchTerm: string, maxResults: number = 50): Promise<Supplier[]> {
    return SupplierSearchCore.searchByName(searchTerm, maxResults);
  }

  /**
   * Get suppliers by category with performance ranking
   * @deprecated Use SupplierSearchCore.getByCategory() instead
   */
  static async getByCategory(
    category: string, 
    options?: CategorySearchOptions
  ): Promise<Supplier[]> {
    return SupplierSearchCore.getByCategory(category, options);
  }

  /**
   * Get suppliers by location/region
   * @deprecated Use SupplierSearchCore.getByLocation() instead
   */
  static async getByLocation(location: string): Promise<Supplier[]> {
    return SupplierSearchCore.getByLocation(location);
  }

  /**
   * Get preferred suppliers with ranking
   * @deprecated Use SupplierSearchCore.getPreferredSuppliers() instead
   */
  static async getPreferredSuppliers(
    options?: PreferredSupplierOptions
  ): Promise<Supplier[]> {
    return SupplierSearchCore.getPreferredSuppliers(options);
  }

  /**
   * Search suppliers for RFQ matching
   * @deprecated Use SupplierSearchCore.searchForRFQ() instead
   */
  static async searchForRFQ(criteria: RFQSearchCriteria): Promise<SupplierWithMatchScore[]> {
    return SupplierSearchCore.searchForRFQ(criteria);
  }

  /**
   * Get supplier suggestions based on context
   * @deprecated Use SupplierSuggestionsService.getSuggestions() instead
   */
  static async getSuggestions(context: SearchSuggestionContext): Promise<{
    companies: string[];
    categories: string[];
    locations: string[];
  }> {
    return SupplierSuggestionsService.getSuggestions(context);
  }

  /**
   * Get advanced search filters/facets
   * @deprecated Use SupplierSuggestionsService.getSearchFacets() instead
   */
  static async getSearchFacets(): Promise<SearchFacets> {
    return SupplierSuggestionsService.getSearchFacets();
  }
}

// Default export for backward compatibility
export { SupplierSearchCore as default } from './search';