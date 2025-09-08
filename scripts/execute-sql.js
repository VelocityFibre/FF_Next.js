const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_jUJCNFiG38aY@ep-mute-brook-a99vppmn-pooler.gwc.azure.neon.tech/neondb?sslmode=require';

async function executeSqlFile(filename) {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const sqlPath = path.join(__dirname, filename);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log(`📄 Executing SQL file: ${filename}`);
    await client.query(sql);
    console.log('✅ SQL executed successfully');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Execute the create tables script
if (require.main === module) {
  const filename = process.argv[2] || 'create-document-tables.sql';
  executeSqlFile(filename);
}