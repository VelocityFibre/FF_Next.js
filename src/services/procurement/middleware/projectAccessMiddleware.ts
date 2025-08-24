/**
 * Project Access Middleware - Legacy Compatibility Layer
 * 
 * @deprecated This file has been split into modular components for better maintainability.
 * 
 * New modular structure:
 * - types.ts: Type definitions and interfaces
 * - cache.ts: Cache management for project access data
 * - validator.ts: Access level validation and permission checking
 * - dataService.ts: Database queries for project access information
 * - accessController.ts: Main access control logic and validation
 * - projectAccessMiddleware.ts: Main service orchestrator
 * 
 * For new code, import from the modular structure:
 * ```typescript
 * import { projectAccessMiddleware, ProjectAccessLevel } from '@/services/middleware/projectAccess';
 * // or
 * import { ProjectAccessController, ProjectAccessValidator } from '@/services/middleware/projectAccess';
 * ```
 * 
 * This legacy layer maintains backward compatibility while the codebase transitions.
 */

import { 
  projectAccessMiddleware as modularMiddleware, 
  ProjectAccessLevel 
} from '../../middleware/projectAccess';

// Re-export types for backward compatibility
export { ProjectAccessLevel };

/**
 * @deprecated Use the new modular projectAccessMiddleware from '@/services/middleware/projectAccess' instead
 * 
 * Legacy middleware instance that delegates to the new modular architecture
 */
export const projectAccessMiddleware = modularMiddleware;

export default projectAccessMiddleware;