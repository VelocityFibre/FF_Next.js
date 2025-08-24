/**
 * Hybrid Project Service - Combines Firebase + Neon operations
 */

import type { Project } from '@/types/project.types';
import * as realtimeOps from './project/realtime';
import * as analyticsOps from './project/analytics';

export class HybridProjectService {
  // ============================================
  // REAL-TIME OPERATIONS (Firebase)
  // ============================================

  async getAllProjects(): Promise<Project[]> {
    return realtimeOps.getAllProjects();
  }

  async getProjectById(id: string): Promise<Project | null> {
    return realtimeOps.getProjectById(id);
  }

  async createProject(projectData: Omit<Project, 'id'>): Promise<string> {
    const projectId = await realtimeOps.createProject(projectData);

    // Trigger analytics sync (async)
    analyticsOps.syncProjectToAnalytics(projectId, projectData).catch(() => {
      // Silent fail for analytics sync
    });

    return projectId;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    await realtimeOps.updateProject(id, updates);

    // Get full project data and sync to analytics
    const updatedProject = await this.getProjectById(id);
    if (updatedProject) {
      analyticsOps.syncProjectToAnalytics(id, updatedProject).catch(() => {
        // Silent fail for analytics sync
      });
    }
  }

  async deleteProject(id: string): Promise<void> {
    return realtimeOps.deleteProject(id);
  }

  subscribeToProject(id: string, callback: (project: Project | null) => void): () => void {
    return realtimeOps.subscribeToProject(id, callback);
  }

  subscribeToProjects(callback: (projects: Project[]) => void): () => void {
    return realtimeOps.subscribeToProjects(callback);
  }

  // ============================================
  // ANALYTICS OPERATIONS (Neon)
  // ============================================

  async getProjectAnalytics(projectId?: string) {
    return analyticsOps.getProjectAnalytics(projectId);
  }

  async getProjectTrends(dateFrom: Date, dateTo: Date) {
    return analyticsOps.getProjectTrends(dateFrom, dateTo);
  }

  async recordKPI(
    projectId: string, 
    metricType: string, 
    metricName: string, 
    value: number, 
    unit: string = ''
  ): Promise<void> {
    return analyticsOps.recordKPI(projectId, metricType, metricName, value, unit);
  }
}