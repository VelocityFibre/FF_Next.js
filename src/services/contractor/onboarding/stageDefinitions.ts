/**
 * Onboarding Stage Definitions - Backward Compatibility Layer
 * @deprecated Use './stages/index.ts' for improved modular stage system
 * 
 * This file provides backward compatibility for existing imports.
 * New code should use the modular stage system in ./stages/
 */

// import { DocumentType } from '@/types/contractor.types'; // Unused
import { OnboardingStage } from './types';
// import { DocumentRequirement } from './types'; // Unused
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

// Additional helper functions for backward compatibility
export function getDocumentRequirements(stageId: string): any[] {
  const stage = getStageById(stageId);
  return stage?.documents || [];
}

export function getRequiredDocumentTypes(stageId: string): string[] {
  const stage = getStageById(stageId);
  return stage?.documents?.filter((d: any) => d.required).map((d: any) => d.type) || [];
}

export function getStageIndex(stageId: string): number {
  const stages = getAllOnboardingStages();
  return stages.findIndex(stage => stage.id === stageId);
}

export function getNextStageId(currentStageId: string): string | null {
  const stages = getAllOnboardingStages();
  const currentIndex = getStageIndex(currentStageId);
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    return null;
  }
  return stages[currentIndex + 1].id;
}

export function getPreviousStageId(currentStageId: string): string | null {
  const stages = getAllOnboardingStages();
  const currentIndex = getStageIndex(currentStageId);
  if (currentIndex <= 0) {
    return null;
  }
  return stages[currentIndex - 1].id;
}

export function isFinalStage(stageId: string): boolean {
  const stages = getAllOnboardingStages();
  const currentIndex = getStageIndex(stageId);
  return currentIndex === stages.length - 1;
}

export function getStageDocuments(stageId: string): any[] {
  return getDocumentRequirements(stageId);
}

export function getStageCategories(): string[] {
  const stages = getAllOnboardingStages();
  const categories = new Set<string>();
  stages.forEach(stage => {
    if (stage.category) {
      categories.add(stage.category);
    }
  });
  return Array.from(categories);
}