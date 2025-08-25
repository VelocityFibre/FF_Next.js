/**
 * Project CRUD Service
 * Handles basic Create, Read, Update, Delete operations for projects
 * Using Neon PostgreSQL as the primary data source
 */

import { projectNeonService } from './projectNeonService';
import type { Project, ProjectFormData, ProjectFilter } from '@/types/project.types';
import { ProjectStatus } from '@/types/project.types';

/**
 * Get all projects with optional filtering
 */
export async function getAll(filter?: ProjectFilter): Promise<Project[]> {
  return projectNeonService.getAll(filter);
}

/**
 * Get a single project by ID
 */
export async function getById(id: string): Promise<Project | null> {
  return projectNeonService.getById(id);
}

/**
 * Create a new project
 */
export async function create(data: ProjectFormData): Promise<string> {
  return projectNeonService.create(data);
}

/**
 * Update an existing project
 */
export async function update(id: string, data: Partial<ProjectFormData>): Promise<void> {
  return projectNeonService.update(id, data);
}

/**
 * Delete a project
 */
export async function remove(id: string): Promise<void> {
  return projectNeonService.remove(id);
}

/**
 * Get projects by client ID
 */
export async function getByClientId(clientId: string): Promise<Project[]> {
  return projectNeonService.getAll({ clientId: [clientId] });
}

/**
 * Get active projects
 */
export async function getActiveProjects(): Promise<Project[]> {
  return projectNeonService.getAll({ status: [ProjectStatus.ACTIVE] });
}