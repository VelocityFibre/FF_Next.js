/**
 * RAG Scoring Service - Risk Assessment and Grading for contractors
 * Calculates comprehensive scores based on performance, financial stability, and capabilities
 */

import { db } from '@/lib/neon/db';
import { contractors, projectAssignments, contractorTeams } from '@/lib/neon/schema';
import { eq, avg, count, sql, desc } from 'drizzle-orm';

export interface RAGScore {
  overall: number;
  risk: 'low' | 'medium' | 'high';
  performance: number;
  financial: number;
  reliability: number;
  capabilities: number;
  breakdown: {
    performance: RAGPerformanceBreakdown;
    financial: RAGFinancialBreakdown;
    reliability: RAGReliabilityBreakdown;
    capabilities: RAGCapabilitiesBreakdown;
  };
  lastUpdated: Date;
  recommendations: string[];
}

export interface RAGPerformanceBreakdown {
  completionRate: number;
  qualityScore: number;
  timelinessScore: number;
  clientSatisfaction: number;
  projectComplexity: number;
}

export interface RAGFinancialBreakdown {
  paymentHistory: number;
  financialStability: number;
  creditRating: number;
  insuranceCoverage: number;
  bondingCapacity: number;
}

export interface RAGReliabilityBreakdown {
  projectHistory: number;
  teamStability: number;
  certificationStatus: number;
  complianceRecord: number;
  communicationRating: number;
}

export interface RAGCapabilitiesBreakdown {
  technicalSkills: number;
  equipmentRating: number;
  teamExperience: number;
  certificationLevel: number;
  specializationDepth: number;
}

class RAGScoringService {
  /**
   * Calculate comprehensive RAG score for a contractor
   */
  async calculateRAGScore(contractorId: string): Promise<RAGScore> {
    try {
      const [contractor] = await db
        .select()
        .from(contractors)
        .where(eq(contractors.id, contractorId))
        .limit(1);

      if (!contractor) {
        throw new Error('Contractor not found');
      }

      // Get assignments data for performance calculation
      const assignments = await db
        .select()
        .from(projectAssignments)
        .where(eq(projectAssignments.contractorId, contractorId));

      // Get teams data for capabilities calculation
      const teams = await db
        .select()
        .from(contractorTeams)
        .where(eq(contractorTeams.contractorId, contractorId));

      // Calculate individual components
      const performance = await this.calculatePerformanceScore(contractorId, assignments);
      const financial = await this.calculateFinancialScore(contractor);
      const reliability = await this.calculateReliabilityScore(contractorId, assignments);
      const capabilities = await this.calculateCapabilitiesScore(contractorId, teams);

      // Calculate weighted overall score
      const overall = this.calculateOverallScore({
        performance: performance.score,
        financial: financial.score,
        reliability: reliability.score,
        capabilities: capabilities.score
      });

      const risk = this.determineRiskLevel(overall);
      const recommendations = this.generateRecommendations(overall, {
        performance,
        financial,
        reliability,
        capabilities
      });

      return {
        overall,
        risk,
        performance: performance.score,
        financial: financial.score,
        reliability: reliability.score,
        capabilities: capabilities.score,
        breakdown: {
          performance: performance.breakdown,
          financial: financial.breakdown,
          reliability: reliability.breakdown,
          capabilities: capabilities.breakdown
        },
        lastUpdated: new Date(),
        recommendations
      };
    } catch (error) {
      console.error('Failed to calculate RAG score:', error);
      throw error;
    }
  }

  /**
   * Calculate performance score based on project history
   */
  private async calculatePerformanceScore(
    contractorId: string,
    assignments: any[]
  ): Promise<{ score: number; breakdown: RAGPerformanceBreakdown }> {
    const completedAssignments = assignments.filter(a => a.status === 'completed');
    
    if (completedAssignments.length === 0) {
      // New contractor - neutral score
      return {
        score: 70,
        breakdown: {
          completionRate: 70,
          qualityScore: 70,
          timelinessScore: 70,
          clientSatisfaction: 70,
          projectComplexity: 70
        }
      };
    }

    // Calculate completion rate
    const completionRate = (completedAssignments.length / assignments.length) * 100;

    // Calculate average quality scores
    const qualityScores = completedAssignments
      .filter(a => a.qualityScore)
      .map(a => a.qualityScore);
    const qualityScore = qualityScores.length > 0 
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length 
      : 70;

    // Calculate timeliness (on-time completion)
    const timelinessScores = completedAssignments
      .filter(a => a.timelinessScore)
      .map(a => a.timelinessScore);
    const timelinessScore = timelinessScores.length > 0
      ? timelinessScores.reduce((sum, score) => sum + score, 0) / timelinessScores.length
      : 70;

    // Calculate performance ratings
    const performanceRatings = completedAssignments
      .filter(a => a.performanceRating)
      .map(a => a.performanceRating);
    const clientSatisfaction = performanceRatings.length > 0
      ? performanceRatings.reduce((sum, rating) => sum + rating, 0) / performanceRatings.length
      : 70;

    // Project complexity factor (based on contract values)
    const avgContractValue = completedAssignments.reduce((sum, a) => sum + a.contractValue, 0) / completedAssignments.length;
    const projectComplexity = Math.min(100, (avgContractValue / 1000000) * 20 + 60); // Scale complexity

    const breakdown: RAGPerformanceBreakdown = {
      completionRate: Math.min(100, completionRate),
      qualityScore,
      timelinessScore,
      clientSatisfaction,
      projectComplexity
    };

    // Weighted average
    const score = (
      breakdown.completionRate * 0.25 +
      breakdown.qualityScore * 0.25 +
      breakdown.timelinessScore * 0.25 +
      breakdown.clientSatisfaction * 0.15 +
      breakdown.projectComplexity * 0.10
    );

    return { score: Math.round(score), breakdown };
  }

  /**
   * Calculate financial stability score
   */
  private async calculateFinancialScore(
    contractor: any
  ): Promise<{ score: number; breakdown: RAGFinancialBreakdown }> {
    // Payment history (based on historical data)
    const paymentHistory = contractor.paymentHistory || 75;

    // Financial stability indicators
    const financialStability = this.assessFinancialStability(contractor);
    
    // Credit rating (if available)
    const creditRating = contractor.creditRating || 70;

    // Insurance coverage adequacy
    const insuranceCoverage = contractor.insuranceVerified ? 90 : 50;

    // Bonding capacity
    const bondingCapacity = contractor.bondingCapacity ? 85 : 60;

    const breakdown: RAGFinancialBreakdown = {
      paymentHistory,
      financialStability,
      creditRating,
      insuranceCoverage,
      bondingCapacity
    };

    const score = (
      breakdown.paymentHistory * 0.30 +
      breakdown.financialStability * 0.25 +
      breakdown.creditRating * 0.20 +
      breakdown.insuranceCoverage * 0.15 +
      breakdown.bondingCapacity * 0.10
    );

    return { score: Math.round(score), breakdown };
  }

  /**
   * Calculate reliability score
   */
  private async calculateReliabilityScore(
    contractorId: string,
    assignments: any[]
  ): Promise<{ score: number; breakdown: RAGReliabilityBreakdown }> {
    // Project history depth
    const projectHistory = Math.min(100, assignments.length * 10 + 50);

    // Team stability (low turnover)
    const teamStability = 80; // TODO: Calculate based on team member tenure

    // Certification status
    const certificationStatus = this.assessCertificationStatus(assignments);

    // Compliance record
    const complianceRecord = assignments.length > 0 ? 85 : 70;

    // Communication rating
    const communicationRating = 80; // TODO: Calculate from client feedback

    const breakdown: RAGReliabilityBreakdown = {
      projectHistory,
      teamStability,
      certificationStatus,
      complianceRecord,
      communicationRating
    };

    const score = (
      breakdown.projectHistory * 0.25 +
      breakdown.teamStability * 0.20 +
      breakdown.certificationStatus * 0.20 +
      breakdown.complianceRecord * 0.20 +
      breakdown.communicationRating * 0.15
    );

    return { score: Math.round(score), breakdown };
  }

  /**
   * Calculate capabilities score
   */
  private async calculateCapabilitiesScore(
    contractorId: string,
    teams: any[]
  ): Promise<{ score: number; breakdown: RAGCapabilitiesBreakdown }> {
    // Technical skills assessment
    const technicalSkills = this.assessTechnicalSkills(teams);

    // Equipment and tools rating
    const equipmentRating = 75; // TODO: Calculate from equipment inventory

    // Team experience level
    const teamExperience = this.assessTeamExperience(teams);

    // Certification levels
    const certificationLevel = this.assessCertificationLevel(teams);

    // Specialization depth
    const specializationDepth = this.assessSpecializationDepth(teams);

    const breakdown: RAGCapabilitiesBreakdown = {
      technicalSkills,
      equipmentRating,
      teamExperience,
      certificationLevel,
      specializationDepth
    };

    const score = (
      breakdown.technicalSkills * 0.25 +
      breakdown.equipmentRating * 0.20 +
      breakdown.teamExperience * 0.25 +
      breakdown.certificationLevel * 0.15 +
      breakdown.specializationDepth * 0.15
    );

    return { score: Math.round(score), breakdown };
  }

  /**
   * Calculate weighted overall score
   */
  private calculateOverallScore(scores: {
    performance: number;
    financial: number;
    reliability: number;
    capabilities: number;
  }): number {
    return Math.round(
      scores.performance * 0.30 +
      scores.financial * 0.25 +
      scores.reliability * 0.25 +
      scores.capabilities * 0.20
    );
  }

  /**
   * Determine risk level based on overall score
   */
  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    return 'high';
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    overallScore: number,
    breakdown: any
  ): string[] {
    const recommendations: string[] = [];

    if (breakdown.performance.score < 70) {
      recommendations.push('Improve project completion rates and quality metrics');
    }

    if (breakdown.financial.score < 70) {
      recommendations.push('Strengthen financial documentation and payment history');
    }

    if (breakdown.reliability.score < 70) {
      recommendations.push('Focus on building consistent delivery track record');
    }

    if (breakdown.capabilities.score < 70) {
      recommendations.push('Invest in team training and certification programs');
    }

    if (overallScore >= 80) {
      recommendations.push('Excellent contractor - suitable for high-value projects');
    } else if (overallScore >= 60) {
      recommendations.push('Good contractor - suitable for standard projects with monitoring');
    } else {
      recommendations.push('High-risk contractor - requires close oversight and improvement plan');
    }

    return recommendations;
  }

  // Helper methods for specific assessments
  private assessFinancialStability(contractor: any): number {
    let score = 70; // Base score
    
    if (contractor.yearsInBusiness >= 5) score += 10;
    if (contractor.yearsInBusiness >= 10) score += 10;
    if (contractor.totalProjects >= 10) score += 5;
    if (contractor.totalProjects >= 50) score += 5;
    
    return Math.min(100, score);
  }

  private assessCertificationStatus(assignments: any[]): number {
    // TODO: Implement based on required vs actual certifications
    return 80;
  }

  private assessTechnicalSkills(teams: any[]): number {
    if (teams.length === 0) return 60;
    
    // TODO: Calculate based on team member skills and certifications
    const avgSkillLevel = teams.reduce((sum, team) => {
      const skillMap = { junior: 60, intermediate: 75, senior: 90, expert: 100 };
      return sum + (skillMap[team.skillLevel as keyof typeof skillMap] || 60);
    }, 0) / teams.length;
    
    return Math.round(avgSkillLevel);
  }

  private assessTeamExperience(teams: any[]): number {
    if (teams.length === 0) return 60;
    
    // TODO: Calculate based on team member experience years
    return 75;
  }

  private assessCertificationLevel(teams: any[]): number {
    if (teams.length === 0) return 60;
    
    // TODO: Calculate based on team certifications
    return 70;
  }

  private assessSpecializationDepth(teams: any[]): number {
    if (teams.length === 0) return 60;
    
    // Calculate based on team specializations
    const specializations = new Set(teams.map(team => team.teamType));
    return Math.min(100, specializations.size * 15 + 55);
  }

  /**
   * Get RAG scores for multiple contractors
   */
  async getContractorRAGScores(contractorIds: string[]): Promise<Map<string, RAGScore>> {
    const scores = new Map<string, RAGScore>();
    
    for (const contractorId of contractorIds) {
      try {
        const score = await this.calculateRAGScore(contractorId);
        scores.set(contractorId, score);
      } catch (error) {
        console.error(`Failed to calculate RAG score for contractor ${contractorId}:`, error);
      }
    }
    
    return scores;
  }

  /**
   * Get contractors ranked by RAG score
   */
  async getRankedContractors(limit: number = 50): Promise<Array<{
    contractorId: string;
    companyName: string;
    ragScore: RAGScore;
  }>> {
    try {
      const contractorList = await db
        .select({
          id: contractors.id,
          companyName: contractors.companyName
        })
        .from(contractors)
        .limit(limit);

      const rankedContractors = [];

      for (const contractor of contractorList) {
        try {
          const ragScore = await this.calculateRAGScore(contractor.id);
          rankedContractors.push({
            contractorId: contractor.id,
            companyName: contractor.companyName,
            ragScore
          });
        } catch (error) {
          console.error(`Failed to calculate RAG score for ${contractor.companyName}:`, error);
        }
      }

      // Sort by overall score (descending)
      return rankedContractors.sort((a, b) => b.ragScore.overall - a.ragScore.overall);
    } catch (error) {
      console.error('Failed to get ranked contractors:', error);
      throw error;
    }
  }
}

export const ragScoringService = new RAGScoringService();