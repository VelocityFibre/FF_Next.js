#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function fixApostrophesInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix apostrophes in JSX text content
    // This is a simple approach - replace ' with &apos; but be careful not to replace in code
    let newContent = content.replace(
      /(>[^<]*?)'/g, 
      (match, beforeQuote) => {
        modified = true;
        return beforeQuote + '&apos;';
      }
    );
    
    // Fix apostrophes in attribute values
    newContent = newContent.replace(
      /(=["'][^"']*?)'/g,
      (match, beforeQuote) => {
        modified = true;
        return beforeQuote + '&apos;';
      }
    );
    
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed apostrophes in: ${filePath}`);
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
    // Get list of files with unescaped entity violations in src/
    const eslintOutput = execSync('npx eslint src/ --format compact | grep "react/no-unescaped-entities"', { 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    
    const files = new Set();
    
    eslintOutput.split('\n').forEach(line => {
      if (line.trim()) {
        const match = line.match(/^([^:]+):/);
        if (match && match[1].includes('C:\\')) {
          files.add(match[1]);
        }
      }
    });
    
    console.log(`Found ${files.size} files with unescaped entities`);
    
    let fixedCount = 0;
    files.forEach(filePath => {
      if (fixApostrophesInFile(filePath)) {
        fixedCount++;
      }
    });
    
    console.log(`Fixed apostrophes in ${fixedCount} files`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}