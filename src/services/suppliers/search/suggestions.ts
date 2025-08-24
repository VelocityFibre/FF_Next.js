/**
 * Supplier Search Suggestions and Autocomplete
 * Generate search suggestions and facets
 */

import { Supplier } from '@/types/supplier.types';
import { SearchSuggestionContext, SearchFacets } from './types';
import { SupplierQueryBuilder } from './queryBuilder';
import { SupplierScoringService } from './scoring';

export class SupplierSuggestionsService {
  /**
   * Get search suggestions based on context
   */
  static async getSuggestions(context: SearchSuggestionContext): Promise<{
    companies: string[];
    categories: string[];
    locations: string[];
  }> {
    try {
      // Get recent suppliers for suggestions
      const suppliers = await SupplierQueryBuilder.getTopRatedSuppliers(100);
      
      const suggestions = {
        companies: this.getCompanySuggestions(suppliers, context.query),
        categories: this.getCategorySuggestions(suppliers, context.category),
        locations: this.getLocationSuggestions(suppliers, context.location)
      };
      
      return suggestions;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return { companies: [], categories: [], locations: [] };
    }
  }

  /**
   * Get search facets for filtering
   */
  static async getSearchFacets(suppliers?: Supplier[]): Promise<SearchFacets> {
    try {
      // Use provided suppliers or get all active suppliers
      const supplierData = suppliers || await SupplierQueryBuilder.getBaseSupplierSet({});
      
      return {
        categories: SupplierScoringService.calculateFacetCounts(
          supplierData,
          supplier => supplier.categories || []
        ),
        locations: SupplierScoringService.calculateFacetCounts(
          supplierData,
          supplier => supplier.addresses?.physical?.city || ''
        ).filter(loc => loc.name),
        businessTypes: SupplierScoringService.calculateFacetCounts(
          supplierData,
          supplier => supplier.businessType || ''
        ).filter(type => type.name),
        ratings: SupplierScoringService.calculateRatingDistribution(supplierData)
      };
    } catch (error) {
      console.error('Error getting search facets:', error);
      return { categories: [], locations: [], businessTypes: [], ratings: [] };
    }
  }

  /**
   * Get company name suggestions
   */
  private static getCompanySuggestions(suppliers: Supplier[], query?: string): string[] {
    let companies = suppliers
      .map(s => s.companyName)
      .filter((name): name is string => !!name);
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      companies = companies
        .filter(name => name.toLowerCase().includes(lowerQuery))
        .sort((a, b) => {
          const aIndex = a.toLowerCase().indexOf(lowerQuery);
          const bIndex = b.toLowerCase().indexOf(lowerQuery);
          return aIndex - bIndex;
        });
    }
    
    return companies.slice(0, 10);
  }

  /**
   * Get category suggestions
   */
  private static getCategorySuggestions(suppliers: Supplier[], category?: string): string[] {
    const allCategories = suppliers
      .flatMap(s => s.categories || [])
      .reduce((acc, cat) => {
        acc.set(cat, (acc.get(cat) || 0) + 1);
        return acc;
      }, new Map<string, number>());
    
    let categories = Array.from(allCategories.entries())
      .sort(([,a], [,b]) => b - a)
      .map(([cat]) => cat);
    
    if (category) {
      const lowerCategory = category.toLowerCase();
      categories = categories.filter(cat => 
        cat.toLowerCase().includes(lowerCategory)
      );
    }
    
    return categories.slice(0, 10);
  }

  /**
   * Get location suggestions
   */
  private static getLocationSuggestions(suppliers: Supplier[], location?: string): string[] {
    const locations = suppliers
      .map(s => s.addresses?.physical?.city)
      .filter((city): city is string => !!city)
      .reduce((acc, city) => {
        acc.set(city, (acc.get(city) || 0) + 1);
        return acc;
      }, new Map<string, number>());
    
    let locationList = Array.from(locations.entries())
      .sort(([,a], [,b]) => b - a)
      .map(([city]) => city);
    
    if (location) {
      const lowerLocation = location.toLowerCase();
      locationList = locationList.filter(city => 
        city.toLowerCase().includes(lowerLocation)
      );
    }
    
    return locationList.slice(0, 10);
  }
}