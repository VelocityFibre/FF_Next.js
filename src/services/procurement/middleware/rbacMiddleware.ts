/**
 * RBAC Middleware for Procurement Module
 * Handles role-based access control for procurement-specific permissions
 * Integrates with FibreFlow's existing authentication and project access systems
 */

import { authService } from '@/services/auth/authService';
import { projectAccessMiddleware, ProjectAccessLevel } from './projectAccessMiddleware';
import { ProcurementPermissionError, createProcurementError } from '../procurementErrors';
import type { ServiceResponse } from '@/services/core/BaseService';

// Procurement-specific permissions
export enum ProcurementPermission {
  // BOQ Permissions
  BOQ_READ = 'boq:read',
  BOQ_CREATE = 'boq:create',
  BOQ_WRITE = 'boq:write',
  BOQ_DELETE = 'boq:delete',
  BOQ_APPROVE = 'boq:approve',
  BOQ_IMPORT = 'boq:import',
  BOQ_EXPORT = 'boq:export',
  BOQ_MAPPING = 'boq:mapping',

  // RFQ Permissions
  RFQ_READ = 'rfq:read',
  RFQ_CREATE = 'rfq:create',
  RFQ_WRITE = 'rfq:write',
  RFQ_DELETE = 'rfq:delete',
  RFQ_ISSUE = 'rfq:issue',
  RFQ_CLOSE = 'rfq:close',
  RFQ_EXTEND = 'rfq:extend',

  // Quote Permissions
  QUOTE_READ = 'quote:read',
  QUOTE_EVALUATE = 'quote:evaluate',
  QUOTE_AWARD = 'quote:award',
  QUOTE_REJECT = 'quote:reject',

  // Supplier Portal Permissions
  SUPPLIER_ACCESS = 'supplier:access',
  SUPPLIER_INVITE = 'supplier:invite',
  SUPPLIER_MANAGE = 'supplier:manage',

  // Stock Permissions
  STOCK_READ = 'stock:read',
  STOCK_ACCESS = 'stock:access',
  STOCK_CREATE = 'stock:create',
  STOCK_WRITE = 'stock:write',
  STOCK_MOVE = 'stock:move',
  STOCK_ADJUST = 'stock:adjust',
  STOCK_COUNT = 'stock:count',

  // Reporting Permissions
  PROCUREMENT_REPORTS = 'procurement:reports',
  PROCUREMENT_ANALYTICS = 'procurement:analytics',
  PROCUREMENT_AUDIT = 'procurement:audit'
}

// Role definitions for procurement module
export const ProcurementRoles = {
  // Procurement Manager - Full access to all procurement functions
  PROCUREMENT_MANAGER: {
    permissions: [
      ProcurementPermission.BOQ_READ,
      ProcurementPermission.BOQ_CREATE,
      ProcurementPermission.BOQ_WRITE,
      ProcurementPermission.BOQ_DELETE,
      ProcurementPermission.BOQ_APPROVE,
      ProcurementPermission.BOQ_IMPORT,
      ProcurementPermission.BOQ_EXPORT,
      ProcurementPermission.BOQ_MAPPING,
      ProcurementPermission.RFQ_READ,
      ProcurementPermission.RFQ_CREATE,
      ProcurementPermission.RFQ_WRITE,
      ProcurementPermission.RFQ_DELETE,
      ProcurementPermission.RFQ_ISSUE,
      ProcurementPermission.RFQ_CLOSE,
      ProcurementPermission.RFQ_EXTEND,
      ProcurementPermission.QUOTE_READ,
      ProcurementPermission.QUOTE_EVALUATE,
      ProcurementPermission.QUOTE_AWARD,
      ProcurementPermission.QUOTE_REJECT,
      ProcurementPermission.SUPPLIER_ACCESS,
      ProcurementPermission.SUPPLIER_INVITE,
      ProcurementPermission.SUPPLIER_MANAGE,
      ProcurementPermission.STOCK_READ,
      ProcurementPermission.STOCK_ACCESS,
      ProcurementPermission.STOCK_CREATE,
      ProcurementPermission.STOCK_WRITE,
      ProcurementPermission.STOCK_MOVE,
      ProcurementPermission.STOCK_ADJUST,
      ProcurementPermission.STOCK_COUNT,
      ProcurementPermission.PROCUREMENT_REPORTS,
      ProcurementPermission.PROCUREMENT_ANALYTICS,
      ProcurementPermission.PROCUREMENT_AUDIT
    ]
  },

  // Procurement Officer - Standard procurement operations
  PROCUREMENT_OFFICER: {
    permissions: [
      ProcurementPermission.BOQ_READ,
      ProcurementPermission.BOQ_CREATE,
      ProcurementPermission.BOQ_WRITE,
      ProcurementPermission.BOQ_IMPORT,
      ProcurementPermission.BOQ_EXPORT,
      ProcurementPermission.BOQ_MAPPING,
      ProcurementPermission.RFQ_READ,
      ProcurementPermission.RFQ_CREATE,
      ProcurementPermission.RFQ_WRITE,
      ProcurementPermission.RFQ_ISSUE,
      ProcurementPermission.QUOTE_READ,
      ProcurementPermission.QUOTE_EVALUATE,
      ProcurementPermission.SUPPLIER_ACCESS,
      ProcurementPermission.SUPPLIER_INVITE,
      ProcurementPermission.STOCK_READ,
      ProcurementPermission.STOCK_ACCESS,
      ProcurementPermission.PROCUREMENT_REPORTS
    ]
  },

  // Stock Manager - Stock operations focus
  STOCK_MANAGER: {
    permissions: [
      ProcurementPermission.BOQ_READ,
      ProcurementPermission.RFQ_READ,
      ProcurementPermission.QUOTE_READ,
      ProcurementPermission.STOCK_READ,
      ProcurementPermission.STOCK_ACCESS,
      ProcurementPermission.STOCK_CREATE,
      ProcurementPermission.STOCK_WRITE,
      ProcurementPermission.STOCK_MOVE,
      ProcurementPermission.STOCK_ADJUST,
      ProcurementPermission.STOCK_COUNT,
      ProcurementPermission.PROCUREMENT_REPORTS
    ]
  },

  // Project Manager - Read access + BOQ approval
  PROJECT_MANAGER: {
    permissions: [
      ProcurementPermission.BOQ_READ,
      ProcurementPermission.BOQ_APPROVE,
      ProcurementPermission.BOQ_EXPORT,
      ProcurementPermission.RFQ_READ,
      ProcurementPermission.RFQ_CLOSE,
      ProcurementPermission.QUOTE_READ,
      ProcurementPermission.QUOTE_AWARD,
      ProcurementPermission.STOCK_READ,
      ProcurementPermission.PROCUREMENT_REPORTS,
      ProcurementPermission.PROCUREMENT_ANALYTICS
    ]
  },

  // Engineer - Read and BOQ management
  ENGINEER: {
    permissions: [
      ProcurementPermission.BOQ_READ,
      ProcurementPermission.BOQ_CREATE,
      ProcurementPermission.BOQ_WRITE,
      ProcurementPermission.BOQ_IMPORT,
      ProcurementPermission.BOQ_EXPORT,
      ProcurementPermission.BOQ_MAPPING,
      ProcurementPermission.RFQ_READ,
      ProcurementPermission.QUOTE_READ,
      ProcurementPermission.STOCK_READ,
      ProcurementPermission.PROCUREMENT_REPORTS
    ]
  },

  // Viewer - Read-only access
  VIEWER: {
    permissions: [
      ProcurementPermission.BOQ_READ,
      ProcurementPermission.RFQ_READ,
      ProcurementPermission.QUOTE_READ,
      ProcurementPermission.STOCK_READ,
      ProcurementPermission.PROCUREMENT_REPORTS
    ]
  }
} as const;

// User permission cache
interface UserPermissionCache {
  permissions: Set<ProcurementPermission>;
  roles: string[];
  projectAccessLevel: ProjectAccessLevel;
  timestamp: number;
}

class RBACMiddleware {
  private permissionCache = new Map<string, UserPermissionCache>();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Check if user has a specific permission for a project
   */
  async checkPermission(
    userId: string,
    permission: ProcurementPermission | string,
    projectId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Validate inputs
      if (!userId || !permission || !projectId) {
        return {
          success: false,
          error: 'User ID, permission, and project ID are required',
          code: 'INVALID_PARAMETERS'
        };
      }

      // Get user permissions
      const userPermissions = await this.getUserPermissions(userId, projectId);
      if (!userPermissions.success) {
        return userPermissions as ServiceResponse<boolean>;
      }

      // Check if user has the specific permission
      const hasPermission = userPermissions.data!.permissions.has(permission as ProcurementPermission);

      return {
        success: true,
        data: hasPermission
      };
    } catch (error) {
      console.error('[RBACMiddleware] checkPermission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Permission check failed',
        code: 'PERMISSION_CHECK_FAILED'
      };
    }
  }

  /**
   * Check multiple permissions (user must have ALL permissions)
   */
  async checkAllPermissions(
    userId: string,
    permissions: (ProcurementPermission | string)[],
    projectId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const userPermissions = await this.getUserPermissions(userId, projectId);
      if (!userPermissions.success) {
        return userPermissions as ServiceResponse<boolean>;
      }

      const hasAllPermissions = permissions.every(permission =>
        userPermissions.data!.permissions.has(permission as ProcurementPermission)
      );

      return {
        success: true,
        data: hasAllPermissions
      };
    } catch (error) {
      console.error('[RBACMiddleware] checkAllPermissions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Permission check failed',
        code: 'PERMISSION_CHECK_FAILED'
      };
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  async checkAnyPermission(
    userId: string,
    permissions: (ProcurementPermission | string)[],
    projectId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const userPermissions = await this.getUserPermissions(userId, projectId);
      if (!userPermissions.success) {
        return userPermissions as ServiceResponse<boolean>;
      }

      const hasAnyPermission = permissions.some(permission =>
        userPermissions.data!.permissions.has(permission as ProcurementPermission)
      );

      return {
        success: true,
        data: hasAnyPermission
      };
    } catch (error) {
      console.error('[RBACMiddleware] checkAnyPermission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Permission check failed',
        code: 'PERMISSION_CHECK_FAILED'
      };
    }
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
      const cacheKey = `${userId}:${projectId}`;
      const cached = this.permissionCache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
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
      const permissions = new Set<ProcurementPermission>();
      const roles = projectAccess.data.roles;

      // Add role-based permissions
      for (const role of roles) {
        const rolePermissions = this.getRolePermissions(role);
        rolePermissions.forEach(permission => permissions.add(permission));
      }

      // Add access-level-based permissions
      const accessLevelPermissions = this.getAccessLevelPermissions(projectAccess.data.accessLevel);
      accessLevelPermissions.forEach(permission => permissions.add(permission));

      // Cache the results
      const userPermissionCache: UserPermissionCache = {
        permissions,
        roles,
        projectAccessLevel: projectAccess.data.accessLevel,
        timestamp: Date.now()
      };

      this.permissionCache.set(cacheKey, userPermissionCache);

      return {
        success: true,
        data: userPermissionCache
      };
    } catch (error) {
      console.error('[RBACMiddleware] getUserPermissions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user permissions',
        code: 'USER_PERMISSIONS_FETCH_FAILED'
      };
    }
  }

  /**
   * Enforce permission requirement (throws error if not authorized)
   */
  async enforcePermission(
    userId: string,
    permission: ProcurementPermission | string,
    projectId: string
  ): Promise<void> {
    const hasPermission = await this.checkPermission(userId, permission, projectId);
    
    if (!hasPermission.success || !hasPermission.data) {
      throw new ProcurementPermissionError(
        permission,
        [], // We don't expose user permissions for security
        {
          userId,
          projectId,
          requiredPermission: permission
        }
      );
    }
  }

  /**
   * Clear permission cache for a user
   */
  async clearUserPermissionCache(userId: string, projectId?: string): Promise<void> {
    if (projectId) {
      // Clear specific project cache
      const cacheKey = `${userId}:${projectId}`;
      this.permissionCache.delete(cacheKey);
    } else {
      // Clear all caches for the user
      const keysToDelete = Array.from(this.permissionCache.keys())
        .filter(key => key.startsWith(`${userId}:`));
      
      keysToDelete.forEach(key => this.permissionCache.delete(key));
    }
  }

  // ==============================================
  // PRIVATE HELPER METHODS
  // ==============================================

  /**
   * Get permissions for a specific role
   */
  private getRolePermissions(role: string): ProcurementPermission[] {
    const normalizedRole = role.toUpperCase().replace(/[^A-Z_]/g, '_');
    
    // Map FibreFlow roles to procurement roles
    const roleMapping: Record<string, keyof typeof ProcurementRoles> = {
      'OWNER': 'PROCUREMENT_MANAGER',
      'ADMIN': 'PROCUREMENT_MANAGER',
      'PROJECT_MANAGER': 'PROJECT_MANAGER',
      'PROCUREMENT_MANAGER': 'PROCUREMENT_MANAGER',
      'PROCUREMENT_OFFICER': 'PROCUREMENT_OFFICER',
      'STOCK_MANAGER': 'STOCK_MANAGER',
      'LEAD_ENGINEER': 'ENGINEER',
      'ENGINEER': 'ENGINEER',
      'TECHNICIAN': 'VIEWER',
      'VIEWER': 'VIEWER',
      'READ_ONLY': 'VIEWER'
    };

    const procurementRole = roleMapping[normalizedRole] || 'VIEWER';
    return ProcurementRoles[procurementRole].permissions;
  }

  /**
   * Get base permissions based on project access level
   */
  private getAccessLevelPermissions(accessLevel: ProjectAccessLevel): ProcurementPermission[] {
    switch (accessLevel) {
      case ProjectAccessLevel.ADMIN:
        return ProcurementRoles.PROCUREMENT_MANAGER.permissions;
      
      case ProjectAccessLevel.WRITE:
        return ProcurementRoles.PROCUREMENT_OFFICER.permissions;
      
      case ProjectAccessLevel.READ:
        return ProcurementRoles.VIEWER.permissions;
      
      case ProjectAccessLevel.NONE:
      default:
        return [];
    }
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.permissionCache.entries()) {
      if (now - cached.timestamp >= this.CACHE_TTL) {
        this.permissionCache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const rbacMiddleware = new RBACMiddleware();

// Set up periodic cache cleanup
setInterval(() => {
  rbacMiddleware['cleanupCache']();
}, 10 * 60 * 1000); // Every 10 minutes

export default rbacMiddleware;