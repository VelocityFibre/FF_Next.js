/**
 * Permission Error Types
 * Shared types and interfaces for permission error handling
 */

export interface PermissionErrorOptions {
  resourceType?: string;
  resourceId?: string;
  operation?: string;
  customMessage?: string;
}

export interface ProjectAccessOptions {
  projectName?: string;
  userRole?: string;
  requiredRole?: string;
  operation?: string;
}

export interface SupplierAccessOptions {
  supplierName?: string;
  invitationStatus?: 'pending' | 'expired' | 'revoked' | 'not_invited';
  expirationDate?: Date;
  operation?: string;
}

export interface RoleAccessOptions {
  roleHierarchy?: string[];
  departmentRestriction?: string;
  operation?: string;
}

export type AccessLevel = 'none' | 'read' | 'write' | 'admin';

export type InvitationStatus = 'pending' | 'expired' | 'revoked' | 'not_invited';
