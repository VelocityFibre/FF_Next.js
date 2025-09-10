#!/usr/bin/env node

/**
 * Smart Import Router
 * Intelligently routes imports based on file size and complexity
 */

const fs = require('fs').promises;
const XLSX = require('xlsx');

async function analyzeImport(filePath) {
  console.log('🧠 Analyzing import requirements...\n');

  try {
    // Check file size
    const stats = await fs.stat(filePath);
    const fileSizeMB = stats.size / (1024 * 1024);

    // Read Excel file to analyze complexity
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const recordCount = data.length - 1; // Subtract header
    const columnCount = data[0]?.length || 0;

    console.log('📊 File Analysis:');
    console.log(`   - File size: ${fileSizeMB.toFixed(2)} MB`);
    console.log(`   - Records: ${recordCount.toLocaleString()}`);
    console.log(`   - Columns: ${columnCount}`);

    // Determine optimal import method
    const recommendation = getImportRecommendation(fileSizeMB, recordCount, columnCount);

    console.log('\n🎯 Recommended Import Method:');
    console.log(`   - Method: ${recommendation.method}`);
    console.log(`   - Reason: ${recommendation.reason}`);
    console.log(`   - Estimated time: ${recommendation.estimatedTime}`);
    console.log(`   - Resource usage: ${recommendation.resourceUsage}`);

    if (recommendation.method === 'CLI') {
      console.log('\n💻 CLI Command:');
      console.log(`   node scripts/conservative-lawley-import.js`);
    }

    return recommendation;

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    return null;
  }
}

function getImportRecommendation(fileSizeMB, recordCount, columnCount) {
  // Decision matrix based on file characteristics
  if (recordCount > 10000 || fileSizeMB > 50) {
    return {
      method: 'CLI',
      reason: 'Large dataset requiring optimized processing',
      estimatedTime: '~15-30 minutes',
      resourceUsage: 'High (server-side processing)',
      pros: ['Handles large files efficiently', 'Detailed progress monitoring', 'Error recovery', 'Batch optimization'],
      cons: ['Requires command line access', 'Less visual feedback']
    };
  }

  if (recordCount > 5000 || fileSizeMB > 20) {
    return {
      method: 'HYBRID',
      reason: 'Medium-large dataset - can use either method',
      estimatedTime: '~5-15 minutes',
      resourceUsage: 'Medium',
      pros: ['Flexible options', 'Good performance either way'],
      cons: ['Choice complexity']
    };
  }

  if (recordCount > 1000 || fileSizeMB > 5) {
    return {
      method: 'UI_PREFERRED',
      reason: 'Medium dataset suitable for UI processing',
      estimatedTime: '~2-5 minutes',
      resourceUsage: 'Low to Medium',
      pros: ['User-friendly interface', 'Visual progress', 'Immediate feedback'],
      cons: ['Potential timeout issues', 'Memory constraints']
    };
  }

  return {
    method: 'UI_OPTIMAL',
    reason: 'Small dataset perfect for UI processing',
    estimatedTime: '~30 seconds - 2 minutes',
    resourceUsage: 'Low',
    pros: ['Fast and user-friendly', 'Immediate results', 'No technical knowledge required'],
    cons: ['Limited to smaller files']
  };
}

// Run analysis if called directly
if (require.main === module) {
  const filePath = process.argv[2] || 'pages/onemap/downloads/lawley_01092025.xlsx';
  analyzeImport(filePath).catch(console.error);
}

module.exports = { analyzeImport, getImportRecommendation };
