/**
 * Capabilities Score Calculator
 * Calculates RAG capabilities scores based on technical skills and capacity
 */

import {
  RAGCapabilitiesBreakdown,
  RAGScoreResult,
  ContractorData,
  ContractorTeam
} from '../types';

export class CapabilitiesCalculator {
  /**
   * Calculate capabilities score based on technical skills and capacity
   */
  static calculateScore(
    contractor: ContractorData,
    teams: ContractorTeam[]
  ): RAGScoreResult<RAGCapabilitiesBreakdown> {
    
    // Calculate individual capability metrics
    const technicalSkills = this.calculateTechnicalSkillsScore(contractor, teams);
    const equipmentCapacity = this.calculateEquipmentScore(contractor);
    const teamCapacity = this.calculateTeamCapacityScore(teams);
    const specialization = this.calculateSpecializationScore(contractor);
    const scalability = this.calculateScalabilityScore(contractor, teams);

    const breakdown: RAGCapabilitiesBreakdown = {
      technicalSkills,
      equipmentCapacity,
      teamCapacity,
      specialization,
      scalability
    };

    // Calculate weighted average
    const score = this.calculateWeightedScore(breakdown);

    return { score: Math.round(score), breakdown };
  }

  /**
   * Calculate technical skills score
   */
  private static calculateTechnicalSkillsScore(contractor: ContractorData, teams: ContractorTeam[]): number {
    let skillsScore = 70; // Default neutral score

    // Assess contractor-level certifications
    const certifications = contractor.certifications || [];
    const relevantCerts = certifications.filter(cert => 
      cert.isActive && cert.category === 'technical'
    );

    // Base score from certifications
    if (relevantCerts.length >= 5) skillsScore = 95;
    else if (relevantCerts.length >= 3) skillsScore = 85;
    else if (relevantCerts.length >= 2) skillsScore = 75;
    else if (relevantCerts.length >= 1) skillsScore = 65;

    // Assess team skills if available
    if (teams.length > 0) {
      const teamSkillsScores = teams.map(team => this.assessTeamSkills(team));
      const avgTeamSkills = teamSkillsScores.reduce((sum, score) => sum + score, 0) / teamSkillsScores.length;
      
      // Weighted combination of contractor and team skills
      skillsScore = (skillsScore * 0.4) + (avgTeamSkills * 0.6);
    }

    return Math.round(skillsScore);
  }

  /**
   * Assess individual team skills
   */
  private static assessTeamSkills(team: ContractorTeam): number {
    if (!team.members || team.members.length === 0) return 70;

    const memberSkills = team.members.map(member => {
      const certifications = member.certifications?.length || 0;
      const experience = member.experience || 0;
      
      let memberScore = 50;
      
      // Experience scoring
      if (experience >= 10) memberScore += 30;
      else if (experience >= 5) memberScore += 25;
      else if (experience >= 3) memberScore += 20;
      else if (experience >= 1) memberScore += 15;
      
      // Certification scoring
      if (certifications >= 5) memberScore += 20;
      else if (certifications >= 3) memberScore += 15;
      else if (certifications >= 2) memberScore += 10;
      else if (certifications >= 1) memberScore += 5;
      
      return Math.min(memberScore, 100);
    });

    return memberSkills.reduce((sum, score) => sum + score, 0) / memberSkills.length;
  }

  /**
   * Calculate equipment capacity score
   */
  private static calculateEquipmentScore(contractor: ContractorData): number {
    const equipment = contractor.equipment || [];
    
    if (equipment.length === 0) return 50; // Low score for no equipment

    // Assess equipment quality and condition
    const equipmentScores = equipment.map(item => {
      let itemScore = 70; // Base score
      
      // Age factor
      if (item.age <= 2) itemScore += 15; // Very new
      else if (item.age <= 5) itemScore += 10; // Relatively new
      else if (item.age <= 10) itemScore += 5; // Moderate age
      else itemScore -= 10; // Old equipment
      
      // Condition factor
      switch (item.condition?.toLowerCase()) {
        case 'excellent': itemScore += 15; break;
        case 'good': itemScore += 10; break;
        case 'fair': itemScore += 5; break;
        case 'poor': itemScore -= 10; break;
      }
      
      // Maintenance status
      if (item.lastMaintenance) {
        const daysSinceService = Math.floor(
          (new Date().getTime() - new Date(item.lastMaintenance).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceService <= 90) itemScore += 10; // Recently serviced
        else if (daysSinceService <= 180) itemScore += 5; // Moderately recent
        else if (daysSinceService > 365) itemScore -= 10; // Overdue service
      }
      
      return Math.max(Math.min(itemScore, 100), 0);
    });

    return equipmentScores.reduce((sum, score) => sum + score, 0) / equipmentScores.length;
  }

  /**
   * Calculate team capacity score
   */
  private static calculateTeamCapacityScore(teams: ContractorTeam[]): number {
    if (teams.length === 0) return 50;

    const teamCapacityScores = teams.map(team => {
      const memberCount = team.members?.length || 0;
      const activeMembers = team.members?.filter(member => member.status === 'active').length || 0;
      
      let capacityScore = 70;
      
      // Team size scoring
      if (memberCount >= 10) capacityScore += 20;
      else if (memberCount >= 5) capacityScore += 15;
      else if (memberCount >= 3) capacityScore += 10;
      else if (memberCount >= 2) capacityScore += 5;
      else if (memberCount === 1) capacityScore -= 10;
      
      // Active member ratio
      const activeRatio = memberCount > 0 ? activeMembers / memberCount : 0;
      if (activeRatio >= 0.9) capacityScore += 10;
      else if (activeRatio >= 0.8) capacityScore += 5;
      else if (activeRatio < 0.6) capacityScore -= 10;
      
      // Current workload factor
      if (team.currentWorkload !== undefined) {
        if (team.currentWorkload <= 70) capacityScore += 10; // Good availability
        else if (team.currentWorkload <= 85) capacityScore += 5; // Moderate availability
        else if (team.currentWorkload >= 100) capacityScore -= 15; // Overloaded
      }
      
      return Math.max(Math.min(capacityScore, 100), 0);
    });

    return teamCapacityScores.reduce((sum, score) => sum + score, 0) / teamCapacityScores.length;
  }

  /**
   * Calculate specialization score
   */
  private static calculateSpecializationScore(contractor: ContractorData): number {
    const specializations = contractor.specializations || [];
    const serviceAreas = contractor.serviceAreas || [];
    
    let specializationScore = 70;
    
    // Number of specializations (more isn't always better)
    if (specializations.length >= 3 && specializations.length <= 5) {
      specializationScore += 15; // Sweet spot
    } else if (specializations.length >= 2) {
      specializationScore += 10;
    } else if (specializations.length === 1) {
      specializationScore += 5; // Highly focused
    } else {
      specializationScore -= 10; // No clear specialization
    }
    
    // Service area coverage
    if (serviceAreas.length >= 5) specializationScore += 10;
    else if (serviceAreas.length >= 3) specializationScore += 5;
    else if (serviceAreas.length === 0) specializationScore -= 5;
    
    // Industry experience depth
    const yearsInBusiness = contractor.yearsInBusiness || 0;
    if (yearsInBusiness >= 10) specializationScore += 15;
    else if (yearsInBusiness >= 5) specializationScore += 10;
    else if (yearsInBusiness >= 2) specializationScore += 5;
    else if (yearsInBusiness < 1) specializationScore -= 10;
    
    return Math.max(Math.min(specializationScore, 100), 0);
  }

  /**
   * Calculate scalability score
   */
  private static calculateScalabilityScore(contractor: ContractorData, teams: ContractorTeam[]): number {
    let scalabilityScore = 70;
    
    // Team structure flexibility
    if (teams.length >= 3) {
      scalabilityScore += 20; // Multiple teams suggest scalability
    } else if (teams.length === 2) {
      scalabilityScore += 10;
    } else if (teams.length === 0) {
      scalabilityScore -= 10;
    }
    
    // Current capacity utilization
    const totalCurrentWorkload = teams.reduce((sum, team) => sum + (team.currentWorkload || 0), 0);
    const avgWorkload = teams.length > 0 ? totalCurrentWorkload / teams.length : 100;
    
    if (avgWorkload <= 60) scalabilityScore += 15; // Lots of spare capacity
    else if (avgWorkload <= 75) scalabilityScore += 10; // Good spare capacity
    else if (avgWorkload <= 85) scalabilityScore += 5; // Some spare capacity
    else if (avgWorkload >= 100) scalabilityScore -= 15; // No spare capacity
    
    // Growth indicators
    const recentGrowth = contractor.recentGrowth || {};
    if (recentGrowth.staffIncrease && recentGrowth.staffIncrease > 0) {
      scalabilityScore += 10;
    }
    if (recentGrowth.revenueGrowth && recentGrowth.revenueGrowth > 0.1) {
      scalabilityScore += 5;
    }
    
    return Math.max(Math.min(scalabilityScore, 100), 0);
  }

  /**
   * Calculate weighted capabilities score
   */
  private static calculateWeightedScore(breakdown: RAGCapabilitiesBreakdown): number {
    return (
      breakdown.technicalSkills * 0.30 +
      breakdown.equipmentCapacity * 0.25 +
      breakdown.teamCapacity * 0.20 +
      breakdown.specialization * 0.15 +
      breakdown.scalability * 0.10
    );
  }

  /**
   * Get capability gaps analysis
   */
  static getCapabilityGaps(breakdown: RAGCapabilitiesBreakdown, industry: string = 'telecommunications'): string[] {
    const gaps: string[] = [];
    const threshold = 70;

    if (breakdown.technicalSkills < threshold) {
      gaps.push('Technical skills need enhancement - consider additional training and certifications');
    }

    if (breakdown.equipmentCapacity < threshold) {
      gaps.push('Equipment needs upgrade or expansion to meet industry standards');
    }

    if (breakdown.teamCapacity < threshold) {
      gaps.push('Team capacity is insufficient - consider hiring or restructuring');
    }

    if (breakdown.specialization < threshold) {
      gaps.push('Specialization focus needs improvement - develop core competencies');
    }

    if (breakdown.scalability < threshold) {
      gaps.push('Scalability constraints - develop systems and processes for growth');
    }

    if (gaps.length === 0) {
      gaps.push('No significant capability gaps identified');
    }

    return gaps;
  }

  /**
   * Get capability recommendations
   */
  static getCapabilityRecommendations(breakdown: RAGCapabilitiesBreakdown): string[] {
    const recommendations: string[] = [];

    // Technical skills recommendations
    if (breakdown.technicalSkills < 85) {
      recommendations.push('Invest in ongoing technical training and industry certifications');
    }

    // Equipment recommendations  
    if (breakdown.equipmentCapacity < 80) {
      recommendations.push('Develop equipment modernization and maintenance schedule');
    }

    // Team capacity recommendations
    if (breakdown.teamCapacity < 80) {
      recommendations.push('Optimize team structure and workload distribution');
    }

    // Specialization recommendations
    if (breakdown.specialization < 75) {
      recommendations.push('Focus on developing core specializations and market positioning');
    }

    // Scalability recommendations
    if (breakdown.scalability < 75) {
      recommendations.push('Build scalable processes and systems to support growth');
    }

    return recommendations;
  }
}