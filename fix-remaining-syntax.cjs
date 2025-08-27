#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixRemainingLogSyntax(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix log statements with trailing spaces and syntax issues
  const fixes = [
    // Fix "{ data: error   }" patterns
    {
      pattern: /{\s*data:\s*([^}]+?)\s{2,}\s*}/g,
      replacement: "{ data: $1 }"
    },
    // Fix log statements with malformed syntax like "}, 'component');"
    {
      pattern: /log\.(info|warn|error|debug)\('([^']+)',\s*{\s*data:\s*([^}]+?)\s{2,}\s*},\s*'([^']+)'\);/g,
      replacement: "log.$1('$2', { data: $3 }, '$4');"
    },
    // Fix orphaned semicolons after log closing braces
    {
      pattern: /}\s*},\s*'([^']+)'\);\s*;/g,
      replacement: "} }, '$1');"
    },
    // Fix lines ending with ;:
    {
      pattern: /;\s*:\s*,/g,
      replacement: ","
    },
    // Fix malformed object destructuring in log parameters
    {
      pattern: /timestamp:\s*new\s*Date\(\s*}\s*,\s*'([^']+)'\);\}\.toISOString\(\),/g,
      replacement: "timestamp: new Date().toISOString(),"
    },
    // Fix missing closing parentheses before component names
    {
      pattern: /log\.(info|warn|error|debug)\('([^']+)',\s*undefined,\s*'([^']+)'\);/g,
      replacement: "log.$1('$2', {}, '$3');"
    }
  ];

  fixes.forEach(fix => {
    const newContent = content.replace(fix.pattern, fix.replacement);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }

  return changed;
}

// Get files with TypeScript errors
const { execSync } = require('child_process');

try {
  // Get TypeScript error files
  const tscOutput = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8' });
  const errorLines = tscOutput.split('\n').filter(line => line.includes('.ts(') || line.includes('.tsx('));
  
  const errorFiles = [...new Set(errorLines.map(line => {
    const match = line.match(/^([^(]+\.(ts|tsx))/);
    return match ? match[1] : null;
  }).filter(Boolean))];

  console.log(`Processing ${errorFiles.length} files with TypeScript errors...`);

  let totalFixed = 0;
  errorFiles.forEach(file => {
    if (fs.existsSync(file) && fixRemainingLogSyntax(file)) {
      totalFixed++;
    }
  });

  console.log(`Fixed ${totalFixed} files`);

} catch (error) {
  console.error('Error running TypeScript check:', error.message);
}