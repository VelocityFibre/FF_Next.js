/**
 * Project Service Barrel Export
 * Centralized exports for all project service modules
 */

// Core service classes
export * from './core/ProjectCrudService';
export * from './core/ProjectQueryService';
export * from './core/ProjectProgressService';
export * from './core/ProjectTeamService';

// Types
export * from './types/service.types';

// Main service class for backward compatibility
import { ProjectCrudService } from './core/ProjectCrudService';
import { ProjectQueryService } from './core/ProjectQueryService';
import { ProjectProgressService } from './core/ProjectProgressService';
import { ProjectTeamService } from './core/ProjectTeamService';
import { 
  CreateProjectRequest, 
  UpdateProjectRequest,
  ProjectListQuery,
  ProjectStatus,
  Project
} from '../../types/project.types';
import { ProjectQueryResult } from './types/service.types';

class ProjectService {
  // CRUD operations
  async createProject(data: CreateProjectRequest): Promise<string> {
    return ProjectCrudService.createProject(data);
  }

  async getProjectById(projectId: string): Promise<Project | null> {
    return ProjectCrudService.getProjectById(projectId);
  }

  async updateProject(data: UpdateProjectRequest): Promise<void> {
    return ProjectCrudService.updateProject(data);
  }

  async deleteProject(projectId: string): Promise<void> {
    return ProjectCrudService.deleteProject(projectId);
  }

  async updateProjectStatus(projectId: string, status: ProjectStatus): Promise<void> {
    return ProjectCrudService.updateProjectStatus(projectId, status);
  }

  // Query operations
  async getProjects(queryOptions?: ProjectListQuery): Promise<ProjectQueryResult> {
    return ProjectQueryService.getProjects(queryOptions);
  }

  async getProjectsByClient(clientId: string): Promise<Project[]> {
    return ProjectQueryService.getProjectsByClient(clientId);
  }

  async getProjectsByManager(managerId: string): Promise<Project[]> {
    return ProjectQueryService.getProjectsByManager(managerId);
  }

  // Progress operations
  async updateProjectProgress(
    projectId: string, 
    progress: Partial<Project['progress']>
  ): Promise<void> {
    return ProjectProgressService.updateProjectProgress(projectId, progress);
  }

  // Team operations
  async addTeamMember(
    projectId: string, 
    staffId: string, 
    role: string, 
    position: string
  ): Promise<void> {
    return ProjectTeamService.addTeamMember(projectId, staffId, role, position);
  }

  async removeTeamMember(projectId: string, staffId: string): Promise<void> {
    return ProjectTeamService.removeTeamMember(projectId, staffId);
  }
}

export const projectService = new ProjectService();