/**
 * Staff CRUD Operations
 * Core CRUD operations for staff management
 */

import { getSql } from '@/lib/neon-sql';
import { StaffMember, StaffFormData } from '@/types/staff.types';
import { validateStaffData, processReportsToField, logDebugInfo, logError } from './validators';
import { log } from '@/lib/logger';

/**
 * Create new staff member
 */
export async function createStaff(data: StaffFormData): Promise<StaffMember> {
  try {
    logDebugInfo('CREATE', data, data.reportsTo);
    
    // Validate required fields
    validateStaffData(data);
    
    // Process reportsTo field
    const processedReportsTo = processReportsToField(data.reportsTo);

    const result = await getSql()`
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

    const rows = result as any[];
    return rows[0] as StaffMember;
  } catch (error) {
    logError('CREATE', error, data);
    throw error;
  }
}

/**
 * Create or update staff member by employee ID (upsert operation)
 */
export async function createOrUpdateStaff(data: StaffFormData): Promise<StaffMember> {
  try {
    logDebugInfo('CREATE_OR_UPDATE', data, data.reportsTo);
    
    // Validate required fields
    validateStaffData(data);
    
    // Process reportsTo field
    const processedReportsTo = processReportsToField(data.reportsTo);

    // Check if staff member exists by employee_id
    const existing = await getSql()`
      SELECT id FROM staff WHERE employee_id = ${data.employeeId}
    `;
    
    const existingRows = existing as any[];
    if (existingRows.length > 0) {
      // Update existing staff member


      const result = await getSql()`
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

      const rows = result as any[];
      return rows[0] as StaffMember;
    } else {
      // Create new staff member


      const result = await getSql()`
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

      const rows = result as any[];
      return rows[0] as StaffMember;
    }
  } catch (error) {
    logError('CREATE_OR_UPDATE', error, data);
    throw error;
  }
}

/**
 * Update staff member
 */
export async function updateStaff(id: string, data: Partial<StaffFormData>): Promise<StaffMember> {
  try {
    // Handle empty string for UUID fields - convert to null
    const reportsTo = data.reportsTo && data.reportsTo.trim() !== '' ? data.reportsTo : null;
    
    const result = await getSql()`
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
    const rows = result as any[];
    return rows[0] as StaffMember;
  } catch (error) {
    log.error('Error updating staff member:', { data: error }, 'crudOperations');
    throw error;
  }
}

/**
 * Delete staff member
 */
export async function deleteStaff(id: string): Promise<void> {
  try {
    await getSql()`DELETE FROM staff WHERE id = ${id}`;
  } catch (error) {
    log.error('Error deleting staff member:', { data: error }, 'crudOperations');
    throw error;
  }
}