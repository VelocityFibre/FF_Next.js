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
        // Get all clients or single client by ID
        if (req.query.id) {
          const client = await sql`SELECT * FROM clients WHERE id = ${req.query.id}`;
          res.status(200).json({ success: true, data: client[0] || null });
        } else {
          const clients = await sql`SELECT * FROM clients ORDER BY created_at DESC`;
          res.status(200).json({ success: true, data: clients });
        }
        break;

      case 'POST':
        // Create new client
        const { company_name, contact_person, email, phone, address, city, status } = req.body;
        const newClient = await sql`
          INSERT INTO clients (company_name, contact_person, email, phone, address, city, status)
          VALUES (${company_name}, ${contact_person}, ${email}, ${phone}, ${address}, ${city}, ${status || 'active'})
          RETURNING *
        `;
        res.status(201).json({ success: true, data: newClient[0] });
        break;

      case 'PUT':
        // Update client
        if (!req.query.id) {
          return res.status(400).json({ success: false, error: 'Client ID required' });
        }
        const updates = req.body;
        const updatedClient = await sql`
          UPDATE clients 
          SET company_name = ${updates.company_name},
              contact_person = ${updates.contact_person},
              email = ${updates.email},
              phone = ${updates.phone},
              address = ${updates.address},
              city = ${updates.city},
              updated_at = NOW()
          WHERE id = ${req.query.id}
          RETURNING *
        `;
        res.status(200).json({ success: true, data: updatedClient[0] });
        break;

      case 'DELETE':
        // Delete client
        if (!req.query.id) {
          return res.status(400).json({ success: false, error: 'Client ID required' });
        }
        await sql`DELETE FROM clients WHERE id = ${req.query.id}`;
        res.status(200).json({ success: true, message: 'Client deleted successfully' });
        break;

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}