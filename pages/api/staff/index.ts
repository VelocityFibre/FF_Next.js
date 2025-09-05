import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all staff or single staff member by ID
        const { id, search, department, status, position } = req.query;
        
        if (id) {
          // Get single staff member
          const staff = await sql`
            SELECT 
              s.*,
              CONCAT(s.first_name, ' ', s.last_name) as full_name
            FROM staff s
            WHERE s.id = ${id as string}
          `;
          
          if (staff.length === 0) {
            return res.status(404).json({ 
              success: false, 
              data: null, 
              message: 'Staff member not found' 
            });
          }
          
          res.status(200).json({ success: true, data: staff[0] });
        } else {
          // Build query with filters
          let conditions = [];
          
          if (search) {
            conditions.push(`(
              LOWER(s.first_name) LIKE LOWER('%${search}%') OR 
              LOWER(s.last_name) LIKE LOWER('%${search}%') OR 
              LOWER(s.email) LIKE LOWER('%${search}%') OR 
              LOWER(s.employee_id) LIKE LOWER('%${search}%')
            )`);
          }
          
          if (department) {
            conditions.push(`s.department = '${department}'`);
          }
          
          if (status) {
            conditions.push(`s.status = '${status}'`);
          }
          
          if (position) {
            conditions.push(`LOWER(s.position) LIKE LOWER('%${position}%')`);
          }
          
          const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
          
          const staff = await sql`
            SELECT 
              s.*,
              CONCAT(s.first_name, ' ', s.last_name) as full_name
            FROM staff s
            ${whereClause ? sql.unsafe(whereClause) : sql``}
            ORDER BY s.created_at DESC NULLS LAST
          `;
          
          // Return empty array if no staff, not an error
          res.status(200).json({ 
            success: true, 
            data: staff || [],
            message: staff.length === 0 ? 'No staff members found' : undefined
          });
        }
        break;

      case 'POST':
        // Create new staff member
        const staffData = req.body;
        const newStaff = await sql`
          INSERT INTO staff (
            employee_id, first_name, last_name, email, phone,
            department, position, hire_date, status
          )
          VALUES (
            ${staffData.employee_id || staffData.employeeId || `EMP-${Date.now()}`},
            ${staffData.first_name || staffData.firstName || ''},
            ${staffData.last_name || staffData.lastName || ''},
            ${staffData.email},
            ${staffData.phone || null},
            ${staffData.department || 'General'},
            ${staffData.position || 'Staff'},
            ${staffData.hire_date || staffData.hireDate || new Date().toISOString()},
            ${staffData.status || 'ACTIVE'}
          )
          RETURNING *, CONCAT(first_name, ' ', last_name) as full_name
        `;
        res.status(201).json({ success: true, data: newStaff[0] });
        break;

      case 'PUT':
        // Update staff member
        if (!req.query.id) {
          return res.status(400).json({ success: false, error: 'Staff ID required' });
        }
        const updates = req.body;
        const updatedStaff = await sql`
          UPDATE staff 
          SET 
              first_name = COALESCE(${updates.first_name || updates.firstName}, first_name),
              last_name = COALESCE(${updates.last_name || updates.lastName}, last_name),
              email = COALESCE(${updates.email}, email),
              phone = COALESCE(${updates.phone}, phone),
              position = COALESCE(${updates.position}, position),
              department = COALESCE(${updates.department}, department),
              status = COALESCE(${updates.status}, status),
              hire_date = COALESCE(${updates.hire_date || updates.hireDate}, hire_date),
              updated_at = NOW()
          WHERE id = ${req.query.id as string}
          RETURNING *, CONCAT(first_name, ' ', last_name) as full_name
        `;
        
        if (updatedStaff.length === 0) {
          return res.status(404).json({ 
            success: false, 
            error: 'Staff member not found' 
          });
        }
        
        res.status(200).json({ success: true, data: updatedStaff[0] });
        break;

      case 'DELETE':
        // Delete staff member
        if (!req.query.id) {
          return res.status(400).json({ success: false, error: 'Staff ID required' });
        }
        await sql`DELETE FROM staff WHERE id = ${req.query.id as string}`;
        res.status(200).json({ success: true, message: 'Staff member deleted successfully' });
        break;

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}