import { sql } from '../../config/database.config.js';

async function createFibreTable() {
  console.log('🔧 Creating Fibre Segments table...\n');
  
  try {
    // Drop existing table if needed to recreate
    await sql`DROP TABLE IF EXISTS fibre_segments CASCADE`;
    console.log('✅ Dropped existing fibre_segments table');
    
    // Create fibre_segments table
    await sql`
      CREATE TABLE fibre_segments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        segment_id VARCHAR(200) UNIQUE NOT NULL,
        project_id UUID NOT NULL,
        from_point VARCHAR(100),
        to_point VARCHAR(100),
        distance FLOAT,
        cable_type VARCHAR(50),
        cable_size VARCHAR(50),
        layer VARCHAR(100),
        pon_no INTEGER,
        zone_no INTEGER,
        installation_date DATE,
        status VARCHAR(50) DEFAULT 'planned',
        contractor VARCHAR(100),
        complete VARCHAR(20),
        notes TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Fibre segments table created');
    
    // Create indexes
    await sql`CREATE INDEX idx_fibre_project_id ON fibre_segments(project_id)`;
    console.log('✅ Index on project_id created');
    
    await sql`CREATE INDEX idx_fibre_from_to ON fibre_segments(from_point, to_point)`;
    console.log('✅ Index on from_point/to_point created');
    
    console.log('\n✅ Fibre segments table is ready for import!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createFibreTable();