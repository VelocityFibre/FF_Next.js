/**
 * Project Access Middleware Types
 * Type definitions and interfaces for project access control
 */

// Project access levels
export enum ProjectAccessLevel {
  NONE = 'none',
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin'
}

// User project access interface
export interface UserProjectAccess {
  projectId: string;
  accessLevel: ProjectAccessLevel;
  roles: string[];
  departments: string[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

// Project information interface
export interface ProjectInfo {
  id: string;
  name: string;
  status: string;
  clientId?: string;
  members: Record<string, {
    role: string;
    accessLevel: ProjectAccessLevel;
    departments: string[];
  }>;
}

// Project access with user info
export interface ProjectWithAccess extends ProjectInfo {
  userAccess: UserProjectAccess;
}

// Operation types
export type AccessOperation = 'read' | 'write' | 'delete' | 'admin';

// Project scope conditions
export interface ProjectScopeConditions {
  userId: string;
  projectIds: string[];
  timestamp: Date;
}

// Cache entry structure
export interface CacheEntry {
  data: UserProjectAccess[];
  timestamp: number;
}