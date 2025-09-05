/**
 * Procurement Permission Utilities
 * Helper functions for converting between different permission formats
 */

import { ProcurementPermissions as BasePermissions } from '@/types/procurement/base.types';
import { ProcurementPermissions as PortalPermissions } from '@/types/procurement/portal.types';
import { ProcurementApiContext } from '@/services/procurement/index';

/**
 * Convert ProcurementPermissions object to string array for API context
 */
export function convertPermissionsToStringArray(permissions: BasePermissions): string[] {
  const permissionArray: string[] = [];
  
  if (permissions.canCreateBOQ) permissionArray.push('boq:create');
  if (permissions.canEditBOQ) permissionArray.push('boq:edit');
  if (permissions.canDeleteBOQ) permissionArray.push('boq:delete');
  if (permissions.canApproveBOQ) permissionArray.push('boq:approve');
  if (permissions.canCreateRFQ) permissionArray.push('rfq:create');
  if (permissions.canEditRFQ) permissionArray.push('rfq:edit');
  if (permissions.canDeleteRFQ) permissionArray.push('rfq:delete');
  if (permissions.canCreatePO) permissionArray.push('po:create');
  if (permissions.canEditPO) permissionArray.push('po:edit');
  if (permissions.canDeletePO) permissionArray.push('po:delete');
  if (permissions.canApprovePO) permissionArray.push('po:approve');
  if (permissions.canManageStock) permissionArray.push('stock:manage');
  if (permissions.canViewReports) permissionArray.push('reports:view');
  if (permissions.isAdmin) permissionArray.push('admin');
  
  return permissionArray;
}

/**
 * Convert portal permissions object to string array for API context
 */
export function convertPortalPermissionsToStringArray(permissions: PortalPermissions): string[] {
  const permissionArray: string[] = [];
  
  if (permissions.canViewBOQ) permissionArray.push('boq:view');
  if (permissions.canEditBOQ) permissionArray.push('boq:edit');
  if (permissions.canViewRFQ) permissionArray.push('rfq:view');
  if (permissions.canCreateRFQ) permissionArray.push('rfq:create');
  if (permissions.canViewQuotes) permissionArray.push('quotes:view');
  if (permissions.canEvaluateQuotes) permissionArray.push('quotes:evaluate');
  if (permissions.canViewPurchaseOrders) permissionArray.push('po:view');
  if (permissions.canCreatePurchaseOrders) permissionArray.push('po:create');
  if (permissions.canAccessStock) permissionArray.push('stock:view');
  if (permissions.canManageStock) permissionArray.push('stock:manage');
  if (permissions.canApproveOrders) permissionArray.push('orders:approve');
  if (permissions.canAccessReports) permissionArray.push('reports:view');
  if (permissions.canViewSuppliers) permissionArray.push('suppliers:view');
  if (permissions.canEditSuppliers) permissionArray.push('suppliers:edit');
  if (permissions.canManageSuppliers) permissionArray.push('suppliers:manage');
  
  // Add role-based permissions
  permissionArray.push(`role:${permissions.role}`);
  if (permissions.approvalLimit > 0) {
    permissionArray.push(`approval:${permissions.approvalLimit}`);
  }
  
  return permissionArray;
}

/**
 * Create a compatible ProcurementApiContext from ProcurementContext
 */
export function createApiContextFromProcurementContext(
  procurementContext: {
    projectId: string;
    userId: string;
    userName?: string;
    permissions: BasePermissions;
  },
  options: {
    userRole?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    source?: 'web' | 'mobile' | 'api';
  } = {}
): ProcurementApiContext {
  return {
    userId: procurementContext.userId,
    userName: procurementContext.userName,
    userRole: options.userRole || 'user',
    projectId: procurementContext.projectId,
    permissions: convertPermissionsToStringArray(procurementContext.permissions),
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    sessionId: options.sessionId,
    source: options.source || 'web'
  };
}

/**
 * Create a compatible ProcurementApiContext from portal context
 */
export function createApiContextFromPortalContext(
  portalContext: {
    selectedProject: { id: string; name?: string } | undefined;
    permissions: PortalPermissions;
  },
  userId: string,
  userName?: string,
  options: {
    userRole?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    source?: 'web' | 'mobile' | 'api';
  } = {}
): ProcurementApiContext | null {
  if (!portalContext.selectedProject) {
    return null;
  }

  return {
    userId,
    userName,
    userRole: options.userRole || portalContext.permissions.role,
    projectId: portalContext.selectedProject.id,
    permissions: convertPortalPermissionsToStringArray(portalContext.permissions),
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    sessionId: options.sessionId,
    source: options.source || 'web'
  };
}

/**
 * Check if user has specific permission in string array format
 */
export function hasPermission(permissions: string[], permission: string): boolean {
  return permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(permissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => permissions.includes(permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(permissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => permissions.includes(permission));
}