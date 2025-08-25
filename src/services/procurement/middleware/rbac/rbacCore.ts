/**
 * @deprecated This file has been modularized for better maintainability.
 * Import from './core/' directory instead.
 * This file maintained for backward compatibility.
 */

import type { ServiceResponse } from '@/services/core/BaseService';
import { ProcurementPermission } from './permissions';
import { UserPermissionCache } from './permissionChecker';
import { PermissionCacheManager } from './cacheManager';
import { CorePermissionChecker, PermissionEnforcer, UserPermissionManager, CacheOperations } from './core';

/**
 * Core RBAC middleware class - compatibility layer
 */
export class RBACCore {
  private userPermissionManager: UserPermissionManager;
  private cacheOperations: CacheOperations;

  constructor(cacheTTL: number = 10 * 60 * 1000) {
    const cacheManager = new PermissionCacheManager(cacheTTL);
    this.userPermissionManager = new UserPermissionManager(cacheManager);
    this.cacheOperations = new CacheOperations(cacheManager);
  }

  // Permission checking methods
  async checkPermission(
    userId: string,
    permission: ProcurementPermission | string,
    projectId: string
  ): Promise<ServiceResponse<boolean>> {
    const userPermissions = await this.getUserPermissions(userId, projectId);
    if (!userPermissions.success) {
      const response: ServiceResponse<boolean> = { success: false };
      if (userPermissions.error !== undefined) {
        response.error = userPermissions.error;
      }
      if (userPermissions.code !== undefined) {
        response.code = userPermissions.code;
      }
      return response;
    }

    return {
      success: true,
      data: CorePermissionChecker.checkSinglePermission(userPermissions.data!, permission)
    };
  }

  async checkAllPermissions(
    userId: string,
    permissions: (ProcurementPermission | string)[],
    projectId: string
  ): Promise<ServiceResponse<boolean>> {
    const userPermissions = await this.getUserPermissions(userId, projectId);
    if (!userPermissions.success) {
      const response: ServiceResponse<boolean> = { success: false };
      if (userPermissions.error !== undefined) {
        response.error = userPermissions.error;
      }
      if (userPermissions.code !== undefined) {
        response.code = userPermissions.code;
      }
      return response;
    }

    return {
      success: true,
      data: CorePermissionChecker.checkAllPermissions(userPermissions.data!, permissions)
    };
  }

  async checkAnyPermission(
    userId: string,
    permissions: (ProcurementPermission | string)[],
    projectId: string
  ): Promise<ServiceResponse<boolean>> {
    const userPermissions = await this.getUserPermissions(userId, projectId);
    if (!userPermissions.success) {
      const response: ServiceResponse<boolean> = { success: false };
      if (userPermissions.error !== undefined) {
        response.error = userPermissions.error;
      }
      if (userPermissions.code !== undefined) {
        response.code = userPermissions.code;
      }
      return response;
    }

    return {
      success: true,
      data: CorePermissionChecker.checkAnyPermission(userPermissions.data!, permissions)
    };
  }

  // Delegation methods
  async getUserPermissions(userId: string, projectId: string): Promise<ServiceResponse<UserPermissionCache>> {
    return this.userPermissionManager.getUserPermissions(userId, projectId);
  }

  async enforcePermission(userId: string, permission: ProcurementPermission | string, projectId: string): Promise<void> {
    return PermissionEnforcer.enforcePermission(this.checkPermission.bind(this), userId, permission, projectId);
  }

  async enforceAllPermissions(userId: string, permissions: (ProcurementPermission | string)[], projectId: string): Promise<void> {
    return PermissionEnforcer.enforceAllPermissions(this.checkAllPermissions.bind(this), userId, permissions, projectId);
  }

  async clearUserPermissionCache(userId: string, projectId?: string): Promise<void> {
    return this.cacheOperations.clearUserPermissionCache(userId, projectId);
  }

  async clearProjectPermissionCache(projectId: string): Promise<void> {
    return this.cacheOperations.clearProjectPermissionCache(projectId);
  }

  getCacheStats() {
    return this.cacheOperations.getCacheStats();
  }

  cleanupCache(): number {
    return this.cacheOperations.cleanupCache();
  }

  async getPermissionSummary(userId: string, projectId: string) {
    return this.userPermissionManager.getPermissionSummary(userId, projectId);
  }

  async canPerformBulkOperations(userId: string, projectId: string): Promise<boolean> {
    return this.userPermissionManager.canPerformBulkOperations(userId, projectId);
  }

  destroy(): void {
    this.cacheOperations.destroy();
  }
}