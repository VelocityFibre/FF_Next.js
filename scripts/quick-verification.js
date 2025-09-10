#!/usr/bin/env node

/**
 * Quick Import Verification
 * Fast check of import status and basic data quality
 */

const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function quickVerification() {
  console.log('⚡ Quick Import Verification...\n');

  try {
    // 1. Current import status
    const count = await sql`SELECT COUNT(*) as count FROM onemap_records`;
    const currentCount = count[0].count;
    const totalExpected = 17995;
    const progressPercent = Math.round((currentCount / totalExpected) * 100);

    console.log('📊 === IMPORT STATUS ===');
    console.log(`   Records imported: ${currentCount.toLocaleString()}`);
    console.log(`   Progress: ${progressPercent}%`);
    console.log(`   Remaining: ${(totalExpected - currentCount).toLocaleString()}`);

    if (currentCount >= totalExpected) {
      console.log('   ✅ Import appears complete!');
    } else {
      console.log('   ⏳ Import still in progress...');
    }

    // 2. Quick data quality check
    const qualityCheck = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN property_id IS NOT NULL AND property_id != '' THEN 1 END) as valid_ids,
        COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as gps_records,
        COUNT(CASE WHEN status IS NOT NULL AND status != '' THEN 1 END) as status_records
      FROM onemap_records
    `;

    const quality = qualityCheck[0];
    console.log('\n✅ === DATA QUALITY CHECK ===');
    console.log(`   Property IDs: ${quality.valid_ids}/${quality.total} (${Math.round((quality.valid_ids/quality.total)*100)}%)`);
    console.log(`   GPS Records: ${quality.gps_records}/${quality.total} (${Math.round((quality.gps_records/quality.total)*100)}%)`);
    console.log(`   Status Records: ${quality.status_records}/${quality.total} (${Math.round((quality.status_records/quality.total)*100)}%)`);

    // 3. Duplicate check
    const duplicates = await sql`
      SELECT COUNT(*) as dup_count FROM (
        SELECT property_id, COUNT(*) as count
        FROM onemap_records
        GROUP BY property_id
        HAVING COUNT(*) > 1
      ) as duplicates
    `;

    console.log('\n🔍 === DUPLICATE CHECK ===');
    if (duplicates[0].dup_count > 0) {
      console.log(`   ⚠️  Found ${duplicates[0].dup_count} duplicate property IDs`);
    } else {
      console.log('   ✅ No duplicates found');
    }

    // 4. Sample records
    const samples = await sql`
      SELECT property_id, status, latitude, longitude
      FROM onemap_records
      WHERE property_id IS NOT NULL AND property_id != ''
      LIMIT 3
    `;

    console.log('\n🔍 === SAMPLE RECORDS ===');
    samples.forEach((record, i) => {
      console.log(`   ${i+1}. Property: ${record.property_id}`);
      console.log(`      Status: ${record.status || 'N/A'}`);
      console.log(`      GPS: ${record.latitude || 'N/A'}, ${record.longitude || 'N/A'}`);
    });

    // 5. Overall assessment
    console.log('\n🎯 === OVERALL ASSESSMENT ===');
    const issues = [];

    if (quality.valid_ids < quality.total) issues.push('Missing property IDs');
    if (quality.gps_records < quality.total * 0.9) issues.push('Low GPS coverage');
    if (duplicates[0].dup_count > 0) issues.push('Duplicate records');

    if (issues.length === 0 && currentCount >= totalExpected) {
      console.log('   ✅ Import successful - data quality excellent!');
      console.log('   ✅ Ready for production use');
    } else if (issues.length === 0) {
      console.log('   ⏳ Import in progress - data quality good so far');
    } else {
      console.log('   ⚠️  Issues detected:');
      issues.forEach(issue => console.log(`      - ${issue}`));
    }

  } catch (error) {
    console.error('\n❌ Quick verification failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  quickVerification().catch(console.error);
}

module.exports = { quickVerification };
