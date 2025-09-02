import { sql } from '../../config/database.config.js';

async function createDropsTable() {
  console.log('🔧 Creating Drops table...\n');
  
  try {
    // Drop existing table if needed to recreate
    await sql`DROP TABLE IF EXISTS drops CASCADE`;
    console.log('✅ Dropped existing drops table');
    
    // Create drops table
    await sql`
      CREATE TABLE drops (
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
    console.log('✅ Drops table created');
    
    // Create indexes
    await sql`CREATE INDEX idx_drops_project_id ON drops(project_id)`;
    console.log('✅ Index on project_id created');
    
    await sql`CREATE INDEX idx_drops_pole_number ON drops(pole_number)`;
    console.log('✅ Index on pole_number created');
    
    console.log('\n✅ Drops table is ready for import!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createDropsTable();