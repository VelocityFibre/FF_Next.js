/**
 * Project Access Middleware - Modular Export
 * Centralized export for all project access modules
 */

// Types and interfaces
export type {
  UserProjectAccess,
  ProjectInfo,
  ProjectWithAccess,
  AccessOperation,
  ProjectScopeConditions,
  CacheEntry
} from './types';

export { ProjectAccessLevel } from './types';

// Core services
export { ProjectAccessCache } from './cache';
export { ProjectAccessValidator } from './validator';
export { ProjectAccessDataService } from './dataService';
export { ProjectAccessController } from './accessController';

// Main middleware class and instance
export { ProjectAccessMiddleware, projectAccessMiddleware } from './projectAccessMiddleware';