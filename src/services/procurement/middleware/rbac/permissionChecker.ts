/**
 * Permission Checking Logic
 * Core logic for validating user permissions
 */

import { ProjectAccessLevel } from '../projectAccessMiddleware';
import type { ServiceResponse } from '@/services/core/BaseService';
import { ProcurementPermission, ProcurementRoles, getRolePermissions } from './permissions';

// User permission cache interface
export interface UserPermissionCache {
  userId: string;
  permissions: Set<ProcurementPermission>;
  roles: string[];
  projectAccessLevel: ProjectAccessLevel;
  timestamp: number;
}

/**
 * Permission checking utilities
 */
export class PermissionChecker {
  /**
   * Check if user has a specific permission
   */
  static checkSinglePermission(
    userPermissions: UserPermissionCache,
    permission: ProcurementPermission | string
  ): boolean {
    return userPermissions.permissions.has(permission as ProcurementPermission);
  }

  /**
   * Check if user has ALL specified permissions
   */
  static checkAllPermissions(
    userPermissions: UserPermissionCache,
    permissions: (ProcurementPermission | string)[]
  ): boolean {
    return permissions.every(permission =>
      userPermissions.permissions.has(permission as ProcurementPermission)
    );
  }

  /**
   * Check if user has ANY of the specified permissions
   */
  static checkAnyPermission(
    userPermissions: UserPermissionCache,
    permissions: (ProcurementPermission | string)[]
  ): boolean {
    return permissions.some(permission =>
      userPermissions.permissions.has(permission as ProcurementPermission)
    );
  }

  /**
   * Build permission set based on roles and access level
   */
  static buildPermissionSet(
    roles: string[],
    accessLevel: ProjectAccessLevel
  ): Set<ProcurementPermission> {
    const permissions = new Set<ProcurementPermission>();

    // Add role-based permissions
    for (const role of roles) {
      const rolePermissions = getRolePermissions(role);
      rolePermissions.forEach(permission => permissions.add(permission));
    }

    // Add access-level-based permissions
    const accessLevelPermissions = this.getAccessLevelPermissions(accessLevel);
    accessLevelPermissions.forEach(permission => permissions.add(permission));

    return permissions;
  }

  /**
   * Get base permissions based on project access level
   */
  static getAccessLevelPermissions(accessLevel: ProjectAccessLevel): ProcurementPermission[] {
    switch (accessLevel) {
      case ProjectAccessLevel.ADMIN:
        return [...ProcurementRoles.PROCUREMENT_MANAGER.permissions];
      
      case ProjectAccessLevel.WRITE:
        return [...ProcurementRoles.PROCUREMENT_OFFICER.permissions];
      
      case ProjectAccessLevel.READ:
        return [...ProcurementRoles.VIEWER.permissions];
      
      case ProjectAccessLevel.NONE:
      default:
        return [];
    }
  }

  /**
   * Validate permission check parameters
   */
  static validatePermissionParams(
    userId: string,
    permission: string,
    projectId: string
  ): ServiceResponse<null> {
    if (!userId || !permission || !projectId) {
      return {
        success: false,
        error: 'User ID, permission, and project ID are required',
        code: 'INVALID_PARAMETERS'
      };
    }

    return { success: true, data: null };
  }

  /**
   * Create error response for permission operations
   */
  static createPermissionErrorResponse(
    error: unknown,
    defaultMessage: string,
    defaultCode: string
  ): ServiceResponse<boolean> {
    console.error('[PermissionChecker] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : defaultMessage,
      code: defaultCode
    };
  }

  /**
   * Get permission summary for user
   */
  static getPermissionSummary(userPermissions: UserPermissionCache): {
    totalPermissions: number;
    roles: string[];
    accessLevel: ProjectAccessLevel;
    hasManagerAccess: boolean;
    hasWriteAccess: boolean;
    hasReadAccess: boolean;
  } {
    return {
      totalPermissions: userPermissions.permissions.size,
      roles: userPermissions.roles,
      accessLevel: userPermissions.projectAccessLevel,
      hasManagerAccess: userPermissions.permissions.has(ProcurementPermission.BOQ_DELETE) ||
                       userPermissions.permissions.has(ProcurementPermission.RFQ_DELETE),
      hasWriteAccess: userPermissions.permissions.has(ProcurementPermission.BOQ_WRITE) ||
                     userPermissions.permissions.has(ProcurementPermission.RFQ_WRITE),
      hasReadAccess: userPermissions.permissions.has(ProcurementPermission.BOQ_READ) ||
                    userPermissions.permissions.has(ProcurementPermission.RFQ_READ)
    };
  }

  /**
   * Get missing permissions from a required set
   */
  static getMissingPermissions(
    userPermissions: UserPermissionCache,
    requiredPermissions: (ProcurementPermission | string)[]
  ): string[] {
    return requiredPermissions.filter(permission =>
      !userPermissions.permissions.has(permission as ProcurementPermission)
    );
  }

  /**
   * Check if user can perform bulk operations
   */
  static canPerformBulkOperations(userPermissions: UserPermissionCache): boolean {
    // Bulk operations require manager or admin level permissions
    return this.checkAnyPermission(userPermissions, [
      ProcurementPermission.BOQ_DELETE,
      ProcurementPermission.RFQ_DELETE,
      ProcurementPermission.PROCUREMENT_AUDIT
    ]);
  }
}