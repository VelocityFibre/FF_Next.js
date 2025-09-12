import type { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandler } from '@/lib/api-error-handler';
import { logCreate, logUpdate, logDelete } from '@/lib/db-logger';
import { getSql } from '@/lib/neon-sql';

// Create a new SQL instance for each request to avoid connection issues
const getSqlInstance = () => getSql();

export default withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const sql = getSqlInstance();
  // CORS handled by withErrorHandler
  
  try {
    switch (req.method) {
      case 'GET': {
        // Get all staff or single staff member by ID
        const { id, search, department, status, position } = req.query;
        
        if (id) {
          // Get single staff member
          const staff = await sql`
            SELECT
              s.*,
              CONCAT(s.first_name, ' ', s.last_name) as name,
              CONCAT(s.first_name, ' ', s.last_name) as full_name
            FROM staff s
            WHERE s.id = ${id as string}
          `;
          
          const staffRows = staff as any[];
          if (staffRows.length === 0) {
            return res.status(404).json({ 
              success: false, 
              data: null, 
              message: 'Staff member not found' 
            });
          }
          
          res.status(200).json({ success: true, data: staffRows[0] });
        } else {
          // Build query with filters using parameterized queries
          let staff;

          if (search && department && status && position) {
            const searchTerm = `%${search}%`;
            const positionTerm = `%${position}%`;
            staff = await sql`
              SELECT
                s.*,
                CONCAT(s.first_name, ' ', s.last_name) as name,
                CONCAT(s.first_name, ' ', s.last_name) as full_name
              FROM staff s
              WHERE (
                LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(${searchTerm}) OR
                LOWER(s.first_name) LIKE LOWER(${searchTerm}) OR
                LOWER(s.last_name) LIKE LOWER(${searchTerm}) OR
                LOWER(s.email) LIKE LOWER(${searchTerm}) OR
                LOWER(s.employee_id) LIKE LOWER(${searchTerm})
              ) AND s.department = ${department} AND s.status = ${status} AND LOWER(s.position) LIKE LOWER(${positionTerm})
              ORDER BY s.created_at DESC NULLS LAST
            `;
          } else if (search && department && status) {
            const searchTerm = `%${search}%`;
            staff = await sql`
              SELECT
                s.*,
                CONCAT(s.first_name, ' ', s.last_name) as name,
                CONCAT(s.first_name, ' ', s.last_name) as full_name
              FROM staff s
              WHERE (
                LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(${searchTerm}) OR
                LOWER(s.first_name) LIKE LOWER(${searchTerm}) OR
                LOWER(s.last_name) LIKE LOWER(${searchTerm}) OR
                LOWER(s.email) LIKE LOWER(${searchTerm}) OR
                LOWER(s.employee_id) LIKE LOWER(${searchTerm})
              ) AND s.department = ${department} AND s.status = ${status}
              ORDER BY s.created_at DESC NULLS LAST
            `;
          } else if (search && department) {
            const searchTerm = `%${search}%`;
            staff = await sql`
              SELECT
                s.*,
                CONCAT(s.first_name, ' ', s.last_name) as name,
                CONCAT(s.first_name, ' ', s.last_name) as full_name
              FROM staff s
              WHERE (
                LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(${searchTerm}) OR
                LOWER(s.first_name) LIKE LOWER(${searchTerm}) OR
                LOWER(s.last_name) LIKE LOWER(${searchTerm}) OR
                LOWER(s.email) LIKE LOWER(${searchTerm}) OR
                LOWER(s.employee_id) LIKE LOWER(${searchTerm})
              ) AND s.department = ${department}
              ORDER BY s.created_at DESC NULLS LAST
            `;
          } else if (search) {
            const searchTerm = `%${search}%`;
            staff = await sql`
              SELECT
                s.*,
                CONCAT(s.first_name, ' ', s.last_name) as name,
                CONCAT(s.first_name, ' ', s.last_name) as full_name
              FROM staff s
              WHERE (
                LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(${searchTerm}) OR
                LOWER(s.first_name) LIKE LOWER(${searchTerm}) OR
                LOWER(s.last_name) LIKE LOWER(${searchTerm}) OR
                LOWER(s.email) LIKE LOWER(${searchTerm}) OR
                LOWER(s.employee_id) LIKE LOWER(${searchTerm})
              )
              ORDER BY s.created_at DESC NULLS LAST
            `;
          } else if (department && status && position) {
            const positionTerm = `%${position}%`;
            staff = await sql`
              SELECT
                s.*,
                CONCAT(s.first_name, ' ', s.last_name) as name,
                CONCAT(s.first_name, ' ', s.last_name) as full_name
              FROM staff s
              WHERE s.department = ${department} AND s.status = ${status} AND LOWER(s.position) LIKE LOWER(${positionTerm})
              ORDER BY s.created_at DESC NULLS LAST
            `;
          } else if (department && status) {
            staff = await sql`
              SELECT
                s.*,
                CONCAT(s.first_name, ' ', s.last_name) as name,
                CONCAT(s.first_name, ' ', s.last_name) as full_name
              FROM staff s
              WHERE s.department = ${department} AND s.status = ${status}
              ORDER BY s.created_at DESC NULLS LAST
            `;
          } else if (department) {
            staff = await sql`
              SELECT
                s.*,
                CONCAT(s.first_name, ' ', s.last_name) as name,
                CONCAT(s.first_name, ' ', s.last_name) as full_name
              FROM staff s
              WHERE s.department = ${department}
              ORDER BY s.created_at DESC NULLS LAST
            `;
          } else if (status) {
            staff = await sql`
              SELECT
                s.*,
                CONCAT(s.first_name, ' ', s.last_name) as name,
                CONCAT(s.first_name, ' ', s.last_name) as full_name
              FROM staff s
              WHERE s.status = ${status}
              ORDER BY s.created_at DESC NULLS LAST
            `;
          } else if (position) {
            const positionTerm = `%${position}%`;
            staff = await sql`
              SELECT
                s.*,
                CONCAT(s.first_name, ' ', s.last_name) as name,
                CONCAT(s.first_name, ' ', s.last_name) as full_name
              FROM staff s
              WHERE LOWER(s.position) LIKE LOWER(${positionTerm})
              ORDER BY s.created_at DESC NULLS LAST
            `;
          } else {
            // Simple query without any parameters when none are provided
            staff = await sql`
              SELECT
                s.*,
                CONCAT(s.first_name, ' ', s.last_name) as name,
                CONCAT(s.first_name, ' ', s.last_name) as full_name
              FROM staff s
              ORDER BY s.created_at DESC NULLS LAST
            `;
          }
          
          // Return empty array if no staff, not an error
          const staffRows = staff as any[];
          res.status(200).json({
            success: true,
            data: staffRows || [],
            message: staffRows.length === 0 ? 'No staff members found' : undefined
          });
        }
        break;
      }

      case 'POST': {
        // Create new staff member
        const staffData = req.body;
        
        // Extract first and last name from name field or use separate fields
        const name = staffData.name || '';
        const firstName = staffData.first_name || staffData.firstName || name.split(' ')[0] || '';
        const lastName = staffData.last_name || staffData.lastName || name.split(' ').slice(1).join(' ') || '';
        
        const newStaff = await sql`
          INSERT INTO staff (
            employee_id, first_name, last_name, email, phone,
            department, position, join_date, status
          )
          VALUES (
            ${staffData.employee_id || staffData.employeeId || `EMP-${Date.now()}`},
            ${firstName},
            ${lastName},
            ${staffData.email},
            ${staffData.phone || null},
            ${staffData.department || 'General'},
            ${staffData.position || 'Staff'},
            ${staffData.join_date || staffData.startDate || new Date().toISOString()},
            ${staffData.status || 'ACTIVE'}
          )
          RETURNING *, CONCAT(first_name, ' ', last_name) as name, CONCAT(first_name, ' ', last_name) as full_name
        `;
        
        // Log successful staff creation
        const newStaffRows = newStaff as any[];
        if (newStaffRows[0]) {
          logCreate('staff', newStaffRows[0].id, {
            employee_id: newStaffRows[0].employee_id,
            name: newStaffRows[0].full_name,
            email: newStaffRows[0].email,
            department: newStaffRows[0].department
          });
        }
        
        res.status(201).json({ success: true, data: newStaffRows[0] });
        break;
      }

      case 'PUT': {
        // Update staff member
        if (!req.query.id) {
          return res.status(400).json({ success: false, error: 'Staff ID required' });
        }
        const updates = req.body;
        
        // Handle name field updates - extract first and last name
        const name = updates.name || '';
        const firstName = updates.first_name || updates.firstName || name.split(' ')[0] || '';
        const lastName = updates.last_name || updates.lastName || name.split(' ').slice(1).join(' ') || '';
        
        const updatedStaff = await sql`
          UPDATE staff
          SET
              first_name = COALESCE(${firstName}, first_name),
              last_name = COALESCE(${lastName}, last_name),
              email = COALESCE(${updates.email}, email),
              phone = COALESCE(${updates.phone}, phone),
              position = COALESCE(${updates.position}, position),
              department = COALESCE(${updates.department}, department),
              status = COALESCE(${updates.status}, status),
              join_date = COALESCE(${updates.join_date || updates.startDate}, join_date),
              updated_at = NOW()
          WHERE id = ${req.query.id as string}
          RETURNING *, CONCAT(first_name, ' ', last_name) as name, CONCAT(first_name, ' ', last_name) as full_name
        `;
        
        const updatedStaffRows = updatedStaff as any[];
        if (updatedStaffRows.length === 0) {
          return res.status(404).json({ 
            success: false, 
            error: 'Staff member not found' 
          });
        }
        
        // Log successful staff update
        if (updatedStaffRows[0]) {
          logUpdate('staff', req.query.id as string, {
            updated_fields: Object.keys(updates),
            name: updatedStaffRows[0].full_name
          });
        }
        
        res.status(200).json({ success: true, data: updatedStaffRows[0] });
        break;
      }

      case 'DELETE': {
        // Delete staff member
        if (!req.query.id) {
          return res.status(400).json({ success: false, error: 'Staff ID required' });
        }
        await sql`DELETE FROM staff WHERE id = ${req.query.id as string}`;
        
        // Log successful staff deletion
        logDelete('staff', req.query.id as string);
        
        res.status(200).json({ success: true, message: 'Staff member deleted successfully' });
        break;
      }

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique constraint violation
      if (error.constraint === 'staff_employee_id_unique') {
        return res.status(409).json({
          success: false,
          error: 'Employee ID already exists. Please use a different employee ID.'
        });
      }
      if (error.constraint === 'staff_email_unique') {
        return res.status(409).json({
          success: false,
          error: 'Email address already exists. Please use a different email address.'
        });
      }
      return res.status(409).json({
        success: false,
        error: 'Duplicate entry. This record already exists.'
      });
    }
    
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
})