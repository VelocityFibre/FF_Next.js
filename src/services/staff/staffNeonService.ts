import { sql } from '@/lib/neon';
import { 
  StaffMember, 
  StaffFormData,
  StaffFilter,
  StaffSummary,
  StaffDropdownOption
} from '@/types/staff.types';

/**
 * Staff service using Neon PostgreSQL database
 */
export const staffNeonService = {
  /**
   * Get all staff with optional filtering
   */
  async getAll(filter?: StaffFilter): Promise<StaffMember[]> {
    try {
      let query = 'SELECT * FROM staff ORDER BY name ASC';
      const params: any[] = [];
      
      if (filter) {
        const conditions: string[] = [];
        let paramCount = 0;
        
        if (filter.status?.length) {
          paramCount++;
          conditions.push(`status = ANY($${paramCount})`);
          params.push(filter.status);
        }
        
        if (filter.department?.length) {
          paramCount++;
          conditions.push(`department = ANY($${paramCount})`);
          params.push(filter.department);
        }
        
        if (conditions.length > 0) {
          query = `SELECT * FROM staff WHERE ${conditions.join(' AND ')} ORDER BY name ASC`;
        }
      }
      
      const result = await sql(query, params);
      return result as StaffMember[];
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  },

  /**
   * Get staff member by ID
   */
  async getById(id: string): Promise<StaffMember | null> {
    try {
      const result = await sql`SELECT * FROM staff WHERE id = ${id} LIMIT 1`;
      return result[0] as StaffMember || null;
    } catch (error) {
      console.error('Error fetching staff member:', error);
      throw error;
    }
  },

  /**
   * Create new staff member
   */
  async create(data: StaffFormData): Promise<StaffMember> {
    try {
      const result = await sql`
        INSERT INTO staff (
          employee_id, name, email, phone, department, position, 
          status, join_date, reports_to, created_at, updated_at
        ) VALUES (
          ${data.employeeId}, ${data.name}, ${data.email}, ${data.phone},
          ${data.department}, ${data.position}, ${data.status || 'ACTIVE'},
          ${data.joinDate || new Date()}, ${data.reportsTo}, 
          NOW(), NOW()
        ) RETURNING *
      `;
      return result[0] as StaffMember;
    } catch (error) {
      console.error('Error creating staff member:', error);
      throw error;
    }
  },

  /**
   * Update staff member
   */
  async update(id: string, data: Partial<StaffFormData>): Promise<StaffMember> {
    try {
      const result = await sql`
        UPDATE staff SET
          name = ${data.name},
          email = ${data.email},
          phone = ${data.phone},
          department = ${data.department},
          position = ${data.position},
          status = ${data.status},
          reports_to = ${data.reportsTo},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0] as StaffMember;
    } catch (error) {
      console.error('Error updating staff member:', error);
      throw error;
    }
  },

  /**
   * Delete staff member
   */
  async delete(id: string): Promise<void> {
    try {
      await sql`DELETE FROM staff WHERE id = ${id}`;
    } catch (error) {
      console.error('Error deleting staff member:', error);
      throw error;
    }
  },

  /**
   * Get active staff for dropdowns
   */
  async getActiveStaff(): Promise<StaffDropdownOption[]> {
    try {
      const result = await sql`
        SELECT id, name, position, department, email 
        FROM staff 
        WHERE status = 'ACTIVE'
        ORDER BY name ASC
      `;
      
      return result.map((staff: any) => ({
        id: staff.id,
        name: staff.name,
        position: staff.position,
        department: staff.department,
        email: staff.email,
        status: 'ACTIVE',
        currentProjectCount: 0, // TODO: Calculate from projects
        maxProjectCount: 5 // TODO: Get from staff settings
      }));
    } catch (error) {
      console.error('Error fetching active staff:', error);
      throw error;
    }
  },

  /**
   * Get project managers for dropdowns
   */
  async getProjectManagers(): Promise<StaffDropdownOption[]> {
    try {
      const result = await sql`
        SELECT id, name, position, department, email 
        FROM staff 
        WHERE status = 'ACTIVE' 
          AND (position LIKE '%Manager%' OR position LIKE '%Lead%' OR position = 'MD')
        ORDER BY name ASC
      `;
      
      return result.map((staff: any) => ({
        id: staff.id,
        name: staff.name,
        position: staff.position,
        department: staff.department || 'Management',
        email: staff.email,
        status: 'ACTIVE',
        currentProjectCount: 0, // TODO: Calculate from projects
        maxProjectCount: 10 // Managers can handle more projects
      }));
    } catch (error) {
      console.error('Error fetching project managers:', error);
      throw error;
    }
  },

  /**
   * Get staff summary statistics
   */
  async getStaffSummary(): Promise<StaffSummary> {
    try {
      const totalResult = await sql`SELECT COUNT(*) as count FROM staff`;
      const activeResult = await sql`SELECT COUNT(*) as count FROM staff WHERE status = 'ACTIVE'`;
      const inactiveResult = await sql`SELECT COUNT(*) as count FROM staff WHERE status = 'INACTIVE'`;
      
      return {
        total: parseInt(totalResult[0].count),
        active: parseInt(activeResult[0].count),
        inactive: parseInt(inactiveResult[0].count),
        onLeave: 0, // TODO: Add on_leave status
        departments: [], // TODO: Get department breakdown
        recentHires: [] // TODO: Get recent hires
      };
    } catch (error) {
      console.error('Error fetching staff summary:', error);
      throw error;
    }
  }
};