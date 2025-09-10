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
    const migrationPath = path.join(__dirname, 'migrations', 'create-project-phases-tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolons and filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Running Project Phases migration with ${statements.length} statements...`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }
      
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      console.log(`Statement preview: ${statement.substring(0, 50)}...`);
      
      try {
        await sql.query(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        errorCount++;
        // Continue with other statements even if one fails
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Migration Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log('='.repeat(50));

    if (errorCount === 0) {
      console.log('\n🎉 Project Phases migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Please check the output above.');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();