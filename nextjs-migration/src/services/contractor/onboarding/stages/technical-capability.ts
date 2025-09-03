/**
 * Technical Capability Stage - Onboarding stage definition
 */

import { DocumentType } from '@/types/contractor.types';
import { OnboardingStage } from '../types';

export const technicalCapabilityStage: OnboardingStage = {
  id: 'technical_capability',
  name: 'Technical Capability',
  description: 'Technical expertise and capability assessment',
  required: true,
  completed: false,
  documents: [
    'technical_portfolio' as DocumentType,
    'equipment_list' as DocumentType,
    'staff_qualifications' as DocumentType
  ],
  checklist: [
    {
      id: 'portfolio_reviewed',
      description: 'Technical portfolio reviewed and approved',
      completed: false,
      required: true,
      category: 'technical'
    },
    {
      id: 'equipment_verified',
      description: 'Equipment list verified and adequate',
      completed: false,
      required: true,
      category: 'technical'
    },
    {
      id: 'staff_qualified',
      description: 'Key staff qualifications verified',
      completed: false,
      required: true,
      category: 'technical'
    },
    {
      id: 'experience_validated',
      description: 'Relevant project experience validated',
      completed: false,
      required: true,
      category: 'technical'
    },
    {
      id: 'capacity_assessment',
      description: 'Current capacity assessment completed',
      completed: false,
      required: true,
      category: 'technical'
    }
  ]
};

/**
 * Validate technical capability stage completion
 */
export function validateTechnicalCapabilityStage(data: any): boolean {
  return !!(
    data.technicalPortfolio?.approved &&
    data.equipmentList?.verified &&
    data.staffQualifications?.validated &&
    data.relevantExperience?.years >= 2
  );
}

/**
 * Get technical capability requirements
 */
export function getTechnicalCapabilityRequirements(): string[] {
  return [
    'Technical portfolio with project examples',
    'Comprehensive equipment inventory',
    'Staff qualifications and certifications',
    'Minimum 2 years relevant experience',
    'Current project capacity assessment',
    'Quality management system certification',
    'Health and safety management plan'
  ];
}

/**
 * Calculate technical capability score
 */
export function calculateTechnicalCapabilityScore(data: any): number {
  let score = 0;
  const maxScore = 100;
  
  // Portfolio quality (25 points)
  if (data.portfolioScore >= 80) {
    score += 25;
  } else if (data.portfolioScore >= 60) {
    score += 20;
  } else if (data.portfolioScore >= 40) {
    score += 15;
  }
  
  // Equipment adequacy (20 points)
  if (data.equipmentScore >= 90) {
    score += 20;
  } else if (data.equipmentScore >= 70) {
    score += 15;
  } else if (data.equipmentScore >= 50) {
    score += 10;
  }
  
  // Staff qualifications (25 points)
  if (data.staffQualificationScore >= 85) {
    score += 25;
  } else if (data.staffQualificationScore >= 65) {
    score += 20;
  } else if (data.staffQualificationScore >= 45) {
    score += 15;
  }
  
  // Experience (20 points)
  const experienceYears = data.relevantExperience?.years || 0;
  if (experienceYears >= 10) {
    score += 20;
  } else if (experienceYears >= 5) {
    score += 15;
  } else if (experienceYears >= 2) {
    score += 10;
  }
  
  // Current capacity (10 points)
  if (data.currentCapacity?.percentage <= 70) {
    score += 10;
  } else if (data.currentCapacity?.percentage <= 85) {
    score += 5;
  }
  
  return Math.min(score, maxScore);
}

/**
 * Assess project suitability
 */
export function assessProjectSuitability(contractorData: any, projectRequirements: any): {
  suitable: boolean;
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 0;
  
  // Check experience match
  if (contractorData.relevantExperience?.years >= projectRequirements.minExperience) {
    score += 30;
    reasons.push('Meets minimum experience requirement');
  } else {
    reasons.push('Insufficient relevant experience');
  }
  
  // Check capacity availability
  if (contractorData.currentCapacity?.percentage <= 80) {
    score += 25;
    reasons.push('Has adequate capacity');
  } else {
    reasons.push('Limited current capacity');
  }
  
  // Check technical capabilities
  if (contractorData.technicalCapabilities?.includes(projectRequirements.techRequirement)) {
    score += 25;
    reasons.push('Has required technical capabilities');
  } else {
    reasons.push('Missing required technical capabilities');
  }
  
  // Check geographic coverage
  if (contractorData.servicingAreas?.includes(projectRequirements.location)) {
    score += 20;
    reasons.push('Services required location');
  } else {
    reasons.push('Does not service required location');
  }
  
  return {
    suitable: score >= 60,
    score,
    reasons
  };
}