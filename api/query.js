import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { table, filters, limit = 100 } = req.body;
  
  if (!table) {
    return res.status(400).json({ success: false, error: 'Table name required' });
  }
  
  // Whitelist allowed tables for security
  const allowedTables = [
    'clients', 'projects', 'staff', 'users', 'contractors', 
    'tasks', 'sow', 'poles', 'drops', 'meetings', 'action_items',
    'daily_progress', 'fiber_stringing', 'home_installations'
  ];
  
  if (!allowedTables.includes(table)) {
    return res.status(403).json({ success: false, error: 'Table not allowed' });
  }
  
  try {
    let result;
    
    if (filters && Object.keys(filters).length > 0) {
      // Build a safe query with parameterized values
      const conditions = Object.entries(filters)
        .map(([key], index) => `${key} = $${index + 1}`)
        .join(' AND ');
      const values = Object.values(filters);
      
      // This is a simplified version - in production you'd want to use a proper query builder
      result = await sql(`SELECT * FROM ${table} WHERE ${conditions} LIMIT ${limit}`, values);
    } else {
      result = await sql(`SELECT * FROM ${table} LIMIT ${limit}`);
    }
    
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Query API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}