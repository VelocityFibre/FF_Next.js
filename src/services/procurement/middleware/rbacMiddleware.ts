/**
 * RBAC Middleware - Legacy Compatibility Layer
 * This file maintains backward compatibility for existing imports
 * New code should import from './rbac' directly
 */

// Re-export everything from the modular structure
export * from './rbac';

// Default export for backward compatibility
export { rbacMiddleware as default } from './rbac';