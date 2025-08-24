/**
 * Project Access Middleware - Main Service
 * Unified interface for project access control
 */

import { ProjectAccessController } from './accessController';
import { ProjectAccessLevel, UserProjectAccess, ProjectWithAccess, AccessOperation, ProjectScopeConditions } from './types';
import type { ServiceResponse } from '@/services/core/BaseService';

/**
 * Main Project Access Middleware class
 * Provides a unified interface for all project access operations
 */
export class ProjectAccessMiddleware {
  private controller = new ProjectAccessController();

  /**
   * Check if user has access to a specific project
   */
  async checkProjectAccess(
    userId: string, 
    projectId: string, 
    requiredLevel: ProjectAccessLevel = ProjectAccessLevel.READ
  ): Promise<ServiceResponse<UserProjectAccess | null>> {
    return this.controller.checkProjectAccess(userId, projectId, requiredLevel);
  }

  /**
   * Get all projects a user has access to
   */
  async getUserProjectAccess(userId: string): Promise<ServiceResponse<UserProjectAccess[]>> {
    return this.controller.getUserProjectAccess(userId);
  }

  /**
   * Validate project access for API requests
   */
  async validateProjectAccess(
    userId: string,
    projectId: string,
    operation: AccessOperation
  ): Promise<ServiceResponse<UserProjectAccess>> {
    return this.controller.validateProjectAccess(userId, projectId, operation);
  }

  /**
   * Get project information with access validation
   */
  async getProjectWithAccess(userId: string, projectId: string): Promise<ServiceResponse<ProjectWithAccess>> {
    return this.controller.getProjectWithAccess(userId, projectId);
  }

  /**
   * Refresh project access cache for a user
   */
  async refreshUserProjectAccess(userId: string): Promise<void> {
    return this.controller.refreshUserProjectAccess(userId);
  }

  /**
   * Create project-scoped query conditions for database operations
   */
  getProjectScopeConditions(userId: string, projectIds: string[]): ProjectScopeConditions {
    return this.controller.getProjectScopeConditions(userId, projectIds);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.controller.clearCache();
  }

  /**
   * Clean up expired cache entries
   */
  cleanupCache(): void {
    this.controller.cleanupCache();
  }
}

// Export singleton instance
export const projectAccessMiddleware = new ProjectAccessMiddleware();

// Set up periodic cache cleanup
setInterval(() => {
  projectAccessMiddleware.cleanupCache();
}, 5 * 60 * 1000); // Every 5 minutes