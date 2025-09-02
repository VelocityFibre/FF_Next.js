import { sql } from '../../config/database.config.js';

async function createImportStatusTable() {
  console.log('🔧 Creating SOW Import Status tracking table...\n');
  
  try {
    // Create import status table
    await sql`
      CREATE TABLE IF NOT EXISTS sow_import_status (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        project_id UUID NOT NULL,
        step_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        records_imported INTEGER DEFAULT 0,
        file_name VARCHAR(255),
        error_message TEXT,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        UNIQUE(project_id, step_type)
      )
    `;
    console.log('✅ Import status table created');
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_import_status_project ON sow_import_status(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_import_status_type ON sow_import_status(step_type)`;
    console.log('✅ Indexes created');
    
    // Create import history table for detailed logs
    await sql`
      CREATE TABLE IF NOT EXISTS sow_import_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        project_id UUID NOT NULL,
        step_type VARCHAR(50) NOT NULL,
        action VARCHAR(100),
        records_count INTEGER,
        success BOOLEAN DEFAULT true,
        error_message TEXT,
        duration_ms INTEGER,
        user_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}'
      )
    `;
    console.log('✅ Import history table created');
    
    console.log('\n✅ Import tracking tables ready!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createImportStatusTable();