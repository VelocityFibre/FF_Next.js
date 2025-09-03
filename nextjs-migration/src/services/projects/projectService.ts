import { BaseService } from '../base/BaseService';

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  clientId?: string;
  clientName?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  budget?: number;
  actualCost?: number;
  progress?: number;
  teamMembers?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ProjectFormData {
  name: string;
  code: string;
  description?: string;
  status?: string;
  clientId?: string;
  clientName?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  budget?: number;
  teamMembers?: string[];
  tags?: string[];
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalActualCost: number;
  averageProgress: number;
}

export interface ProjectApiResponse<T = Project> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProjectListResponse {
  success: boolean;
  data?: Project[];
  total?: number;
  error?: string;
}

/**
 * Project Service for Next.js
 * Handles all project-related API operations
 */
export class ProjectService extends BaseService {
  constructor() {
    super('projects');
  }

  /**
   * Get all projects
   */
  async getAllProjects(): Promise<ProjectListResponse> {
    try {
      return await this.get<ProjectListResponse>('');
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
      };
    }
  }

  /**
   * Get projects by status
   */
  async getProjectsByStatus(status: Project['status']): Promise<ProjectListResponse> {
    try {
      return await this.get<ProjectListResponse>(`?status=${status}`);
    } catch (error) {
      console.error('Failed to fetch projects by status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
      };
    }
  }

  /**
   * Get projects by client
   */
  async getProjectsByClient(clientId: string): Promise<ProjectListResponse> {
    try {
      return await this.get<ProjectListResponse>(`?clientId=${clientId}`);
    } catch (error) {
      console.error('Failed to fetch projects by client:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
      };
    }
  }

  /**
   * Get a single project by ID
   */
  async getProjectById(id: string): Promise<ProjectApiResponse> {
    try {
      return await this.get<ProjectApiResponse>(id);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch project',
      };
    }
  }

  /**
   * Create a new project
   */
  async createProject(data: ProjectFormData): Promise<ProjectApiResponse> {
    try {
      return await this.post<ProjectApiResponse>('', {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to create project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create project',
      };
    }
  }

  /**
   * Update a project
   */
  async updateProject(id: string, data: Partial<ProjectFormData>): Promise<ProjectApiResponse> {
    try {
      return await this.put<ProjectApiResponse>(id, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to update project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update project',
      };
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.delete<{ success: boolean; error?: string }>(id);
    } catch (error) {
      console.error('Failed to delete project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete project',
      };
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(): Promise<{ success: boolean; data?: ProjectStats; error?: string }> {
    try {
      return await this.get<{ success: boolean; data?: ProjectStats; error?: string }>('stats');
    } catch (error) {
      console.error('Failed to fetch project stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch project stats',
      };
    }
  }

  /**
   * Get project team members
   */
  async getProjectTeam(projectId: string): Promise<{ success: boolean; data?: string[]; error?: string }> {
    try {
      return await this.get<{ success: boolean; data?: string[]; error?: string }>(`${projectId}/team`);
    } catch (error) {
      console.error('Failed to fetch project team:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch project team',
      };
    }
  }

  /**
   * Add team member to project
   */
  async addTeamMember(projectId: string, userId: string): Promise<ProjectApiResponse> {
    try {
      return await this.post<ProjectApiResponse>(`${projectId}/team`, { userId });
    } catch (error) {
      console.error('Failed to add team member:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add team member',
      };
    }
  }

  /**
   * Remove team member from project
   */
  async removeTeamMember(projectId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.delete<{ success: boolean; error?: string }>(`${projectId}/team/${userId}`);
    } catch (error) {
      console.error('Failed to remove team member:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove team member',
      };
    }
  }

  /**
   * Search projects
   */
  async searchProjects(query: string): Promise<ProjectListResponse> {
    try {
      return await this.get<ProjectListResponse>(`search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Failed to search projects:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search projects',
      };
    }
  }
}

// Export singleton instance
export const projectService = new ProjectService();