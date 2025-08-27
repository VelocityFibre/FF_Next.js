#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes Vite build output and provides optimization recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read build output from log file
const buildOutputPath = path.join(__dirname, '..', 'build-output.log');
let buildOutput = '';

try {
  if (fs.existsSync(buildOutputPath)) {
    buildOutput = fs.readFileSync(buildOutputPath, 'utf-8');
  } else {
    console.error('❌ Build output file not found. Run `npm run build:analyze` first.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error reading build output:', error.message);
  process.exit(1);
}

// Bundle analysis functions
const CHUNK_SIZE_LIMITS = {
  critical: 100 * 1024, // 100KB
  large: 300 * 1024,    // 300KB
  medium: 150 * 1024,   // 150KB
  small: 50 * 1024,     // 50KB
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const categorizeChunk = (chunkName) => {
  const patterns = {
    critical: ['react-core', 'index', 'main', 'app', 'components-core', 'contexts'],
    large: ['module-', 'firebase', 'database', 'xlsx', 'charts', 'procurement', 'contractors', 'workflow'],
    medium: ['services-', 'components-', 'ui-libs', 'state-management'],
    small: ['utilities', 'app-utils', 'styles', 'csv-parser']
  };

  for (const [category, categoryPatterns] of Object.entries(patterns)) {
    if (categoryPatterns.some(pattern => chunkName.includes(pattern))) {
      return category;
    }
  }
  return 'medium';
};

const parseBuildOutput = (output) => {
  // Match both old and new Vite output formats
  const chunkRegex = /assets\/js\/(.+?)-[a-f0-9]+\.js\s+([0-9,]+\.?\d*)\s*([A-Z]+)/g;
  const chunks = [];
  let match;

  while ((match = chunkRegex.exec(output)) !== null) {
    const [, name, sizeStr, unit] = match;
    
    const sizeNum = parseFloat(sizeStr.replace(/,/g, ''));
    let size = sizeNum;
    
    switch (unit) {
      case 'KB':
        size = sizeNum * 1024;
        break;
      case 'MB':
        size = sizeNum * 1024 * 1024;
        break;
      case 'GB':
        size = sizeNum * 1024 * 1024 * 1024;
        break;
    }

    const category = categorizeChunk(name);
    const isOverLimit = size > CHUNK_SIZE_LIMITS[category];

    chunks.push({
      name,
      size,
      sizeFormatted: formatBytes(size),
      isOverLimit,
      category,
      originalSize: `${sizeStr} ${unit}`
    });
  }

  return chunks.sort((a, b) => b.size - a.size);
};

const generateReport = (chunks) => {
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const oversizedChunks = chunks.filter(chunk => chunk.isOverLimit);
  const largestChunks = chunks.slice(0, 10);

  // Calculate optimization score
  let score = 100;
  
  // Deduct for oversized chunks
  score -= Math.min(oversizedChunks.length * 10, 50);
  
  // Deduct for large total size
  const totalSizeMB = totalSize / (1024 * 1024);
  if (totalSizeMB > 5) {
    score -= Math.min((totalSizeMB - 5) * 5, 30);
  }
  
  // Deduct for too many chunks
  if (chunks.length > 30) {
    score -= Math.min((chunks.length - 30) * 2, 20);
  }

  score = Math.max(0, score);

  return {
    totalSize,
    totalSizeFormatted: formatBytes(totalSize),
    chunkCount: chunks.length,
    oversizedChunks,
    largestChunks,
    optimizationScore: Math.round(score)
  };
};

// Parse build output
const chunks = parseBuildOutput(buildOutput);
const report = generateReport(chunks);

// Print report
console.log('\n🔍 Bundle Analysis Report');
console.log('========================');
console.log(`📊 Total Size: ${report.totalSizeFormatted}`);
console.log(`📦 Chunks: ${report.chunkCount}`);
console.log(`⭐ Optimization Score: ${report.optimizationScore}/100`);

if (report.optimizationScore >= 90) {
  console.log('🟢 **Excellent** - Bundle is well optimized');
} else if (report.optimizationScore >= 75) {
  console.log('🟡 **Good** - Minor optimizations possible');
} else if (report.optimizationScore >= 50) {
  console.log('🟠 **Fair** - Significant optimizations needed');
} else {
  console.log('🔴 **Poor** - Major optimizations required');
}

if (report.oversizedChunks.length > 0) {
  console.log(`\n⚠️  Oversized Chunks (${report.oversizedChunks.length}):`);
  report.oversizedChunks.forEach(chunk => {
    console.log(`   🔸 ${chunk.name}: ${chunk.sizeFormatted} (${chunk.category} limit: ${formatBytes(CHUNK_SIZE_LIMITS[chunk.category])})`);
  });
  
  console.log('\n💡 Optimization Suggestions:');
  report.oversizedChunks.forEach(chunk => {
    if (chunk.name.includes('firebase')) {
      console.log(`   - ${chunk.name}: Split Firebase services by functionality`);
    }
    if (chunk.name.includes('services-')) {
      console.log(`   - ${chunk.name}: Implement lazy loading for service modules`);
    }
    if (chunk.name.includes('module-')) {
      console.log(`   - ${chunk.name}: Use route-level code splitting`);
    }
    if (chunk.name.includes('vendor') || chunk.name.includes('react-core')) {
      console.log(`   - ${chunk.name}: Split vendor dependencies further`);
    }
  });
}

console.log('\n🔝 Top 5 Largest Chunks:');
report.largestChunks.slice(0, 5).forEach((chunk, i) => {
  const status = chunk.isOverLimit ? '⚠️' : '✅';
  console.log(`   ${i + 1}. ${chunk.name}: ${chunk.sizeFormatted} ${status}`);
});

// Performance recommendations
console.log('\n🚀 Performance Recommendations:');

const hasFirebaseChunks = chunks.some(c => c.name.includes('firebase'));
const hasLargeServiceChunks = chunks.some(c => c.name.includes('services-') && c.size > 200 * 1024);
const hasLargeVendorChunks = chunks.some(c => (c.name.includes('vendor') || c.name.includes('react-core')) && c.size > 500 * 1024);

if (hasFirebaseChunks) {
  console.log('   🔥 Implement Firebase dynamic imports in auth services');
}

if (hasLargeServiceChunks) {
  console.log('   🔥 Add lazy loading to large service modules');
}

if (hasLargeVendorChunks) {
  console.log('   🔥 Further split vendor dependencies by usage frequency');
}

if (chunks.some(c => c.name.includes('xlsx'))) {
  console.log('   🔥 Load Excel processor only when file operations needed');
}

if (chunks.some(c => c.name.includes('charts'))) {
  console.log('   🔥 Load chart library dynamically when charts displayed');
}

console.log('   🔥 Consider using web workers for heavy computations');
console.log('   🔥 Implement resource preloading based on user navigation patterns');

// Save detailed report
const reportPath = path.join(__dirname, '..', 'bundle-analysis-report.json');
const detailedReport = {
  timestamp: new Date().toISOString(),
  summary: report,
  chunks: chunks,
  recommendations: {
    firebase: hasFirebaseChunks,
    services: hasLargeServiceChunks,
    vendor: hasLargeVendorChunks,
    excel: chunks.some(c => c.name.includes('xlsx')),
    charts: chunks.some(c => c.name.includes('charts'))
  }
};

try {
  fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
} catch (error) {
  console.warn(`⚠️  Could not save report: ${error.message}`);
}

// Exit with appropriate code
if (report.optimizationScore < 50) {
  console.log('\n❌ Bundle optimization needs immediate attention!');
  process.exit(1);
} else if (report.oversizedChunks.length > 5) {
  console.log('\n⚠️  Multiple oversized chunks detected');
  process.exit(1);
} else {
  console.log('\n✅ Bundle analysis complete');
  process.exit(0);
}