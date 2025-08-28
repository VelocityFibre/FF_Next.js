import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
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
        if (req.query.id) {
          const staff = await sql`SELECT * FROM staff WHERE id = ${req.query.id}`;
          res.status(200).json({ success: true, data: staff[0] || null });
        } else {
          const staff = await sql`SELECT * FROM staff ORDER BY created_at DESC`;
          res.status(200).json({ success: true, data: staff });
        }
        break;

      case 'POST':
        // Create new staff member
        const staffData = req.body;
        const newStaff = await sql`
          INSERT INTO staff (
            employee_id, first_name, last_name, email, phone, 
            position, department, status
          )
          VALUES (
            ${staffData.employee_id}, ${staffData.first_name}, ${staffData.last_name},
            ${staffData.email}, ${staffData.phone}, ${staffData.position},
            ${staffData.department}, ${staffData.status || 'active'}
          )
          RETURNING *
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
          SET first_name = ${updates.first_name},
              last_name = ${updates.last_name},
              email = ${updates.email},
              phone = ${updates.phone},
              position = ${updates.position},
              department = ${updates.department},
              status = ${updates.status},
              updated_at = NOW()
          WHERE id = ${req.query.id}
          RETURNING *
        `;
        res.status(200).json({ success: true, data: updatedStaff[0] });
        break;

      case 'DELETE':
        // Delete staff member
        if (!req.query.id) {
          return res.status(400).json({ success: false, error: 'Staff ID required' });
        }
        await sql`DELETE FROM staff WHERE id = ${req.query.id}`;
        res.status(200).json({ success: true, message: 'Staff member deleted successfully' });
        break;

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}