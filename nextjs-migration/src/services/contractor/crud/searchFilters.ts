/**
 * Search and Filter Utilities for Contractors
 * Handles filtering logic and search operations
 */

import { 
  QueryConstraint,
  where,
  orderBy
} from 'firebase/firestore';
import { 
  Contractor, 
  ContractorFilter
} from '@/types/contractor.types';

/**
 * Build Firebase query constraints from filter
 */
export function buildQueryConstraints(filter?: ContractorFilter): QueryConstraint[] {
  const constraints: QueryConstraint[] = [orderBy('companyName', 'asc')];
  
  if (!filter) return constraints;
  
  // Status filter
  if (filter.status?.length) {
    constraints.push(where('status', 'in', filter.status));
  }
  
  // Compliance status filter
  if (filter.complianceStatus?.length) {
    constraints.push(where('complianceStatus', 'in', filter.complianceStatus));
  }
  
  // RAG overall filter
  if (filter.ragOverall?.length) {
    constraints.push(where('ragOverall', 'in', filter.ragOverall));
  }
  
  // Business type filter
  if (filter.businessType?.length) {
    constraints.push(where('businessType', 'in', filter.businessType));
  }
  
  // Province filter
  if (filter.province?.length) {
    constraints.push(where('province', 'in', filter.province));
  }
  
  // Active projects filter (Firebase query)
  if (filter.hasActiveProjects !== undefined) {
    if (filter.hasActiveProjects) {
      constraints.push(where('activeProjects', '>', 0));
    } else {
      constraints.push(where('activeProjects', '==', 0));
    }
  }
  
  // Documents expiring filter (Firebase query)
  if (filter.documentsExpiring !== undefined && filter.documentsExpiring) {
    constraints.push(where('documentsExpiring', '>', 0));
  }
  
  return constraints;
}

/**
 * Apply client-side search filter
 */
export function applySearchFilter(
  contractors: Contractor[], 
  searchTerm?: string
): Contractor[] {
  if (!searchTerm) return contractors;
  
  const term = searchTerm.toLowerCase();
  return contractors.filter(contractor => 
    contractor.companyName.toLowerCase().includes(term) ||
    contractor.contactPerson.toLowerCase().includes(term) ||
    contractor.email.toLowerCase().includes(term) ||
    contractor.phone?.includes(term) ||
    contractor.registrationNumber.toLowerCase().includes(term) ||
    contractor.industryCategory?.toLowerCase().includes(term)
  );
}

/**
 * Apply tag filter
 */
export function applyTagFilter(
  contractors: Contractor[], 
  tags?: string[]
): Contractor[] {
  if (!tags?.length) return contractors;
  
  return contractors.filter(contractor =>
    contractor.tags?.some(tag => tags.includes(tag))
  );
}

/**
 * Apply all client-side filters
 */
export function applyClientSideFilters(
  contractors: Contractor[], 
  filter?: ContractorFilter
): Contractor[] {
  let filtered = contractors;
  
  // Apply search filter
  filtered = applySearchFilter(filtered, filter?.searchTerm);
  
  // Apply tag filter
  filtered = applyTagFilter(filtered, filter?.tags);
  
  return filtered;
}

/**
 * Sort contractors by specified field
 */
export function sortContractors(
  contractors: Contractor[],
  sortBy: keyof Contractor = 'companyName',
  sortOrder: 'asc' | 'desc' = 'asc'
): Contractor[] {
  return [...contractors].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (aVal === bVal) return 0;
    
    let result = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      result = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      result = aVal - bVal;
    } else if (aVal instanceof Date && bVal instanceof Date) {
      result = aVal.getTime() - bVal.getTime();
    } else {
      result = String(aVal).localeCompare(String(bVal));
    }
    
    return sortOrder === 'desc' ? -result : result;
  });
}

/**
 * Filter contractors by performance metrics
 */
export function filterByPerformance(
  contractors: Contractor[],
  minScore?: number,
  maxScore?: number
): Contractor[] {
  if (minScore === undefined && maxScore === undefined) return contractors;
  
  return contractors.filter(contractor => {
    const score = contractor.performanceScore || 0;
    if (minScore !== undefined && score < minScore) return false;
    if (maxScore !== undefined && score > maxScore) return false;
    return true;
  });
}

/**
 * Filter contractors by project statistics
 */
export function filterByProjectStats(
  contractors: Contractor[],
  minProjects?: number,
  maxProjects?: number
): Contractor[] {
  if (minProjects === undefined && maxProjects === undefined) return contractors;
  
  return contractors.filter(contractor => {
    const totalProjects = contractor.totalProjects || 0;
    if (minProjects !== undefined && totalProjects < minProjects) return false;
    if (maxProjects !== undefined && totalProjects > maxProjects) return false;
    return true;
  });
}