/**
 * BOQ Data Processing Utilities
 * Helper functions for searching, sorting, and filtering BOQ items
 */

import { BOQItem } from '@/types/procurement/boq.types';
import { SortDirection } from './types';

/**
 * Extract search keywords from BOQ item
 */
export function extractBOQItemKeywords(item: BOQItem): string[] {
  const keywords = new Set<string>();
  
  // Add description words
  if (item.description) {
    item.description.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2)
      .forEach(word => keywords.add(word));
  }
  
  // Add item code
  if (item.itemCode) {
    keywords.add(item.itemCode.toLowerCase());
  }
  
  // Add category and subcategory
  if (item.category) {
    keywords.add(item.category.toLowerCase());
  }
  
  if (item.subcategory) {
    keywords.add(item.subcategory.toLowerCase());
  }
  
  // Add catalog information
  if (item.catalogItemCode) {
    keywords.add(item.catalogItemCode.toLowerCase());
  }
  
  return Array.from(keywords);
}

/**
 * Filter BOQ items based on search criteria
 */
export function filterBOQItems(items: BOQItem[], searchTerm: string): BOQItem[] {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return items;
  }

  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return items.filter(item => {
    const keywords = extractBOQItemKeywords(item);
    return keywords.some(keyword => keyword.includes(lowerSearchTerm)) ||
           item.description.toLowerCase().includes(lowerSearchTerm) ||
           (item.itemCode && item.itemCode.toLowerCase().includes(lowerSearchTerm)) ||
           (item.catalogItemName && item.catalogItemName.toLowerCase().includes(lowerSearchTerm));
  });
}

/**
 * Sort BOQ items by specified field
 */
export function sortBOQItems(
  items: BOQItem[], 
  sortBy: keyof BOQItem, 
  direction: SortDirection = 'asc'
): BOQItem[] {
  return [...items].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return direction === 'asc' ? 1 : -1;
    if (bVal == null) return direction === 'asc' ? -1 : 1;
    
    // Compare values
    let comparison = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    } else if (aVal instanceof Date && bVal instanceof Date) {
      comparison = aVal.getTime() - bVal.getTime();
    } else {
      comparison = String(aVal).localeCompare(String(bVal));
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
}