/**
 * Performance Score Calculator
 * Calculates RAG performance scores based on project history
 */

import {
  RAGPerformanceBreakdown,
  RAGScoreResult,
  ContractorAssignment
} from '../types';

// Extended interface to include performance-specific properties
interface ExtendedContractorAssignment extends ContractorAssignment {
  startDate?: string;
  endDate?: string;
  expectedEndDate?: string;
  clientFeedback?: {
    rating?: number;
  };
  complexityLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export class PerformanceCalculator {
  /**
   * Calculate performance score based on project history
   */
  static calculateScore(
    assignments: ExtendedContractorAssignment[]
  ): RAGScoreResult<RAGPerformanceBreakdown> {
    const completedAssignments = assignments.filter(a => a.status === 'completed');
    
    if (completedAssignments.length === 0) {
      // New contractor - neutral score
      const breakdown: RAGPerformanceBreakdown = {
        completionRate: 70,
        qualityScore: 70,
        timelinessScore: 70,
        clientSatisfaction: 70,
        projectComplexity: 70
      };
      
      return { score: 70, breakdown };
    }

    // Calculate completion rate
    const completionRate = (completedAssignments.length / assignments.length) * 100;

    // Calculate average quality scores
    const qualityScores = completedAssignments
      .filter(a => a.qualityScore !== undefined)
      .map(a => a.qualityScore!);
    const avgQualityScore = qualityScores.length > 0 
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
      : 70;

    // Calculate timeliness
    const timelinessScore = this.calculateTimelinessScore(completedAssignments);

    // Calculate client satisfaction
    const clientSatisfaction = this.calculateClientSatisfaction(completedAssignments);

    // Calculate project complexity score
    const projectComplexity = this.calculateProjectComplexity(completedAssignments);

    // Create breakdown
    const breakdown: RAGPerformanceBreakdown = {
      completionRate: Math.min(completionRate, 100),
      qualityScore: avgQualityScore,
      timelinessScore,
      clientSatisfaction,
      projectComplexity
    };

    // Calculate weighted average
    const score = this.calculateWeightedScore(breakdown);

    return { score: Math.round(score), breakdown };
  }

  /**
   * Calculate timeliness score based on project delivery times
   */
  private static calculateTimelinessScore(assignments: ExtendedContractorAssignment[]): number {
    const timelyCounts = assignments.filter(a => {
      if (!a.startDate || !a.endDate || !a.expectedEndDate) return true; // No penalty for missing dates
      
      const actualEnd = new Date(a.endDate);
      const expectedEnd = new Date(a.expectedEndDate);
      
      return actualEnd <= expectedEnd;
    });

    if (assignments.length === 0) return 70;
    
    const timelinessRate = (timelyCounts.length / assignments.length) * 100;
    return Math.max(Math.min(timelinessRate, 100), 0);
  }

  /**
   * Calculate client satisfaction score
   */
  private static calculateClientSatisfaction(assignments: ExtendedContractorAssignment[]): number {
    const satisfactionScores = assignments
      .filter(a => a.clientFeedback?.rating !== undefined)
      .map(a => a.clientFeedback!.rating!);

    if (satisfactionScores.length === 0) return 70;

    const avgSatisfaction = satisfactionScores.reduce((sum, rating) => sum + rating, 0) / satisfactionScores.length;
    
    // Convert 5-star rating to 100-point scale
    return (avgSatisfaction / 5) * 100;
  }

  /**
   * Calculate project complexity handling score
   */
  private static calculateProjectComplexity(assignments: ExtendedContractorAssignment[]): number {
    const complexityScores = assignments
      .filter(a => a.complexityLevel !== undefined)
      .map(a => {
        switch (a.complexityLevel) {
          case 'low': return 60;
          case 'medium': return 75;
          case 'high': return 90;
          case 'critical': return 100;
          default: return 70;
        }
      });

    if (complexityScores.length === 0) return 70;

    return complexityScores.reduce((sum, score) => sum + score, 0) / complexityScores.length;
  }

  /**
   * Calculate weighted performance score
   */
  private static calculateWeightedScore(breakdown: RAGPerformanceBreakdown): number {
    return (
      breakdown.completionRate * 0.25 +
      breakdown.qualityScore * 0.25 +
      breakdown.timelinessScore * 0.20 +
      breakdown.clientSatisfaction * 0.20 +
      breakdown.projectComplexity * 0.10
    );
  }

  /**
   * Get performance trend over time
   */
  static getPerformanceTrend(assignments: ExtendedContractorAssignment[]): 'improving' | 'declining' | 'stable' {
    if (assignments.length < 3) return 'stable';

    const sortedAssignments = assignments
      .filter(a => a.endDate && a.qualityScore !== undefined)
      .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime());

    if (sortedAssignments.length < 3) return 'stable';

    const recentScores = sortedAssignments.slice(-3).map(a => a.qualityScore!);
    const olderScores = sortedAssignments.slice(-6, -3).map(a => a.qualityScore!);

    if (olderScores.length === 0) return 'stable';

    const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;

    const improvement = recentAvg - olderAvg;

    if (improvement > 5) return 'improving';
    if (improvement < -5) return 'declining';
    return 'stable';
  }
}