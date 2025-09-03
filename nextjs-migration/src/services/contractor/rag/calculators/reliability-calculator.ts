/**
 * Reliability Score Calculator
 * Calculates RAG reliability scores based on consistency and dependability factors
 */

import {
  RAGScoreResult,
  ContractorAssignment,
  ContractorTeam
} from '../types';
import { 
  RELIABILITY_WEIGHTS, 
  SCORING_CONFIG, 
  COMPLIANCE_CONFIG,
  GAP_MESSAGES,
  RECOMMENDATION_MESSAGES 
} from './config/reliability-config';
import {
  applyThresholdScoring,
  applyFallbackScoring,
  calculateFilteredAverage,
  calculateTenureInYears,
  clampScore
} from './utils/scoring-utils';

// Extended interfaces to match calculator requirements
interface ExtendedAssignment extends ContractorAssignment {
  clientFeedback?: number;
  issuesReported?: number;
  issuesResolved?: number;
  startDate?: string;
  endDate?: string;
  expectedEndDate?: string;
}

interface ExtendedTeam extends ContractorTeam {
  members?: {
    id: string;
    joinDate?: string;
  }[];
}

interface ExtendedReliabilityBreakdown {
  projectHistory: number;
  teamStability: number;
  certificationStatus: number;
  complianceRecord: number;
  communicationRating: number;
}

export class ReliabilityCalculator {
  /**
   * Calculate reliability score based on consistency metrics
   */
  static calculateScore(
    assignments: ExtendedAssignment[],
    teams: ExtendedTeam[]
  ): RAGScoreResult<ExtendedReliabilityBreakdown> {
    
    if (assignments.length === 0) {
      return this.getDefaultScoreForNewContractor();
    }

    const breakdown: ExtendedReliabilityBreakdown = {
      projectHistory: this.calculateProjectHistoryScore(assignments),
      teamStability: this.calculateTeamStabilityScore(teams),
      certificationStatus: this.calculateCertificationScore(),
      complianceRecord: this.calculateComplianceScore(assignments),
      communicationRating: this.calculateCommunicationScore(assignments)
    };

    const score = this.calculateWeightedScore(breakdown);
    return { score: Math.round(score), breakdown };
  }

  /**
   * Get default score for new contractors
   */
  private static getDefaultScoreForNewContractor(): RAGScoreResult<ExtendedReliabilityBreakdown> {
    const breakdown: ExtendedReliabilityBreakdown = {
      projectHistory: SCORING_CONFIG.DEFAULT_SCORE,
      teamStability: SCORING_CONFIG.DEFAULT_SCORE,
      certificationStatus: SCORING_CONFIG.DEFAULT_SCORE,
      complianceRecord: SCORING_CONFIG.DEFAULT_SCORE,
      communicationRating: SCORING_CONFIG.DEFAULT_SCORE
    };
    
    return { score: SCORING_CONFIG.DEFAULT_SCORE, breakdown };
  }

  /**
   * Calculate project history score based on past performance
   */
  private static calculateProjectHistoryScore(assignments: ExtendedAssignment[]): number {
    if (assignments.length === 0) return SCORING_CONFIG.DEFAULT_SCORE;

    const completedCount = assignments.filter(a => a.status === 'completed').length;
    const successRate = completedCount / assignments.length;
    
    // Apply success rate scoring
    let score = applyThresholdScoring(successRate, SCORING_CONFIG.SUCCESS_RATE_BONUSES as any, SCORING_CONFIG.DEFAULT_SCORE);
    
    // Add performance quality scoring
    const avgPerformance = calculateFilteredAverage(
      assignments, 
      a => a.performanceRating
    );
    
    if (avgPerformance > 0) {
      score += applyThresholdScoring(avgPerformance, SCORING_CONFIG.PERFORMANCE_BONUSES as any, 0);
    }

    return clampScore(score);
  }

  /**
   * Calculate communication score based on client feedback
   */
  private static calculateCommunicationScore(assignments: ExtendedAssignment[]): number {
    const avgFeedback = calculateFilteredAverage(assignments, a => a.clientFeedback);
    
    return avgFeedback > 0 
      ? applyFallbackScoring(avgFeedback, SCORING_CONFIG.FEEDBACK_SCORES as any)
      : SCORING_CONFIG.DEFAULT_SCORE;
  }

  /**
   * Calculate team stability score
   */
  private static calculateTeamStabilityScore(teams: ExtendedTeam[]): number {
    if (teams.length === 0) return SCORING_CONFIG.DEFAULT_SCORE;

    const memberTenures = teams.flatMap(team => 
      (team.members || []).filter(member => member.joinDate)
        .map(member => calculateTenureInYears(member.joinDate!))
    );

    if (memberTenures.length === 0) return SCORING_CONFIG.DEFAULT_SCORE;

    const avgTenure = memberTenures.reduce((sum, tenure) => sum + tenure, 0) / memberTenures.length;
    
    return clampScore(
      applyThresholdScoring(avgTenure, SCORING_CONFIG.TENURE_BONUSES as any, SCORING_CONFIG.DEFAULT_SCORE)
    );
  }

  /**
   * Calculate certification status score
   */
  private static calculateCertificationScore(): number {
    // Default implementation - would typically check certification database
    return COMPLIANCE_CONFIG.DEFAULT_SCORE; // Neutral score until certification system is integrated
  }

  /**
   * Calculate compliance record score
   */
  private static calculateComplianceScore(assignments: ExtendedAssignment[]): number {
    const issueAssignments = assignments.filter(a => 
      a.issuesReported !== undefined && (a.issuesReported || 0) > 0
    );

    if (issueAssignments.length === 0) {
      return COMPLIANCE_CONFIG.DEFAULT_SCORE + COMPLIANCE_CONFIG.NO_ISSUES_BONUS;
    }

    const avgIssues = calculateFilteredAverage(issueAssignments, a => a.issuesReported);
    const penalty = applyThresholdScoring(avgIssues, COMPLIANCE_CONFIG.ISSUE_PENALTIES as any, 0);
    
    return clampScore(COMPLIANCE_CONFIG.DEFAULT_SCORE + penalty);
  }

  /**
   * Calculate weighted reliability score
   */
  private static calculateWeightedScore(breakdown: ExtendedReliabilityBreakdown): number {
    return (
      breakdown.projectHistory * RELIABILITY_WEIGHTS.PROJECT_HISTORY +
      breakdown.teamStability * RELIABILITY_WEIGHTS.TEAM_STABILITY +
      breakdown.certificationStatus * RELIABILITY_WEIGHTS.CERTIFICATION_STATUS +
      breakdown.complianceRecord * RELIABILITY_WEIGHTS.COMPLIANCE_RECORD +
      breakdown.communicationRating * RELIABILITY_WEIGHTS.COMMUNICATION_RATING
    );
  }

  /**
   * Get reliability gaps analysis
   */
  static getReliabilityGaps(breakdown: ExtendedReliabilityBreakdown): string[] {
    const gaps: string[] = [];
    const { THRESHOLD } = SCORING_CONFIG;

    const checks = [
      { value: breakdown.projectHistory, message: GAP_MESSAGES.PROJECT_HISTORY },
      { value: breakdown.teamStability, message: GAP_MESSAGES.TEAM_STABILITY },
      { value: breakdown.certificationStatus, message: GAP_MESSAGES.CERTIFICATION_STATUS },
      { value: breakdown.complianceRecord, message: GAP_MESSAGES.COMPLIANCE_RECORD },
      { value: breakdown.communicationRating, message: GAP_MESSAGES.COMMUNICATION_RATING }
    ];

    checks.forEach(({ value, message }) => {
      if (value < THRESHOLD) gaps.push(message);
    });

    return gaps.length > 0 ? gaps : [GAP_MESSAGES.NO_GAPS];
  }

  /**
   * Get reliability recommendations
   */
  static getReliabilityRecommendations(breakdown: ExtendedReliabilityBreakdown): string[] {
    const recommendations: string[] = [];
    const threshold = 80;

    const checks = [
      { value: breakdown.projectHistory, message: RECOMMENDATION_MESSAGES.PROJECT_HISTORY },
      { value: breakdown.teamStability, message: RECOMMENDATION_MESSAGES.TEAM_STABILITY },
      { value: breakdown.certificationStatus, message: RECOMMENDATION_MESSAGES.CERTIFICATION_STATUS },
      { value: breakdown.complianceRecord, message: RECOMMENDATION_MESSAGES.COMPLIANCE_RECORD },
      { value: breakdown.communicationRating, message: RECOMMENDATION_MESSAGES.COMMUNICATION_RATING }
    ];

    checks.forEach(({ value, message }) => {
      if (value < threshold) recommendations.push(message);
    });

    return recommendations;
  }
}
