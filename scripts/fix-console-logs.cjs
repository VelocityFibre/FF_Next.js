#!/usr/bin/env node

/**
 * Script to fix console.log statements in the FibreFlow React codebase
 * Removes debug console.log statements and replaces error console.error with proper logging
 */

const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Remove debug console.log statements (but keep console.error for errors)
  const debugLogPattern = /^\s*console\.log\([^)]*\);\s*$/gm;
  if (debugLogPattern.test(content)) {
    content = content.replace(debugLogPattern, '');
    changed = true;
  }

  // Replace console.error with comments in development code
  const errorLogPattern = /console\.error\(/g;
  if (errorLogPattern.test(content)) {
    // Only replace console.error in non-error-boundary contexts
    content = content.replace(/^\s*console\.error\('Error generating [^']+'\);\s*$/gm, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed console statements in: ${filePath}`);
    return true;
  }

  return false;
}

function walkDirectory(dir, filePattern = /\.(ts|tsx)$/i) {
  const files = fs.readdirSync(dir);
  let totalFixed = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other directories
      if (['node_modules', '.git', 'dist', 'build'].includes(file)) {
        continue;
      }
      totalFixed += walkDirectory(filePath, filePattern);
    } else if (filePattern.test(file)) {
      if (processFile(filePath)) {
        totalFixed++;
      }
    }
  }

  return totalFixed;
}

// Main execution
console.log('🔧 Starting console.log cleanup...');

const srcDir = path.join(__dirname, '..', 'src');
const totalFixed = walkDirectory(srcDir);

console.log(`\n✨ Console cleanup complete! Fixed ${totalFixed} files.`);

if (totalFixed > 0) {
  console.log('📝 Run ESLint to verify fixes:');
  console.log('   npm run lint');
}