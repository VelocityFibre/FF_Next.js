/**
 * @fileoverview Onboarding Types and Interfaces
 * Type definitions for contractor onboarding system
 */

export {
  OnboardingProgress,
  StageUpdateRequest,
  ApprovalRequest,
  RejectionRequest
} from './types';

// Additional types specific to modular onboarding
export interface OnboardingWorkflowData {
  contractorId: string;
  currentStage: string;
  progress: number;
  metadata: Record<string, any>;
}

export interface OnboardingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface OnboardingStepConfig {
  id: string;
  name: string;
  required: boolean;
  order: number;
  dependencies: string[];
}

export interface OnboardingAnalyticsData {
  completionRate: number;
  averageTime: number;
  stageBreakdown: Record<string, number>;
  trends: Record<string, number[]>;
}