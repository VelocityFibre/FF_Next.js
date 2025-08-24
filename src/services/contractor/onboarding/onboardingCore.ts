/**
 * Onboarding Core Service
 * Main orchestrator for contractor onboarding workflow
 * 
 * @deprecated This service has been split into modular components:
 * - onboarding-steps.ts for step management
 * - onboarding-validation.ts for validation and approval
 * - onboarding-workflow.ts for workflow orchestration
 * - onboarding-types.ts for type definitions
 * 
 * Please use the new modular services instead of this monolithic service.
 * This service is maintained for backward compatibility only.
 */

import {
  OnboardingProgress,
  StageUpdateRequest,
  ApprovalRequest,
  RejectionRequest
} from './types';
import { OnboardingProgressManager } from './OnboardingProgressManager';
import { OnboardingApprovalService } from './OnboardingApprovalService';
import { OnboardingAnalyticsService } from './OnboardingAnalyticsService';
import { OnboardingDatabaseService } from './OnboardingDatabaseService';

/**
 * Core onboarding service - orchestrates all onboarding operations
 */
export class OnboardingCore {
  private progressManager = new OnboardingProgressManager();
  private approvalService = new OnboardingApprovalService();
  private analyticsService = new OnboardingAnalyticsService();
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
   * Get onboarding analytics
   */
  async getOnboardingAnalytics(contractorIds?: string[]): Promise<any> {
    return this.analyticsService.getOnboardingAnalytics(contractorIds);
  }

  /**
   * Check if contractor can be submitted for approval
   */
  async canSubmitForApproval(contractorId: string): Promise<{ canSubmit: boolean; reason?: string }> {
    return this.approvalService.canSubmitForApproval(contractorId);
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
   * Get all active contractor IDs
   */
  async getAllActiveContractorIds(): Promise<string[]> {
    return this.databaseService.getAllActiveContractorIds();
  }
}

// Export singleton instance
export const onboardingCore = new OnboardingCore();