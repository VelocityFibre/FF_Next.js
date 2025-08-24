/**
 * Onboarding Stage Definitions - Backward Compatibility Layer
 * @deprecated Use './stages/index.ts' for improved modular stage system
 * 
 * This file provides backward compatibility for existing imports.
 * New code should use the modular stage system in ./stages/
 */

import { DocumentType } from '@/types/contractor.types';
import { OnboardingStage, DocumentRequirement } from './types';
import { 
  getAllOnboardingStages,
  getStageById,
  getRequiredStages,
  calculateOnboardingProgress
} from './stages';

/**
 * Get predefined onboarding stages
 * @deprecated Use getAllOnboardingStages from './stages' instead
 */
export function getOnboardingStages(): OnboardingStage[] {
  return getAllOnboardingStages();
}

/**
 * Get stage by ID
 * @deprecated Use getStageById from './stages' instead  
 */
export function getStageDefinition(stageId: string): OnboardingStage | undefined {
  return getStageById(stageId);
}

/**
 * Get required stages
 * @deprecated Use getRequiredStages from './stages' instead
 */
export function getRequiredOnboardingStages(): OnboardingStage[] {
  return getRequiredStages();
}

/**
 * Calculate progress
 * @deprecated Use calculateOnboardingProgress from './stages' instead
 */
export function calculateProgress(completedStages: string[]): {
  percentage: number;
  completed: number;
  total: number;
  remaining: string[];
} {
  return calculateOnboardingProgress(completedStages);
}

// Re-export everything from the new modular structure for convenience
export * from './stages';