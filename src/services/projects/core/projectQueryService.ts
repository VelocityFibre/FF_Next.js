/**
 * Project Query Service
 * Handles all project read operations and filtering
 */

import { sql } from '@/lib/neon';
import type { Project, ProjectFilter } from '@/types/project.types';
import { ProjectDataMapper } from '../utils/projectDataMapper';

/**
 * Project query and filtering service
 */
export class ProjectQueryService {
  /**
   * Get all projects with optional filtering
   */
  static async getAllProjects(filter?: ProjectFilter): Promise<Project[]> {
    try {

      const result = await this.buildFilteredQuery(filter);

      return result.map(ProjectDataMapper.mapToProject);
    } catch (error) {
      console.error('Error fetching projects from Neon:', error);
      return [];
    }
  }

  /**
   * Get a single project by ID
   */
  static async getProjectById(id: string): Promise<Project | null> {
    try {
      const result = await sql`
        SELECT 
          p.*,
          c.name as client_name,
          c.contact_person as client_contact
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.id = ${id}
        LIMIT 1
      `;
      
      if (!result || result.length === 0) {
        return null;
      }
      
      return ProjectDataMapper.mapToProject(result[0] as any);
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      return null;
    }
  }

  /**
   * Get projects by client ID
   */
  static async getProjectsByClient(clientId: string): Promise<Project[]> {
    try {
      const result = await sql`
        SELECT 
          p.*,
          c.name as client_name,
          c.contact_person as client_contact
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.client_id = ${clientId}
        ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC
      `;
      
      return result.map(ProjectDataMapper.mapToProject);
    } catch (error) {
      console.error('Error fetching projects by client:', error);
      return [];
    }
  }

  /**
   * Get projects by status
   */
  static async getProjectsByStatus(status: string): Promise<Project[]> {
    try {
      const result = await sql`
        SELECT 
          p.*,
          c.name as client_name,
          c.contact_person as client_contact
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.status = ${status}
        ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC
      `;
      
      return result.map(ProjectDataMapper.mapToProject);
    } catch (error) {
      console.error('Error fetching projects by status:', error);
      return [];
    }
  }

  /**
   * Search projects by name or code
   */
  static async searchProjects(searchTerm: string): Promise<Project[]> {
    try {
      const result = await sql`
        SELECT 
          p.*,
          c.name as client_name,
          c.contact_person as client_contact
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE 
          p.name ILIKE ${'%' + searchTerm + '%'} OR
          p.code ILIKE ${'%' + searchTerm + '%'} OR
          p.description ILIKE ${'%' + searchTerm + '%'}
        ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC
      `;
      
      return result.map(ProjectDataMapper.mapToProject);
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  }

  /**
   * Get active projects only
   */
  static async getActiveProjects(): Promise<Project[]> {
    try {
      const result = await sql`
        SELECT 
          p.*,
          c.name as client_name,
          c.contact_person as client_contact
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.is_active = true AND p.status IN ('ACTIVE', 'IN_PROGRESS')
        ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC
      `;
      
      return result.map(ProjectDataMapper.mapToProject);
    } catch (error) {
      console.error('Error fetching active projects:', error);
      return [];
    }
  }

  /**
   * Get projects with pagination
   */
  static async getProjectsPaginated(
    limit: number = 10,
    offset: number = 0,
    _filter?: ProjectFilter
  ): Promise<{ projects: Project[]; total: number }> {
    try {
      // Get total count
      const countResult = await sql`
        SELECT COUNT(*) as total
        FROM projects p
        WHERE p.is_active = true
      `;
      
      const total = parseInt(countResult[0].total);
      
      // Get paginated results
      const result = await sql`
        SELECT 
          p.*,
          c.name as client_name,
          c.contact_person as client_contact
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.is_active = true
        ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
      
      const projects = result.map(ProjectDataMapper.mapToProject);
      
      return { projects, total };
    } catch (error) {
      console.error('Error fetching paginated projects:', error);
      return { projects: [], total: 0 };
    }
  }

  /**
   * Build filtered query based on provided filter options
   */
  private static async buildFilteredQuery(filter?: ProjectFilter): Promise<any[]> {
    // Base query - get all projects with client information
    if (!filter || Object.keys(filter).length === 0) {
      return await sql`
        SELECT 
          p.*,
          c.name as client_name,
          c.contact_person as client_contact
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC
      `;
    }
    
    // Handle filtering by status
    if (filter.status) {
      return await sql`
        SELECT 
          p.*,
          c.name as client_name,
          c.contact_person as client_contact
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.status = ${filter.status}
        ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC
      `;
    }
    
    // Handle filtering by client
    if (filter.clientId) {
      return await sql`
        SELECT 
          p.*,
          c.name as client_name,
          c.contact_person as client_contact
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.client_id = ${filter.clientId}
        ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC
      `;
    }
    
    // Default: return all projects
    return await sql`
      SELECT 
        p.*,
        c.name as client_name,
        c.contact_person as client_contact
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC
    `;
  }
}