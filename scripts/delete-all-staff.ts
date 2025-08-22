/**
 * Script to delete all staff records from Neon database
 * Run with: npx tsx scripts/delete-all-staff.ts
 */

import { sql, db } from '../src/lib/neon';

async function deleteAllStaff() {
  try {
    console.log('🗑️ Starting to delete all staff records...');
    
    // First, get count of existing staff
    const countResult = await sql`SELECT COUNT(*) FROM staff`;
    const existingCount = parseInt(countResult[0].count);
    
    if (existingCount === 0) {
      console.log('ℹ️ No staff records found in database.');
      return;
    }
    
    console.log(`📊 Found ${existingCount} staff records to delete.`);
    
    // Confirm deletion
    console.log('⚠️ WARNING: This will permanently delete ALL staff records!');
    console.log('🔄 Proceeding with deletion...');
    
    // First, remove staff references from projects table
    console.log('🔄 Removing staff references from projects...');
    await sql`UPDATE projects SET project_manager_id = NULL WHERE project_manager_id IS NOT NULL`;
    console.log('✅ Removed project manager references.');
    
    // Delete all staff records
    const deleteResult = await sql`DELETE FROM staff`;
    
    console.log(`✅ Successfully deleted staff records.`);
    
    // Verify deletion
    const verifyResult = await sql`SELECT COUNT(*) FROM staff`;
    const remainingCount = parseInt(verifyResult[0].count);
    
    if (remainingCount === 0) {
      console.log('✅ Verification complete: All staff records have been deleted.');
    } else {
      console.log(`⚠️ Warning: ${remainingCount} staff records still remain in database.`);
    }
    
    // Optional: Reset any sequences if needed
    try {
      await sql`SELECT setval(pg_get_serial_sequence('staff', 'id'), 1, false)`;
      console.log('✅ Reset staff ID sequence.');
    } catch (error) {
      // Sequence might not exist or have different name
      console.log('ℹ️ Note: Could not reset ID sequence (may not be needed).');
    }
    
  } catch (error) {
    console.error('❌ Error deleting staff records:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  } finally {
    console.log('🔌 Database operation completed.');
  }
}

// Run the deletion
deleteAllStaff();