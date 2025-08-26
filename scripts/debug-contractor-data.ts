/**
 * Debug contractor data to see what's returned from the service
 */

import { neon } from '@neondatabase/serverless';

async function debugContractorData() {
  try {
    const connectionString = process.env.VITE_NEON_DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    
    if (!connectionString) {
      console.error('❌ No database connection string found');
      process.exit(1);
    }

    const sql = neon(connectionString);
    
    // Get all contractors with their status
    const contractors = await sql`
      SELECT id, company_name, contact_person, email, status, created_at
      FROM contractors 
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    console.log('📊 Sample contractors from database:');
    contractors.forEach((contractor, index) => {
      console.log(`${index + 1}. ${contractor.company_name}`);
      console.log(`   Status: "${contractor.status}" (length: ${contractor.status?.length})`);
      console.log(`   ID: ${contractor.id}`);
      console.log(`   Created: ${contractor.created_at}`);
      console.log();
    });
    
    // Check status counts again with exact matching
    const statusCheck = await sql`
      SELECT 
        status,
        COUNT(*) as count,
        CASE 
          WHEN status = 'pending' THEN 'EXACT_MATCH'
          WHEN status LIKE '%pending%' THEN 'CONTAINS_PENDING'
          ELSE 'NO_MATCH'
        END as match_type
      FROM contractors 
      GROUP BY status
    `;
    
    console.log('🔍 Status matching analysis:');
    statusCheck.forEach(row => {
      console.log(`  "${row.status}" (${row.match_type}): ${row.count} contractors`);
    });
    
  } catch (error) {
    console.error('❌ Error debugging data:', error);
    process.exit(1);
  }
}

debugContractorData();