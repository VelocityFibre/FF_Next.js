/**
 * Recommendation Engine
 * Generate improvement recommendations and compliance analysis
 */

import { Supplier } from '@/types/supplier.types';
import { ScorecardScoreCalculator } from './score-calculator';
import type { ComplianceData } from './scorecard-types';

export class ScorecardRecommendationEngine {
  /**
   * Extract compliance information
   */
  static extractCompliance(supplier: Supplier): ComplianceData {
    const compliance = supplier.complianceStatus;
    
    return {
      score: compliance?.complianceScore || 0,
      status: this.determineComplianceStatus(compliance?.complianceScore || 0),
      lastCheck: compliance?.lastComplianceCheck || new Date()
    };
  }

  /**
   * Generate improvement recommendations
   */
  static generateRecommendations(
    supplier: Supplier, 
    overallScore: number, 
    compliance: ComplianceData
  ): string[] {
    const recommendations: string[] = [];

    // Score-based recommendations
    if (overallScore < 60) {
      recommendations.push('Critical improvement needed across all performance areas');
      recommendations.push('Schedule immediate supplier development meeting');
    } else if (overallScore < 80) {
      recommendations.push('Focus on key performance improvement areas');
    }

    // Rating-based recommendations
    const rating = ScorecardScoreCalculator.getSupplierRating(supplier);
    if (rating < 3.5) {
      recommendations.push('Improve service quality and customer satisfaction');
      if (rating < 2.5) {
        recommendations.push('Consider supplier replacement due to poor performance');
      }
    }

    // Compliance recommendations
    if (compliance.score < 80) {
      recommendations.push('Update compliance documentation and certifications');
      if (compliance.score < 60) {
        recommendations.push('Urgent compliance review required - risk of non-compliance');
      }
    }

    // Performance-specific recommendations
    const performance = supplier.performance as any;
    if (performance?.onTimeDelivery < 90) {
      recommendations.push('Improve delivery time consistency');
      if (performance.onTimeDelivery < 70) {
        recommendations.push('Implement delivery performance improvement plan');
      }
    }

    if (performance?.qualityScore < 85) {
      recommendations.push('Enhance quality control processes');
      if (performance.qualityScore < 70) {
        recommendations.push('Conduct quality audit and implement corrective actions');
      }
    }

    // Communication recommendations
    if (!supplier.primaryContact || !supplier.primaryContact.email) {
      recommendations.push('Ensure complete contact information is provided');
    }

    // Preferred status recommendations
    if (!supplier.isPreferred && overallScore > 85) {
      recommendations.push('Consider for preferred supplier status based on excellent performance');
    } else if (supplier.isPreferred && overallScore < 70) {
      recommendations.push('Review preferred supplier status - performance below expectations');
    }

    // Category-specific recommendations
    this.addCategorySpecificRecommendations(supplier, recommendations);

    // Contract and commercial recommendations
    this.addCommercialRecommendations(supplier, overallScore, recommendations);

    // Default recommendation if none identified
    if (recommendations.length === 0) {
      recommendations.push('Maintain current excellent performance standards');
    }

    return recommendations.slice(0, 8); // Limit to top 8 recommendations
  }

  /**
   * Determine compliance status string
   */
  static determineComplianceStatus(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Acceptable';
    if (score >= 40) return 'Needs Improvement';
    return 'Critical';
  }

  /**
   * Add category-specific recommendations
   */
  private static addCategorySpecificRecommendations(supplier: Supplier, recommendations: string[]): void {
    const categories = supplier.categories || [];
    
    if (categories.includes('Technology')) {
      const techPerformance = (supplier.performance as any)?.technologyScore || 0;
      if (techPerformance < 80) {
        recommendations.push('Upgrade technology capabilities and infrastructure');
      }
    }

    if (categories.includes('Manufacturing')) {
      const qualityScore = (supplier.performance as any)?.qualityScore || 0;
      if (qualityScore < 85) {
        recommendations.push('Implement lean manufacturing and quality management systems');
      }
    }

    if (categories.includes('Logistics')) {
      const deliveryScore = (supplier.performance as any)?.onTimeDelivery || 0;
      if (deliveryScore < 90) {
        recommendations.push('Optimize supply chain and logistics processes');
      }
    }
  }

  /**
   * Add commercial recommendations
   */
  private static addCommercialRecommendations(
    supplier: Supplier, 
    overallScore: number, 
    recommendations: string[]
  ): void {
    // Pricing recommendations
    const hasCompetitivePricing = (supplier.performance as any)?.competitivePricing !== false;
    if (!hasCompetitivePricing && overallScore > 75) {
      recommendations.push('Negotiate pricing improvements given strong performance');
    }

    // Contract recommendations
    const contractStatus = supplier.status;
    if (contractStatus === 'pending' && overallScore > 80) {
      recommendations.push('Prioritize contract finalization for high-performing supplier');
    }

    // Risk recommendations
    if (overallScore < 60) {
      recommendations.push('Develop supplier risk mitigation plan');
    }

    // Innovation recommendations
    if (overallScore > 85) {
      recommendations.push('Explore innovation partnership opportunities');
    }
  }

  /**
   * Generate priority action items
   */
  static generatePriorityActions(
    supplier: Supplier,
    overallScore: number,
    compliance: ComplianceData
  ): Array<{ priority: 'high' | 'medium' | 'low'; action: string; timeline: string }> {
    const actions: Array<{ priority: 'high' | 'medium' | 'low'; action: string; timeline: string }> = [];

    // High priority actions
    if (overallScore < 50) {
      actions.push({
        priority: 'high',
        action: 'Immediate supplier review and development plan',
        timeline: '1 week'
      });
    }

    if (compliance.score < 60) {
      actions.push({
        priority: 'high',
        action: 'Compliance audit and corrective action plan',
        timeline: '2 weeks'
      });
    }

    // Medium priority actions
    if (overallScore < 75) {
      actions.push({
        priority: 'medium',
        action: 'Performance improvement initiative',
        timeline: '1 month'
      });
    }

    // Low priority actions
    if (overallScore > 85 && !supplier.isPreferred) {
      actions.push({
        priority: 'low',
        action: 'Evaluate for preferred supplier program',
        timeline: '3 months'
      });
    }

    return actions;
  }
}