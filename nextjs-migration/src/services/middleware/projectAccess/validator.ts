/**
 * Project Access Validation Service
 * Handles access level validation and permission checking
 */

import { ProjectAccessLevel, AccessOperation } from './types';

/**
 * Project access validation utilities
 */
export class ProjectAccessValidator {
  /**
   * Map FibreFlow role to access level
   */
  static mapRoleToAccessLevel(role: string): ProjectAccessLevel {
    const roleMapping: Record<string, ProjectAccessLevel> = {
      'owner': ProjectAccessLevel.ADMIN,
      'admin': ProjectAccessLevel.ADMIN,
      'project_manager': ProjectAccessLevel.ADMIN,
      'lead_engineer': ProjectAccessLevel.WRITE,
      'engineer': ProjectAccessLevel.WRITE,
      'technician': ProjectAccessLevel.READ,
      'viewer': ProjectAccessLevel.READ,
      'read_only': ProjectAccessLevel.READ
    };

    return roleMapping[role.toLowerCase()] || ProjectAccessLevel.NONE;
  }

  /**
   * Map operation to required access level
   */
  static mapOperationToAccessLevel(operation: AccessOperation): ProjectAccessLevel {
    const operationMapping: Record<string, ProjectAccessLevel> = {
      'read': ProjectAccessLevel.READ,
      'view': ProjectAccessLevel.READ,
      'write': ProjectAccessLevel.WRITE,
      'create': ProjectAccessLevel.WRITE,
      'update': ProjectAccessLevel.WRITE,
      'delete': ProjectAccessLevel.ADMIN,
      'admin': ProjectAccessLevel.ADMIN,
      'manage': ProjectAccessLevel.ADMIN
    };

    return operationMapping[operation.toLowerCase()] || ProjectAccessLevel.WRITE;
  }

  /**
   * Check if current access level meets required level
   */
  static hasRequiredAccessLevel(current: ProjectAccessLevel, required: ProjectAccessLevel): boolean {
    const levelHierarchy = {
      [ProjectAccessLevel.NONE]: 0,
      [ProjectAccessLevel.READ]: 1,
      [ProjectAccessLevel.WRITE]: 2,
      [ProjectAccessLevel.ADMIN]: 3
    };

    return levelHierarchy[current] >= levelHierarchy[required];
  }

  /**
   * Validate input parameters
   */
  static validateParameters(userId: string, projectId: string): { isValid: boolean; error?: string } {
    if (!userId || !projectId) {
      return {
        isValid: false,
        error: 'User ID and Project ID are required'
      };
    }

    if (typeof userId !== 'string' || typeof projectId !== 'string') {
      return {
        isValid: false,
        error: 'User ID and Project ID must be strings'
      };
    }

    return { isValid: true };
  }

  /**
   * Check if access has expired
   */
  static isAccessExpired(expiresAt?: Date): boolean {
    if (!expiresAt) return false;
    return expiresAt < new Date();
  }

  /**
   * Get access level hierarchy score
   */
  static getAccessLevelScore(level: ProjectAccessLevel): number {
    const scores = {
      [ProjectAccessLevel.NONE]: 0,
      [ProjectAccessLevel.READ]: 1,
      [ProjectAccessLevel.WRITE]: 2,
      [ProjectAccessLevel.ADMIN]: 3
    };

    return scores[level] || 0;
  }

  /**
   * Compare two access levels
   */
  static compareAccessLevels(level1: ProjectAccessLevel, level2: ProjectAccessLevel): number {
    const score1 = this.getAccessLevelScore(level1);
    const score2 = this.getAccessLevelScore(level2);
    return score1 - score2;
  }
}