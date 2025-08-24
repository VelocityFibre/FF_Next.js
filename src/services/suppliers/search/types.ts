/**
 * Supplier Search Types and Interfaces
 */

import { SupplierStatus, Supplier } from '@/types/supplier.types';

export interface SupplierSearchFilters {
  searchTerm?: string;
  status?: SupplierStatus | SupplierStatus[];
  categories?: string[];
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
  category?: string;
  sortByPerformance?: boolean;
  limit?: number;
}

export interface RFQSearchCriteria {
  categories: string[];
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
  category?: string;
  location?: string;
  userHistory?: string[];
}

export interface SearchFacets {
  categories: Array<{ name: string; count: number }>;
  locations: Array<{ name: string; count: number }>;
  businessTypes: Array<{ name: string; count: number }>;
  ratings: Array<{ range: string; count: number }>;
}