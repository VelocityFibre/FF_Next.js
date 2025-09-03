/**
 * Onboarding Analytics Service
 * Handles analytics and statistics for onboarding
 */

import { ProgressTracker } from './progressTracker';
import { OnboardingProgressManager } from './OnboardingProgressManager';
import { OnboardingDatabaseService } from './OnboardingDatabaseService';
import { log } from '@/lib/logger';

export class OnboardingAnalyticsService {
  private progressManager = new OnboardingProgressManager();
  private databaseService = new OnboardingDatabaseService();

  /**
   * Get onboarding analytics
   */
  async getOnboardingAnalytics(contractorIds?: string[]): Promise<any> {
    try {
      // If no specific contractors provided, get all active ones
      const idsToAnalyze = contractorIds || await this.databaseService.getAllActiveContractorIds();
      
      const progressMap = await this.progressManager.getBulkProgress(idsToAnalyze);
      const progressList = Array.from(progressMap.values());
      
      return ProgressTracker.getOnboardingStatistics(progressList);
    } catch (error) {
      log.error('Failed to get onboarding analytics:', { data: error }, 'OnboardingAnalyticsService');
      throw error;
    }
  }

  /**
   * Get completion rate statistics
   */
  async getCompletionStats(): Promise<{
    totalContractors: number;
    completedOnboarding: number;
    inProgress: number;
    notStarted: number;
    completionRate: number;
    averageTimeToComplete: number;
  }> {
    try {
      const dbStats = await this.databaseService.getOnboardingStats();
      
      const completionRate = dbStats.total > 0 
        ? Math.round((dbStats.completed / dbStats.total) * 100)
        : 0;

      return {
        totalContractors: dbStats.total,
        completedOnboarding: dbStats.completed,
        inProgress: dbStats.inProgress,
        notStarted: dbStats.notStarted,
        completionRate,
        averageTimeToComplete: 7 // Mock data - would be calculated from database
      };
    } catch (error) {
      log.error('Failed to get completion stats:', { data: error }, 'OnboardingAnalyticsService');
      return {
        totalContractors: 0,
        completedOnboarding: 0,
        inProgress: 0,
        notStarted: 0,
        completionRate: 0,
        averageTimeToComplete: 0
      };
    }
  }

  /**
   * Get stage completion analytics
   */
  async getStageAnalytics(): Promise<Array<{
    stageName: string;
    completionRate: number;
    averageTimeToComplete: number;
    commonBlockers: string[];
  }>> {
    try {
      // In production, this would analyze stage completion data
      // For now, return mock analytics
      return [
        {
          stageName: 'Initial Setup',
          completionRate: 95,
          averageTimeToComplete: 2,
          commonBlockers: ['Missing contact information', 'Invalid email']
        },
        {
          stageName: 'Document Verification',
          completionRate: 85,
          averageTimeToComplete: 5,
          commonBlockers: ['Document quality issues', 'Missing required documents']
        },
        {
          stageName: 'Compliance Review',
          completionRate: 78,
          averageTimeToComplete: 7,
          commonBlockers: ['Insurance requirements', 'Certificate validity']
        }
      ];
    } catch (error) {
      log.error('Failed to get stage analytics:', { data: error }, 'OnboardingAnalyticsService');
      return [];
    }
  }

  /**
   * Get approval rate statistics
   */
  async getApprovalStats(): Promise<{
    totalSubmissions: number;
    approved: number;
    rejected: number;
    pending: number;
    approvalRate: number;
    averageApprovalTime: number;
    commonRejectionReasons: Array<{ reason: string; count: number }>;
  }> {
    try {
      // In production, this would query approval data from database
      return {
        totalSubmissions: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        approvalRate: 0,
        averageApprovalTime: 0,
        commonRejectionReasons: []
      };
    } catch (error) {
      log.error('Failed to get approval stats:', { data: error }, 'OnboardingAnalyticsService');
      return {
        totalSubmissions: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        approvalRate: 0,
        averageApprovalTime: 0,
        commonRejectionReasons: []
      };
    }
  }

  /**
   * Get trend analysis
   */
  async getTrendAnalysis(months: number = 6): Promise<Array<{
    period: string;
    started: number;
    completed: number;
    approved: number;
    rejected: number;
    completionRate: number;
  }>> {
    try {
      const trends = [];
      const currentDate = new Date();
      
      for (let i = months - 1; i >= 0; i--) {
        const periodDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const periodName = periodDate.toISOString().substring(0, 7); // YYYY-MM format
        
        // In production, this would query historical data
        const started = Math.floor(Math.random() * 20) + 10;
        const completed = Math.floor(started * 0.8);
        const approved = Math.floor(completed * 0.85);
        const rejected = completed - approved;
        
        trends.push({
          period: periodName,
          started,
          completed,
          approved,
          rejected,
          completionRate: started > 0 ? Math.round((completed / started) * 100) : 0
        });
      }
      
      return trends;
    } catch (error) {
      log.error('Failed to get trend analysis:', { data: error }, 'OnboardingAnalyticsService');
      return [];
    }
  }

  /**
   * Generate onboarding report
   */
  async generateReport(contractorId?: string): Promise<{
    summary: any;
    stageAnalytics: any[];
    recommendations: string[];
    actionItems: Array<{ priority: string; description: string; dueDate: Date }>;
  }> {
    try {
      const summary = contractorId 
        ? await this.getContractorSummary(contractorId)
        : await this.getOverallSummary();
        
      const stageAnalytics = await this.getStageAnalytics();
      
      const recommendations = this.generateRecommendations(summary, stageAnalytics);
      const actionItems = this.generateActionItems(summary, stageAnalytics);
      
      return {
        summary,
        stageAnalytics,
        recommendations,
        actionItems
      };
    } catch (error) {
      log.error('Failed to generate report:', { data: error }, 'OnboardingAnalyticsService');
      throw error;
    }
  }

  private async getContractorSummary(contractorId: string): Promise<any> {
    const progress = await this.progressManager.getProgress(contractorId);
    return {
      contractorId,
      status: progress.overallStatus,
      completionPercentage: progress.completionPercentage,
      currentStage: progress.currentStage,
      totalStages: progress.totalStages
    };
  }

  private async getOverallSummary(): Promise<any> {
    const stats = await this.getCompletionStats();
    const approvalStats = await this.getApprovalStats();
    
    return {
      totalContractors: stats.totalContractors,
      completionRate: stats.completionRate,
      approvalRate: approvalStats.approvalRate,
      averageTimeToComplete: stats.averageTimeToComplete
    };
  }

  private generateRecommendations(summary: any, stageAnalytics: any[]): string[] {
    const recommendations = [];
    
    if (summary.completionRate < 80) {
      recommendations.push('Focus on improving onboarding completion rate through better guidance and support');
    }
    
    if (summary.approvalRate < 85) {
      recommendations.push('Review approval criteria and provide better preparation guidance');
    }
    
    const slowStages = stageAnalytics.filter(stage => stage.averageTimeToComplete > 5);
    if (slowStages.length > 0) {
      recommendations.push('Optimize slow-moving stages: ' + slowStages.map(s => s.stageName).join(', '));
    }
    
    return recommendations;
  }

  private generateActionItems(summary: any, stageAnalytics: any[]): Array<{ priority: string; description: string; dueDate: Date }> {
    const actionItems = [];
    
    if (summary.completionRate < 70) {
      actionItems.push({
        priority: 'high',
        description: 'Review and improve onboarding process to increase completion rate',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }
    
    const problematicStages = stageAnalytics.filter(stage => stage.completionRate < 80);
    problematicStages.forEach(stage => {
      actionItems.push({
        priority: 'medium',
        description: `Address common blockers in ${stage.stageName}: ${stage.commonBlockers.join(', ')}`,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      });
    });
    
    return actionItems;
  }
}