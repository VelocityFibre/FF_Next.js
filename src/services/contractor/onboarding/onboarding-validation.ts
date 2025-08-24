/**
 * @fileoverview Onboarding Validation and Approval
 * Handles validation logic and approval workflows
 */

import {
  OnboardingProgress,
  ApprovalRequest,
  RejectionRequest,
  OnboardingValidationResult
} from './onboarding-types';
import { OnboardingApprovalService } from './OnboardingApprovalService';

/**
 * Handles onboarding validation and approval processes
 */
export class OnboardingValidationService {
  private approvalService = new OnboardingApprovalService();

  /**
   * Submit contractor for final approval
   */
  async submitForApproval(contractorId: string): Promise<OnboardingProgress> {
    return this.approvalService.submitForApproval(contractorId);
  }

  /**
   * Approve contractor onboarding
   */
  async approveContractor(request: ApprovalRequest): Promise<OnboardingProgress> {
    return this.approvalService.approveContractor(request);
  }

  /**
   * Reject contractor onboarding
   */
  async rejectContractor(request: RejectionRequest): Promise<OnboardingProgress> {
    return this.approvalService.rejectContractor(request);
  }

  /**
   * Check if contractor can be submitted for approval
   */
  async canSubmitForApproval(contractorId: string): Promise<{ canSubmit: boolean; reason?: string }> {
    return this.approvalService.canSubmitForApproval(contractorId);
  }

  /**
   * Validate contractor data completeness
   */
  async validateContractorData(contractorId: string): Promise<OnboardingValidationResult> {
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];

    try {
      // Check if contractor can submit for approval
      const approvalCheck = await this.canSubmitForApproval(contractorId);
      
      if (!approvalCheck.canSubmit) {
        validationErrors.push(approvalCheck.reason || 'Cannot submit for approval');
      }

      return {
        isValid: validationErrors.length === 0,
        errors: validationErrors,
        warnings: validationWarnings
      };
    } catch (error) {
      validationErrors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        isValid: false,
        errors: validationErrors,
        warnings: validationWarnings
      };
    }
  }

  /**
   * Validate specific onboarding stage
   */
  async validateStage(contractorId: string, stageId: string): Promise<OnboardingValidationResult> {
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];

    // Stage-specific validation logic would go here
    // For now, return basic validation
    
    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }

  /**
   * Get validation requirements for a stage
   */
  async getStageRequirements(stageId: string): Promise<string[]> {
    const requirements: Record<string, string[]> = {
      'personal_info': [
        'Full name must be provided',
        'Valid email address required',
        'Phone number must be provided'
      ],
      'company_info': [
        'Company name required',
        'Valid business registration number',
        'Company address must be complete'
      ],
      'documents': [
        'ID document must be uploaded',
        'Proof of address required',
        'Business license must be valid'
      ],
      'verification': [
        'All documents must be verified',
        'Background check must be completed',
        'Reference checks must pass'
      ]
    };

    return requirements[stageId] || [];
  }

  /**
   * Perform comprehensive pre-approval validation
   */
  async performPreApprovalValidation(contractorId: string): Promise<OnboardingValidationResult> {
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];

    try {
      // Validate all stages
      const stages = ['personal_info', 'company_info', 'documents', 'verification'];
      
      for (const stageId of stages) {
        const stageValidation = await this.validateStage(contractorId, stageId);
        validationErrors.push(...stageValidation.errors);
        validationWarnings.push(...stageValidation.warnings);
      }

      // Overall contractor data validation
      const dataValidation = await this.validateContractorData(contractorId);
      validationErrors.push(...dataValidation.errors);
      validationWarnings.push(...dataValidation.warnings);

      return {
        isValid: validationErrors.length === 0,
        errors: validationErrors,
        warnings: validationWarnings
      };
    } catch (error) {
      validationErrors.push(`Pre-approval validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        isValid: false,
        errors: validationErrors,
        warnings: validationWarnings
      };
    }
  }
}

// Export service instance
export const onboardingValidationService = new OnboardingValidationService();