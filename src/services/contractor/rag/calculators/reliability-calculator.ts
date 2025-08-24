/**
 * Reliability Score Calculator
 * Calculates RAG reliability scores based on consistency and dependability factors
 */

import {
  RAGReliabilityBreakdown,
  RAGScoreResult,
  ContractorAssignment,
  ContractorTeam
} from '../types';

export class ReliabilityCalculator {
  /**
   * Calculate reliability score based on consistency metrics
   */
  static calculateScore(
    assignments: ContractorAssignment[],
    teams: ContractorTeam[]
  ): RAGScoreResult<RAGReliabilityBreakdown> {
    
    if (assignments.length === 0) {
      // New contractor - neutral score
      const breakdown: RAGReliabilityBreakdown = {
        consistency: 70,
        communication: 70,
        issueResolution: 70,
        teamStability: 70,
        commitmentAdherence: 70
      };
      
      return { score: 70, breakdown };
    }

    // Calculate individual reliability metrics
    const consistency = this.calculateConsistencyScore(assignments);
    const communication = this.calculateCommunicationScore(assignments);
    const issueResolution = this.calculateIssueResolutionScore(assignments);
    const teamStability = this.calculateTeamStabilityScore(teams);
    const commitmentAdherence = this.calculateCommitmentAdherenceScore(assignments);

    const breakdown: RAGReliabilityBreakdown = {
      consistency,
      communication,
      issueResolution,
      teamStability,
      commitmentAdherence
    };

    // Calculate weighted average
    const score = this.calculateWeightedScore(breakdown);

    return { score: Math.round(score), breakdown };
  }

  /**
   * Calculate consistency score based on performance variation
   */
  private static calculateConsistencyScore(assignments: ContractorAssignment[]): number {
    const qualityScores = assignments
      .filter(a => a.qualityScore && a.status === 'completed')
      .map(a => a.qualityScore!);

    if (qualityScores.length < 2) return 70;

    // Calculate standard deviation of quality scores
    const mean = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
    const variance = qualityScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / qualityScores.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    if (standardDeviation <= 5) return 95;
    if (standardDeviation <= 10) return 85;
    if (standardDeviation <= 15) return 75;
    if (standardDeviation <= 20) return 65;
    if (standardDeviation <= 25) return 45;
    return 25;
  }

  /**
   * Calculate communication score
   */
  private static calculateCommunicationScore(assignments: ContractorAssignment[]): number {
    const communicationScores = assignments
      .filter(a => a.clientFeedback?.communicationRating)
      .map(a => a.clientFeedback!.communicationRating!);

    if (communicationScores.length === 0) return 70;

    const avgCommunication = communicationScores.reduce((sum, rating) => sum + rating, 0) / communicationScores.length;
    
    // Convert 5-star rating to 100-point scale
    return (avgCommunication / 5) * 100;
  }

  /**
   * Calculate issue resolution score
   */
  private static calculateIssueResolutionScore(assignments: ContractorAssignment[]): number {
    const issueData = assignments
      .filter(a => a.issuesReported !== undefined && a.issuesResolved !== undefined)
      .map(a => ({
        reported: a.issuesReported!,
        resolved: a.issuesResolved!
      }));

    if (issueData.length === 0) return 70;

    const totalReported = issueData.reduce((sum, data) => sum + data.reported, 0);
    const totalResolved = issueData.reduce((sum, data) => sum + data.resolved, 0);

    if (totalReported === 0) return 95; // No issues is excellent

    const resolutionRate = (totalResolved / totalReported) * 100;

    if (resolutionRate >= 95) return 95;
    if (resolutionRate >= 90) return 85;
    if (resolutionRate >= 80) return 75;
    if (resolutionRate >= 70) return 65;
    if (resolutionRate >= 50) return 45;
    return 25;
  }

  /**
   * Calculate team stability score
   */
  private static calculateTeamStabilityScore(teams: ContractorTeam[]): number {
    if (teams.length === 0) return 70;

    const stabilityScores: number[] = [];

    teams.forEach(team => {
      if (!team.members || team.members.length === 0) {
        stabilityScores.push(70);
        return;
      }

      // Calculate average tenure of team members
      const avgTenure = team.members
        .filter(member => member.tenure !== undefined)
        .reduce((sum, member) => sum + (member.tenure || 0), 0) / team.members.length;

      // Calculate team stability based on average tenure
      let teamScore = 70;
      if (avgTenure >= 24) teamScore = 95; // 2+ years
      else if (avgTenure >= 18) teamScore = 85; // 1.5+ years
      else if (avgTenure >= 12) teamScore = 75; // 1+ year
      else if (avgTenure >= 6) teamScore = 65; // 6+ months
      else if (avgTenure >= 3) teamScore = 45; // 3+ months
      else teamScore = 25; // Less than 3 months

      stabilityScores.push(teamScore);
    });

    return stabilityScores.reduce((sum, score) => sum + score, 0) / stabilityScores.length;
  }

  /**
   * Calculate commitment adherence score
   */
  private static calculateCommitmentAdherenceScore(assignments: ContractorAssignment[]): number {
    const completedAssignments = assignments.filter(a => 
      a.status === 'completed' && a.startDate && a.endDate && a.expectedEndDate
    );

    if (completedAssignments.length === 0) return 70;

    const adherenceScores: number[] = [];

    completedAssignments.forEach(assignment => {
      const actualEnd = new Date(assignment.endDate!);
      const expectedEnd = new Date(assignment.expectedEndDate!);
      const daysDifference = Math.ceil((actualEnd.getTime() - expectedEnd.getTime()) / (1000 * 60 * 60 * 24));

      // Score based on how close to expected delivery
      let score = 95;
      if (daysDifference <= 0) score = 95; // On time or early
      else if (daysDifference <= 2) score = 85; // Up to 2 days late
      else if (daysDifference <= 5) score = 75; // Up to 5 days late
      else if (daysDifference <= 10) score = 65; // Up to 10 days late
      else if (daysDifference <= 20) score = 45; // Up to 20 days late
      else score = 25; // More than 20 days late

      adherenceScores.push(score);
    });

    return adherenceScores.reduce((sum, score) => sum + score, 0) / adherenceScores.length;
  }

  /**
   * Calculate weighted reliability score
   */
  private static calculateWeightedScore(breakdown: RAGReliabilityBreakdown): number {
    return (
      breakdown.consistency * 0.25 +
      breakdown.communication * 0.20 +
      breakdown.issueResolution * 0.20 +
      breakdown.teamStability * 0.20 +
      breakdown.commitmentAdherence * 0.15
    );
  }

  /**
   * Get reliability trend analysis
   */
  static getReliabilityTrend(assignments: ContractorAssignment[]): 'improving' | 'declining' | 'stable' {
    if (assignments.length < 6) return 'stable';

    const sortedAssignments = assignments
      .filter(a => a.endDate && a.clientFeedback?.rating)
      .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime());

    if (sortedAssignments.length < 6) return 'stable';

    const recentAssignments = sortedAssignments.slice(-3);
    const olderAssignments = sortedAssignments.slice(-6, -3);

    const recentAvgRating = recentAssignments.reduce((sum, a) => sum + a.clientFeedback!.rating!, 0) / recentAssignments.length;
    const olderAvgRating = olderAssignments.reduce((sum, a) => sum + a.clientFeedback!.rating!, 0) / olderAssignments.length;

    const improvement = recentAvgRating - olderAvgRating;

    if (improvement > 0.5) return 'improving';
    if (improvement < -0.5) return 'declining';
    return 'stable';
  }

  /**
   * Get reliability recommendations
   */
  static getReliabilityRecommendations(breakdown: RAGReliabilityBreakdown): string[] {
    const recommendations: string[] = [];

    if (breakdown.consistency < 70) {
      recommendations.push('Focus on maintaining consistent quality standards across all projects');
    }

    if (breakdown.communication < 70) {
      recommendations.push('Improve client communication frequency and quality');
    }

    if (breakdown.issueResolution < 70) {
      recommendations.push('Enhance issue tracking and resolution processes');
    }

    if (breakdown.teamStability < 70) {
      recommendations.push('Work on team retention and stability improvements');
    }

    if (breakdown.commitmentAdherence < 70) {
      recommendations.push('Improve project planning to better meet delivery commitments');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain current reliability standards');
    }

    return recommendations;
  }
}