/**
 * User Permission Management
 * Handles user permission retrieval and caching
 */

import { projectAccessMiddleware } from '../../projectAccessMiddleware';
import { PermissionChecker, UserPermissionCache } from '../permissionChecker';
import { PermissionCacheManager } from '../cacheManager';
import type { ServiceResponse } from '@/services/core/BaseService';

/**
 * User permission management operations
 */
export class UserPermissionManager {
  private cacheManager: PermissionCacheManager;

  constructor(cacheManager: PermissionCacheManager) {
    this.cacheManager = cacheManager;
  }

  /**
   * Get all permissions for a user in a project
   */
  async getUserPermissions(
    userId: string,
    projectId: string
  ): Promise<ServiceResponse<UserPermissionCache>> {
    try {
      // Check cache first
      const cached = this.cacheManager.getCachedPermissions(userId, projectId);
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      // Get project access information
      const projectAccess = await projectAccessMiddleware.checkProjectAccess(userId, projectId);
      if (!projectAccess.success || !projectAccess.data) {
        return {
          success: false,
          error: 'No project access',
          code: 'PROJECT_ACCESS_DENIED'
        };
      }

      // Build permission set based on roles and access level
      const permissions = PermissionChecker.buildPermissionSet(
        projectAccess.data.roles,
        projectAccess.data.accessLevel
      );

      // Create user permission cache object
      const userPermissionCache: UserPermissionCache = {
        permissions,
        roles: projectAccess.data.roles,
        projectAccessLevel: projectAccess.data.accessLevel,
        timestamp: Date.now()
      };

      // Cache the results
      this.cacheManager.setCachedPermissions(userId, projectId, userPermissionCache);

      return {
        success: true,
        data: userPermissionCache
      };
    } catch (error) {
      console.error('[UserPermissionManager] getUserPermissions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user permissions',
        code: 'USER_PERMISSIONS_FETCH_FAILED'
      };
    }
  }

  /**
   * Get permission summary for user
   */
  async getPermissionSummary(userId: string, projectId: string) {
    const userPermissions = await this.getUserPermissions(userId, projectId);
    if (!userPermissions.success || !userPermissions.data) {
      return null;
    }

    return PermissionChecker.getPermissionSummary(userPermissions.data);
  }

  /**
   * Check if user can perform bulk operations
   */
  async canPerformBulkOperations(userId: string, projectId: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, projectId);
    if (!userPermissions.success || !userPermissions.data) {
      return false;
    }

    return PermissionChecker.canPerformBulkOperations(userPermissions.data);
  }
}