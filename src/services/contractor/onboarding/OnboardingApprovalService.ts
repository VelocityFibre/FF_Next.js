/**
 * Onboarding Approval Service
 * Handles approval and rejection workflows
 */

import {
  OnboardingProgress,
  ApprovalRequest,
  RejectionRequest
} from './types';
import { ProgressTracker } from './progressTracker';
import { DocumentManager } from './documentManager';
import { OnboardingProgressManager } from './OnboardingProgressManager';
import { OnboardingDatabaseService } from './OnboardingDatabaseService';
import { log } from '@/lib/logger';

export class OnboardingApprovalService {
  private progressManager = new OnboardingProgressManager();
  private databaseService = new OnboardingDatabaseService();

  /**
   * Submit contractor for final approval
   */
  async submitForApproval(_contractorId: string): Promise<OnboardingProgress> {
    try {
      const progress = await this.progressManager.getProgress(contractorId);
      
      // Validate submission eligibility
      const { canSubmit, reason } = ProgressTracker.canSubmitForApproval(progress);
      if (!canSubmit) {
        throw new Error(`Cannot submit for approval: ${reason}`);
      }

      // Validate all required documents
      const documentValidation = await DocumentManager.validateRequiredDocuments(contractorId);
      if (!documentValidation.isValid) {
        const missingDocs = documentValidation.missingDocuments;
        const unverifiedDocs = documentValidation.unverifiedDocuments;
        
        let errorMessage = 'Cannot submit for approval:';
        if (missingDocs.length > 0) {
          errorMessage += ` Missing documents: ${missingDocs.join(', ')}.`;
        }
        if (unverifiedDocs.length > 0) {
          errorMessage += ` Unverified documents: ${unverifiedDocs.join(', ')}.`;
        }
        
        throw new Error(errorMessage);
      }

      // Update status to completed (ready for approval)
      progress.overallStatus = 'completed';
      progress.lastUpdated = new Date();

      // In production, trigger approval workflow notification
      return progress;
    } catch (error) {
      log.error('Failed to submit for approval:', { data: error }, 'OnboardingApprovalService');
      throw error;
    }
  }

  /**
   * Approve contractor onboarding
   */
  async approveContractor(request: ApprovalRequest): Promise<OnboardingProgress> {
    try {
      const { contractorId, approvedBy, notes } = request;
      const progress = await this.progressManager.getProgress(contractorId);
      
      if (progress.overallStatus !== 'completed') {
        throw new Error('Cannot approve - onboarding not completed');
      }

      // Update progress status
      progress.overallStatus = 'approved';
      progress.approvedBy = approvedBy;
      progress.approvedAt = new Date();
      progress.lastUpdated = new Date();

      // Update contractor status in database
      await this.databaseService.updateContractorStatus(contractorId, 'active', true);

      // In production, trigger post-approval workflows
      // - Send welcome email
      // - Create contractor portal access
      // - Notify relevant teams

      return progress;
    } catch (error) {
      log.error('Failed to approve contractor:', { data: error }, 'OnboardingApprovalService');
      throw error;
    }
  }

  /**
   * Reject contractor onboarding
   */
  async rejectContractor(request: RejectionRequest): Promise<OnboardingProgress> {
    try {
      const { contractorId, rejectedBy, rejectionReason, notes } = request;
      const progress = await this.progressManager.getProgress(contractorId);
      
      // Update progress status
      progress.overallStatus = 'rejected';
      progress.rejectionReason = rejectionReason;
      progress.lastUpdated = new Date();

      // Update contractor status in database
      await this.databaseService.updateContractorStatus(contractorId, 'rejected', false);

      // In production, trigger rejection workflows
      // - Send rejection notification
      // - Log rejection reason
      // - Schedule follow-up if applicable

      return progress;
    } catch (error) {
      log.error('Failed to reject contractor:', { data: error }, 'OnboardingApprovalService');
      throw error;
    }
  }

  /**
   * Check if contractor can be submitted for approval
   */
  async canSubmitForApproval(_contractorId: string): Promise<{ canSubmit: boolean; reason?: string }> {
    try {
      const progress = await this.progressManager.getProgress(contractorId);
      return ProgressTracker.canSubmitForApproval(progress);
    } catch (error) {
      log.error('Failed to check submission eligibility:', { data: error }, 'OnboardingApprovalService');
      return { canSubmit: false, reason: 'Error checking eligibility' };
    }
  }

  /**
   * Get approval history for a contractor
   */
  async getApprovalHistory(__contractorId: string): Promise<Array<{
    action: 'approved' | 'rejected' | 'submitted';
    timestamp: Date;
    by?: string;
    reason?: string;
    notes?: string;
  }>> {
    // In production, this would fetch from database
    // For now, return empty history
    return [];
  }
}