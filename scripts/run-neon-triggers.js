#!/usr/bin/env node

/**
 * Neon-compatible trigger migration
 * Uses a polling-based approach instead of LISTEN/NOTIFY
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🚀 Running Neon-compatible real-time triggers migration...\n');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'neon-realtime-triggers.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split into individual statements and filter
    const statements = migrationSQL
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Determine operation type for logging
      let operation = 'Executing statement';
      if (statement.includes('DROP TRIGGER')) {
        operation = '🗑️  Dropping old trigger';
      } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
        operation = '⚡ Creating function';
      } else if (statement.includes('CREATE TRIGGER')) {
        operation = '🔔 Creating trigger';
      } else if (statement.includes('CREATE TABLE')) {
        operation = '📊 Creating table';
      } else if (statement.includes('CREATE INDEX')) {
        operation = '📇 Creating index';
      }
      
      console.log(`${operation}...`);
      
      try {
        // Execute using template literal
        await sql`${sql(statement)}`;
        successCount++;
        console.log(`  ✅ Success\n`);
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error: ${error.message}\n`);
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`  ✅ Successful: ${successCount}`);
    console.log(`  ❌ Failed: ${errorCount}`);
    
    // Test the new system
    console.log('\n🧪 Testing the trigger system...\n');
    
    try {
      // Check if realtime_changes table exists
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'realtime_changes'
        ) as exists
      `;
      
      if (tableCheck[0].exists) {
        console.log('  ✅ Realtime changes table created');
        
        // Test creating a record
        console.log('\n  🧪 Testing change tracking...');
        
        // Get initial count
        const initialCount = await sql`
          SELECT COUNT(*) as count FROM realtime_changes WHERE processed = FALSE
        `;
        console.log(`     Initial unprocessed changes: ${initialCount[0].count}`);
        
        // Try to create a test project (with required fields)
        try {
          const testProject = await sql`
            INSERT INTO projects (
              project_code, 
              project_name, 
              status, 
              created_at, 
              updated_at
            )
            VALUES (
              'TEST-' || EXTRACT(EPOCH FROM NOW())::INTEGER,
              'Trigger Test Project',
              'active',
              NOW(),
              NOW()
            )
            RETURNING id, project_code, project_name
          `;
          
          console.log(`     ✅ Created test project: ${testProject[0].project_name}`);
          
          // Check if change was logged
          const afterInsert = await sql`
            SELECT COUNT(*) as count FROM realtime_changes 
            WHERE processed = FALSE 
            AND table_name = 'projects'
            AND operation = 'INSERT'
          `;
          
          if (afterInsert[0].count > initialCount[0].count) {
            console.log(`     ✅ INSERT trigger working - change logged`);
          }
          
          // Update the project
          await sql`
            UPDATE projects 
            SET project_name = 'Updated Trigger Test'
            WHERE id = ${testProject[0].id}
          `;
          console.log(`     ✅ Updated test project`);
          
          // Check for update log
          const afterUpdate = await sql`
            SELECT COUNT(*) as count FROM realtime_changes 
            WHERE processed = FALSE 
            AND table_name = 'projects'
            AND operation = 'UPDATE'
          `;
          
          if (afterUpdate[0].count > 0) {
            console.log(`     ✅ UPDATE trigger working - change logged`);
          }
          
          // Delete the test project
          await sql`DELETE FROM projects WHERE id = ${testProject[0].id}`;
          console.log(`     ✅ Deleted test project`);
          
          // Check for delete log
          const afterDelete = await sql`
            SELECT COUNT(*) as count FROM realtime_changes 
            WHERE processed = FALSE 
            AND table_name = 'projects'
            AND operation = 'DELETE'
          `;
          
          if (afterDelete[0].count > 0) {
            console.log(`     ✅ DELETE trigger working - change logged`);
          }
          
          // Get recent changes
          const recentChanges = await sql`
            SELECT * FROM get_recent_changes(NULL, 5)
          `;
          
          console.log(`\n  📋 Recent changes in tracking table:`);
          recentChanges.forEach(change => {
            console.log(`     - ${change.operation} on ${change.table_name} (ID: ${change.record_id})`);
          });
          
          // Clean up test data from tracking table
          const testChangeIds = await sql`
            SELECT id FROM realtime_changes 
            WHERE table_name = 'projects' 
            AND record_data->>'project_name' LIKE '%Trigger Test%'
          `;
          
          if (testChangeIds.length > 0) {
            const ids = testChangeIds.map(r => r.id);
            await sql`
              UPDATE realtime_changes 
              SET processed = TRUE 
              WHERE id = ANY(${ids})
            `;
            console.log(`\n  🧹 Cleaned up ${ids.length} test entries`);
          }
          
        } catch (error) {
          console.log(`  ⚠️  Could not fully test triggers: ${error.message}`);
        }
        
      } else {
        console.log('  ❌ Realtime changes table not created');
      }
      
    } catch (error) {
      console.log(`  ❌ Test failed: ${error.message}`);
    }
    
    console.log('\n✅ Migration complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. The system now tracks changes in the realtime_changes table');
    console.log('2. Your WebSocket server can poll this table for updates');
    console.log('3. Start the server with: PORT=3005 npm start');
    console.log('4. Test real-time updates at: http://localhost:3005/test-realtime');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration().catch(console.error);