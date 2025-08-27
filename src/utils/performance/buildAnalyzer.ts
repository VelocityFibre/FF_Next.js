/**
 * Build Analyzer - Bundle Size Analysis and Reporting
 * Monitors and reports on bundle composition and optimization opportunities
 */

export interface ChunkAnalysis {
  name: string;
  size: number;
  sizeFormatted: string;
  isOverLimit: boolean;
  category: 'critical' | 'large' | 'medium' | 'small';
  suggestions: string[];
}

export interface BundleAnalysisReport {
  totalSize: number;
  totalSizeFormatted: string;
  chunkCount: number;
  oversizedChunks: ChunkAnalysis[];
  largestChunks: ChunkAnalysis[];
  categories: Record<string, ChunkAnalysis[]>;
  optimizationScore: number;
  recommendations: string[];
}

const CHUNK_SIZE_LIMITS = {
  critical: 100 * 1024, // 100KB - Critical path chunks
  large: 300 * 1024,    // 300KB - Feature chunks
  medium: 150 * 1024,   // 150KB - Service chunks
  small: 50 * 1024,     // 50KB - Utility chunks
};

/**
 * Format bytes to human-readable format
 */
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Categorize chunk by name patterns
 */
const categorizeChunk = (chunkName: string): keyof typeof CHUNK_SIZE_LIMITS => {
  const patterns = {
    critical: [
      'react-core', 'index', 'main', 'app', 'vendor-critical',
      'components-core', 'contexts'
    ],
    large: [
      'module-', 'firebase', 'database', 'xlsx', 'charts',
      'procurement', 'contractors', 'workflow'
    ],
    medium: [
      'services-', 'components-', 'ui-libs', 'state-management'
    ],
    small: [
      'utilities', 'app-utils', 'styles', 'csv-parser'
    ]
  };

  for (const [category, categoryPatterns] of Object.entries(patterns)) {
    if (categoryPatterns.some(pattern => chunkName.includes(pattern))) {
      return category as keyof typeof CHUNK_SIZE_LIMITS;
    }
  }

  return 'medium'; // Default category
};

/**
 * Generate optimization suggestions for a chunk
 */
const generateSuggestions = (chunk: ChunkAnalysis): string[] => {
  const suggestions: string[] = [];
  const { name, size, category } = chunk;

  if (size > CHUNK_SIZE_LIMITS[category]) {
    suggestions.push(`Chunk exceeds ${category} limit by ${formatBytes(size - CHUNK_SIZE_LIMITS[category])}`);
  }

  // Specific suggestions based on chunk name
  if (name.includes('vendor') || name.includes('node_modules')) {
    suggestions.push('Consider splitting vendor dependencies further');
    if (size > 500 * 1024) {
      suggestions.push('Move rarely-used dependencies to dynamic imports');
    }
  }

  if (name.includes('firebase')) {
    suggestions.push('Split Firebase services by functionality (auth/firestore/storage)');
    suggestions.push('Use dynamic imports for Firebase modules');
  }

  if (name.includes('services-')) {
    suggestions.push('Split large service modules by domain');
    suggestions.push('Consider lazy loading service modules');
  }

  if (name.includes('module-')) {
    suggestions.push('Implement route-level code splitting');
    suggestions.push('Move heavy calculations to web workers');
  }

  if (name.includes('xlsx') || name.includes('excel')) {
    suggestions.push('Load Excel processor only when file operations are needed');
  }

  if (name.includes('charts') || name.includes('recharts')) {
    suggestions.push('Load chart library dynamically when charts are displayed');
  }

  if (name.includes('mui') || name.includes('@emotion')) {
    suggestions.push('Use MUI tree shaking to reduce bundle size');
    suggestions.push('Consider custom UI components for frequently used elements');
  }

  return suggestions;
};

/**
 * Parse build output to extract chunk information
 */
export const parseBuildOutput = (buildOutput: string): ChunkAnalysis[] => {
  const chunkRegex = /assets\/js\/(.+?)-[a-f0-9]+\.js\s+([0-9,]+\.?\d*)\s*([A-Z]+)/g;
  const chunks: ChunkAnalysis[] = [];
  let match;

  while ((match = chunkRegex.exec(buildOutput)) !== null) {
    const [, name, sizeStr, unit] = match;
    
    // Convert size to bytes
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
    const suggestions = [];

    const chunk: ChunkAnalysis = {
      name,
      size,
      sizeFormatted: formatBytes(size),
      isOverLimit,
      category,
      suggestions,
    };

    chunk.suggestions = generateSuggestions(chunk);
    chunks.push(chunk);
  }

  return chunks.sort((a, b) => b.size - a.size);
};

/**
 * Generate comprehensive bundle analysis report
 */
export const generateBundleReport = (chunks: ChunkAnalysis[]): BundleAnalysisReport => {
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const oversizedChunks = chunks.filter(chunk => chunk.isOverLimit);
  const largestChunks = chunks.slice(0, 10);

  // Group chunks by category
  const categories = chunks.reduce((acc, chunk) => {
    if (!acc[chunk.category]) {
      acc[chunk.category] = [];
    }
    acc[chunk.category].push(chunk);
    return acc;
  }, {} as Record<string, ChunkAnalysis[]>);

  // Calculate optimization score (0-100)
  const maxPossibleScore = 100;
  let score = maxPossibleScore;
  
  // Deduct points for oversized chunks
  const oversizedPenalty = Math.min(oversizedChunks.length * 10, 50);
  score -= oversizedPenalty;
  
  // Deduct points for very large total size (>5MB)
  const totalSizeMB = totalSize / (1024 * 1024);
  if (totalSizeMB > 5) {
    score -= Math.min((totalSizeMB - 5) * 5, 30);
  }
  
  // Deduct points for too many chunks (>30)
  if (chunks.length > 30) {
    score -= Math.min((chunks.length - 30) * 2, 20);
  }

  score = Math.max(0, score);

  // Generate high-level recommendations
  const recommendations: string[] = [];
  
  if (oversizedChunks.length > 0) {
    recommendations.push(`${oversizedChunks.length} chunks exceed size limits - prioritize splitting these`);
  }
  
  if (totalSizeMB > 5) {
    recommendations.push(`Total bundle size is ${formatBytes(totalSize)} - consider more aggressive code splitting`);
  }
  
  if (chunks.filter(c => c.name.includes('vendor')).length > 3) {
    recommendations.push('Too many vendor chunks - consolidate related dependencies');
  }
  
  if (chunks.some(c => c.name.includes('firebase') && c.size > 300 * 1024)) {
    recommendations.push('Firebase bundle is large - implement granular Firebase imports');
  }
  
  if (chunks.some(c => c.name.includes('services') && c.size > 200 * 1024)) {
    recommendations.push('Service bundles are large - implement lazy loading for service modules');
  }

  return {
    totalSize,
    totalSizeFormatted: formatBytes(totalSize),
    chunkCount: chunks.length,
    oversizedChunks,
    largestChunks,
    categories,
    optimizationScore: Math.round(score),
    recommendations,
  };
};

/**
 * Generate detailed report in markdown format
 */
export const generateMarkdownReport = (report: BundleAnalysisReport): string => {
  const { 
    totalSizeFormatted, 
    chunkCount, 
    oversizedChunks, 
    largestChunks, 
    optimizationScore, 
    recommendations 
  } = report;

  let markdown = `# Bundle Analysis Report

## Summary
- **Total Bundle Size**: ${totalSizeFormatted}
- **Number of Chunks**: ${chunkCount}
- **Optimization Score**: ${optimizationScore}/100
- **Oversized Chunks**: ${oversizedChunks.length}

## Optimization Score Breakdown
`;

  if (optimizationScore >= 90) {
    markdown += '🟢 **Excellent** - Bundle is well optimized\n';
  } else if (optimizationScore >= 75) {
    markdown += '🟡 **Good** - Minor optimizations possible\n';
  } else if (optimizationScore >= 50) {
    markdown += '🟠 **Fair** - Significant optimizations needed\n';
  } else {
    markdown += '🔴 **Poor** - Major optimizations required\n';
  }

  if (recommendations.length > 0) {
    markdown += '\n## High-Priority Recommendations\n';
    recommendations.forEach((rec, i) => {
      markdown += `${i + 1}. ${rec}\n`;
    });
  }

  if (oversizedChunks.length > 0) {
    markdown += '\n## Oversized Chunks (Require Immediate Attention)\n';
    oversizedChunks.forEach(chunk => {
      markdown += `\n### ${chunk.name} (${chunk.sizeFormatted})\n`;
      markdown += `- **Category**: ${chunk.category}\n`;
      markdown += `- **Status**: ⚠️ Exceeds ${chunk.category} limit\n`;
      if (chunk.suggestions.length > 0) {
        markdown += '- **Suggestions**:\n';
        chunk.suggestions.forEach(suggestion => {
          markdown += `  - ${suggestion}\n`;
        });
      }
    });
  }

  markdown += '\n## Largest Chunks\n';
  largestChunks.forEach((chunk, i) => {
    const status = chunk.isOverLimit ? '⚠️' : '✅';
    markdown += `${i + 1}. **${chunk.name}** - ${chunk.sizeFormatted} ${status}\n`;
  });

  return markdown;
};

import { log } from '@/lib/logger';

/**
 * CLI-friendly structured report (replaces console output)
 */
export const printConsoleReport = (report: BundleAnalysisReport): void => {
  // Create structured log data instead of console output
  const reportData = {
    totalSize: report.totalSizeFormatted,
    chunkCount: report.chunkCount,
    optimizationScore: report.optimizationScore,
    oversizedChunks: report.oversizedChunks.map(chunk => ({
      name: chunk.name,
      size: chunk.sizeFormatted
    })),
    recommendations: report.recommendations,
    largestChunks: report.largestChunks.slice(0, 5).map((chunk, i) => ({
      rank: i + 1,
      name: chunk.name,
      size: chunk.sizeFormatted,
      status: chunk.isOverLimit ? 'oversized' : 'normal'
    }))
  };

  // Log structured bundle analysis report
  log.info('Bundle Analysis Report Generated', reportData, 'buildAnalyzer');

  // For critical issues, use appropriate log levels
  if (report.oversizedChunks.length > 0) {
    log.warn('Oversized chunks detected', {
      count: report.oversizedChunks.length,
      chunks: report.oversizedChunks
    }, 'buildAnalyzer');
  }

  if (report.recommendations.length > 0) {
    log.info('Bundle optimization recommendations available', {
      count: report.recommendations.length,
      recommendations: report.recommendations
    }, 'buildAnalyzer');
  }
};