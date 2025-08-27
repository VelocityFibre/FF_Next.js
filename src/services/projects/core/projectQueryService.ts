/**
 * Project Query Service
 * Handles all project read operations and filtering
 */

import { sql } from '@/lib/neon';
import type { Project, ProjectFilter } from '@/types/project.types';
import { ProjectDataMapper } from '../utils/projectDataMapper';
import { log } from '@/lib/logger';

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
      log.error('Error fetching projects from Neon:', { data: error }, 'projectQueryService');
      
      // If it's a database connection error, throw it to be handled by React Query
      if (error && typeof error === 'object') {
        const errorMessage = 'message' in error ? (error as any).message : '';
        if (errorMessage.includes('password authentication failed') || 
            errorMessage.includes('connection refused') ||
            errorMessage.includes('network error')) {
          throw error; // Let React Query handle the retry logic
        }
      }
      
      // For other errors, return empty array to prevent UI crashes
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
      log.error('Error fetching project by ID:', { data: error }, 'projectQueryService');
      
      // If it's a database connection error, throw it to be handled by React Query
      if (error && typeof error === 'object') {
        const errorMessage = 'message' in error ? (error as any).message : '';
        if (errorMessage.includes('password authentication failed') || 
            errorMessage.includes('connection refused') ||
            errorMessage.includes('network error')) {
          throw error; // Let React Query handle the retry logic
        }
      }
      
      // For other errors, return null
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
      log.error('Error fetching projects by client:', { data: error }, 'projectQueryService');
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
      log.error('Error fetching projects by status:', { data: error }, 'projectQueryService');
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
      log.error('Error searching projects:', { data: error }, 'projectQueryService');
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
        WHERE p.status IN ('ACTIVE', 'IN_PROGRESS', 'active', 'in_progress')
        ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC
      `;
      
      return result.map(ProjectDataMapper.mapToProject);
    } catch (error) {
      log.error('Error fetching active projects:', { data: error }, 'projectQueryService');
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
        WHERE p.status NOT IN ('archived', 'cancelled', 'deleted')
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
        WHERE p.status NOT IN ('archived', 'cancelled', 'deleted')
        ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
      
      const projects = result.map(ProjectDataMapper.mapToProject);
      
      return { projects, total };
    } catch (error) {
      log.error('Error fetching paginated projects:', { data: error }, 'projectQueryService');
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