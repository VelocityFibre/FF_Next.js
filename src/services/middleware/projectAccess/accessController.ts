/**
 * Project Access Controller
 * Main access control logic and validation
 */

import { ProjectAccessLevel, UserProjectAccess, ProjectInfo, ProjectWithAccess, AccessOperation, ProjectScopeConditions } from './types';
import { ProjectAccessCache } from './cache';
import { ProjectAccessValidator } from './validator';
import { ProjectAccessDataService } from './dataService';
import { ProcurementPermissionError } from '../../procurement/procurementErrors';
import type { ServiceResponse } from '@/services/core/BaseService';

/**
 * Project access controller
 */
export class ProjectAccessController {
  private cache = new ProjectAccessCache();

  /**
   * Check if user has access to a specific project
   */
  async checkProjectAccess(
    userId: string, 
    projectId: string, 
    requiredLevel: ProjectAccessLevel = ProjectAccessLevel.READ
  ): Promise<ServiceResponse<UserProjectAccess | null>> {
    try {
      // Validate inputs
      const validation = ProjectAccessValidator.validateParameters(userId, projectId);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          code: 'INVALID_PARAMETERS'
        };
      }

      // Get user's project access
      const userAccess = await this.getUserProjectAccess(userId);
      if (!userAccess.success) {
        return {
          success: false,
          error: userAccess.error,
          code: userAccess.code
        };
      }

      // Find access for the specific project
      const projectAccess = userAccess.data!.find(access => access.projectId === projectId);
      
      if (!projectAccess) {
        return {
          success: false,
          error: 'No access to project',
          code: 'PROJECT_ACCESS_DENIED'
        };
      }

      // Check if access has expired
      if (ProjectAccessValidator.isAccessExpired(projectAccess.expiresAt)) {
        return {
          success: false,
          error: 'Project access has expired',
          code: 'PROJECT_ACCESS_EXPIRED'
        };
      }

      // Validate access level
      if (!ProjectAccessValidator.hasRequiredAccessLevel(projectAccess.accessLevel, requiredLevel)) {
        return {
          success: false,
          error: `Insufficient access level. Required: ${requiredLevel}, Current: ${projectAccess.accessLevel}`,
          code: 'INSUFFICIENT_ACCESS_LEVEL'
        };
      }

      return {
        success: true,
        data: projectAccess
      };
    } catch (error) {
      console.error('[ProjectAccessController] checkProjectAccess error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'ACCESS_CHECK_FAILED'
      };
    }
  }

  /**
   * Get all projects a user has access to
   */
  async getUserProjectAccess(userId: string): Promise<ServiceResponse<UserProjectAccess[]>> {
    try {
      // Check cache first
      const cached = this.cache.get(userId);
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      // Fetch from database
      const result = await ProjectAccessDataService.fetchUserProjectAccess(userId);
      
      if (result.success && result.data) {
        // Cache the results
        this.cache.set(userId, result.data);
      }

      return result;
    } catch (error) {
      console.error('[ProjectAccessController] getUserProjectAccess error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user project access',
        code: 'USER_ACCESS_FETCH_FAILED'
      };
    }
  }

  /**
   * Validate project access for API requests
   */
  async validateProjectAccess(
    userId: string,
    projectId: string,
    operation: AccessOperation
  ): Promise<ServiceResponse<UserProjectAccess>> {
    try {
      const requiredLevel = ProjectAccessValidator.mapOperationToAccessLevel(operation);
      const accessCheck = await this.checkProjectAccess(userId, projectId, requiredLevel);
      
      if (!accessCheck.success || !accessCheck.data) {
        throw new ProcurementPermissionError(
          `project:${operation}`,
          [],
          {
            projectId,
            userId,
            operation,
            requiredAccessLevel: requiredLevel
          }
        );
      }

      return {
        success: true,
        data: accessCheck.data
      };
    } catch (error) {
      if (error instanceof ProcurementPermissionError) {
        return {
          success: false,
          error: error.message,
          code: error.code
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Project access validation failed',
        code: 'PROJECT_ACCESS_VALIDATION_FAILED'
      };
    }
  }

  /**
   * Get project information with access validation
   */
  async getProjectWithAccess(userId: string, projectId: string): Promise<ServiceResponse<ProjectWithAccess>> {
    try {
      // Validate project access
      const accessCheck = await this.checkProjectAccess(userId, projectId);
      if (!accessCheck.success || !accessCheck.data) {
        return accessCheck as any;
      }

      // Get project information
      const projectResult = await ProjectAccessDataService.getProjectInfo(projectId);
      if (!projectResult.success || !projectResult.data) {
        return projectResult as any;
      }

      return {
        success: true,
        data: {
          ...projectResult.data,
          userAccess: accessCheck.data
        }
      };
    } catch (error) {
      console.error('[ProjectAccessController] getProjectWithAccess error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get project with access',
        code: 'PROJECT_FETCH_WITH_ACCESS_FAILED'
      };
    }
  }

  /**
   * Refresh project access cache for a user
   */
  async refreshUserProjectAccess(userId: string): Promise<void> {
    this.cache.delete(userId);
    
    // Trigger fresh fetch
    await this.getUserProjectAccess(userId);
  }

  /**
   * Create project-scoped query conditions for database operations
   */
  getProjectScopeConditions(userId: string, projectIds: string[]): ProjectScopeConditions {
    return {
      userId,
      projectIds,
      timestamp: new Date()
    };
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired cache entries
   */
  cleanupCache(): void {
    this.cache.cleanup();
  }
}