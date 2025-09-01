/**
 * Project Analytics Service
 * Handles project performance and trend analysis
 */

import { analyticsApi } from '@/services/api/analyticsApi';
import type { ProjectOverview, ProjectTrend } from './types';
import { log } from '@/lib/logger';

export class ProjectAnalyticsService {
  /**
   * Get project performance overview
   */
  async getProjectOverview(projectId?: string): Promise<ProjectOverview[]> {
    try {
      const summary = await analyticsApi.getProjectSummary(projectId);
      
      // Convert API response to ProjectOverview format
      return [{
        totalProjects: summary.overview.totalProjects,
        totalBudget: summary.overview.totalBudget,
        spentBudget: summary.overview.spentBudget,
        avgCompletion: summary.overview.avgCompletion,
        activeProjects: summary.overview.activeProjects,
        completedProjects: summary.overview.completedProjects,
        delayedProjects: summary.overview.delayedProjects,
        totalValue: summary.overview.totalValue,
        averageCompletionRate: summary.overview.averageCompletionRate
      }];
    } catch (error) {
      log.error('Failed to get project overview:', { data: error }, 'projectAnalytics');
      // Return empty structure with zeros instead of throwing
      return [{
        totalProjects: 0,
        totalBudget: 0,
        spentBudget: 0,
        avgCompletion: 0,
        activeProjects: 0,
        completedProjects: 0,
        delayedProjects: 0,
        totalValue: 0,
        averageCompletionRate: 0
      }];
    }
  }

  /**
   * Get project completion trends over time
   */
  async getProjectTrends(dateFrom: Date, dateTo: Date): Promise<ProjectTrend[]> {
    try {
      const trends = await analyticsApi.getProjectTrends('', {
        type: 'monthly',
        startDate: dateFrom.toISOString(),
        endDate: dateTo.toISOString()
      });
      
      // Convert API response to ProjectTrend format
      return trends.trends || [];
    } catch (error) {
      log.error('Failed to get project trends:', { data: error }, 'projectAnalytics');
      // Return empty array instead of throwing
      return [];
    }
  }
}

// Export singleton instance
export const projectAnalyticsService = new ProjectAnalyticsService();