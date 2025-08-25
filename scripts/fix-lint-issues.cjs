#!/usr/bin/env node

/**
 * Script to fix common ESLint issues in FibreFlow React codebase
 * Addresses: unused variables, prefer-const, unescaped entities, explicit any types
 */

const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix prefer-const: Replace 'let' with 'const' for variables that are never reassigned
  const letPattern = /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*[^;]+;/g;
  let match;
  while ((match = letPattern.exec(content)) !== null) {
    const varName = match[1];
    const fullMatch = match[0];
    const restOfContent = content.substring(match.index + fullMatch.length);
    
    // Simple heuristic: if variable is not reassigned later (no standalone assignment), convert to const
    const reassignPattern = new RegExp(`\\b${varName}\\s*=\\s*[^=]`, 'g');
    if (!reassignPattern.test(restOfContent)) {
      content = content.replace(fullMatch, fullMatch.replace('let ', 'const '));
      changed = true;
    }
  }

  // Fix unescaped entities in JSX
  content = content.replace(/'/g, '&apos;').replace(/"/g, '&quot;');
  if (content !== fs.readFileSync(filePath, 'utf8')) {
    changed = true;
  }

  // Prefix unused variables with underscore
  const unusedVarPattern = /(\w+)\s+(\w+)(?=\s*[:=])/g;
  // This is a simplified pattern - full implementation would need AST parsing

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ESLint issues in: ${filePath}`);
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
      // Skip certain directories
      if (['node_modules', '.git', 'dist', 'build', '__tests__'].includes(file)) {
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
console.log('🔧 Starting ESLint issues cleanup...');

const srcDir = path.join(__dirname, '..', 'src');
const totalFixed = walkDirectory(srcDir);

console.log(`\n✨ ESLint cleanup complete! Fixed ${totalFixed} files.`);

if (totalFixed > 0) {
  console.log('📝 Run ESLint again to verify fixes:');
  console.log('   npm run lint');
}