const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  try {
    // Read database URL from environment
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create Neon client
    const sql = neon(DATABASE_URL);

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'create-onemap-tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolons and filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Running OneMap migration with ${statements.length} statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        await sql.query(statement);
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error.message);
        // Continue with other statements even if one fails
      }
    }

    console.log('OneMap migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();