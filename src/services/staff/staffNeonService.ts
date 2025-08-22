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
      // If no filters, return all staff with manager information
      if (!filter || (!filter.status?.length && !filter.department?.length)) {
        const result = await sql`
          SELECT 
            s.*,
            m.name as manager_name,
            m.position as manager_position
          FROM staff s
          LEFT JOIN staff m ON s.reports_to = m.id
          ORDER BY s.name ASC
        `;
        return result.map((staff: any) => ({
          ...staff,
          managerName: staff.manager_name,
          managerPosition: staff.manager_position
        })) as StaffMember[];
      }
      
      // Handle filtering with tagged templates only
      if (filter.status?.length && filter.department?.length) {
        // Both status and department filters - for now just handle simple cases
        const statusValue = filter.status[0]; // Take first status
        const deptValue = filter.department[0]; // Take first department
        const result = await sql`
          SELECT 
            s.*,
            m.name as manager_name,
            m.position as manager_position
          FROM staff s
          LEFT JOIN staff m ON s.reports_to = m.id
          WHERE s.status = ${statusValue} AND s.department = ${deptValue}
          ORDER BY s.name ASC
        `;
        return result.map((staff: any) => ({
          ...staff,
          managerName: staff.manager_name,
          managerPosition: staff.manager_position
        })) as StaffMember[];
      } else if (filter.status?.length) {
        // Status filter only
        const statusValue = filter.status[0]; // Take first status for simplicity
        const result = await sql`
          SELECT 
            s.*,
            m.name as manager_name,
            m.position as manager_position
          FROM staff s
          LEFT JOIN staff m ON s.reports_to = m.id
          WHERE s.status = ${statusValue}
          ORDER BY s.name ASC
        `;
        return result.map((staff: any) => ({
          ...staff,
          managerName: staff.manager_name,
          managerPosition: staff.manager_position
        })) as StaffMember[];
      } else if (filter.department?.length) {
        // Department filter only
        const deptValue = filter.department[0]; // Take first department for simplicity
        const result = await sql`
          SELECT 
            s.*,
            m.name as manager_name,
            m.position as manager_position
          FROM staff s
          LEFT JOIN staff m ON s.reports_to = m.id
          WHERE s.department = ${deptValue}
          ORDER BY s.name ASC
        `;
        return result.map((staff: any) => ({
          ...staff,
          managerName: staff.manager_name,
          managerPosition: staff.manager_position
        })) as StaffMember[];
      }
      
      // Fallback to all staff
      const result = await sql`
        SELECT 
          s.*,
          m.name as manager_name,
          m.position as manager_position
        FROM staff s
        LEFT JOIN staff m ON s.reports_to = m.id
        ORDER BY s.name ASC
      `;
      return result.map((staff: any) => ({
        ...staff,
        managerName: staff.manager_name,
        managerPosition: staff.manager_position
      })) as StaffMember[];
      
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
      const result = await sql`
        SELECT 
          s.*,
          m.name as manager_name,
          m.position as manager_position
        FROM staff s
        LEFT JOIN staff m ON s.reports_to = m.id
        WHERE s.id = ${id} 
        LIMIT 1
      `;
      
      if (result.length === 0) return null;
      
      const staff = result[0];
      return {
        ...staff,
        employeeId: staff.employee_id, // Map snake_case to camelCase
        managerName: staff.manager_name,
        managerPosition: staff.manager_position,
        startDate: staff.join_date, // Map join_date to startDate
        alternativePhone: staff.alternate_phone, // Map alternate_phone to alternativePhone
        contractType: staff.type, // Map type to contractType
      } as StaffMember;
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
      // COMPREHENSIVE DEBUG LOGGING - UUID ERROR TRACING
      console.log('🔍 CREATE METHOD - Full debugging trace:');
      console.log('1. Raw input data:', JSON.stringify(data, null, 2));
      console.log('2. reportsTo field analysis:');
      console.log('   - Raw value:', data.reportsTo);
      console.log('   - Type:', typeof data.reportsTo);
      console.log('   - String representation:', String(data.reportsTo));
      console.log('   - JSON stringify:', JSON.stringify(data.reportsTo));
      console.log('   - Is undefined?', data.reportsTo === undefined);
      console.log('   - Is null?', data.reportsTo === null);
      console.log('   - Is empty string?', data.reportsTo === '');
      console.log('   - Trimmed length:', data.reportsTo ? String(data.reportsTo).trim().length : 'N/A');
      
      // Validate required fields before database call
      if (!data.employeeId || data.employeeId.trim() === '') {
        throw new Error('Employee ID is required and cannot be empty');
      }
      
      if (!data.name || data.name.trim() === '') {
        throw new Error('Name is required and cannot be empty');
      }
      
      if (!data.email || data.email.trim() === '') {
        throw new Error('Email is required and cannot be empty');
      }
      
      // ULTRA-SAFE UUID PROCESSING - Multiple validation layers
      let processedReportsTo: string | null = null;
      
      console.log('3. UUID Processing steps:');
      
      // Step 1: Check if reportsTo exists and is not undefined/null
      if (data.reportsTo !== undefined && data.reportsTo !== null) {
        console.log('   Step 1: reportsTo is not undefined/null');
        
        // Step 2: Convert to string and check if not empty
        const reportsToString = String(data.reportsTo).trim();
        console.log('   Step 2: Converted to string and trimmed:', `"${reportsToString}"`);
        
        // Step 3: Validate it's a non-empty string
        if (reportsToString !== '' && reportsToString !== 'undefined' && reportsToString !== 'null') {
          console.log('   Step 3: String is valid, using as UUID');
          processedReportsTo = reportsToString;
        } else {
          console.log('   Step 3: String is empty/invalid, setting to null');
          processedReportsTo = null;
        }
      } else {
        console.log('   Step 1: reportsTo is undefined/null, setting to null');
        processedReportsTo = null;
      }
      
      console.log('4. Final processed reportsTo:', processedReportsTo);
      console.log('5. Final processed reportsTo type:', typeof processedReportsTo);
      
      // TRIPLE CHECK - Absolutely ensure no empty strings
      if (processedReportsTo === '') {
        console.log('🚨 EMERGENCY: Empty string detected at final check, converting to null');
        processedReportsTo = null;
      }
      
      console.log('6. Pre-SQL final value:', processedReportsTo);
      
      const result = await sql`
        INSERT INTO staff (
          employee_id, name, email, phone, department, position, 
          status, join_date, reports_to, created_at, updated_at
        ) VALUES (
          ${data.employeeId.trim()}, ${data.name.trim()}, ${data.email.trim()}, ${data.phone.trim()},
          ${data.department}, ${data.position}, ${data.status || 'ACTIVE'},
          ${data.startDate || new Date()}, ${processedReportsTo}, 
          NOW(), NOW()
        ) RETURNING *
      `;
      
      console.log('✅ CREATE SUCCESS - Staff member created:', result[0]);
      return result[0] as StaffMember;
    } catch (error) {
      console.error('❌ CREATE ERROR - Detailed error info:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        inputData: data,
        processedData: {
          employeeId: data.employeeId,
          reportsTo: data.reportsTo
        }
      });
      throw error;
    }
  },

  /**
   * Create or update staff member by employee ID (upsert operation)
   */
  async createOrUpdate(data: StaffFormData): Promise<StaffMember> {
    try {
      // COMPREHENSIVE DEBUG LOGGING - CREATE OR UPDATE METHOD
      console.log('🔍 CREATE_OR_UPDATE METHOD - Full debugging trace:');
      console.log('1. Raw input data:', JSON.stringify(data, null, 2));
      console.log('2. reportsTo field analysis:');
      console.log('   - Raw value:', data.reportsTo);
      console.log('   - Type:', typeof data.reportsTo);
      console.log('   - String representation:', String(data.reportsTo));
      console.log('   - JSON stringify:', JSON.stringify(data.reportsTo));
      console.log('   - Is undefined?', data.reportsTo === undefined);
      console.log('   - Is null?', data.reportsTo === null);
      console.log('   - Is empty string?', data.reportsTo === '');
      
      // Validate required fields before database call
      if (!data.employeeId || data.employeeId.trim() === '') {
        throw new Error('Employee ID is required and cannot be empty');
      }
      
      if (!data.name || data.name.trim() === '') {
        throw new Error('Name is required and cannot be empty');
      }
      
      if (!data.email || data.email.trim() === '') {
        throw new Error('Email is required and cannot be empty');
      }
      
      // ULTRA-SAFE UUID PROCESSING - Multiple validation layers
      let processedReportsTo: string | null = null;
      
      console.log('3. UUID Processing steps:');
      
      // Step 1: Check if reportsTo exists and is not undefined/null
      if (data.reportsTo !== undefined && data.reportsTo !== null) {
        console.log('   Step 1: reportsTo is not undefined/null');
        
        // Step 2: Convert to string and check if not empty
        const reportsToString = String(data.reportsTo).trim();
        console.log('   Step 2: Converted to string and trimmed:', `"${reportsToString}"`);
        
        // Step 3: Validate it's a non-empty string
        if (reportsToString !== '' && reportsToString !== 'undefined' && reportsToString !== 'null') {
          console.log('   Step 3: String is valid, using as UUID');
          processedReportsTo = reportsToString;
        } else {
          console.log('   Step 3: String is empty/invalid, setting to null');
          processedReportsTo = null;
        }
      } else {
        console.log('   Step 1: reportsTo is undefined/null, setting to null');
        processedReportsTo = null;
      }
      
      console.log('4. Final processed reportsTo:', processedReportsTo);
      console.log('5. Final processed reportsTo type:', typeof processedReportsTo);
      
      // TRIPLE CHECK - Absolutely ensure no empty strings
      if (processedReportsTo === '') {
        console.log('🚨 EMERGENCY: Empty string detected at final check, converting to null');
        processedReportsTo = null;
      }
      
      console.log('6. Pre-SQL final value:', processedReportsTo);
      
      // Check if staff member exists by employee_id
      const existing = await sql`
        SELECT id FROM staff WHERE employee_id = ${data.employeeId}
      `;
      
      if (existing.length > 0) {
        // Update existing staff member
        console.log(`✏️ UPDATING existing staff member with employee ID: ${data.employeeId}`);
        console.log('7. Pre-UPDATE SQL final value:', processedReportsTo);
        
        const result = await sql`
          UPDATE staff SET
            name = ${data.name},
            email = ${data.email},
            phone = ${data.phone},
            department = ${data.department},
            position = ${data.position},
            status = ${data.status || 'ACTIVE'},
            reports_to = ${processedReportsTo},
            updated_at = NOW()
          WHERE employee_id = ${data.employeeId}
          RETURNING *
        `;
        
        console.log('✅ UPDATE SUCCESS - Staff member updated:', result[0]);
        return result[0] as StaffMember;
      } else {
        // Create new staff member
        console.log(`➕ CREATING new staff member with employee ID: ${data.employeeId}`);
        console.log('7. Pre-INSERT SQL final value:', processedReportsTo);
        
        const result = await sql`
          INSERT INTO staff (
            employee_id, name, email, phone, department, position, 
            status, join_date, reports_to, created_at, updated_at
          ) VALUES (
            ${data.employeeId}, ${data.name}, ${data.email}, ${data.phone},
            ${data.department}, ${data.position}, ${data.status || 'ACTIVE'},
            ${data.startDate || new Date()}, ${processedReportsTo}, 
            NOW(), NOW()
          ) RETURNING *
        `;
        
        console.log('✅ INSERT SUCCESS - Staff member created:', result[0]);
        return result[0] as StaffMember;
      }
    } catch (error) {
      console.error('❌ CREATE_OR_UPDATE ERROR - Detailed error info:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        inputData: data,
        processedData: {
          employeeId: data.employeeId,
          reportsTo: data.reportsTo
        }
      });
      throw error;
    }
  },

  /**
   * Update staff member
   */
  async update(id: string, data: Partial<StaffFormData>): Promise<StaffMember> {
    try {
      // Handle empty string for UUID fields - convert to null
      const reportsTo = data.reportsTo && data.reportsTo.trim() !== '' ? data.reportsTo : null;
      
      const result = await sql`
        UPDATE staff SET
          name = ${data.name},
          email = ${data.email},
          phone = ${data.phone},
          department = ${data.department},
          position = ${data.position},
          status = ${data.status},
          reports_to = ${reportsTo},
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
        status: 'ACTIVE' as any, // Type will be fixed when we properly implement enums
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
        status: 'ACTIVE' as any, // Type will be fixed when we properly implement enums
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