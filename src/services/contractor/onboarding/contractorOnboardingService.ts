/**
 * Contractor Onboarding Service - Main Instance
 * Provides the main onboarding service interface
 */

import { onboardingCore } from './onboardingCore';
import { StageUpdateRequest, ApprovalRequest, RejectionRequest } from './types';

// Create wrapper class to maintain API compatibility
class ContractorOnboardingService {
  /**
   * Initialize onboarding process for a new contractor
   */
  async initializeOnboarding(contractorId: string) {
    return onboardingCore.initializeOnboarding(contractorId);
  }

  /**
   * Get current onboarding progress for a contractor
   */
  async getOnboardingProgress(contractorId: string) {
    return onboardingCore.getOnboardingProgress(contractorId);
  }

  /**
   * Update onboarding stage completion
   */
  async updateStageCompletion(
    contractorId: string,
    stageId: string,
    checklistItemId: string,
    completed: boolean
  ) {
    const request: StageUpdateRequest = {
      contractorId,
      stageId,
      checklistItemId,
      completed
    };
    return onboardingCore.updateStageCompletion(request);
  }

  /**
   * Submit contractor for final approval
   */
  async submitForApproval(contractorId: string) {
    return onboardingCore.submitForApproval(contractorId);
  }

  /**
   * Approve contractor onboarding
   */
  async approveContractor(contractorId: string, approvedBy: string) {
    const request: ApprovalRequest = {
      contractorId,
      approvedBy
    };
    return onboardingCore.approveContractor(request);
  }

  /**
   * Reject contractor onboarding
   */
  async rejectContractor(
    contractorId: string,
    rejectionReason: string,
    rejectedBy: string
  ) {
    const request: RejectionRequest = {
      contractorId,
      rejectedBy,
      rejectionReason
    };
    return onboardingCore.rejectContractor(request);
  }

  /**
   * Reset onboarding process
   */
  async resetOnboarding(contractorId: string) {
    return onboardingCore.resetOnboarding(contractorId);
  }

  /**
   * Get bulk onboarding progress
   */
  async getBulkProgress(contractorIds: string[]) {
    return onboardingCore.getBulkProgress(contractorIds);
  }

  /**
   * Get onboarding analytics
   */
  async getOnboardingAnalytics(contractorIds?: string[]) {
    return onboardingCore.getOnboardingAnalytics(contractorIds);
  }
}

// Export singleton instance
export const contractorOnboardingService = new ContractorOnboardingService();