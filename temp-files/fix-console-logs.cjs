#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get list of files with console.log violations
const { execSync } = require('child_process');

function fixConsoleLogsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove console.log, console.warn, console.error statements but keep console.info for debugging
    let newContent = content.replace(/^\s*console\.(log|warn|error)\([^)]*\);?\s*$/gm, (match) => {
      modified = true;
      // Keep some spacing to avoid breaking code structure
      return '';
    });
    
    // Remove console statements that span multiple lines
    newContent = newContent.replace(/^\s*console\.(log|warn|error)\(\s*[\s\S]*?\);?\s*$/gm, (match) => {
      modified = true;
      return '';
    });
    
    // Clean up multiple empty lines
    newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed console logs in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  try {
    // Get list of files with console.log violations in src/
    const eslintOutput = execSync('npx eslint src/ --format compact | grep "no-console"', { 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    
    const files = new Set();
    
    eslintOutput.split('\n').forEach(line => {
      if (line.trim()) {
        const match = line.match(/^([^:]+):/);
        if (match) {
          files.add(match[1]);
        }
      }
    });
    
    console.log(`Found ${files.size} files with console.log statements`);
    
    let fixedCount = 0;
    files.forEach(filePath => {
      if (fixConsoleLogsInFile(filePath)) {
        fixedCount++;
      }
    });
    
    console.log(`Fixed console logs in ${fixedCount} files`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}