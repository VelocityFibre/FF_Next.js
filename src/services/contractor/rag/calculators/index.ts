/**
 * RAG Score Calculators - Barrel export
 */

export { PerformanceCalculator } from './performance-calculator';
export { FinancialCalculator } from './financial-calculator';
export { ReliabilityCalculator } from './reliability-calculator';
export { CapabilitiesCalculator } from './capabilities-calculator';

// Re-export types for convenience
export type {
  RAGPerformanceBreakdown,
  RAGFinancialBreakdown,
  RAGReliabilityBreakdown,
  RAGCapabilitiesBreakdown,
  RAGScoreResult,
  ContractorAssignment,
  ContractorTeam,
  ContractorData
} from '../types';

import { PerformanceCalculator } from './performance-calculator';
import { FinancialCalculator } from './financial-calculator';
import { ReliabilityCalculator } from './reliability-calculator';
import { CapabilitiesCalculator } from './capabilities-calculator';
import {
  RAGScore,
  RAGAssessmentResult,
  ContractorData,
  ContractorAssignment,
  ContractorTeam,
  DEFAULT_RAG_WEIGHTS
} from '../types';

/**
 * Unified RAG Score Calculator
 * Combines all individual calculators for comprehensive scoring
 */
export class RAGScoreCalculator {
  /**
   * Calculate comprehensive RAG score for a contractor
   */
  static calculateComprehensiveScore(
    contractor: ContractorData,
    assignments: ContractorAssignment[] = [],
    teams: ContractorTeam[] = []
  ): RAGAssessmentResult {
    // Calculate individual scores
    const performance = PerformanceCalculator.calculateScore(assignments);
    const financial = FinancialCalculator.calculateScore(contractor);
    const reliability = ReliabilityCalculator.calculateScore(assignments, teams);
    const capabilities = CapabilitiesCalculator.calculateScore(contractor, teams);

    // Calculate weighted overall score
    const overallScore = (
      performance.score * DEFAULT_RAG_WEIGHTS.performance +
      financial.score * DEFAULT_RAG_WEIGHTS.financial +
      reliability.score * DEFAULT_RAG_WEIGHTS.reliability +
      capabilities.score * DEFAULT_RAG_WEIGHTS.capabilities
    );

    // Determine RAG status
    const ragStatus = this.determineRAGStatus(Math.round(overallScore));

    return {
      contractorId: contractor.id,
      assessmentDate: new Date(),
      overallScore: Math.round(overallScore),
      ragStatus,
      breakdown: {
        performance: performance.breakdown,
        financial: financial.breakdown,
        reliability: reliability.breakdown,
        capabilities: capabilities.breakdown
      },
      scores: {
        performance: performance.score,
        financial: financial.score,
        reliability: reliability.score,
        capabilities: capabilities.score
      },
      recommendations: this.generateRecommendations({
        performance: performance.breakdown,
        financial: financial.breakdown,
        reliability: reliability.breakdown,
        capabilities: capabilities.breakdown
      }),
      riskFactors: this.identifyRiskFactors({
        performance: performance.breakdown,
        financial: financial.breakdown,
        reliability: reliability.breakdown,
        capabilities: capabilities.breakdown
      }, Math.round(overallScore))
    };
  }

  /**
   * Determine RAG status based on score
   */
  private static determineRAGStatus(score: number): 'red' | 'amber' | 'green' {
    if (score >= 75) return 'green';
    if (score >= 50) return 'amber';
    return 'red';
  }

  /**
   * Generate comprehensive recommendations
   */
  private static generateRecommendations(breakdown: any): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (breakdown.performance.completionRate < 80) {
      recommendations.push('Improve project completion rates through better planning');
    }

    // Financial recommendations
    if (breakdown.financial.cashFlow < 70) {
      recommendations.push('Focus on cash flow management and collection processes');
    }

    // Reliability recommendations
    if (breakdown.reliability.consistency < 70) {
      recommendations.push('Work on maintaining consistent quality standards');
    }

    // Capabilities recommendations
    if (breakdown.capabilities.technicalSkills < 75) {
      recommendations.push('Invest in technical training and certifications');
    }

    return recommendations;
  }

  /**
   * Identify risk factors
   */
  private static identifyRiskFactors(breakdown: any, overallScore: number): string[] {
    const risks: string[] = [];

    if (overallScore < 50) {
      risks.push('Overall contractor performance is below acceptable standards');
    }

    if (breakdown.financial.creditScore < 60) {
      risks.push('Credit rating indicates potential financial instability');
    }

    if (breakdown.reliability.consistency < 60) {
      risks.push('Inconsistent performance quality poses delivery risks');
    }

    if (breakdown.capabilities.teamCapacity < 60) {
      risks.push('Limited team capacity may affect project delivery');
    }

    return risks;
  }
}