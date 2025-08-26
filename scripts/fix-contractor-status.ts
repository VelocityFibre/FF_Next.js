/**
 * Fix contractor statuses - Convert 'Pending' to 'pending'
 */

import { neon } from '@neondatabase/serverless';

async function fixContractorStatuses() {
  try {
    const connectionString = process.env.VITE_NEON_DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    
    if (!connectionString) {
      console.error('❌ No database connection string found');
      process.exit(1);
    }

    const sql = neon(connectionString);
    
    // Update contractors with 'Pending' status to 'pending'
    const updateResult = await sql`
      UPDATE contractors 
      SET status = 'pending' 
      WHERE status = 'Pending'
    `;
    
    console.log('✅ Updated contractors:', updateResult);
    
    // Check current status distribution
    const statusCounts = await sql`
      SELECT status, COUNT(*) as count 
      FROM contractors 
      GROUP BY status
    `;
    
    console.log('📊 Current status distribution:');
    statusCounts.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`);
    });
    
    console.log('🎉 Status fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing statuses:', error);
    process.exit(1);
  }
}

fixContractorStatuses();