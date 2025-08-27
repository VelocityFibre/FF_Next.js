/**
 * Onboarding Progress Manager
 * Handles progress tracking, calculations, and stage management
 */

import {
  OnboardingProgress,
  StageUpdateRequest
} from './types';
import { getOnboardingStages } from './stageDefinitions';
import { ProgressTracker } from './progressTracker';
import { DocumentManager } from './documentManager';
import { log } from '@/lib/logger';

export class OnboardingProgressManager {
  /**
   * Initialize onboarding progress for a new contractor
   */
  async initializeProgress(contractorId: string): Promise<OnboardingProgress> {
    try {
      const stages = getOnboardingStages();
      
      const onboardingProgress: OnboardingProgress = {
        contractorId,
        currentStage: 0,
        totalStages: stages.length,
        completionPercentage: 0,
        stages,
        overallStatus: 'not_started',
        lastUpdated: new Date()
      };

      return onboardingProgress;
    } catch (error) {
      log.error('Failed to initialize onboarding progress:', { data: error }, 'OnboardingProgressManager');
      throw error;
    }
  }

  /**
   * Get current onboarding progress for a contractor
   */
  async getProgress(contractorId: string): Promise<OnboardingProgress> {
    try {
      const stages = getOnboardingStages();
      
      // Get documents and update stages based on them
      const documents = await DocumentManager.getContractorDocuments(contractorId);
      const updatedStages = await DocumentManager.updateStagesBasedOnDocuments(stages, documents);
      
      // Calculate progress metrics
      const completionPercentage = ProgressTracker.calculateCompletionPercentage(updatedStages);
      const currentStage = ProgressTracker.getCurrentStageIndex(updatedStages);
      const overallStatus = ProgressTracker.determineOverallStatus(completionPercentage, updatedStages);

      return {
        contractorId,
        currentStage,
        totalStages: updatedStages.length,
        completionPercentage,
        stages: updatedStages,
        overallStatus,
        lastUpdated: new Date()
      };
    } catch (error) {
      log.error('Failed to get onboarding progress:', { data: error }, 'OnboardingProgressManager');
      throw error;
    }
  }

  /**
   * Update onboarding stage completion
   */
  async updateStageCompletion(request: StageUpdateRequest): Promise<OnboardingProgress> {
    try {
      const { contractorId, stageId, checklistItemId, completed } = request;
      
      // Get current progress
      const progress = await this.getProgress(contractorId);
      
      // Find and update the specific checklist item
      const stage = progress.stages.find(s => s.id === stageId);
      if (!stage) {
        throw new Error('Stage not found');
      }

      const checklistItem = stage.checklist.find(item => item.id === checklistItemId);
      if (!checklistItem) {
        throw new Error('Checklist item not found');
      }

      // Update checklist item
      checklistItem.completed = completed;
      
      // Update stage completion
      ProgressTracker.updateStageCompletion(stage);

      // Recalculate overall progress
      progress.completionPercentage = ProgressTracker.calculateCompletionPercentage(progress.stages);
      progress.currentStage = ProgressTracker.getCurrentStageIndex(progress.stages);
      progress.overallStatus = ProgressTracker.determineOverallStatus(
        progress.completionPercentage, 
        progress.stages
      );
      progress.lastUpdated = new Date();

      return progress;
    } catch (error) {
      log.error('Failed to update stage completion:', { data: error }, 'OnboardingProgressManager');
      throw error;
    }
  }

  /**
   * Reset onboarding progress (for resubmission after rejection)
   */
  async resetProgress(contractorId: string): Promise<OnboardingProgress> {
    try {
      const progress = await this.getProgress(contractorId);
      
      if (progress.overallStatus !== 'rejected') {
        throw new Error('Can only reset rejected onboarding processes');
      }

      // Reset progress
      progress.overallStatus = 'in_progress';
      delete progress.rejectionReason;
      progress.lastUpdated = new Date();

      // Reset incomplete stages
      progress.stages.forEach(stage => {
        if (!stage.completed) {
          stage.checklist.forEach(item => {
            if (!item.completed && item.required) {
              // Keep document-related items completed if docs are still valid
              if (!DocumentManager.isDocumentRelatedChecklistItem(item.id)) {
                item.completed = false;
              }
            }
          });
        }
      });

      return progress;
    } catch (error) {
      log.error('Failed to reset onboarding progress:', { data: error }, 'OnboardingProgressManager');
      throw error;
    }
  }

  /**
   * Get onboarding progress for multiple contractors
   */
  async getBulkProgress(contractorIds: string[]): Promise<Map<string, OnboardingProgress>> {
    const progressMap = new Map<string, OnboardingProgress>();
    
    // Process in batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < contractorIds.length; i += batchSize) {
      const batch = contractorIds.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (contractorId) => {
        try {
          const progress = await this.getProgress(contractorId);
          return { contractorId, progress };
        } catch (error) {
          log.error(`Failed to get progress for contractor ${contractorId}:`, { data: error }, 'OnboardingProgressManager');
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result) {
          progressMap.set(result.contractorId, result.progress);
        }
      });
    }
    
    return progressMap;
  }
}