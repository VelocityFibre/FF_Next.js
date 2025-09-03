/**
 * Supplier Search Scoring and Matching
 * Calculate match scores and rankings for suppliers
 */

import { Supplier } from '@/types/supplier/base.types';
import { SupplierWithMatchScore, RFQSearchCriteria } from './types';

export class SupplierScoringService {
  /**
   * Get supplier rating value (handles both number and object types)
   */
  private static getSupplierRating(supplier: Supplier): number {
    if (typeof supplier.rating === 'number') {
      return supplier.rating;
    } else if (supplier.rating && typeof supplier.rating === 'object') {
      return supplier.rating.overall || 0;
    }
    return 0;
  }
  /**
   * Score suppliers for RFQ matching
   */
  static scoreForRFQ(suppliers: Supplier[], criteria: RFQSearchCriteria): SupplierWithMatchScore[] {
    return suppliers.map(supplier => ({
      ...supplier,
      matchScore: this.calculateRFQMatchScore(supplier, criteria)
    })).sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Calculate RFQ match score for a supplier
   */
  private static calculateRFQMatchScore(supplier: Supplier, criteria: RFQSearchCriteria): number {
    let score = 0;
    
    // Category match score (40% weight)
    const categoryMatches = criteria.categories.filter(cat => 
      supplier.categories?.includes(cat)
    ).length;
    const categoryScore = (categoryMatches / criteria.categories.length) * 0.4;
    score += categoryScore;
    
    // Rating score (30% weight)
    const ratingScore = (this.getSupplierRating(supplier) / 5) * 0.3;
    score += ratingScore;
    
    // Performance score (20% weight)
    const performanceScore = ((supplier.performance?.overallScore || 0) / 100) * 0.2;
    score += performanceScore;
    
    // Certification match score (10% weight)
    if (criteria.requiredCertifications && criteria.requiredCertifications.length > 0) {
      const supplierCerts = supplier.certifications?.map(cert => cert.type) || [];
      const certMatches = criteria.requiredCertifications.filter(reqCert =>
        supplierCerts.includes(reqCert)
      ).length;
      const certScore = (certMatches / criteria.requiredCertifications.length) * 0.1;
      score += certScore;
    } else {
      score += 0.1; // Full score if no certifications required
    }
    
    // Preferred supplier bonus
    if (supplier.isPreferred) {
      score *= 1.1; // 10% bonus
    }
    
    // Location proximity bonus (simplified)
    if (criteria.location && this.matchesLocation(supplier, criteria.location)) {
      score *= 1.05; // 5% bonus
    }
    
    return Math.min(score, 1); // Cap at 1.0
  }

  /**
   * Calculate facet counts for search results
   */
  static calculateFacetCounts<T>(items: T[], getValue: (item: T) => string | string[]): Array<{ name: string; count: number }> {
    const counts = new Map<string, number>();
    
    items.forEach(item => {
      const values = getValue(item);
      const valueArray = Array.isArray(values) ? values : [values];
      
      valueArray.forEach(value => {
        if (value && typeof value === 'string') {
          counts.set(value, (counts.get(value) || 0) + 1);
        }
      });
    });
    
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate rating distribution
   */
  static calculateRatingDistribution(suppliers: Supplier[]): Array<{ range: string; count: number }> {
    const ranges = [
      { range: '4.5-5.0', min: 4.5, max: 5.0 },
      { range: '4.0-4.4', min: 4.0, max: 4.4 },
      { range: '3.5-3.9', min: 3.5, max: 3.9 },
      { range: '3.0-3.4', min: 3.0, max: 3.4 },
      { range: '2.5-2.9', min: 2.5, max: 2.9 },
      { range: '0-2.4', min: 0, max: 2.4 }
    ];
    
    return ranges.map(range => ({
      range: range.range,
      count: suppliers.filter(supplier => {
        const rating = this.getSupplierRating(supplier) || 0;
        return rating >= range.min && rating <= range.max;
      }).length
    })).filter(range => range.count > 0);
  }


  /**
   * Check if supplier matches location
   */
  private static matchesLocation(supplier: Supplier, location: string): boolean {
    const address = supplier.addresses?.physical;
    if (!address) return false;
    
    const locationFields = [
      address.city,
      address.state,
      address.country
    ].map(field => field?.toLowerCase() || '');
    
    const searchTerm = location.toLowerCase();
    return locationFields.some(field => field.includes(searchTerm));
  }
}