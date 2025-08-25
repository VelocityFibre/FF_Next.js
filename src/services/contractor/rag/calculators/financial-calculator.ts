/**
 * Financial Score Calculator
 * Calculates RAG financial scores based on financial health indicators
 */

import {
  RAGFinancialBreakdown,
  RAGScoreResult,
  ContractorData
} from '../types';

export class FinancialCalculator {
  /**
   * Calculate financial score based on financial health indicators
   */
  static calculateScore(contractor: ContractorData): RAGScoreResult<RAGFinancialBreakdown> {
    const breakdown: RAGFinancialBreakdown = {
      paymentHistory: this.calculatePaymentHistoryScore(contractor),
      financialStability: this.calculateFinancialStabilityScore(contractor),
      creditRating: this.calculateCreditRatingScore(contractor),
      insuranceCoverage: this.calculateInsuranceCoverageScore(contractor),
      bondingCapacity: this.calculateBondingCapacityScore(contractor)
    };

    // Calculate weighted average
    const score = this.calculateWeightedScore(breakdown);

    return { score: Math.round(score), breakdown };
  }

  /**
   * Calculate payment history score
   */
  private static calculatePaymentHistoryScore(contractor: ContractorData): number {
    const paymentHistory = contractor.paymentHistory;
    
    if (paymentHistory === undefined || paymentHistory === null) return 70;

    // Assume paymentHistory is a percentage (0-100) or ratio (0-1)
    const score = paymentHistory > 1 ? paymentHistory : paymentHistory * 100;

    if (score >= 95) return 95;
    if (score >= 85) return 85;
    if (score >= 75) return 75;
    if (score >= 65) return 65;
    if (score >= 50) return 45;
    return 25;
  }

  /**
   * Calculate financial stability score based on years in business and project count
   */
  private static calculateFinancialStabilityScore(contractor: ContractorData): number {
    const yearsInBusiness = contractor.yearsInBusiness || 0;
    const totalProjects = contractor.totalProjects || 0;
    
    let stabilityScore = 50; // Base score
    
    // Years in business component (0-25 points)
    if (yearsInBusiness >= 15) stabilityScore += 25;
    else if (yearsInBusiness >= 10) stabilityScore += 20;
    else if (yearsInBusiness >= 5) stabilityScore += 15;
    else if (yearsInBusiness >= 2) stabilityScore += 10;
    else if (yearsInBusiness >= 1) stabilityScore += 5;
    
    // Project experience component (0-25 points)
    if (totalProjects >= 100) stabilityScore += 25;
    else if (totalProjects >= 50) stabilityScore += 20;
    else if (totalProjects >= 25) stabilityScore += 15;
    else if (totalProjects >= 10) stabilityScore += 10;
    else if (totalProjects >= 5) stabilityScore += 5;
    
    return Math.min(stabilityScore, 100);
  }

  /**
   * Calculate credit rating score
   */
  private static calculateCreditRatingScore(contractor: ContractorData): number {
    const creditRating = contractor.creditRating;
    
    if (creditRating === undefined || creditRating === null) return 70;

    // Assume creditRating is already normalized to 0-100 scale
    if (typeof creditRating === 'number') {
      if (creditRating >= 90) return 95;
      if (creditRating >= 80) return 85;
      if (creditRating >= 70) return 75;
      if (creditRating >= 60) return 65;
      if (creditRating >= 50) return 45;
      return 25;
    }

    return 70;
  }

  /**
   * Calculate insurance coverage score
   */
  private static calculateInsuranceCoverageScore(contractor: ContractorData): number {
    const insuranceVerified = contractor.insuranceVerified;
    
    if (insuranceVerified === undefined || insuranceVerified === null) return 70;
    
    // Simple boolean check - could be enhanced with coverage amounts
    return insuranceVerified ? 95 : 25;
  }

  /**
   * Calculate bonding capacity score
   */
  private static calculateBondingCapacityScore(contractor: ContractorData): number {
    const bondingCapacity = contractor.bondingCapacity;
    
    if (bondingCapacity === undefined || bondingCapacity === null) return 70;
    
    // Simple boolean check - could be enhanced with bonding amounts
    return bondingCapacity ? 95 : 45;
  }

  /**
   * Calculate weighted financial score
   */
  private static calculateWeightedScore(breakdown: RAGFinancialBreakdown): number {
    // Using weights from DEFAULT_RAG_WEIGHTS
    return (
      breakdown.paymentHistory * 0.30 +
      breakdown.financialStability * 0.25 +
      breakdown.creditRating * 0.20 +
      breakdown.insuranceCoverage * 0.15 +
      breakdown.bondingCapacity * 0.10
    );
  }

  /**
   * Get financial health status
   */
  static getFinancialHealthStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (score >= 85) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 65) return 'fair';
    if (score >= 45) return 'poor';
    return 'critical';
  }

  /**
   * Get financial recommendations
   */
  static getFinancialRecommendations(breakdown: RAGFinancialBreakdown): string[] {
    const recommendations: string[] = [];

    if (breakdown.paymentHistory < 70) {
      recommendations.push('Improve payment history by ensuring timely payments to suppliers and creditors');
    }

    if (breakdown.financialStability < 70) {
      recommendations.push('Build financial stability through consistent project delivery and business growth');
    }

    if (breakdown.creditRating < 70) {
      recommendations.push('Work on improving credit rating through better financial management');
    }

    if (breakdown.insuranceCoverage < 70) {
      recommendations.push('Ensure comprehensive insurance coverage is maintained and verified');
    }

    if (breakdown.bondingCapacity < 70) {
      recommendations.push('Establish or improve bonding capacity to qualify for larger projects');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain current excellent financial performance levels');
    }

    return recommendations;
  }
}
