#!/usr/bin/env node

/**
 * Clean Hardcoded Credentials from Script Files
 * Replaces hardcoded database connection strings with environment variable usage
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

console.log('🔧 Cleaning hardcoded credentials from script files...');

// Pattern to match hardcoded PostgreSQL URLs
const hardcodedPatterns = [
  /postgresql:\/\/[^'"\s]+@ep-[^'"\s]+/g,
  /npg_[A-Za-z0-9]{12}/g
];

// Replacement pattern
const envReplacement = `process.env.DATABASE_URL`;
const errorCheck = `
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required. Check your .env file.');
}`;

// Find all script files
const scriptFiles = glob.sync('scripts/**/*.{js,ts}', { 
  ignore: ['scripts/clean-hardcoded-credentials.js'] 
});

let filesModified = 0;
let credentialsFound = 0;

console.log(`📁 Found ${scriptFiles.length} script files to check`);

scriptFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let fileModified = false;
    
    // Check for hardcoded patterns
    hardcodedPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        console.log(`🚨 Found hardcoded credentials in: ${filePath}`);
        credentialsFound++;
        fileModified = true;
        
        // Replace hardcoded URLs with environment variable
        modifiedContent = modifiedContent.replace(
          /(['"`])postgresql:\/\/[^'"`]+@ep-[^'"`]+(['"`])/g,
          `${envReplacement}`
        );
        
        // Add error checking if not present
        if (!modifiedContent.includes('process.env.DATABASE_URL') && 
            !modifiedContent.includes('DATABASE_URL')) {
          const lines = modifiedContent.split('\n');
          const insertAt = Math.min(10, lines.length);
          lines.splice(insertAt, 0, errorCheck);
          modifiedContent = lines.join('\n');
        }
      }
    });
    
    if (fileModified) {
      fs.writeFileSync(filePath, modifiedContent);
      filesModified++;
      console.log(`✅ Cleaned credentials in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎯 Cleanup Summary:`);
console.log(`   Files checked: ${scriptFiles.length}`);
console.log(`   Credentials found: ${credentialsFound}`);
console.log(`   Files modified: ${filesModified}`);

if (filesModified > 0) {
  console.log(`\n✅ Hardcoded credentials cleaned successfully!`);
  console.log(`⚠️  Remember to set DATABASE_URL in your .env file`);
} else {
  console.log(`\n🎉 No hardcoded credentials found - scripts are clean!`);
}