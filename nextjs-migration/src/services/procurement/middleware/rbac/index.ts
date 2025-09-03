/**
 * RBAC Middleware - Index
 * Centralizes all RBAC exports and provides main interface
 */

// Core components
export { RBACCore } from './rbacCore';
export { PermissionCacheManager } from './cacheManager';
export { PermissionChecker, type UserPermissionCache } from './permissionChecker';

// Permissions and roles
export { 
  ProcurementPermission,
  ProcurementRoles,
  ROLE_MAPPING,
  getRolePermissions,
  roleHasPermission,
  getCombinedRolePermissions
} from './permissions';

// Main RBAC middleware instance
export { rbacMiddleware } from './rbacMiddleware';

// Default export for backward compatibility
export { rbacMiddleware as default } from './rbacMiddleware';