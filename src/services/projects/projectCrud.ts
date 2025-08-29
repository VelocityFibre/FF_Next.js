/**
 * Project CRUD Service
 * Handles basic Create, Read, Update, Delete operations for projects
 * Using API routes for browser, Neon for server/build
 */

import { projectNeonService } from './projectNeonService';
import { projectApiService } from '../project/projectApiService';
import type { Project, ProjectFormData, ProjectFilter } from '@/types/project.types';
import { ProjectStatus } from '@/types/project.types';

// Use API service in browser, Neon service for server/build
const isBrowser = typeof window !== 'undefined';
const baseService = isBrowser ? projectApiService : projectNeonService;

/**
 * Get all projects with optional filtering
 */
export async function getAll(filter?: ProjectFilter): Promise<Project[]> {
  if (isBrowser) {
    // API service doesn't support filtering yet, so get all and filter client-side
    const projects = await baseService.getAll();
    if (!filter) return projects;
    
    return projects.filter(project => {
      if (filter.status && !filter.status.includes(project.status as ProjectStatus)) return false;
      if (filter.clientId && !filter.clientId.includes(project.client_id || '')) return false;
      if (filter.projectType && !filter.projectType.includes(project.project_type || '')) return false;
      return true;
    });
  }
  return projectNeonService.getAll(filter);
}

/**
 * Get a single project by ID
 */
export async function getById(id: string): Promise<Project | null> {
  return baseService.getById(id);
}

/**
 * Create a new project
 */
export async function create(data: ProjectFormData): Promise<string> {
  if (isBrowser) {
    const project = await projectApiService.create(data as any);
    return project.id || '';
  }
  return projectNeonService.create(data);
}

/**
 * Update an existing project
 */
export async function update(id: string, data: Partial<ProjectFormData>): Promise<void> {
  if (isBrowser) {
    await projectApiService.update(id, data as any);
    return;
  }
  return projectNeonService.update(id, data);
}

/**
 * Delete a project
 */
export async function remove(id: string): Promise<void> {
  if (isBrowser) {
    await projectApiService.delete(id);
    return;
  }
  return projectNeonService.remove(id);
}

/**
 * Get projects by client ID
 */
export async function getByClientId(clientId: string): Promise<Project[]> {
  if (isBrowser) {
    return projectApiService.getProjectsByClient(clientId);
  }
  return projectNeonService.getAll({ clientId: [clientId] });
}

/**
 * Get active projects
 */
export async function getActiveProjects(): Promise<Project[]> {
  if (isBrowser) {
    return projectApiService.getActiveProjects();
  }
  return projectNeonService.getAll({ status: [ProjectStatus.ACTIVE] });
}