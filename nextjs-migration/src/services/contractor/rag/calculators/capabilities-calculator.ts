/**
 * Capabilities Score Calculator
 * Calculates RAG capabilities scores based on technical skills and capacity
 */

import {
  RAGScoreResult,
  ContractorTeam
} from '../types';
import { Contractor, TeamMember } from '@/types/contractor.types';
import {
  CAPABILITIES_WEIGHTS,
  CAPABILITIES_CONFIG,
  CAPABILITY_GAP_MESSAGES,
  CAPABILITY_RECOMMENDATION_MESSAGES
} from './config/capabilities-config';
import {
  applyThresholdScoring,
  applyFallbackScoring,
  clampScore
} from './utils/scoring-utils';
import {
  calculateEquipmentItemScore,
  calculateSpecializationCountBonus,
  applyGrowthIndicators
} from './utils/capabilities-utils';

// Extended interfaces to match calculator requirements
interface ExtendedContractor extends Contractor {
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
}

interface ExtendedTeam extends ContractorTeam {
  members?: ExtendedMember[];
  currentWorkload?: number;
}

interface ExtendedMember extends TeamMember {
  experience?: number;
  status: 'active' | 'inactive';
}

interface ExtendedCapabilitiesBreakdown {
  technicalSkills: number;
  equipmentRating: number;
  teamExperience: number;
  certificationLevel: number;
  specializationDepth: number;
}

export class CapabilitiesCalculator {
  /**
   * Calculate capabilities score based on technical skills and capacity
   */
  static calculateScore(
    contractor: ExtendedContractor,
    teams: ExtendedTeam[]
  ): RAGScoreResult<ExtendedCapabilitiesBreakdown> {
    
    const breakdown: ExtendedCapabilitiesBreakdown = {
      technicalSkills: this.calculateTechnicalSkillsScore(contractor, teams),
      equipmentRating: this.calculateEquipmentScore(contractor),
      teamExperience: this.calculateTeamCapacityScore(teams),
      certificationLevel: this.calculateSpecializationScore(contractor),
      specializationDepth: this.calculateScalabilityScore(contractor, teams)
    };

    const score = this.calculateWeightedScore(breakdown);
    return { score: Math.round(score), breakdown };
  }

  /**
   * Calculate technical skills score
   */
  private static calculateTechnicalSkillsScore(contractor: ExtendedContractor, teams: ExtendedTeam[]): number {
    const certifications = contractor.certifications || [];
    const relevantCerts = certifications.filter((cert: string) => 
      cert.includes('technical') || cert.includes('fiber') || cert.includes('telecom')
    );

    // Base score from contractor certifications
    let skillsScore = applyFallbackScoring(
      relevantCerts.length, 
      CAPABILITIES_CONFIG.TECHNICAL_SKILLS.CERT_SCORES as any
    );

    // Enhance with team skills if available
    if (teams.length > 0) {
      const teamSkillsScores = teams.map(team => this.assessTeamSkills(team));
      const avgTeamSkills = teamSkillsScores.reduce((sum, score) => sum + score, 0) / teamSkillsScores.length;
      
      // Weighted combination: 40% contractor, 60% team
      skillsScore = (skillsScore * 0.4) + (avgTeamSkills * 0.6);
    }

    return Math.round(skillsScore);
  }

  /**
   * Assess individual team skills
   */
  private static assessTeamSkills(team: ExtendedTeam): number {
    if (!team.members || team.members.length === 0) return CAPABILITIES_CONFIG.DEFAULT_SCORE;

    const memberSkills = team.members.map((member: ExtendedMember) => {
      const certifications = member.certifications?.length || 0;
      const experience = member.experience || 0;
      
      let memberScore = 50;
      
      // Apply experience and certification bonuses
      memberScore += applyThresholdScoring(
        experience, 
        CAPABILITIES_CONFIG.TECHNICAL_SKILLS.MEMBER_EXPERIENCE as any, 
        0
      );
      
      memberScore += applyThresholdScoring(
        certifications, 
        CAPABILITIES_CONFIG.TECHNICAL_SKILLS.MEMBER_CERTS as any, 
        0
      );
      
      return clampScore(memberScore);
    });

    return memberSkills.reduce((sum, score) => sum + score, 0) / memberSkills.length;
  }

  /**
   * Calculate equipment capacity score
   */
  private static calculateEquipmentScore(contractor: ExtendedContractor): number {
    const equipment = contractor.equipment || [];
    
    if (equipment.length === 0) return CAPABILITIES_CONFIG.EQUIPMENT_SCORES.NO_EQUIPMENT;

    const equipmentScores = equipment.map(calculateEquipmentItemScore);
    return equipmentScores.reduce((sum, score) => sum + score, 0) / equipmentScores.length;
  }


  /**
   * Calculate team capacity score
   */
  private static calculateTeamCapacityScore(teams: ExtendedTeam[]): number {
    if (teams.length === 0) return 50;

    const teamCapacityScores = teams.map((team: ExtendedTeam) => {
      const memberCount = team.members?.length || 0;
      const activeMembers = team.members?.filter(member => member.status === 'active').length || 0;
      
      let capacityScore = CAPABILITIES_CONFIG.TEAM_CAPACITY.BASE_SCORE;
      
      // Apply team size scoring
      capacityScore += applyThresholdScoring(
        memberCount, 
        CAPABILITIES_CONFIG.TEAM_CAPACITY.SIZE_BONUSES as any, 
        0
      );
      
      // Apply active member ratio scoring
      const activeRatio = memberCount > 0 ? activeMembers / memberCount : 0;
      capacityScore += applyThresholdScoring(
        activeRatio, 
        CAPABILITIES_CONFIG.TEAM_CAPACITY.ACTIVE_RATIO_BONUSES as any, 
        0
      );
      
      // Apply workload factor
      if (team.currentWorkload !== undefined) {
        capacityScore += applyThresholdScoring(
          team.currentWorkload, 
          CAPABILITIES_CONFIG.TEAM_CAPACITY.WORKLOAD_BONUSES as any, 
          0
        );
      }
      
      return clampScore(capacityScore);
    });

    return teamCapacityScores.reduce((sum, score) => sum + score, 0) / teamCapacityScores.length;
  }

  /**
   * Calculate specialization score
   */
  private static calculateSpecializationScore(contractor: ExtendedContractor): number {
    const specializations = contractor.specializations || [];
    const serviceAreas = contractor.serviceAreas || [];
    const yearsInBusiness = contractor.yearsInBusiness || 0;
    
    let specializationScore = CAPABILITIES_CONFIG.SPECIALIZATION.BASE_SCORE;
    
    // Apply specialization count bonus
    specializationScore += calculateSpecializationCountBonus(specializations.length);
    
    // Apply service area and experience bonuses
    specializationScore += applyThresholdScoring(
      serviceAreas.length, 
      CAPABILITIES_CONFIG.SPECIALIZATION.SERVICE_AREA_BONUSES as any, 
      0
    );
    
    specializationScore += applyThresholdScoring(
      yearsInBusiness, 
      CAPABILITIES_CONFIG.SPECIALIZATION.EXPERIENCE_BONUSES as any, 
      0
    );
    
    return clampScore(specializationScore);
  }

  /**
   * Calculate scalability score
   */
  private static calculateScalabilityScore(contractor: ExtendedContractor, teams: ExtendedTeam[]): number {
    let scalabilityScore: number = CAPABILITIES_CONFIG.SCALABILITY.BASE_SCORE;
    
    // Apply team structure flexibility bonus
    scalabilityScore += applyThresholdScoring(
      teams.length, 
      CAPABILITIES_CONFIG.SCALABILITY.TEAM_COUNT_BONUSES as any, 
      0
    );
    
    // Apply capacity utilization scoring
    const totalCurrentWorkload = teams.reduce((sum, team) => sum + (team.currentWorkload || 0), 0);
    const avgWorkload = teams.length > 0 ? totalCurrentWorkload / teams.length : 100;
    
    scalabilityScore += applyThresholdScoring(
      avgWorkload, 
      CAPABILITIES_CONFIG.SCALABILITY.WORKLOAD_BONUSES as any, 
      0
    );
    
    // Apply growth indicators
    scalabilityScore = applyGrowthIndicators(scalabilityScore, contractor.recentGrowth);
    
    return clampScore(scalabilityScore);
  }

  /**
   * Calculate weighted capabilities score
   */
  private static calculateWeightedScore(breakdown: ExtendedCapabilitiesBreakdown): number {
    return (
      breakdown.technicalSkills * CAPABILITIES_WEIGHTS.TECHNICAL_SKILLS +
      breakdown.equipmentRating * CAPABILITIES_WEIGHTS.EQUIPMENT_CAPACITY +
      breakdown.teamExperience * CAPABILITIES_WEIGHTS.TEAM_CAPACITY +
      breakdown.certificationLevel * CAPABILITIES_WEIGHTS.SPECIALIZATION +
      breakdown.specializationDepth * CAPABILITIES_WEIGHTS.SCALABILITY
    );
  }

  /**
   * Get capability gaps analysis
   */
  static getCapabilityGaps(breakdown: ExtendedCapabilitiesBreakdown): string[] {
    const gaps: string[] = [];
    const { THRESHOLD } = CAPABILITIES_CONFIG;

    const checks = [
      { value: breakdown.technicalSkills, message: CAPABILITY_GAP_MESSAGES.TECHNICAL_SKILLS },
      { value: breakdown.equipmentRating, message: CAPABILITY_GAP_MESSAGES.EQUIPMENT_CAPACITY },
      { value: breakdown.teamExperience, message: CAPABILITY_GAP_MESSAGES.TEAM_CAPACITY },
      { value: breakdown.certificationLevel, message: CAPABILITY_GAP_MESSAGES.SPECIALIZATION },
      { value: breakdown.specializationDepth, message: CAPABILITY_GAP_MESSAGES.SCALABILITY }
    ];

    checks.forEach(({ value, message }) => {
      if (value < THRESHOLD) gaps.push(message);
    });

    return gaps.length > 0 ? gaps : [CAPABILITY_GAP_MESSAGES.NO_GAPS];
  }

  /**
   * Get capability recommendations
   */
  static getCapabilityRecommendations(breakdown: ExtendedCapabilitiesBreakdown): string[] {
    const recommendations: string[] = [];
    const thresholds = { technical: 85, equipment: 80, team: 80, specialization: 75, scalability: 75 };

    const checks = [
      { value: breakdown.technicalSkills, threshold: thresholds.technical, message: CAPABILITY_RECOMMENDATION_MESSAGES.TECHNICAL_SKILLS },
      { value: breakdown.equipmentRating, threshold: thresholds.equipment, message: CAPABILITY_RECOMMENDATION_MESSAGES.EQUIPMENT_CAPACITY },
      { value: breakdown.teamExperience, threshold: thresholds.team, message: CAPABILITY_RECOMMENDATION_MESSAGES.TEAM_CAPACITY },
      { value: breakdown.certificationLevel, threshold: thresholds.specialization, message: CAPABILITY_RECOMMENDATION_MESSAGES.SPECIALIZATION },
      { value: breakdown.specializationDepth, threshold: thresholds.scalability, message: CAPABILITY_RECOMMENDATION_MESSAGES.SCALABILITY }
    ];

    checks.forEach(({ value, threshold, message }) => {
      if (value < threshold) recommendations.push(message);
    });

    return recommendations;
  }
}