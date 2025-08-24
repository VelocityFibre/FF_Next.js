/**
 * Contractor Onboarding Service - Index
 * Centralizes all onboarding exports
 */

// Core service (legacy - @deprecated, use modular services instead)
export { OnboardingCore, onboardingCore } from './onboardingCore';

// New modular services
export { OnboardingStepsService, onboardingStepsService } from './onboarding-steps';
export { OnboardingValidationService, onboardingValidationService } from './onboarding-validation';  
export { OnboardingWorkflowService, onboardingWorkflowService } from './onboarding-workflow';
export * from './onboarding-types';

// Progress tracking
export { ProgressTracker } from './progressTracker';

// Document management
export { DocumentManager } from './documentManager';

// Stage definitions
export {
  getOnboardingStages,
  getRequiredDocumentTypes,
  getDocumentRequirements,
  getStageById,
  getStageIndex,
  getNextStageId,
  getPreviousStageId,
  isFinalStage,
  getStageDocuments,
  getStageCategories
} from './stageDefinitions';

// Types and interfaces
export type {
  OnboardingStage,
  OnboardingChecklistItem,
  OnboardingProgress,
  OnboardingStatus,
  StageUpdateRequest,
  ApprovalRequest,
  RejectionRequest,
  DocumentRequirement,
  OnboardingStatistics,
  StageCompletionSummary,
  OnboardingWorkflowConfig
} from './types';

// Main service instance for backward compatibility
export { contractorOnboardingService } from './contractorOnboardingService';

// Default export for backward compatibility
export { contractorOnboardingService as default } from './contractorOnboardingService';