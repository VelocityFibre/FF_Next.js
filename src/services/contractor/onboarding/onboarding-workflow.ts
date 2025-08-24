/**
 * @fileoverview Onboarding Workflow Orchestrator
 * Main workflow coordination and analytics aggregation
 */

import {
  OnboardingProgress,
  OnboardingAnalyticsData
} from './onboarding-types';
import { OnboardingAnalyticsService } from './OnboardingAnalyticsService';
import { onboardingStepsService } from './onboarding-steps';
import { onboardingValidationService } from './onboarding-validation';

/**
 * Main workflow orchestrator for contractor onboarding
 */
export class OnboardingWorkflowService {
  private analyticsService = new OnboardingAnalyticsService();

  /**
   * Get onboarding analytics
   */
  async getOnboardingAnalytics(contractorIds?: string[]): Promise<any> {
    return this.analyticsService.getOnboardingAnalytics(contractorIds);
  }

  /**
   * Get completion statistics
   */
  async getCompletionStats() {
    return this.analyticsService.getCompletionStats();
  }

  /**
   * Get approval statistics
   */
  async getApprovalStats() {
    return this.analyticsService.getApprovalStats();
  }

  /**
   * Generate comprehensive onboarding report
   */
  async generateReport(contractorId?: string) {
    return this.analyticsService.generateReport(contractorId);
  }

  /**
   * Get stage analytics
   */
  async getStageAnalytics() {
    return this.analyticsService.getStageAnalytics();
  }

  /**
   * Get trend analysis
   */
  async getTrendAnalysis(months: number = 6) {
    return this.analyticsService.getTrendAnalysis(months);
  }

  /**
   * Execute complete onboarding workflow for a contractor
   */
  async executeWorkflow(contractorId: string): Promise<{
    progress: OnboardingProgress;
    validation: any;
    analytics: OnboardingAnalyticsData;
  }> {
    try {
      // Get current progress
      const progress = await onboardingStepsService.getOnboardingProgress(contractorId);
      
      // Validate current state
      const validation = await onboardingValidationService.validateContractorData(contractorId);
      
      // Get analytics for this contractor
      const analytics = await this.getOnboardingAnalytics([contractorId]);

      return {
        progress,
        validation,
        analytics
      };
    } catch (error) {
      throw new Error(`Workflow execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get comprehensive onboarding status for multiple contractors
   */
  async getBulkWorkflowStatus(contractorIds: string[]): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    try {
      // Get bulk progress
      const progressMap = await onboardingStepsService.getBulkProgress(contractorIds);
      
      // Process each contractor
      for (const contractorId of contractorIds) {
        const progress = progressMap.get(contractorId);
        const validation = await onboardingValidationService.validateContractorData(contractorId);
        
        results.set(contractorId, {
          progress,
          validation,
          canSubmitForApproval: validation.isValid
        });
      }

      return results;
    } catch (error) {
      throw new Error(`Bulk workflow status failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process onboarding advancement for a contractor
   */
  async advanceWorkflow(contractorId: string, currentStage: string): Promise<{
    success: boolean;
    nextStage?: string;
    message: string;
  }> {
    try {
      // Validate current stage
      const validation = await onboardingValidationService.validateStage(contractorId, currentStage);
      
      if (!validation.isValid) {
        return {
          success: false,
          message: `Stage validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Get step configuration to determine next stage
      const stepConfig = await onboardingStepsService.getStepConfiguration();
      const currentStepIndex = stepConfig.findIndex(step => step.id === currentStage);
      
      if (currentStepIndex === -1) {
        return {
          success: false,
          message: 'Invalid current stage'
        };
      }

      // Check if this is the final stage
      if (currentStepIndex === stepConfig.length - 1) {
        // Check if ready for final approval
        const canSubmit = await onboardingValidationService.canSubmitForApproval(contractorId);
        
        if (canSubmit.canSubmit) {
          return {
            success: true,
            message: 'Ready for final approval'
          };
        } else {
          return {
            success: false,
            message: canSubmit.reason || 'Not ready for approval'
          };
        }
      }

      // Advance to next stage
      const nextStep = stepConfig[currentStepIndex + 1];
      
      return {
        success: true,
        nextStage: nextStep.id,
        message: `Advanced to ${nextStep.name}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Workflow advancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export service instance
export const onboardingWorkflowService = new OnboardingWorkflowService();