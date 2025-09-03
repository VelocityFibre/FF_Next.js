/**
 * Onboarding Stages - Barrel export
 */

export { companyInfoStage, validateCompanyInfoStage, getCompanyInfoRequirements } from './company-info';
export { financialInfoStage, validateFinancialInfoStage, getFinancialInfoRequirements, calculateFinancialHealthScore } from './financial-info';
export { complianceStage, validateComplianceStage, getComplianceRequirements, calculateComplianceScore, checkExpiringCertificates } from './compliance';
export { technicalCapabilityStage, validateTechnicalCapabilityStage, getTechnicalCapabilityRequirements, calculateTechnicalCapabilityScore, assessProjectSuitability } from './technical-capability';

import { companyInfoStage } from './company-info';
import { financialInfoStage } from './financial-info';
import { complianceStage } from './compliance';
import { technicalCapabilityStage } from './technical-capability';
import { OnboardingStage } from '../types';

/**
 * Get all predefined onboarding stages
 */
export function getAllOnboardingStages(): OnboardingStage[] {
  return [
    companyInfoStage,
    financialInfoStage,
    complianceStage,
    technicalCapabilityStage
  ];
}

/**
 * Get stage by ID
 */
export function getStageById(stageId: string): OnboardingStage | undefined {
  const stages = getAllOnboardingStages();
  return stages.find(stage => stage.id === stageId);
}

/**
 * Get required stages only
 */
export function getRequiredStages(): OnboardingStage[] {
  return getAllOnboardingStages().filter(stage => stage.required);
}

/**
 * Calculate overall onboarding progress
 */
export function calculateOnboardingProgress(completedStages: string[]): {
  percentage: number;
  completed: number;
  total: number;
  remaining: string[];
} {
  // const allStages = getAllOnboardingStages(); // Unused - kept for potential debugging
  const requiredStages = getRequiredStages();
  
  const completedRequired = completedStages.filter(stageId => 
    requiredStages.some(stage => stage.id === stageId)
  );
  
  const remaining = requiredStages
    .filter(stage => !completedStages.includes(stage.id))
    .map(stage => stage.id);
  
  return {
    percentage: Math.round((completedRequired.length / requiredStages.length) * 100),
    completed: completedRequired.length,
    total: requiredStages.length,
    remaining
  };
}