/**
 * Progress Tracker
 * Handles onboarding progress calculation and status management
 */

import {
  OnboardingProgress,
  OnboardingStage,
  OnboardingStatus,
  StageCompletionSummary,
  OnboardingStatistics
} from './types';
import { getOnboardingStages } from './stageDefinitions';

/**
 * Progress calculation utilities
 */
export class ProgressTracker {
  /**
   * Calculate overall completion percentage
   */
  static calculateCompletionPercentage(stages: OnboardingStage[]): number {
    const totalStages = stages.filter(stage => stage.required).length;
    const completedStages = stages.filter(stage => stage.required && stage.completed).length;
    
    if (totalStages === 0) return 0;
    return Math.round((completedStages / totalStages) * 100);
  }

  /**
   * Determine current stage index
   */
  static getCurrentStageIndex(stages: OnboardingStage[]): number {
    const completedStages = stages.filter(stage => stage.completed).length;
    return completedStages < stages.length ? completedStages : stages.length - 1;
  }

  /**
   * Determine overall onboarding status
   */
  static determineOverallStatus(
    completionPercentage: number,
    stages: OnboardingStage[],
    isApproved?: boolean,
    isRejected?: boolean
  ): OnboardingStatus {
    if (isRejected) return 'rejected';
    if (isApproved) return 'approved';
    if (completionPercentage === 0) return 'not_started';
    if (completionPercentage === 100) return 'completed';
    return 'in_progress';
  }

  /**
   * Update stage completion based on checklist
   */
  static updateStageCompletion(stage: OnboardingStage): OnboardingStage {
    const requiredItems = stage.checklist.filter(item => item.required);
    const completedRequiredItems = requiredItems.filter(item => item.completed);
    
    stage.completed = requiredItems.length > 0 && requiredItems.length === completedRequiredItems.length;
    
    return stage;
  }

  /**
   * Get stage completion summary
   */
  static getStageCompletionSummary(stage: OnboardingStage): StageCompletionSummary {
    const requiredItems = stage.checklist.filter(item => item.required);
    const completedItems = stage.checklist.filter(item => item.completed);
    const completedRequiredItems = requiredItems.filter(item => item.completed);
    
    const completionPercentage = requiredItems.length > 0 
      ? Math.round((completedRequiredItems.length / requiredItems.length) * 100)
      : 0;

    // Identify blockers (incomplete required items)
    const blockers = requiredItems
      .filter(item => !item.completed)
      .map(item => item.description);

    return {
      stageId: stage.id,
      stageName: stage.name,
      requiredItems: requiredItems.length,
      completedItems: completedItems.length,
      completionPercentage,
      isCompleted: stage.completed,
      blockers
    };
  }

  /**
   * Get progress statistics for multiple contractors
   */
  static getOnboardingStatistics(progressList: OnboardingProgress[]): OnboardingStatistics {
    const total = progressList.length;
    const notStarted = progressList.filter(p => p.overallStatus === 'not_started').length;
    const inProgress = progressList.filter(p => p.overallStatus === 'in_progress').length;
    const completed = progressList.filter(p => p.overallStatus === 'completed').length;
    const approved = progressList.filter(p => p.overallStatus === 'approved').length;
    const rejected = progressList.filter(p => p.overallStatus === 'rejected').length;

    // Calculate average completion time for approved contractors
    const approvedWithDates = progressList.filter(p => 
      p.overallStatus === 'approved' && p.approvedAt
    );
    
    const averageCompletionTime = approvedWithDates.length > 0
      ? approvedWithDates.reduce((sum, p) => {
          const completionTime = Math.floor(
            (p.approvedAt!.getTime() - p.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + Math.max(1, completionTime); // At least 1 day
        }, 0) / approvedWithDates.length
      : 0;

    // Find most common stuck stage
    const inProgressContractors = progressList.filter(p => p.overallStatus === 'in_progress');
    const stageFrequency: Record<string, number> = {};
    
    inProgressContractors.forEach(p => {
      const currentStage = p.stages[p.currentStage];
      if (currentStage) {
        stageFrequency[currentStage.name] = (stageFrequency[currentStage.name] || 0) + 1;
      }
    });

    const mostCommonStuckStage = Object.entries(stageFrequency)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    return {
      totalContractors: total,
      notStarted,
      inProgress,
      completed,
      approved,
      rejected,
      averageCompletionTime,
      mostCommonStuckStage
    };
  }

  /**
   * Check if contractor can be submitted for approval
   */
  static canSubmitForApproval(progress: OnboardingProgress): {
    canSubmit: boolean;
    reason?: string;
  } {
    if (progress.completionPercentage < 100) {
      return {
        canSubmit: false,
        reason: 'Onboarding is not 100% complete'
      };
    }

    if (progress.overallStatus === 'approved') {
      return {
        canSubmit: false,
        reason: 'Contractor is already approved'
      };
    }

    if (progress.overallStatus === 'rejected') {
      return {
        canSubmit: false,
        reason: 'Contractor has been rejected'
      };
    }

    return { canSubmit: true };
  }

  /**
   * Get next required action for contractor
   */
  static getNextAction(progress: OnboardingProgress): {
    action: string;
    description: string;
    stageId?: string;
    urgent: boolean;
  } {
    switch (progress.overallStatus) {
      case 'not_started':
        return {
          action: 'start_onboarding',
          description: 'Begin the onboarding process by completing company information',
          stageId: progress.stages[0]?.id,
          urgent: false
        };

      case 'in_progress':
        const currentStage = progress.stages[progress.currentStage];
        if (currentStage) {
          const incompleteTasks = currentStage.checklist
            .filter(item => item.required && !item.completed);
          
          if (incompleteTasks.length > 0) {
            return {
              action: 'complete_tasks',
              description: `Complete ${incompleteTasks.length} remaining task(s) in ${currentStage.name}`,
              stageId: currentStage.id,
              urgent: incompleteTasks.length <= 2
            };
          }
        }
        return {
          action: 'advance_stage',
          description: 'Move to the next onboarding stage',
          urgent: false
        };

      case 'completed':
        return {
          action: 'submit_approval',
          description: 'Submit contractor for final approval',
          urgent: true
        };

      case 'approved':
        return {
          action: 'none',
          description: 'Contractor is fully onboarded and approved',
          urgent: false
        };

      case 'rejected':
        return {
          action: 'review_rejection',
          description: 'Review rejection reasons and address concerns',
          urgent: true
        };

      default:
        return {
          action: 'unknown',
          description: 'Status unknown - please review',
          urgent: true
        };
    }
  }

  /**
   * Calculate days since last update
   */
  static getDaysSinceLastUpdate(lastUpdated: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastUpdated.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if onboarding is stalled
   */
  static isStalled(progress: OnboardingProgress, stalledThresholdDays: number = 7): boolean {
    if (progress.overallStatus === 'approved' || progress.overallStatus === 'rejected') {
      return false;
    }

    const daysSinceUpdate = this.getDaysSinceLastUpdate(progress.lastUpdated);
    return daysSinceUpdate > stalledThresholdDays;
  }

  /**
   * Get completion timeline estimate
   */
  static getCompletionEstimate(progress: OnboardingProgress): {
    estimatedDays: number;
    confidence: 'low' | 'medium' | 'high';
  } {
    const remainingStages = progress.totalStages - progress.stages.filter(s => s.completed).length;
    const averageDaysPerStage = 2; // Historical average
    
    const baseEstimate = remainingStages * averageDaysPerStage;
    
    // Adjust based on current progress speed
    const daysSinceStart = this.getDaysSinceLastUpdate(progress.lastUpdated);
    const completionRate = progress.completionPercentage / Math.max(1, daysSinceStart);
    
    let confidence: 'low' | 'medium' | 'high' = 'medium';
    let estimatedDays = baseEstimate;

    if (completionRate > 10) {
      // Fast progress
      estimatedDays = Math.max(1, baseEstimate * 0.7);
      confidence = 'high';
    } else if (completionRate < 3) {
      // Slow progress
      estimatedDays = baseEstimate * 1.5;
      confidence = 'low';
    }

    return {
      estimatedDays: Math.ceil(estimatedDays),
      confidence
    };
  }
}