/**
 * Supplier Search Types and Interfaces
 */

import { SupplierStatus, Supplier } from '@/types/supplier/base.types';
import { ProductCategory } from '@/types/supplier/common.types';

export interface SupplierSearchFilters {
  searchTerm?: string;
  status?: SupplierStatus | SupplierStatus[];
  categories?: ProductCategory[];
  isPreferred?: boolean;
  minRating?: number;
  maxRating?: number;
  location?: string;
  businessType?: string;
  hasDocuments?: boolean;
  isCompliant?: boolean;
  limit?: number;
  sortBy?: 'name' | 'rating' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CategorySearchOptions {
  includeInactive?: boolean;
  sortByRating?: boolean;
  limit?: number;
}

export interface PreferredSupplierOptions {
  category?: ProductCategory;
  sortByPerformance?: boolean;
  limit?: number;
}

export interface RFQSearchCriteria {
  categories: ProductCategory[];
  location?: string;
  minRating?: number;
  maxDistance?: number;
  excludeSuppliers?: string[];
  requiredCertifications?: string[];
}

export interface SupplierWithMatchScore extends Supplier {
  matchScore: number;
}

export interface SearchSuggestionContext {
  query?: string;
  category?: ProductCategory;
  location?: string;
  userHistory?: string[];
}

export interface SearchFacets {
  categories: Array<{ name: string; count: number }>;
  locations: Array<{ name: string; count: number }>;
  businessTypes: Array<{ name: string; count: number }>;
  ratings: Array<{ range: string; count: number }>;
}