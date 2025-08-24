/**
 * Project Analytics Service
 * Handles project performance and trend analysis
 */

import { neonDb } from '@/lib/neon/connection';
import { projectAnalytics } from '@/lib/neon/schema';
import { eq, and, gte, lte, sql, count, sum, avg } from 'drizzle-orm';
import type { ProjectOverview, ProjectTrend } from './types';

export class ProjectAnalyticsService {
  /**
   * Get project performance overview
   */
  async getProjectOverview(projectId?: string): Promise<ProjectOverview[]> {
    try {
      const baseQuery = neonDb
        .select({
          totalProjects: count(projectAnalytics.id),
          totalBudget: sum(projectAnalytics.totalBudget),
          spentBudget: sum(projectAnalytics.spentBudget),
          avgCompletion: avg(projectAnalytics.completionPercentage),
        })
        .from(projectAnalytics);

      if (projectId) {
        return await baseQuery.where(eq(projectAnalytics.projectId, projectId));
      }

      return await baseQuery;
    } catch (error) {
      console.error('Failed to get project overview:', error);
      throw error;
    }
  }

  /**
   * Get project completion trends over time
   */
  async getProjectTrends(dateFrom: Date, dateTo: Date): Promise<ProjectTrend[]> {
    try {
      return await neonDb
        .select({
          month: sql<string>`DATE_TRUNC('month', ${projectAnalytics.createdAt})`,
          completedProjects: count(projectAnalytics.id),
          avgCompletion: avg(projectAnalytics.completionPercentage),
          totalBudget: sum(projectAnalytics.totalBudget),
        })
        .from(projectAnalytics)
        .where(
          and(
            gte(projectAnalytics.createdAt, dateFrom),
            lte(projectAnalytics.createdAt, dateTo)
          )
        )
        .groupBy(sql`DATE_TRUNC('month', ${projectAnalytics.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${projectAnalytics.createdAt})`);
    } catch (error) {
      console.error('Failed to get project trends:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const projectAnalyticsService = new ProjectAnalyticsService();