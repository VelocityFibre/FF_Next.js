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
      // If no filters, return all staff
      if (!filter || (!filter.status?.length && !filter.department?.length)) {
        const result = await sql`SELECT * FROM staff ORDER BY name ASC`;
        return result as StaffMember[];
      }
      
      // Handle filtering with tagged templates only
      if (filter.status?.length && filter.department?.length) {
        // Both status and department filters - for now just handle simple cases
        const statusValue = filter.status[0]; // Take first status
        const deptValue = filter.department[0]; // Take first department
        const result = await sql`
          SELECT * FROM staff 
          WHERE status = ${statusValue} AND department = ${deptValue}
          ORDER BY name ASC
        `;
        return result as StaffMember[];
      } else if (filter.status?.length) {
        // Status filter only
        const statusValue = filter.status[0]; // Take first status for simplicity
        const result = await sql`
          SELECT * FROM staff 
          WHERE status = ${statusValue}
          ORDER BY name ASC
        `;
        return result as StaffMember[];
      } else if (filter.department?.length) {
        // Department filter only
        const deptValue = filter.department[0]; // Take first department for simplicity
        const result = await sql`
          SELECT * FROM staff 
          WHERE department = ${deptValue}
          ORDER BY name ASC
        `;
        return result as StaffMember[];
      }
      
      // Fallback to all staff
      const result = await sql`SELECT * FROM staff ORDER BY name ASC`;
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
      const onLeaveResult = await sql`SELECT COUNT(*) as count FROM staff WHERE status = 'ON_LEAVE'`;
      
      // Get department breakdown
      const departmentResult = await sql`
        SELECT department, COUNT(*) as count 
        FROM staff 
        GROUP BY department
      `;
      
      const totalStaff = parseInt(totalResult[0].count);
      const activeStaff = parseInt(activeResult[0].count);
      const inactiveStaff = parseInt(inactiveResult[0].count);
      const onLeaveStaff = parseInt(onLeaveResult[0].count);
      
      // Calculate utilization rate (assuming active staff are utilized)
      const utilizationRate = totalStaff > 0 ? (activeStaff / totalStaff) * 100 : 0;
      
      // Build department breakdown
      const staffByDepartment: { [key: string]: number } = {};
      departmentResult.forEach((dept: any) => {
        staffByDepartment[dept.department] = parseInt(dept.count);
      });
      
      return {
        totalStaff,
        activeStaff,
        inactiveStaff,
        onLeaveStaff,
        availableStaff: activeStaff,
        monthlyGrowth: 0, // TODO: Calculate monthly growth
        averageProjectLoad: 0, // TODO: Calculate average project load
        staffByDepartment,
        staffByLevel: {}, // TODO: Get level breakdown
        staffBySkill: {}, // TODO: Get skill breakdown
        staffByContractType: {}, // TODO: Get contract type breakdown
        averageExperience: 0, // TODO: Calculate average experience
        utilizationRate,
        overallocatedStaff: 0, // TODO: Calculate overallocated staff
        underutilizedStaff: 0, // TODO: Calculate underutilized staff
        topPerformers: [], // TODO: Get top performers
        topSkills: [] // TODO: Get top skills
      };
    } catch (error) {
      console.error('Error fetching staff summary:', error);
      throw error;
    }
  }
};