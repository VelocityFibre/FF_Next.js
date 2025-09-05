const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function loadDemoData() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🚀 Loading demo data into Neon database...');
  
  try {
    // Read the SQL file
    const sqlScript = fs.readFileSync(path.join(__dirname, 'demo-data.sql'), 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sqlScript
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.includes('DROP TABLE') || 
          statement.includes('CREATE TABLE') || 
          statement.includes('INSERT INTO') || 
          statement.includes('CREATE INDEX')) {
        try {
          // Use sql`` template literal syntax
          await sql.query(statement + ';');
          console.log('✓ Executed:', statement.substring(0, 50) + '...');
        } catch (err) {
          if (!err.message.includes('does not exist')) {
            console.log('⚠ Warning:', err.message);
          }
        }
      }
    }
    
    // Verify data was loaded
    const clients = await sql`SELECT COUNT(*) as count FROM clients`;
    const projects = await sql`SELECT COUNT(*) as count FROM projects`;
    const staff = await sql`SELECT COUNT(*) as count FROM staff`;
    
    console.log('\n✅ Demo data loaded successfully!');
    console.log(`   - ${clients[0].count} clients`);
    console.log(`   - ${projects[0].count} projects`);
    console.log(`   - ${staff[0].count} staff members`);
    
  } catch (error) {
    console.error('❌ Error loading demo data:', error);
    process.exit(1);
  }
}

loadDemoData();