#!/usr/bin/env node

/**
 * OneMap Import Progress Monitor
 * Monitors the import progress and reports updates
 */

const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

let lastCount = 0;
let startTime = Date.now();

async function checkProgress() {
  try {
    const count = await sql`SELECT COUNT(*) as count FROM onemap_records`;
    const currentCount = count[0].count;
    const totalExpected = 17995;
    const progressPercent = Math.round((currentCount / totalExpected) * 100);
    const remaining = totalExpected - currentCount;
    
    const elapsedMinutes = Math.round((Date.now() - startTime) / 60000);
    const recordsPerMinute = elapsedMinutes > 0 ? Math.round(currentCount / elapsedMinutes) : 0;
    
    console.log('\n📊 === OneMap Import Progress Update ===');
    console.log(`   Time elapsed: ${elapsedMinutes} minutes`);
    console.log(`   Records imported: ${currentCount.toLocaleString()} / ${totalExpected.toLocaleString()}`);
    console.log(`   Progress: ${progressPercent}%`);
    console.log(`   Remaining: ${remaining.toLocaleString()}`);
    console.log(`   Rate: ${recordsPerMinute} records/minute`);
    
    if (recordsPerMinute > 0) {
      const estimatedMinutes = Math.round(remaining / recordsPerMinute);
      const estimatedHours = Math.round(estimatedMinutes / 60);
      
      if (estimatedHours > 1) {
        console.log(`   Estimated completion: ~${estimatedHours} hours`);
      } else {
        console.log(`   Estimated completion: ~${estimatedMinutes} minutes`);
      }
    }
    
    // Check data quality
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status IS NOT NULL AND status != '' THEN 1 END) as with_status,
        COUNT(CASE WHEN pole_number IS NOT NULL AND pole_number != '' THEN 1 END) as with_pole,
        COUNT(CASE WHEN drop_number IS NOT NULL AND drop_number != '' THEN 1 END) as with_drop,
        COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_gps
      FROM onemap_records
    `;
    
    console.log('\n📈 Data Quality:');
    console.log(`   Status info: ${stats[0].with_status} (${Math.round((stats[0].with_status/currentCount)*100)}%)`);
    console.log(`   Pole numbers: ${stats[0].with_pole} (${Math.round((stats[0].with_pole/currentCount)*100)}%)`);
    console.log(`   Drop numbers: ${stats[0].with_drop} (${Math.round((stats[0].with_drop/currentCount)*100)}%)`);
    console.log(`   GPS coordinates: ${stats[0].with_gps} (${Math.round((stats[0].with_gps/currentCount)*100)}%)`);
    
    if (currentCount >= totalExpected) {
      console.log('\n🎉 === IMPORT COMPLETED SUCCESSFULLY! ===');
      console.log(`✅ All ${totalExpected.toLocaleString()} records imported`);
      console.log(`⏱️  Total time: ${elapsedMinutes} minutes`);
      console.log(`📊 Average rate: ${recordsPerMinute} records/minute`);
      process.exit(0);
    }
    
    lastCount = currentCount;
    
  } catch (error) {
    console.error('❌ Error checking progress:', error.message);
  }
}

console.log('🚀 Starting OneMap Import Monitor...');
console.log('📊 Will check progress every 5 minutes');
console.log('⏹️  Press Ctrl+C to stop monitoring\n');

// Initial check
checkProgress();

// Set up periodic monitoring every 5 minutes
const monitorInterval = setInterval(checkProgress, 5 * 60 * 1000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Monitoring stopped by user');
  clearInterval(monitorInterval);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Monitoring stopped');
  clearInterval(monitorInterval);
  process.exit(0);
});
