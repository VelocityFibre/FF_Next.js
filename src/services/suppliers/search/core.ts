/**
 * Supplier Search Core Service
 * Main search orchestration and public API
 */

import { Supplier } from '@/types/supplier.types';
import { 
  SupplierSearchFilters, 
  CategorySearchOptions, 
  PreferredSupplierOptions, 
  RFQSearchCriteria,
  SupplierWithMatchScore
} from './types';
import { SupplierQueryBuilder } from './queryBuilder';
import { SupplierFilterProcessor } from './filters';
import { SupplierSortingService } from './sorting';
import { SupplierScoringService } from './scoring';

export class SupplierSearchCore {
  /**
   * Advanced supplier search with multiple filters
   */
  static async search(filters: SupplierSearchFilters): Promise<Supplier[]> {
    try {
      let suppliers = await SupplierQueryBuilder.getBaseSupplierSet(filters);
      
      // Apply client-side filters for complex criteria
      suppliers = SupplierFilterProcessor.applyClientSideFilters(suppliers, filters);
      
      // Apply sorting
      suppliers = SupplierSortingService.applySorting(suppliers, filters.sortBy, filters.sortOrder);
      
      // Apply limit
      if (filters.limit && filters.limit > 0) {
        suppliers = suppliers.slice(0, filters.limit);
      }
      
      return suppliers;
    } catch (error) {
      console.error('Error searching suppliers:', error);
      throw new Error(`Failed to search suppliers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search suppliers by name with fuzzy matching
   */
  static async searchByName(searchTerm: string, maxResults: number = 50): Promise<Supplier[]> {
    try {
      if (!searchTerm.trim()) {
        return [];
      }

      // Get suppliers from query builder
      const suppliers = await SupplierQueryBuilder.queryByName(searchTerm, maxResults);
      
      // Client-side fuzzy search
      const searchResults = SupplierSortingService.fuzzySearchSuppliers(suppliers, searchTerm);
      
      return searchResults.slice(0, maxResults);
    } catch (error) {
      console.error('Error searching suppliers by name:', error);
      throw new Error(`Failed to search suppliers by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get suppliers by category with performance ranking
   */
  static async getByCategory(
    category: string, 
    options?: CategorySearchOptions
  ): Promise<Supplier[]> {
    try {
      return await SupplierQueryBuilder.queryByCategory(category, options);
    } catch (error) {
      console.error(`Error fetching suppliers by category ${category}:`, error);
      throw new Error(`Failed to fetch suppliers by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get suppliers by location/region
   */
  static async getByLocation(location: string): Promise<Supplier[]> {
    try {
      // Get all active suppliers and filter by location
      const suppliers = await SupplierQueryBuilder.getBaseSupplierSet({ status: 'active' });
      return SupplierFilterProcessor.filterByLocation(suppliers, location);
    } catch (error) {
      console.error(`Error fetching suppliers by location ${location}:`, error);
      throw new Error(`Failed to fetch suppliers by location: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get preferred suppliers with ranking
   */
  static async getPreferredSuppliers(
    options?: PreferredSupplierOptions
  ): Promise<Supplier[]> {
    try {
      return await SupplierQueryBuilder.queryPreferredSuppliers(options);
    } catch (error) {
      console.error('Error fetching preferred suppliers:', error);
      throw new Error(`Failed to fetch preferred suppliers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search suppliers for RFQ matching
   */
  static async searchForRFQ(criteria: RFQSearchCriteria): Promise<SupplierWithMatchScore[]> {
    try {
      const suppliers = await SupplierQueryBuilder.getBaseSupplierSet({ 
        status: 'active' 
      });
      
      // Filter suppliers for RFQ match
      const filteredSuppliers = SupplierFilterProcessor.filterForRFQ(suppliers, criteria);
      
      // Score and rank suppliers
      return SupplierScoringService.scoreForRFQ(filteredSuppliers, criteria);
    } catch (error) {
      console.error('Error searching suppliers for RFQ:', error);
      throw new Error(`Failed to search suppliers for RFQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}