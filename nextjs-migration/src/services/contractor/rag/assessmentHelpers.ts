/**
 * Assessment Helper Methods
 * Utility functions for specific RAG assessments
 */

import { ContractorTeam, SKILL_LEVEL_SCORES } from './types';

/**
 * Assess technical skills based on team data
 */
export function assessTechnicalSkills(teams: ContractorTeam[]): number {
  if (teams.length === 0) return 60;
  
  // Calculate based on team member skills and certifications
  const avgSkillLevel = teams.reduce((sum, team) => {
    return sum + (SKILL_LEVEL_SCORES[team.skillLevel] || 60);
  }, 0) / teams.length;
  
  return Math.round(avgSkillLevel);
}

/**
 * Assess specialization depth based on team diversity
 */
export function assessSpecializationDepth(teams: ContractorTeam[]): number {
  if (teams.length === 0) return 60;
  
  // Calculate based on team specializations diversity
  const specializations = new Set(teams.map(team => team.teamType));
  return Math.min(100, specializations.size * 15 + 55);
}

/**
 * Calculate team experience distribution
 */
export function getTeamExperienceDistribution(teams: ContractorTeam[]): {
  junior: number;
  intermediate: number;
  senior: number;
  expert: number;
} {
  const distribution = {
    junior: 0,
    intermediate: 0,
    senior: 0,
    expert: 0
  };

  teams.forEach(team => {
    distribution[team.skillLevel]++;
  });

  return distribution;
}

/**
 * Calculate team skill diversity score
 */
export function calculateSkillDiversity(teams: ContractorTeam[]): number {
  if (teams.length === 0) return 0;

  const distribution = getTeamExperienceDistribution(teams);
  const totalMembers = teams.length;

  // Calculate diversity using Shannon diversity index
  let diversity = 0;
  Object.values(distribution).forEach(count => {
    if (count > 0) {
      const proportion = count / totalMembers;
      diversity -= proportion * Math.log2(proportion);
    }
  });

  // Normalize to 0-100 scale (log2(4) = 2 is maximum diversity for 4 skill levels)
  return Math.round((diversity / 2) * 100);
}

/**
 * Assess team composition balance
 */
export function assessTeamCompositionBalance(teams: ContractorTeam[]): {
  score: number;
  analysis: string;
} {
  if (teams.length === 0) {
    return {
      score: 0,
      analysis: 'No team data available'
    };
  }

  const distribution = getTeamExperienceDistribution(teams);
  const totalMembers = teams.length;

  // Ideal distribution percentages
  const idealDistribution = {
    junior: 0.3,    // 30% junior
    intermediate: 0.4, // 40% intermediate  
    senior: 0.25,   // 25% senior
    expert: 0.05    // 5% expert
  };

  // Calculate deviation from ideal
  let deviationScore = 0;
  let analysis = '';

  Object.entries(distribution).forEach(([level, count]) => {
    const actualPercentage = count / totalMembers;
    const idealPercentage = idealDistribution[level as keyof typeof idealDistribution];
    const deviation = Math.abs(actualPercentage - idealPercentage);
    deviationScore += deviation;
  });

  // Convert deviation to score (lower deviation = higher score)
  const score = Math.max(0, Math.round(100 - (deviationScore * 100)));

  // Generate analysis
  if (score >= 80) {
    analysis = 'Well-balanced team composition';
  } else if (score >= 60) {
    analysis = 'Good team composition with minor imbalances';
  } else if (score >= 40) {
    analysis = 'Team composition needs improvement';
  } else {
    analysis = 'Team composition significantly imbalanced';
  }

  return { score, analysis };
}

/**
 * Calculate team scaling potential
 */
export function calculateTeamScalingPotential(teams: ContractorTeam[]): number {
  if (teams.length === 0) return 50;

  const distribution = getTeamExperienceDistribution(teams);
  
  // Senior and expert members can mentor and scale teams effectively
  const mentorCapacity = distribution.senior + distribution.expert;
  const juniorMembers = distribution.junior + distribution.intermediate;
  
  // Good scaling potential requires adequate senior leadership
  const scalingRatio = mentorCapacity / Math.max(1, juniorMembers);
  
  // Score based on ratio (ideal is 1:3 to 1:5)
  let score = 50; // Base score
  
  if (scalingRatio >= 0.2 && scalingRatio <= 0.33) {
    score = 90; // Optimal ratio
  } else if (scalingRatio >= 0.15 && scalingRatio <= 0.5) {
    score = 80; // Good ratio
  } else if (scalingRatio >= 0.1 && scalingRatio <= 0.6) {
    score = 70; // Acceptable ratio
  } else {
    score = 60; // Suboptimal ratio
  }

  return Math.min(100, score);
}

/**
 * Assess team specialization coverage
 */
export function assessSpecializationCoverage(
  teams: ContractorTeam[], 
  requiredSpecializations: string[] = []
): {
  score: number;
  coverage: string[];
  missing: string[];
} {
  const availableSpecializations = new Set(teams.map(team => team.teamType));
  const requiredSet = new Set(requiredSpecializations);

  const coverage = requiredSpecializations.filter(spec => availableSpecializations.has(spec));
  const missing = requiredSpecializations.filter(spec => !availableSpecializations.has(spec));

  // Calculate coverage percentage
  const coveragePercentage = requiredSpecializations.length > 0 
    ? (coverage.length / requiredSpecializations.length) * 100
    : 100;

  // Bonus points for additional specializations beyond requirements
  const additionalSpecs = Array.from(availableSpecializations).filter(
    spec => !requiredSet.has(spec)
  );
  const bonusScore = Math.min(20, additionalSpecs.length * 5);

  const score = Math.min(100, coveragePercentage + bonusScore);

  return {
    score: Math.round(score),
    coverage,
    missing
  };
}

/**
 * Calculate team readiness score
 */
export function calculateTeamReadiness(teams: ContractorTeam[]): {
  score: number;
  factors: {
    size: number;
    experience: number;
    diversity: number;
    specialization: number;
  };
} {
  if (teams.length === 0) {
    return {
      score: 0,
      factors: {
        size: 0,
        experience: 0,
        diversity: 0,
        specialization: 0
      }
    };
  }

  // Size factor (optimal team size is 3-8 members)
  const size = Math.min(100, teams.length >= 3 ? 
    (teams.length <= 8 ? 100 : Math.max(60, 100 - (teams.length - 8) * 5)) : 
    teams.length * 25
  );

  // Experience factor (based on skill level distribution)
  const experience = assessTechnicalSkills(teams);

  // Diversity factor (skill level diversity)
  const diversity = calculateSkillDiversity(teams);

  // Specialization factor (number of different specializations)
  const specialization = assessSpecializationDepth(teams);

  // Calculate weighted average
  const score = Math.round(
    size * 0.2 +
    experience * 0.35 +
    diversity * 0.25 +
    specialization * 0.2
  );

  return {
    score,
    factors: {
      size: Math.round(size),
      experience: Math.round(experience),
      diversity: Math.round(diversity),
      specialization: Math.round(specialization)
    }
  };
}

/**
 * Generate team improvement recommendations
 */
export function generateTeamRecommendations(teams: ContractorTeam[]): string[] {
  const recommendations: string[] = [];
  
  if (teams.length === 0) {
    recommendations.push('Build a core team with diverse skill sets');
    return recommendations;
  }

  const distribution = getTeamExperienceDistribution(teams);
  const totalMembers = teams.length;
  const balance = assessTeamCompositionBalance(teams);

  // Size recommendations
  if (totalMembers < 3) {
    recommendations.push('Expand team size to at least 3 members for project resilience');
  } else if (totalMembers > 12) {
    recommendations.push('Consider splitting large team into specialized sub-teams');
  }

  // Experience distribution recommendations
  if (distribution.senior + distribution.expert === 0) {
    recommendations.push('Add senior team members for leadership and mentoring');
  }

  if (distribution.expert === 0 && totalMembers > 5) {
    recommendations.push('Consider adding expert-level specialists for complex projects');
  }

  // Balance recommendations
  if (balance.score < 60) {
    recommendations.push('Rebalance team composition for optimal performance');
  }

  // Specialization recommendations
  const specializations = new Set(teams.map(team => team.teamType));
  if (specializations.size < 2 && totalMembers > 2) {
    recommendations.push('Diversify team specializations to handle varied project requirements');
  }

  return recommendations;
}