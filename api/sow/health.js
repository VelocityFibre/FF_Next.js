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

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Check database connection
    const dbCheck = await sql`SELECT NOW() as current_time, version() as db_version`;
    
    // Check if SOW tables exist
    const tableCheck = await sql`
      SELECT table_name, 
             pg_size_pretty(pg_total_relation_size(table_schema||'.'||table_name)) as size,
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_schema = t.table_schema 
              AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name IN ('sow_poles', 'sow_drops', 'sow_fibre', 'sow_project_summary')
      ORDER BY table_name
    `;

    // Get row counts for each table
    const rowCounts = await Promise.all([
      sql`SELECT COUNT(*) as count FROM sow_poles`.catch(() => [{ count: 0 }]),
      sql`SELECT COUNT(*) as count FROM sow_drops`.catch(() => [{ count: 0 }]),
      sql`SELECT COUNT(*) as count FROM sow_fibre`.catch(() => [{ count: 0 }]),
      sql`SELECT COUNT(*) as count FROM sow_project_summary`.catch(() => [{ count: 0 }])
    ]);

    // Check indexes
    const indexCheck = await sql`
      SELECT 
        indexname,
        tablename,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('sow_poles', 'sow_drops', 'sow_fibre', 'sow_project_summary')
      ORDER BY tablename, indexname
    `;

    const tables = tableCheck.map((table, index) => ({
      ...table,
      row_count: rowCounts[index][0].count
    }));

    const health = {
      status: 'healthy',
      timestamp: dbCheck[0].current_time,
      database: {
        connected: true,
        version: dbCheck[0].db_version
      },
      tables: {
        exists: tableCheck.length === 4,
        details: tables,
        missing: ['sow_poles', 'sow_drops', 'sow_fibre', 'sow_project_summary']
          .filter(name => !tableCheck.find(t => t.table_name === name))
      },
      indexes: {
        count: indexCheck.length,
        details: indexCheck
      },
      statistics: {
        total_poles: rowCounts[0][0].count,
        total_drops: rowCounts[1][0].count,
        total_fibre_segments: rowCounts[2][0].count,
        total_projects: rowCounts[3][0].count
      }
    };

    // If tables are missing, update status
    if (health.tables.missing.length > 0) {
      health.status = 'degraded';
      health.message = `Missing tables: ${health.tables.missing.join(', ')}`;
    }

    res.status(200).json({ 
      success: true, 
      health: health
    });
  } catch (error) {
    console.error('SOW Health check error:', error);
    res.status(503).json({ 
      success: false,
      health: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error.message
        }
      }
    });
  }
}