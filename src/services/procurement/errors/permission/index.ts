/**
 * Permission Errors Index
 * Unified exports for all permission error types
 */

// Import error classes for factory usage
import { ProcurementPermissionError } from './base';
import { ProjectAccessDeniedError } from './project';
import { SupplierAccessError } from './supplier';
import { RoleAccessError } from './role';

// Export base error class
export { ProcurementPermissionError } from './base';

// Export specialized error classes
export { ProjectAccessDeniedError } from './project';
export { SupplierAccessError } from './supplier';
export { RoleAccessError } from './role';

// Export types
export type {
  PermissionErrorOptions,
  ProjectAccessOptions,
  SupplierAccessOptions,
  RoleAccessOptions,
  AccessLevel,
  InvitationStatus
} from './types';

// Export factory functions for common error scenarios
export class PermissionErrorFactory {
  /**
   * Create a project access denied error
   */
  static projectAccessDenied(
    projectId: string,
    requiredPermission: string,
    userPermissions: string[],
    options?: {
      projectName?: string;
      userRole?: string;
      requiredRole?: string;
      operation?: string;
    }
  ) {
    return new ProjectAccessDeniedError(
      projectId,
      requiredPermission,
      userPermissions,
      options
    );
  }

  /**
   * Create a supplier access error
   */
  static supplierAccessDenied(
    supplierId: string,
    requiredPermission: string,
    userPermissions: string[],
    options?: {
      supplierName?: string;
      invitationStatus?: 'pending' | 'expired' | 'revoked' | 'not_invited';
      expirationDate?: Date;
      operation?: string;
    }
  ) {
    return new SupplierAccessError(
      supplierId,
      requiredPermission,
      userPermissions,
      options
    );
  }

  /**
   * Create a role access error
   */
  static roleAccessDenied(
    userRole: string,
    requiredRole: string,
    requiredPermission: string,
    userPermissions: string[],
    options?: {
      roleHierarchy?: string[];
      departmentRestriction?: string;
      operation?: string;
    }
  ) {
    return new RoleAccessError(
      userRole,
      requiredRole,
      requiredPermission,
      userPermissions,
      options
    );
  }

  /**
   * Create a generic permission error
   */
  static genericPermissionDenied(
    requiredPermission: string,
    userPermissions: string[],
    options?: {
      resourceType?: string;
      resourceId?: string;
      operation?: string;
      customMessage?: string;
    }
  ) {
    return new ProcurementPermissionError(
      requiredPermission,
      userPermissions,
      options
    );
  }
}
