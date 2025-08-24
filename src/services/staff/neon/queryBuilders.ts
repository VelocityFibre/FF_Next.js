/**
 * Staff Query Builders for Neon PostgreSQL
 * Reusable query building functions for staff operations
 */

import { sql } from '@/lib/neon';
import { StaffFilter } from '@/types/staff.types';

/**
 * Build base staff query with manager information
 */
export const baseStaffQuery = () => sql`
  SELECT 
    s.*,
    m.name as manager_name,
    m.position as manager_position
  FROM staff s
  LEFT JOIN staff m ON s.reports_to = m.id
`;

/**
 * Query all staff with optional filtering
 */
export async function queryStaffWithFilters(filter?: StaffFilter) {
  // If no filters, return all staff
  if (!filter || (!filter.status?.length && !filter.department?.length)) {
    return sql`
      SELECT 
        s.*,
        m.name as manager_name,
        m.position as manager_position
      FROM staff s
      LEFT JOIN staff m ON s.reports_to = m.id
      ORDER BY s.name ASC
    `;
  }
  
  // Handle filtering with tagged templates only
  if (filter.status?.length && filter.department?.length) {
    // Both status and department filters - for now just handle simple cases
    const statusValue = filter.status[0]; // Take first status
    const deptValue = filter.department[0]; // Take first department
    return sql`
      SELECT 
        s.*,
        m.name as manager_name,
        m.position as manager_position
      FROM staff s
      LEFT JOIN staff m ON s.reports_to = m.id
      WHERE s.status = ${statusValue} AND s.department = ${deptValue}
      ORDER BY s.name ASC
    `;
  } else if (filter.status?.length) {
    // Status filter only
    const statusValue = filter.status[0]; // Take first status for simplicity
    return sql`
      SELECT 
        s.*,
        m.name as manager_name,
        m.position as manager_position
      FROM staff s
      LEFT JOIN staff m ON s.reports_to = m.id
      WHERE s.status = ${statusValue}
      ORDER BY s.name ASC
    `;
  } else if (filter.department?.length) {
    // Department filter only
    const deptValue = filter.department[0]; // Take first department for simplicity
    return sql`
      SELECT 
        s.*,
        m.name as manager_name,
        m.position as manager_position
      FROM staff s
      LEFT JOIN staff m ON s.reports_to = m.id
      WHERE s.department = ${deptValue}
      ORDER BY s.name ASC
    `;
  }
  
  // Fallback to all staff
  return sql`
    SELECT 
      s.*,
      m.name as manager_name,
      m.position as manager_position
    FROM staff s
    LEFT JOIN staff m ON s.reports_to = m.id
    ORDER BY s.name ASC
  `;
}

/**
 * Query staff by ID
 */
export async function queryStaffById(id: string) {
  return sql`
    SELECT 
      s.*,
      m.name as manager_name,
      m.position as manager_position
    FROM staff s
    LEFT JOIN staff m ON s.reports_to = m.id
    WHERE s.id = ${id} 
    LIMIT 1
  `;
}

/**
 * Query active staff for dropdowns
 */
export async function queryActiveStaff() {
  return sql`
    SELECT id, name, position, department, email 
    FROM staff 
    WHERE status = 'ACTIVE'
    ORDER BY name ASC
  `;
}

/**
 * Query project managers
 */
export async function queryProjectManagers() {
  return sql`
    SELECT id, name, position, department, email 
    FROM staff 
    WHERE status = 'ACTIVE' 
      AND (position LIKE '%Manager%' OR position LIKE '%Lead%' OR position = 'MD')
    ORDER BY name ASC
  `;
}