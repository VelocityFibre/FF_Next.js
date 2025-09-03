/**
 * @fileoverview Onboarding Steps Management
 * Handles step progression and progress tracking
 */

import {
  OnboardingProgress,
  StageUpdateRequest,
  // OnboardingWorkflowData, // Unused
  OnboardingStepConfig
} from './onboarding-types';
import { OnboardingProgressManager } from './OnboardingProgressManager';
import { OnboardingDatabaseService } from './OnboardingDatabaseService';

/**
 * Manages onboarding steps and progress tracking
 */
export class OnboardingStepsService {
  private progressManager = new OnboardingProgressManager();
  private databaseService = new OnboardingDatabaseService();

  /**
   * Initialize onboarding process for a new contractor
   */
  async initializeOnboarding(contractorId: string): Promise<OnboardingProgress> {
    return this.progressManager.initializeProgress(contractorId);
  }

  /**
   * Get current onboarding progress for a contractor
   */
  async getOnboardingProgress(contractorId: string): Promise<OnboardingProgress> {
    return this.progressManager.getProgress(contractorId);
  }

  /**
   * Update onboarding stage completion
   */
  async updateStageCompletion(request: StageUpdateRequest): Promise<OnboardingProgress> {
    return this.progressManager.updateStageCompletion(request);
  }

  /**
   * Reset onboarding process (for resubmission after rejection)
   */
  async resetOnboarding(contractorId: string): Promise<OnboardingProgress> {
    return this.progressManager.resetProgress(contractorId);
  }

  /**
   * Get onboarding progress for multiple contractors
   */
  async getBulkProgress(contractorIds: string[]): Promise<Map<string, OnboardingProgress>> {
    return this.progressManager.getBulkProgress(contractorIds);
  }

  /**
   * Get all active contractor IDs
   */
  async getAllActiveContractorIds(): Promise<string[]> {
    return this.databaseService.getAllActiveContractorIds();
  }

  /**
   * Get step configuration for current onboarding flow
   */
  async getStepConfiguration(): Promise<OnboardingStepConfig[]> {
    // Return standardized step configuration
    return [
      {
        id: 'personal_info',
        name: 'Personal Information',
        required: true,
        order: 1,
        dependencies: []
      },
      {
        id: 'company_info',
        name: 'Company Information',
        required: true,
        order: 2,
        dependencies: ['personal_info']
      },
      {
        id: 'documents',
        name: 'Document Upload',
        required: true,
        order: 3,
        dependencies: ['company_info']
      },
      {
        id: 'verification',
        name: 'Verification',
        required: true,
        order: 4,
        dependencies: ['documents']
      }
    ];
  }

  /**
   * Calculate overall progress percentage
   */
  async calculateProgressPercentage(contractorId: string): Promise<number> {
    const progress = await this.getOnboardingProgress(contractorId);
    const totalSteps = (await this.getStepConfiguration()).length;
    const completedSteps = progress.completedStages?.length || 0;
    return Math.round((completedSteps / totalSteps) * 100);
  }
}

// Export service instance
export const onboardingStepsService = new OnboardingStepsService();