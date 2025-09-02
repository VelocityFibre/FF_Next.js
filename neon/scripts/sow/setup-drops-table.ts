import { sql } from '../../config/database.config.js';

async function setupDropsTable() {
  console.log('📦 Setting up Drops table...\n');
  
  try {
    // Create drops table
    await sql`
      CREATE TABLE IF NOT EXISTS drops (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        drop_number VARCHAR(100) UNIQUE NOT NULL,
        pole_number VARCHAR(100),
        project_id UUID NOT NULL,
        address TEXT,
        customer_name VARCHAR(255),
        cable_length VARCHAR(50),
        installation_date DATE,
        status VARCHAR(50) DEFAULT 'planned',
        notes TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Drops table created/verified');
    
    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_drops_project_id ON drops(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_drops_pole_number ON drops(pole_number)`;
    
    console.log('✅ Indexes created/verified');
    console.log('\n✅ Drops table ready for import!');
    
  } catch (error) {
    console.error('❌ Error setting up table:', error);
  }
}

setupDropsTable();