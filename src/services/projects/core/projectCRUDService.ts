/**
 * Project CRUD Service
 * Handles all project create, update, and delete operations
 */

import { sql } from '@/lib/neon';
import type { ProjectFormData } from '@/types/project.types';
import { log } from '@/lib/logger';

/**
 * Project CRUD operations service
 */
export class ProjectCRUDService {
  /**
   * Create a new project
   */
  static async createProject(data: ProjectFormData): Promise<string> {
    try {
      const result = await sql`
        INSERT INTO projects (
          name, code, description, status, type, priority,
          client_id, start_date, end_date, budget, 
          location, manager, is_active,
          created_at, updated_at
        ) VALUES (
          ${data.name},
          ${data.code},
          ${data.description || null},
          ${data.status || 'PLANNING'},
          ${data.projectType || 'OTHER'},
          ${data.priority || 'MEDIUM'},
          ${data.clientId || null},
          ${data.startDate || null},
          ${data.endDate || null},
          ${data.budget || null},
          ${data.location || null},
          ${data.projectManagerId || null},
          ${true},
          NOW(),
          NOW()
        )
        RETURNING id
      `;
      
      return result[0].id;
    } catch (error) {
      log.error('Error creating project:', { data: error }, 'projectCRUDService');
      throw error;
    }
  }

  /**
   * Update an existing project
   */
  static async updateProject(id: string, data: Partial<ProjectFormData>): Promise<void> {
    try {
      await sql`
        UPDATE projects
        SET 
          name = COALESCE(${data.name}, name),
          code = COALESCE(${data.code}, code),
          description = COALESCE(${data.description}, description),
          status = COALESCE(${data.status}, status),
          type = COALESCE(${data.projectType}, type),
          priority = COALESCE(${data.priority}, priority),
          client_id = COALESCE(${data.clientId}, client_id),
          budget = COALESCE(${data.budget}, budget),
          start_date = COALESCE(${data.startDate}, start_date),
          end_date = COALESCE(${data.endDate}, end_date),
          location = COALESCE(${data.location}, location),
          manager = COALESCE(${data.projectManagerId}, manager),
          updated_at = NOW()
        WHERE id = ${id}
      `;
    } catch (error) {
      log.error('Error updating project:', { data: error }, 'projectCRUDService');
      throw error;
    }
  }

  /**
   * Delete a project (soft delete by setting is_active = false)
   */
  static async deleteProject(id: string): Promise<void> {
    try {
      await sql`
        UPDATE projects
        SET is_active = false, updated_at = NOW()
        WHERE id = ${id}
      `;
    } catch (error) {
      log.error('Error deleting project:', { data: error }, 'projectCRUDService');
      throw error;
    }
  }

  /**
   * Hard delete a project (permanent removal)
   */
  static async hardDeleteProject(id: string): Promise<void> {
    try {
      await sql`
        DELETE FROM projects
        WHERE id = ${id}
      `;
    } catch (error) {
      log.error('Error hard deleting project:', { data: error }, 'projectCRUDService');
      throw error;
    }
  }

  /**
   * Update project status
   */
  static async updateProjectStatus(id: string, status: string): Promise<void> {
    try {
      await sql`
        UPDATE projects
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${id}
      `;
    } catch (error) {
      log.error('Error updating project status:', { data: error }, 'projectCRUDService');
      throw error;
    }
  }

  /**
   * Update project progress
   */
  static async updateProjectProgress(id: string, progress: number): Promise<void> {
    try {
      await sql`
        UPDATE projects
        SET progress = ${progress}, updated_at = NOW()
        WHERE id = ${id}
      `;
    } catch (error) {
      log.error('Error updating project progress:', { data: error }, 'projectCRUDService');
      throw error;
    }
  }

  /**
   * Update project budget
   */
  static async updateProjectBudget(id: string, budget: number): Promise<void> {
    try {
      await sql`
        UPDATE projects
        SET budget = ${budget}, updated_at = NOW()
        WHERE id = ${id}
      `;
    } catch (error) {
      log.error('Error updating project budget:', { data: error }, 'projectCRUDService');
      throw error;
    }
  }

  /**
   * Restore a soft-deleted project
   */
  static async restoreProject(id: string): Promise<void> {
    try {
      await sql`
        UPDATE projects
        SET is_active = true, updated_at = NOW()
        WHERE id = ${id}
      `;
    } catch (error) {
      log.error('Error restoring project:', { data: error }, 'projectCRUDService');
      throw error;
    }
  }

  /**
   * Bulk update project status
   */
  static async bulkUpdateStatus(projectIds: string[], status: string): Promise<void> {
    try {
      await sql`
        UPDATE projects
        SET status = ${status}, updated_at = NOW()
        WHERE id = ANY(${projectIds})
      `;
    } catch (error) {
      log.error('Error bulk updating project status:', { data: error }, 'projectCRUDService');
      throw error;
    }
  }

  /**
   * Assign project to client
   */
  static async assignProjectToClient(projectId: string, clientId: string): Promise<void> {
    try {
      await sql`
        UPDATE projects
        SET client_id = ${clientId}, updated_at = NOW()
        WHERE id = ${projectId}
      `;
    } catch (error) {
      log.error('Error assigning project to client:', { data: error }, 'projectCRUDService');
      throw error;
    }
  }

  /**
   * Update project dates
   */
  static async updateProjectDates(
    id: string, 
    startDate?: Date | null, 
    endDate?: Date | null
  ): Promise<void> {
    try {
      await sql`
        UPDATE projects
        SET 
          start_date = COALESCE(${startDate || null}, start_date),
          end_date = COALESCE(${endDate || null}, end_date),
          updated_at = NOW()
        WHERE id = ${id}
      `;
    } catch (error) {
      log.error('Error updating project dates:', { data: error }, 'projectCRUDService');
      throw error;
    }
  }
}