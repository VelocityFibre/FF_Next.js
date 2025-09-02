import { sql } from '../../config/database.config.js';

async function fixAllColumns() {
  console.log('🔧 Fixing all column sizes...\n');
  
  try {
    // Fix status column
    await sql`ALTER TABLE poles ALTER COLUMN status TYPE VARCHAR(50)`;
    console.log('✅ Status column updated to VARCHAR(50)');
    
    // Fix type column
    await sql`ALTER TABLE poles ALTER COLUMN type TYPE VARCHAR(100)`;
    console.log('✅ Type column updated to VARCHAR(100)');
    
    // Fix material column  
    await sql`ALTER TABLE poles ALTER COLUMN material TYPE VARCHAR(100)`;
    console.log('✅ Material column updated to VARCHAR(100)');
    
    console.log('\n✅ All columns fixed!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAllColumns();