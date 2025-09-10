#!/usr/bin/env node

/**
 * Generate Verification Report
 * Creates a detailed HTML report of the import verification results
 */

const { neon } = require('@neondatabase/serverless');
const XLSX = require('xlsx');
const fs = require('fs').promises;
const sql = neon(process.env.DATABASE_URL);

async function generateVerificationReport() {
  console.log('📄 Generating detailed verification report...\n');

  try {
    const reportData = {
      generatedAt: new Date().toISOString(),
      excelFile: 'pages/onemap/downloads/lawley_01092025.xlsx',
      databaseTable: 'onemap_records'
    };

    // 1. Basic statistics
    const totalCount = await sql`SELECT COUNT(*) as count FROM onemap_records`;
    reportData.totalRecords = totalCount[0].count;

    // 2. Excel comparison
    const workbook = XLSX.readFile(reportData.excelFile);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    reportData.excelRecords = excelData.length - 1;

    // 3. Completeness analysis
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

    reportData.completeness = completenessStats[0];

    // 4. Duplicate analysis
    const duplicates = await sql`
      SELECT property_id, COUNT(*) as count
      FROM onemap_records
      GROUP BY property_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;
    reportData.duplicates = duplicates;

    // 5. Status distribution
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
    reportData.statusDistribution = statusDistribution;

    // 6. GPS statistics
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
    reportData.gpsStats = gpsStats[0];

    // 7. Sample records
    const sampleRecords = await sql`
      SELECT property_id, status, pole_number, drop_number, latitude, longitude, location_address
      FROM onemap_records
      WHERE property_id IS NOT NULL AND property_id != ''
      LIMIT 10
    `;
    reportData.sampleRecords = sampleRecords;

    // Generate HTML report
    const htmlReport = generateHTMLReport(reportData);

    // Save report to file
    const reportFileName = `lawley-import-verification-${new Date().toISOString().split('T')[0]}.html`;
    await fs.writeFile(reportFileName, htmlReport);

    console.log(`✅ Verification report generated: ${reportFileName}`);
    console.log(`📊 Report includes:`);
    console.log(`   - Complete data statistics`);
    console.log(`   - Quality analysis`);
    console.log(`   - Duplicate detection`);
    console.log(`   - GPS coordinate validation`);
    console.log(`   - Sample records`);
    console.log(`   - Status distribution`);

  } catch (error) {
    console.error('\n❌ Report generation failed:', error);
    process.exit(1);
  }
}

function generateHTMLReport(data) {
  const completenessPercentages = {
    propertyIds: Math.round((data.completeness.property_ids / data.completeness.total) * 100),
    statuses: Math.round((data.completeness.statuses / data.completeness.total) * 100),
    poleNumbers: Math.round((data.completeness.pole_numbers / data.completeness.total) * 100),
    dropNumbers: Math.round((data.completeness.drop_numbers / data.completeness.total) * 100),
    addresses: Math.round((data.completeness.addresses / data.completeness.total) * 100),
    gpsCoordinates: Math.round((data.completeness.gps_coordinates / data.completeness.total) * 100)
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lawley OneMap Import Verification Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1, h2, h3 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .metric-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .metric-card.success {
            border-left-color: #27ae60;
        }
        .metric-card.warning {
            border-left-color: #f39c12;
        }
        .metric-card.error {
            border-left-color: #e74c3c;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #2c3e50;
        }
        .metric-label {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
        }
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .status-approved { background: #d4edda; color: #155724; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-other { background: #e2e3e5; color: #383d41; }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3498db, #2980b9);
            transition: width 0.3s ease;
        }
        .sample-record {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid #3498db;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Lawley OneMap Import Verification Report</h1>
        
        <div class="summary-grid">
            <div class="metric-card success">
                <div class="metric-value">${data.totalRecords.toLocaleString()}</div>
                <div class="metric-label">Total Records Imported</div>
            </div>
            <div class="metric-card ${data.duplicates.length > 0 ? 'warning' : 'success'}">
                <div class="metric-value">${data.duplicates.length}</div>
                <div class="metric-label">Duplicate Records</div>
            </div>
            <div class="metric-card success">
                <div class="metric-value">${completenessPercentages.gpsCoordinates}%</div>
                <div class="metric-label">GPS Coverage</div>
            </div>
            <div class="metric-card success">
                <div class="metric-value">${completenessPercentages.propertyIds}%</div>
                <div class="metric-label">Property ID Coverage</div>
            </div>
        </div>

        <h2>📊 Import Summary</h2>
        <table>
            <tr><th>Metric</th><th>Excel File</th><th>Database</th><th>Difference</th></tr>
            <tr><td>Total Records</td><td>${data.excelRecords.toLocaleString()}</td><td>${data.totalRecords.toLocaleString()}</td><td>${(data.totalRecords - data.excelRecords).toLocaleString()}</td></tr>
        </table>

        <h2>📈 Data Completeness</h2>
        <table>
            <tr><th>Field</th><th>Complete Records</th><th>Percentage</th><th>Progress Bar</th></tr>
            <tr><td>Property IDs</td><td>${data.completeness.property_ids.toLocaleString()}</td><td>${completenessPercentages.propertyIds}%</td><td><div class="progress-bar"><div class="progress-fill" style="width: ${completenessPercentages.propertyIds}%"></div></div></td></tr>
            <tr><td>Status Information</td><td>${data.completeness.statuses.toLocaleString()}</td><td>${completenessPercentages.statuses}%</td><td><div class="progress-bar"><div class="progress-fill" style="width: ${completenessPercentages.statuses}%"></div></div></td></tr>
            <tr><td>Pole Numbers</td><td>${data.completeness.pole_numbers.toLocaleString()}</td><td>${completenessPercentages.poleNumbers}%</td><td><div class="progress-bar"><div class="progress-fill" style="width: ${completenessPercentages.poleNumbers}%"></div></div></td></tr>
            <tr><td>Drop Numbers</td><td>${data.completeness.drop_numbers.toLocaleString()}</td><td>${completenessPercentages.dropNumbers}%</td><td><div class="progress-bar"><div class="progress-fill" style="width: ${completenessPercentages.dropNumbers}%"></div></div></td></tr>
            <tr><td>Addresses</td><td>${data.completeness.addresses.toLocaleString()}</td><td>${completenessPercentages.addresses}%</td><td><div class="progress-bar"><div class="progress-fill" style="width: ${completenessPercentages.addresses}%"></div></div></td></tr>
            <tr><td>GPS Coordinates</td><td>${data.completeness.gps_coordinates.toLocaleString()}</td><td>${completenessPercentages.gpsCoordinates}%</td><td><div class="progress-bar"><div class="progress-fill" style="width: ${completenessPercentages.gpsCoordinates}%"></div></div></td></tr>
        </table>

        <h2>📋 Status Distribution</h2>
        <table>
            <tr><th>Status Category</th><th>Count</th><th>Percentage</th></tr>
            ${data.statusDistribution.map(row => `
                <tr>
                    <td>${row.status_category}</td>
                    <td>${row.count.toLocaleString()}</td>
                    <td>${Math.round((row.count/data.completeness.total)*100)}%</td>
                </tr>
            `).join('')}
        </table>

        ${data.duplicates.length > 0 ? `
        <h2>⚠️ Duplicate Records</h2>
        <table>
            <tr><th>Property ID</th><th>Duplicate Count</th></tr>
            ${data.duplicates.slice(0, 10).map(dup => `
                <tr>
                    <td>${dup.property_id}</td>
                    <td>${dup.count}</td>
                </tr>
            `).join('')}
        </table>
        ` : '<h2>✅ No Duplicates Found</h2>'}

        <h2>🌍 GPS Statistics</h2>
        <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Records with GPS</td><td>${data.gpsStats.total_with_gps.toLocaleString()}</td></tr>
            <tr><td>Average Latitude</td><td>${data.gpsStats.avg_latitude?.toFixed(6) || 'N/A'}</td></tr>
            <tr><td>Average Longitude</td><td>${data.gpsStats.avg_longitude?.toFixed(6) || 'N/A'}</td></tr>
            <tr><td>Latitude Range</td><td>${data.gpsStats.min_latitude?.toFixed(6) || 'N/A'} to ${data.gpsStats.max_latitude?.toFixed(6) || 'N/A'}</td></tr>
            <tr><td>Longitude Range</td><td>${data.gpsStats.min_longitude?.toFixed(6) || 'N/A'} to ${data.gpsStats.max_longitude?.toFixed(6) || 'N/A'}</td></tr>
        </table>

        <h2>🔍 Sample Records</h2>
        ${data.sampleRecords.map((record, i) => `
            <div class="sample-record">
                <h4>Record ${i+1}: Property ${record.property_id}</h4>
                <p><strong>Status:</strong> ${record.status || 'N/A'}</p>
                <p><strong>Pole Number:</strong> ${record.pole_number || 'N/A'}</p>
                <p><strong>Drop Number:</strong> ${record.drop_number || 'N/A'}</p>
                <p><strong>GPS:</strong> ${record.latitude || 'N/A'}, ${record.longitude || 'N/A'}</p>
                <p><strong>Address:</strong> ${record.location_address?.substring(0, 100) || 'N/A'}${record.location_address?.length > 100 ? '...' : ''}</p>
            </div>
        `).join('')}

        <div class="footer">
            <p>Report generated on ${new Date(data.generatedAt).toLocaleString()}</p>
            <p>Source: ${data.excelFile} → Database: ${data.databaseTable}</p>
        </div>
    </div>
</body>
</html>`;
}

// Run if called directly
if (require.main === module) {
  generateVerificationReport().catch(console.error);
}

module.exports = { generateVerificationReport };
