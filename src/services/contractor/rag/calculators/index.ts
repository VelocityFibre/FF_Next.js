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
  RAGAssessmentResult,
  ContractorAssignment,
  ContractorTeam,
  ContractorData
} from '../types';

import { PerformanceCalculator } from './performance-calculator';
import { FinancialCalculator } from './financial-calculator';
import { ReliabilityCalculator } from './reliability-calculator';
import { CapabilitiesCalculator } from './capabilities-calculator';
import {
  RAGAssessmentResult,
  ContractorData,
  ContractorAssignment,
  ContractorTeam,
  DEFAULT_RAG_WEIGHTS,
  RAGPerformanceBreakdown,
  RAGFinancialBreakdown,
  RAGReliabilityBreakdown,
  RAGCapabilitiesBreakdown
} from '../types';

// Extended interfaces for calculators
interface ExtendedContractorAssignment extends ContractorAssignment {
  startDate?: string;
  endDate?: string;
  expectedEndDate?: string;
  clientFeedback?: {
    rating?: number;
  };
  complexityLevel?: 'low' | 'medium' | 'high' | 'critical';
}

interface ExtendedContractor extends ContractorData {
  equipment?: {
    age: number;
    condition: string;
    lastMaintenance?: string;
  }[];
  serviceAreas?: string[];
  recentGrowth?: {
    staffIncrease?: number;
    revenueGrowth?: number;
  };
  certifications?: string[];
  specializations?: string[];
  yearsInBusiness?: number;
}

interface ExtendedMember {
  id: string;
  teamId: string;
  contractorId: string;
  firstName: string;
  lastName: string;
  idNumber?: string;
  email?: string;
  phone?: string;
  joinDate?: string;
  certifications?: string[];
  experience?: number;
  status: 'active' | 'inactive';
}

interface ExtendedTeam extends ContractorTeam {
  members?: ExtendedMember[];
  currentWorkload?: number;
}

/**
 * Unified RAG Score Calculator
 * Combines all individual calculators for comprehensive scoring
 */
export class RAGScoreCalculator {
  /**
   * Calculate comprehensive RAG score for a contractor
   */
  static calculateComprehensiveScore(
    contractor: ExtendedContractor,
    assignments: ExtendedContractorAssignment[] = [],
    teams: ExtendedTeam[] = []
  ): RAGAssessmentResult {
    // Calculate individual scores
    const performance = PerformanceCalculator.calculateScore(assignments);
    const financial = FinancialCalculator.calculateScore(contractor);
    const reliability = ReliabilityCalculator.calculateScore(assignments as any, teams);
    const capabilities = CapabilitiesCalculator.calculateScore(contractor as any, teams as any);

    // Calculate weighted overall score
    const overallScore = (
      performance.score * DEFAULT_RAG_WEIGHTS.overall.performance +
      financial.score * DEFAULT_RAG_WEIGHTS.overall.financial +
      reliability.score * DEFAULT_RAG_WEIGHTS.overall.reliability +
      capabilities.score * DEFAULT_RAG_WEIGHTS.overall.capabilities
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
  private static generateRecommendations(breakdown: {
    performance: RAGPerformanceBreakdown;
    financial: RAGFinancialBreakdown;
    reliability: RAGReliabilityBreakdown;
    capabilities: RAGCapabilitiesBreakdown;
  }): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (breakdown.performance.completionRate < 80) {
      recommendations.push('Improve project completion rates through better planning');
    }
    if (breakdown.performance.qualityScore < 75) {
      recommendations.push('Focus on improving work quality and standards');
    }

    // Financial recommendations
    if (breakdown.financial.paymentHistory < 70) {
      recommendations.push('Improve payment history and financial discipline');
    }
    if (breakdown.financial.financialStability < 70) {
      recommendations.push('Build financial stability through consistent growth');
    }

    // Reliability recommendations
    if (breakdown.reliability.projectHistory < 70) {
      recommendations.push('Work on maintaining consistent project delivery');
    }
    if (breakdown.reliability.communicationRating < 70) {
      recommendations.push('Enhance client communication protocols');
    }

    // Capabilities recommendations
    if (breakdown.capabilities.technicalSkills < 75) {
      recommendations.push('Invest in technical training and certifications');
    }
    if (breakdown.capabilities.equipmentRating < 70) {
      recommendations.push('Upgrade and maintain equipment to industry standards');
    }

    return recommendations;
  }

  /**
   * Identify risk factors
   */
  private static identifyRiskFactors(breakdown: {
    performance: RAGPerformanceBreakdown;
    financial: RAGFinancialBreakdown;
    reliability: RAGReliabilityBreakdown;
    capabilities: RAGCapabilitiesBreakdown;
  }, overallScore: number): string[] {
    const risks: string[] = [];

    if (overallScore < 50) {
      risks.push('Overall contractor performance is below acceptable standards');
    }

    if (breakdown.financial.creditRating < 60) {
      risks.push('Credit rating indicates potential financial instability');
    }

    if (breakdown.reliability.projectHistory < 60) {
      risks.push('Inconsistent project delivery history poses risks');
    }

    if (breakdown.capabilities.teamExperience < 60) {
      risks.push('Limited team experience may affect project delivery');
    }

    if (breakdown.performance.completionRate < 70) {
      risks.push('Low completion rates indicate delivery reliability concerns');
    }

    return risks;
  }

  /**
   * Calculate overall score from component scores
   */
  static calculateOverallScore(scores: {
    performance: number;
    financial: number;
    reliability: number;
    capabilities: number;
  }): number {
    return Math.round(
      scores.performance * DEFAULT_RAG_WEIGHTS.overall.performance +
      scores.financial * DEFAULT_RAG_WEIGHTS.overall.financial +
      scores.reliability * DEFAULT_RAG_WEIGHTS.overall.reliability +
      scores.capabilities * DEFAULT_RAG_WEIGHTS.overall.capabilities
    );
  }

  /**
   * Determine risk level from overall score
   */
  static determineRiskLevel(overallScore: number): 'low' | 'medium' | 'high' {
    if (overallScore >= 70) return 'low';
    if (overallScore >= 50) return 'medium';
    return 'high';
  }
}