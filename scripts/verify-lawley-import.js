#!/usr/bin/env node

/**
 * Lawley Import Data Verification Script
 * Comprehensive verification of imported OneMap data
 */

const { neon } = require('@neondatabase/serverless');
const XLSX = require('xlsx');
const sql = neon(process.env.DATABASE_URL);

async function verifyLawleyImport() {
  console.log('🔍 Starting Lawley Import Data Verification...\n');

  try {
    // 1. Basic database statistics
    console.log('📊 === DATABASE STATISTICS ===');
    const totalCount = await sql`SELECT COUNT(*) as count FROM onemap_records`;
    console.log(`   - Total records in database: ${totalCount[0].count.toLocaleString()}`);

    // 2. Compare with original Excel file
    console.log('\n📋 === EXCEL FILE COMPARISON ===');
    const filePath = 'pages/onemap/downloads/lawley_01092025.xlsx';
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const excelRecords = excelData.length - 1; // Subtract header row

    console.log(`   - Records in Excel file: ${excelRecords.toLocaleString()}`);
    console.log(`   - Records in database: ${totalCount[0].count.toLocaleString()}`);
    console.log(`   - Difference: ${(totalCount[0].count - excelRecords).toLocaleString()}`);

    // 3. Data completeness analysis
    console.log('\n📈 === DATA COMPLETENESS ANALYSIS ===');
    const completenessStats = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN property_id IS NOT NULL AND property_id != '' THEN 1 END) as property_ids,
        COUNT(CASE WHEN status IS NOT NULL AND status != '' THEN 1 END) as statuses,
        COUNT(CASE WHEN pole_number IS NOT NULL AND pole_number != '' THEN 1 END) as pole_numbers,
        COUNT(CASE WHEN drop_number IS NOT NULL AND drop_number != '' THEN 1 END) as drop_numbers,
        COUNT(CASE WHEN location_address IS NOT NULL AND location_address != '' THEN 1 END) as addresses,
        COUNT(CASE WHEN latitude IS NOT NULL AND latitude != 0 THEN 1 END) as latitudes,
        COUNT(CASE WHEN longitude IS NOT NULL AND longitude != 0 THEN 1 END) as longitudes,
        COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL AND latitude != 0 AND longitude != 0 THEN 1 END) as gps_coordinates
      FROM onemap_records
    `;

    const stats = completenessStats[0];
    console.log(`   - Property IDs: ${stats.property_ids} (${Math.round((stats.property_ids/stats.total)*100)}%)`);
    console.log(`   - Status info: ${stats.statuses} (${Math.round((stats.statuses/stats.total)*100)}%)`);
    console.log(`   - Pole numbers: ${stats.pole_numbers} (${Math.round((stats.pole_numbers/stats.total)*100)}%)`);
    console.log(`   - Drop numbers: ${stats.drop_numbers} (${Math.round((stats.drop_numbers/stats.total)*100)}%)`);
    console.log(`   - Addresses: ${stats.addresses} (${Math.round((stats.addresses/stats.total)*100)}%)`);
    console.log(`   - GPS coordinates: ${stats.gps_coordinates} (${Math.round((stats.gps_coordinates/stats.total)*100)}%)`);

    // 4. Duplicate detection
    console.log('\n🔍 === DUPLICATE ANALYSIS ===');
    const duplicates = await sql`
      SELECT property_id, COUNT(*) as count
      FROM onemap_records
      GROUP BY property_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10
    `;

    if (duplicates.length > 0) {
      console.log('   ⚠️  Found duplicate property IDs:');
      duplicates.forEach(dup => {
        console.log(`      - Property ${dup.property_id}: ${dup.count} times`);
      });
    } else {
      console.log('   ✅ No duplicate property IDs found');
    }

    // 5. Data quality checks
    console.log('\n✅ === DATA QUALITY CHECKS ===');

    // Check for invalid GPS coordinates
    const invalidGPS = await sql`
      SELECT COUNT(*) as count
      FROM onemap_records
      WHERE (latitude < -90 OR latitude > 90 OR longitude < -180 OR longitude > 180)
        AND latitude IS NOT NULL AND longitude IS NOT NULL
    `;
    console.log(`   - Invalid GPS coordinates: ${invalidGPS[0].count}`);

    // Check for empty property IDs
    const emptyPropertyIds = await sql`
      SELECT COUNT(*) as count
      FROM onemap_records
      WHERE property_id IS NULL OR property_id = ''
    `;
    console.log(`   - Empty property IDs: ${emptyPropertyIds[0].count}`);

    // 6. Status distribution
    console.log('\n📊 === STATUS DISTRIBUTION ===');
    const statusDistribution = await sql`
      SELECT
        CASE
          WHEN status IS NULL OR status = '' THEN 'Empty/Null'
          WHEN status LIKE '%Approved%' THEN 'Approved'
          WHEN status LIKE '%Pending%' THEN 'Pending'
          WHEN status LIKE '%Rejected%' THEN 'Rejected'
          ELSE 'Other'
        END as status_category,
        COUNT(*) as count
      FROM onemap_records
      GROUP BY
        CASE
          WHEN status IS NULL OR status = '' THEN 'Empty/Null'
          WHEN status LIKE '%Approved%' THEN 'Approved'
          WHEN status LIKE '%Pending%' THEN 'Pending'
          WHEN status LIKE '%Rejected%' THEN 'Rejected'
          ELSE 'Other'
        END
      ORDER BY count DESC
    `;

    statusDistribution.forEach(row => {
      console.log(`   - ${row.status_category}: ${row.count} (${Math.round((row.count/stats.total)*100)}%)`);
    });

    // 7. GPS coordinate validation
    console.log('\n🌍 === GPS COORDINATE VALIDATION ===');
    const gpsStats = await sql`
      SELECT
        COUNT(*) as total_with_gps,
        AVG(latitude) as avg_latitude,
        AVG(longitude) as avg_longitude,
        MIN(latitude) as min_latitude,
        MAX(latitude) as max_latitude,
        MIN(longitude) as min_longitude,
        MAX(longitude) as max_longitude
      FROM onemap_records
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        AND latitude != 0 AND longitude != 0
    `;

    if (gpsStats[0].total_with_gps > 0) {
      console.log(`   - Records with GPS: ${gpsStats[0].total_with_gps}`);
      console.log(`   - Latitude range: ${gpsStats[0].min_latitude.toFixed(6)} to ${gpsStats[0].max_latitude.toFixed(6)}`);
      console.log(`   - Longitude range: ${gpsStats[0].min_longitude.toFixed(6)} to ${gpsStats[0].max_longitude.toFixed(6)}`);
      console.log(`   - Average location: ${gpsStats[0].avg_latitude.toFixed(6)}, ${gpsStats[0].avg_longitude.toFixed(6)}`);
    }

    // 8. Sample records verification
    console.log('\n🔍 === SAMPLE RECORD VERIFICATION ===');
    const sampleRecords = await sql`
      SELECT property_id, status, pole_number, drop_number, latitude, longitude
      FROM onemap_records
      WHERE property_id IS NOT NULL AND property_id != ''
      LIMIT 5
    `;

    console.log('   Sample records:');
    sampleRecords.forEach((record, i) => {
      console.log(`      ${i+1}. Property: ${record.property_id}`);
      console.log(`         Status: ${record.status || 'N/A'}`);
      console.log(`         Pole: ${record.pole_number || 'N/A'}`);
      console.log(`         Drop: ${record.drop_number || 'N/A'}`);
      console.log(`         GPS: ${record.latitude || 'N/A'}, ${record.longitude || 'N/A'}`);
      console.log('');
    });

    // 9. Final verification summary
    console.log('\n🎯 === VERIFICATION SUMMARY ===');

    const issues = [];
    if (stats.property_ids < stats.total) issues.push('Missing property IDs');
    if (stats.gps_coordinates < stats.total * 0.9) issues.push('Low GPS coverage');
    if (duplicates.length > 0) issues.push('Duplicate records found');
    if (invalidGPS[0].count > 0) issues.push('Invalid GPS coordinates');
    if (emptyPropertyIds[0].count > 0) issues.push('Empty property IDs');

    if (issues.length === 0) {
      console.log('   ✅ All verification checks passed!');
      console.log('   ✅ Data quality is excellent');
      console.log('   ✅ Ready for production use');
    } else {
      console.log('   ⚠️  Issues found:');
      issues.forEach(issue => console.log(`      - ${issue}`));
    }

    console.log(`\n📊 Final Statistics:`);
    console.log(`   - Total records: ${stats.total.toLocaleString()}`);
    console.log(`   - Data completeness: ${Math.round(((stats.property_ids + stats.statuses + stats.pole_numbers + stats.drop_numbers + stats.addresses + stats.gps_coordinates) / (stats.total * 6)) * 100)}%`);
    console.log(`   - GPS coverage: ${Math.round((stats.gps_coordinates/stats.total)*100)}%`);

  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  verifyLawleyImport().catch(console.error);
}

module.exports = { verifyLawleyImport };
