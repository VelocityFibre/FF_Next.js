/**
 * Permission and Authorization Error Classes
 * Backward compatibility layer for existing imports
 * @deprecated Use ./permission/index.ts instead
 */

// Re-export all permission error classes and types
export {
  ProcurementPermissionError,
  ProjectAccessDeniedError,
  SupplierAccessError,
  RoleAccessError,
  PermissionErrorFactory
} from './permission/index';

// Re-export types for backward compatibility
export type {
  PermissionErrorOptions,
  ProjectAccessOptions,
  SupplierAccessOptions,
  RoleAccessOptions,
  AccessLevel,
  InvitationStatus
} from './permission/index';