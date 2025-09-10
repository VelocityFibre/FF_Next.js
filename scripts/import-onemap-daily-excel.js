#!/usr/bin/env node

/**
 * OneMap Daily Import Script - Excel Version
 * Handles both Excel (.xlsx) and CSV files
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs').promises;
const path = require('path');
const Papa = require('papaparse');
const XLSX = require('xlsx');

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Collections (adapted for Neon PostgreSQL)
const STAGING_TABLE = 'onemap_imports';
const IMPORT_BATCHES_TABLE = 'onemap_import_batches';
const CHANGE_HISTORY_TABLE = 'onemap_change_history';
const IMPORT_REPORTS_TABLE = 'onemap_import_reports';

// Business Logic Constraints
const CONSTRAINTS = {
  MAX_DROPS_PER_POLE: 12,
  EXPECTED_POLES_PER_DAY_MIN: 50,
  EXPECTED_POLES_PER_DAY_MAX: 500,
  LAWLEY_GPS_BOUNDS: {
    lat: { min: -26.35, max: -26.15 },
    lng: { min: 28.20, max: 28.40 }
  }
};

/**
 * Parse Excel or CSV file
 */
async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.xlsx' || ext === '.xls') {
    console.log('📊 Parsing Excel file...');
    return parseExcelFile(filePath);
  } else if (ext === '.csv') {
    console.log('📄 Parsing CSV file...');
    return parseCSVFile(filePath);
  } else {
    throw new Error(`Unsupported file format: ${ext}. Please use .xlsx, .xls, or .csv files.`);
  }
}

/**
 * Parse Excel file
 */
function parseExcelFile(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Use first sheet
    const worksheet = workbook.Sheets[sheetName];

    console.log(`📋 Using sheet: ${sheetName}`);

    // Convert to JSON with headers
    const records = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: ''
    });

    if (records.length === 0) {
      throw new Error('Excel file appears to be empty');
    }

    // First row is headers
    const headers = records[0];
    const dataRows = records.slice(1);

    // Convert to objects
    const jsonRecords = dataRows.map(row => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] || '';
      });
      return record;
    });

    console.log(`✅ Parsed ${jsonRecords.length} records from Excel file`);
    return jsonRecords;
  } catch (error) {
    console.error('❌ Error parsing Excel file:', error);
    throw error;
  }
}

/**
 * Parse CSV file (original function)
 */
async function parseCSVFile(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    // Remove BOM if present
    const cleanContent = fileContent.replace(/^\uFEFF/, '');

    const parsed = Papa.parse(cleanContent, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      dynamicTyping: true
    });

    if (parsed.errors && parsed.errors.length > 0) {
      console.warn('⚠️ CSV parsing warnings:', parsed.errors);
    }

    const records = parsed.data;
    console.log(`✅ Parsed ${records.length} records from CSV`);
    return records;
  } catch (error) {
    console.error('❌ Error parsing CSV:', error);
    throw error;
  }
}

/**
 * Get best tracking identifier for a record
 */
function getTrackingIdentifier(record) {
  if (record['Pole Number'] && record['Pole Number'].trim()) {
    return { type: 'pole', value: record['Pole Number'].trim() };
  }
  if (record['Drop Number'] && record['Drop Number'].trim()) {
    return { type: 'drop', value: record['Drop Number'].trim() };
  }
  if (record['Latitude'] && record['Longitude']) {
    const lat = parseFloat(record['Latitude']);
    const lng = parseFloat(record['Longitude']);
    if (!isNaN(lat) && !isNaN(lng)) {
      // Round to ~10m accuracy
      return { type: 'gps', value: `${lat.toFixed(4)},${lng.toFixed(4)}` };
    }
  }
  if (record['Location Address'] && record['Location Address'].trim()) {
    return { type: 'address', value: record['Location Address'].trim() };
  }
  return { type: 'property_id', value: record['Property ID'] };
}

/**
 * Perform manual spot checks on random records
 */
async function performSpotChecks(records, sampleSize = 5) {
  const spotChecks = [];
  const sampleIndices = [];

  // Get random indices
  while (sampleIndices.length < Math.min(sampleSize, records.length)) {
    const idx = Math.floor(Math.random() * records.length);
    if (!sampleIndices.includes(idx)) {
      sampleIndices.push(idx);
    }
  }

  // Check each sample
  for (const idx of sampleIndices) {
    const record = records[idx];
    const propertyId = record['Property ID'];

    // Check if exists in database
    const existing = await sql`
      SELECT id FROM ${sql(STAGING_TABLE)}
      WHERE property_id = ${propertyId}
      LIMIT 1
    `;

    spotChecks.push({
      property_id: propertyId,
      pole_number: record['Pole Number'] || 'N/A',
      address: record['Location Address'] || 'N/A',
      status: record['Status'] || 'N/A',
      exists_in_db: existing.length > 0,
      tracking_id: getTrackingIdentifier(record)
    });
  }

  return spotChecks;
}

/**
 * Perform count verification
 */
function performCountVerification(records) {
  const counts = {
    total_records: records.length,
    unique_property_ids: new Set(records.map(r => r['Property ID'])).size,
    unique_poles: new Set(records.map(r => r['Pole Number']).filter(Boolean)).size,
    unique_addresses: new Set(records.map(r => r['Location Address']).filter(Boolean)).size,
    status_breakdown: {}
  };

  // Count by status
  records.forEach(record => {
    const status = record['Status'] || 'No Status';
    counts.status_breakdown[status] = (counts.status_breakdown[status] || 0) + 1;
  });

  return counts;
}

/**
 * Check business logic constraints
 */
async function checkBusinessLogic(records, report) {
  const polesPerDay = {};
  const dropsPerPole = {};
  const gpsViolations = [];
  const statusConflicts = {};

  // Analyze each record
  for (const record of records) {
    // Check drops per pole
    const poleNumber = record['Pole Number'];
    const dropNumber = record['Drop Number'];
    if (poleNumber && dropNumber) {
      if (!dropsPerPole[poleNumber]) {
        dropsPerPole[poleNumber] = new Set();
      }
      dropsPerPole[poleNumber].add(dropNumber);
    }

    // Check GPS bounds
    const lat = parseFloat(record['Latitude']);
    const lng = parseFloat(record['Longitude']);
    if (!isNaN(lat) && !isNaN(lng)) {
      if (lat < CONSTRAINTS.LAWLEY_GPS_BOUNDS.lat.min ||
          lat > CONSTRAINTS.LAWLEY_GPS_BOUNDS.lat.max ||
          lng < CONSTRAINTS.LAWLEY_GPS_BOUNDS.lng.min ||
          lng > CONSTRAINTS.LAWLEY_GPS_BOUNDS.lng.max) {
        gpsViolations.push({
          property_id: record['Property ID'],
          pole_number: poleNumber,
          gps: `${lat},${lng}`,
          address: record['Location Address']
        });
      }
    }

    // Track status by pole for conflict detection
    if (poleNumber) {
      if (!statusConflicts[poleNumber]) {
        statusConflicts[poleNumber] = new Set();
      }
      statusConflicts[poleNumber].add(record['Status']);
    }
  }

  // Check violations
  const dropViolations = [];
  for (const [pole, drops] of Object.entries(dropsPerPole)) {
    if (drops.size > CONSTRAINTS.MAX_DROPS_PER_POLE) {
      dropViolations.push({
        pole,
        drop_count: drops.size,
        limit: CONSTRAINTS.MAX_DROPS_PER_POLE
      });
    }
  }

  // Check status conflicts
  const conflicts = [];
  for (const [pole, statuses] of Object.entries(statusConflicts)) {
    if (statuses.size > 1) {
      conflicts.push({
        pole,
        conflicting_statuses: Array.from(statuses)
      });
    }
  }

  // Update report
  report.checks.business_logic_checks.drops_per_pole.violations = dropViolations;
  report.checks.business_logic_checks.drops_per_pole.passed = dropViolations.length === 0;

  report.checks.business_logic_checks.gps_bounds.violations = gpsViolations;
  report.checks.business_logic_checks.gps_bounds.passed = gpsViolations.length === 0;

  report.checks.business_logic_checks.conflicting_statuses.violations = conflicts;
  report.checks.business_logic_checks.conflicting_statuses.passed = conflicts.length === 0;

  return report;
}

/**
 * Normalize status text for consistent matching
 */
function normalizeStatus(status) {
  if (!status) return '';
  return status.toLowerCase()
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .replace(/permissions/g, 'permission')  // Normalize plural
    .replace(/sign ups/g, 'sign up')
    .replace(/home sign up/g, 'home signup')  // Standardize
    .trim();
}

/**
 * Process a single record
 */
async function processRecord(record, report, batchId, firstInstanceTracking) {
  const propertyId = record['Property ID'];

  // Check if record already exists
  const existing = await sql`
    SELECT * FROM ${sql(STAGING_TABLE)}
    WHERE property_id = ${propertyId}
  `;

  const isNew = existing.length === 0;
  const trackingId = getTrackingIdentifier(record);
  const normalizedStatus = normalizeStatus(record['Status']);

  // Check for first instance tracking
  let isFirst = false;
  if (trackingId.type === 'pole' && normalizedStatus) {
    const poleKey = `${trackingId.value}_${normalizedStatus}`;
    if (!firstInstanceTracking[poleKey]) {
      firstInstanceTracking[poleKey] = true;
      isFirst = true;

      // Track in first instances table
      await sql`
        INSERT INTO onemap_first_instances (
          pole_number, status_type, normalized_status, first_date, property_id, batch_id
        ) VALUES (
          ${trackingId.value}, ${normalizedStatus}, ${normalizedStatus},
          ${new Date()}, ${propertyId}, ${batchId}
        )
      `;
    }
  }

  if (isNew) {
    report.summary.new_records++;

    // Insert new record
    await sql`
      INSERT INTO ${sql(STAGING_TABLE)} (
        property_id, tracking_key, current_data, import_batch_id,
        first_seen_date, last_updated_date, version, is_active
      ) VALUES (
        ${propertyId}, ${trackingId.value}, ${JSON.stringify(record)}, ${batchId},
        ${new Date()}, ${new Date()}, 1, true
      )
    `;
  } else {
    // Update existing record
    const currentVersion = existing[0].version || 1;
    await sql`
      UPDATE ${sql(STAGING_TABLE)}
      SET current_data = ${JSON.stringify(record)},
          last_updated_date = ${new Date()},
          version = ${currentVersion + 1}
      WHERE property_id = ${propertyId}
    `;
  }

  // Track status changes
  if (!isNew && existing[0].current_data) {
    const oldData = existing[0].current_data;
    if (oldData.Status !== record['Status']) {
      report.changes.status_changes.push({
        property_id: propertyId,
        old_status: oldData.Status,
        new_status: record['Status'],
        pole_number: record['Pole Number']
      });
    }
  }

  // Track first instances for reporting
  if (isFirst) {
    if (normalizedStatus.includes('pole permission')) {
      report.summary.first_pole_permissions++;
    } else if (normalizedStatus.includes('pole planted') || normalizedStatus.includes('installed')) {
      report.summary.first_pole_planted++;
    } else if (normalizedStatus.includes('home signup')) {
      report.summary.first_home_signups++;
    } else if (normalizedStatus.includes('home install')) {
      report.summary.first_home_installs++;
    }
  }

  // Track home sign-ups separately (count each home)
  if (normalizedStatus.includes('home signup') && record['Drop Number']) {
    report.summary.total_home_signups++;
  }

  // Track specific changes
  if (record['Pole Number'] && existing.length === 0) {
    report.changes.new_poles.push({
      pole: record['Pole Number'],
      address: record['Location Address'],
      status: record['Status'],
      is_first_instance: isFirst
    });
  }

  // Log to change history
  await sql`
    INSERT INTO ${sql(CHANGE_HISTORY_TABLE)} (
      property_id, batch_id, change_type, change_date, record_snapshot, is_first_instance
    ) VALUES (
      ${propertyId}, ${batchId}, 'new', ${new Date()},
      ${JSON.stringify(record)}, ${isFirst || false}
    )
  `;
}

/**
 * Generate and save reports
 */
async function generateReports(report, batchId, fileName) {
  // Generate text report
  const textReport = `
# OneMap Import Report
## Batch ID: ${batchId}
## File: ${fileName}
## Date: ${new Date().toISOString()}

### Summary
- Total Records Processed: ${report.summary.total_records}
- New Records Imported: ${report.summary.new_records}
- Duplicate Property IDs Skipped: ${report.summary.duplicate_property_ids}
- Verification Status: ${report.summary.verification_passed ? '✅ PASSED' : '❌ FAILED'}

### First Instance Tracking (Avoiding Duplicates)
- First Pole Permissions: ${report.summary.first_pole_permissions}
- First Poles Planted: ${report.summary.first_pole_planted}
- First Home Sign-ups: ${report.summary.first_home_signups}
- First Home Installs: ${report.summary.first_home_installs}
- Total Home Sign-ups (all homes): ${report.summary.total_home_signups}

### Verification Checks

#### 1. Manual Spot Checks (${report.checks.manual_spot_checks.length} samples)
${report.checks.manual_spot_checks.map(check =>
  `- Property ${check.property_id}: ${check.exists_in_db ? 'Already exists' : 'New record'} | Pole: ${check.pole_number}`
).join('\n')}

#### 2. Count Verification
- Unique Property IDs: ${report.checks.count_verification.unique_property_ids}
- Unique Poles: ${report.checks.count_verification.unique_poles}
- Unique Addresses: ${report.checks.count_verification.unique_addresses}

Status Breakdown:
${Object.entries(report.checks.count_verification.status_breakdown || {})
  .map(([status, count]) => `- ${status}: ${count}`)
  .join('\n')}

#### 3. Business Logic Checks
- Drops per Pole: ${report.checks.business_logic_checks.drops_per_pole.passed ? '✅ PASSED' : '❌ FAILED'}
  ${report.checks.business_logic_checks.drops_per_pole.violations.length > 0 ?
    'Violations: ' + report.checks.business_logic_checks.drops_per_pole.violations
      .map(v => `Pole ${v.pole} has ${v.drop_count} drops (limit: ${v.limit})`)
      .join(', ') : ''}

- GPS Bounds: ${report.checks.business_logic_checks.gps_bounds.passed ? '✅ PASSED' : '❌ FAILED'}
  ${report.checks.business_logic_checks.gps_bounds.violations.length > 0 ?
    `Found ${report.checks.business_logic_checks.gps_bounds.violations.length} records outside Lawley area` : ''}

- Status Conflicts: ${report.checks.business_logic_checks.conflicting_statuses.passed ? '✅ PASSED' : '❌ FAILED'}
  ${report.checks.business_logic_checks.conflicting_statuses.violations.length > 0 ?
    `Found ${report.checks.business_logic_checks.conflicting_statuses.violations.length} poles with conflicting statuses` : ''}

### Changes Detected
- New Poles: ${report.changes.new_poles.length}
- Status Changes: ${report.changes.status_changes.length}
- Pole Assignments: ${report.changes.pole_assignments.length}
- Drop Additions: ${report.changes.drop_additions.length}

${report.checks.red_flags && report.checks.red_flags.length > 0 ? `

### ⚠️ Red Flags
${report.checks.red_flags.join('\n')}
` : ''}
  `;

  // Save text report to file
  const reportPath = path.join(__dirname, '..', 'reports', `import_report_${batchId}.txt`);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, textReport);

  // Save to database
  await sql`
    INSERT INTO ${sql(IMPORT_REPORTS_TABLE)} (
      batch_id, report_type, report_data, created_date
    ) VALUES (
      ${batchId}, 'import_with_verification', ${JSON.stringify(report)}, ${new Date()}
    )
  `;

  console.log(`\n📄 Report saved to: ${reportPath}`);
  return textReport;
}

/**
 * Verification Results Structure
 */
class VerificationReport {
  constructor() {
    this.summary = {
      total_records: 0,
      new_records: 0,
      duplicate_property_ids: 0,
      verification_passed: true,
      first_pole_permissions: 0,
      first_pole_planted: 0,
      first_home_signups: 0,
      first_home_installs: 0,
      total_home_signups: 0
    };

    this.checks = {
      manual_spot_checks: [],
      count_verification: {},
      business_logic_checks: {
        drops_per_pole: { passed: true, violations: [] },
        gps_bounds: { passed: true, violations: [] },
        conflicting_statuses: { passed: true, violations: [] }
      },
      red_flags: []
    };

    this.changes = {
      new_poles: [],
      status_changes: [],
      pole_assignments: [],
      drop_additions: [],
      agent_changes: []
    };
  }

  addRedFlag(flag) {
    this.red_flags.push(flag);
    this.summary.verification_passed = false;
  }
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/import-onemap-daily-excel.js <excel-file-path>');
    console.error('Supports: .xlsx, .xls, .csv files');
    process.exit(1);
  }

  const filePath = args[0];
  const batchId = `IMP_${new Date().toISOString().replace(/[:.]/g, '-')}`;

  console.log(`🚀 Starting OneMap Daily Import (Excel/CSV)`);
  console.log(`📁 File: ${filePath}`);
  console.log(`🏷️  Batch ID: ${batchId}`);

  try {
    // Create import batch record
    await sql`
      INSERT INTO ${IMPORT_BATCHES_TABLE} (
        batch_id, import_date, file_name, status
      ) VALUES (
        ${batchId}, ${new Date().toISOString()}, ${path.basename(filePath)}, 'processing'
      )
    `;

    // Parse file (Excel or CSV)
    const records = await parseFile(filePath);
    const report = new VerificationReport();
    report.summary.total_records = records.length;

    // Step 1: Manual Spot Checks
    console.log('\\n🔍 Performing manual spot checks...');
    report.checks.manual_spot_checks = await performSpotChecks(records);

    // Step 2: Count Verification
    console.log('📊 Performing count verification...');
    report.checks.count_verification = performCountVerification(records);

    // Step 3: Business Logic Checks
    console.log('🏗️  Checking business logic constraints...');
    await checkBusinessLogic(records, report);

    // Step 4: Process Records
    console.log('\\n💾 Processing records...');
    let processed = 0;
    const firstInstanceTracking = {}; // Track first instances across all records

    for (const record of records) {
      await processRecord(record, report, batchId, firstInstanceTracking);
      processed++;

      if (processed % 100 === 0) {
        console.log(`  Processed ${processed}/${records.length} records...`);
      }
    }

    // Update batch status
    await sql`
      UPDATE ${sql(IMPORT_BATCHES_TABLE)}
      SET status = 'completed',
          total_rows_processed = ${report.summary.total_records},
          new_records_count = ${report.summary.new_records},
          duplicate_count = ${report.summary.duplicate_property_ids},
          verification_passed = ${report.summary.verification_passed}
      WHERE batch_id = ${batchId}
    `;

    // Generate reports
    console.log('\\n📝 Generating reports...');
    const textReport = await generateReports(report, batchId, path.basename(filePath));

    // Display summary
    console.log('\\n' + textReport);

    console.log('\\n✅ Import completed successfully!');

  } catch (error) {
    console.error('\\n❌ Import failed:', error);

    // Update batch status to failed
    await sql`
      UPDATE ${sql(IMPORT_BATCHES_TABLE)}
      SET status = 'failed', error_message = ${error.message}
      WHERE batch_id = ${batchId}
    `;

    throw error;
  }
  // Neon serverless client handles connection cleanup automatically
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { parseFile, processRecord, performSpotChecks };