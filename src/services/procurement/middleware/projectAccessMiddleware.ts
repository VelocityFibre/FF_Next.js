/**
 * Project Access Middleware
 * Ensures data isolation by validating user access to projects
 * Integrates with Firebase Auth and existing FibreFlow project access patterns
 */

import { authService } from '@/services/auth/authService';
import { db as firestoreDb } from '@/config/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ProcurementPermissionError, createProcurementError } from '../procurementErrors';
import type { ServiceResponse } from '@/services/core/BaseService';

// Project access levels
export enum ProjectAccessLevel {
  NONE = 'none',
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin'
}

// User project access interface
interface UserProjectAccess {
  projectId: string;
  accessLevel: ProjectAccessLevel;
  roles: string[];
  departments: string[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

// Project information interface
interface ProjectInfo {
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

class ProjectAccessMiddleware {
  private accessCache = new Map<string, { data: UserProjectAccess[]; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if user has access to a specific project
   */
  async checkProjectAccess(
    userId: string, 
    projectId: string, 
    requiredLevel: ProjectAccessLevel = ProjectAccessLevel.READ
  ): Promise<ServiceResponse<UserProjectAccess | null>> {
    try {
      // Validate inputs
      if (!userId || !projectId) {
        return {
          success: false,
          error: 'User ID and Project ID are required',
          code: 'INVALID_PARAMETERS'
        };
      }

      // Get user's project access
      const userAccess = await this.getUserProjectAccess(userId);
      if (!userAccess.success) {
        return userAccess as ServiceResponse<UserProjectAccess | null>;
      }

      // Find access for the specific project
      const projectAccess = userAccess.data!.find(access => access.projectId === projectId);
      
      if (!projectAccess) {
        return {
          success: false,
          error: 'No access to project',
          code: 'PROJECT_ACCESS_DENIED'
        };
      }

      // Check if access has expired
      if (projectAccess.expiresAt && projectAccess.expiresAt < new Date()) {
        return {
          success: false,
          error: 'Project access has expired',
          code: 'PROJECT_ACCESS_EXPIRED'
        };
      }

      // Validate access level
      if (!this.hasRequiredAccessLevel(projectAccess.accessLevel, requiredLevel)) {
        return {
          success: false,
          error: `Insufficient access level. Required: ${requiredLevel}, Current: ${projectAccess.accessLevel}`,
          code: 'INSUFFICIENT_ACCESS_LEVEL'
        };
      }

      return {
        success: true,
        data: projectAccess
      };
    } catch (error) {
      console.error('[ProjectAccessMiddleware] checkProjectAccess error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'ACCESS_CHECK_FAILED'
      };
    }
  }

  /**
   * Get all projects a user has access to
   */
  async getUserProjectAccess(userId: string): Promise<ServiceResponse<UserProjectAccess[]>> {
    try {
      // Check cache first
      const cacheKey = `user_projects_${userId}`;
      const cached = this.accessCache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
        return {
          success: true,
          data: cached.data
        };
      }

      // Query Firestore for user's project access
      // This integrates with FibreFlow's existing project access patterns
      const userProjectsQuery = query(
        collection(firestoreDb, 'user_project_access'),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );

      const userProjectsSnapshot = await getDocs(userProjectsQuery);
      const projectAccess: UserProjectAccess[] = [];

      for (const docSnap of userProjectsSnapshot.docs) {
        const data = docSnap.data();
        
        // Validate project still exists and user still has access
        const projectDoc = await getDoc(doc(firestoreDb, 'projects', data.projectId));
        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          
          // Check if user is still a member of the project
          if (projectData.members && projectData.members[userId]) {
            const memberInfo = projectData.members[userId];
            
            projectAccess.push({
              projectId: data.projectId,
              accessLevel: this.mapRoleToAccessLevel(memberInfo.role),
              roles: Array.isArray(memberInfo.roles) ? memberInfo.roles : [memberInfo.role],
              departments: memberInfo.departments || [],
              grantedBy: data.grantedBy || 'system',
              grantedAt: data.grantedAt?.toDate() || new Date(),
              expiresAt: data.expiresAt?.toDate()
            });
          }
        }
      }

      // Cache the results
      this.accessCache.set(cacheKey, {
        data: projectAccess,
        timestamp: Date.now()
      });

      return {
        success: true,
        data: projectAccess
      };
    } catch (error) {
      console.error('[ProjectAccessMiddleware] getUserProjectAccess error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user project access',
        code: 'USER_ACCESS_FETCH_FAILED'
      };
    }
  }

  /**
   * Validate project access for API requests
   */
  async validateProjectAccess(
    userId: string,
    projectId: string,
    operation: 'read' | 'write' | 'delete' | 'admin'
  ): Promise<ServiceResponse<UserProjectAccess>> {
    try {
      const requiredLevel = this.mapOperationToAccessLevel(operation);
      const accessCheck = await this.checkProjectAccess(userId, projectId, requiredLevel);
      
      if (!accessCheck.success || !accessCheck.data) {
        throw new ProcurementPermissionError(
          `project:${operation}`,
          [],
          {
            projectId,
            userId,
            operation,
            requiredAccessLevel: requiredLevel
          }
        );
      }

      return {
        success: true,
        data: accessCheck.data
      };
    } catch (error) {
      if (error instanceof ProcurementPermissionError) {
        return {
          success: false,
          error: error.message,
          code: error.code
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Project access validation failed',
        code: 'PROJECT_ACCESS_VALIDATION_FAILED'
      };
    }
  }

  /**
   * Get project information with access validation
   */
  async getProjectWithAccess(userId: string, projectId: string): Promise<ServiceResponse<ProjectInfo & { userAccess: UserProjectAccess }>> {
    try {
      // Validate project access
      const accessCheck = await this.checkProjectAccess(userId, projectId);
      if (!accessCheck.success || !accessCheck.data) {
        return accessCheck as any;
      }

      // Get project information
      const projectDoc = await getDoc(doc(firestoreDb, 'projects', projectId));
      if (!projectDoc.exists()) {
        return {
          success: false,
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND'
        };
      }

      const projectData = projectDoc.data();
      const projectInfo: ProjectInfo = {
        id: projectDoc.id,
        name: projectData.name || 'Unnamed Project',
        status: projectData.status || 'active',
        clientId: projectData.clientId,
        members: projectData.members || {}
      };

      return {
        success: true,
        data: {
          ...projectInfo,
          userAccess: accessCheck.data
        }
      };
    } catch (error) {
      console.error('[ProjectAccessMiddleware] getProjectWithAccess error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get project with access',
        code: 'PROJECT_FETCH_WITH_ACCESS_FAILED'
      };
    }
  }

  /**
   * Refresh project access cache for a user
   */
  async refreshUserProjectAccess(userId: string): Promise<void> {
    const cacheKey = `user_projects_${userId}`;
    this.accessCache.delete(cacheKey);
    
    // Trigger fresh fetch
    await this.getUserProjectAccess(userId);
  }

  /**
   * Create project-scoped query conditions for database operations
   */
  getProjectScopeConditions(userId: string, projectIds: string[]): {
    userId: string;
    projectIds: string[];
    timestamp: Date;
  } {
    return {
      userId,
      projectIds,
      timestamp: new Date()
    };
  }

  // ==============================================
  // PRIVATE HELPER METHODS
  // ==============================================

  /**
   * Map FibreFlow role to access level
   */
  private mapRoleToAccessLevel(role: string): ProjectAccessLevel {
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
  private mapOperationToAccessLevel(operation: string): ProjectAccessLevel {
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
  private hasRequiredAccessLevel(current: ProjectAccessLevel, required: ProjectAccessLevel): boolean {
    const levelHierarchy = {
      [ProjectAccessLevel.NONE]: 0,
      [ProjectAccessLevel.READ]: 1,
      [ProjectAccessLevel.WRITE]: 2,
      [ProjectAccessLevel.ADMIN]: 3
    };

    return levelHierarchy[current] >= levelHierarchy[required];
  }

  /**
   * Clear expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.accessCache.entries()) {
      if (now - cached.timestamp >= this.CACHE_TTL) {
        this.accessCache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const projectAccessMiddleware = new ProjectAccessMiddleware();

// Set up periodic cache cleanup
setInterval(() => {
  projectAccessMiddleware['cleanupCache']();
}, 5 * 60 * 1000); // Every 5 minutes

export default projectAccessMiddleware;