import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const result = await sql`SELECT NOW() as current_time, version() as version`;
    res.status(200).json({ 
      success: true, 
      status: 'healthy',
      database: 'connected',
      time: result[0].current_time,
      version: result[0].version
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message 
    });
  }
}