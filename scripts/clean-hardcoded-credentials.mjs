#!/usr/bin/env node

/**
 * Clean Hardcoded Credentials from Script Files
 * Replaces hardcoded database connection strings with environment variable usage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Cleaning hardcoded credentials from script files...');

// Pattern to match hardcoded PostgreSQL URLs
const hardcodedPattern = /postgresql:\/\/[^'"\s\)]+@ep-[^'"\s\)]+/g;

// Find all script files manually
const scriptDir = __dirname;
const scriptFiles = fs.readdirSync(scriptDir)
  .filter(file => file.endsWith('.js') || file.endsWith('.ts'))
  .filter(file => file !== 'clean-hardcoded-credentials.mjs')
  .map(file => path.join(scriptDir, file));

let filesModified = 0;
let credentialsFound = 0;

console.log(`📁 Found ${scriptFiles.length} script files to check`);

scriptFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for hardcoded patterns
    const matches = content.match(hardcodedPattern);
    if (matches) {
      console.log(`🚨 Found ${matches.length} hardcoded credential(s) in: ${path.basename(filePath)}`);
      credentialsFound += matches.length;
      
      // Replace hardcoded URLs with environment variable usage
      let modifiedContent = content.replace(
        hardcodedPattern,
        'process.env.DATABASE_URL'
      );
      
      // Ensure error checking exists
      if (!modifiedContent.includes('if (!process.env.DATABASE_URL)')) {
        const errorCheck = `
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required. Check your .env file.');
}`;
        
        // Insert after imports/requires
        const lines = modifiedContent.split('\n');
        let insertAt = 0;
        for (let i = 0; i < Math.min(15, lines.length); i++) {
          if (!lines[i].trim().startsWith('import') && 
              !lines[i].trim().startsWith('require') &&
              !lines[i].trim().startsWith('//') &&
              !lines[i].trim().startsWith('/**') &&
              !lines[i].trim().startsWith('*') &&
              lines[i].trim() !== '') {
            insertAt = i;
            break;
          }
        }
        lines.splice(insertAt, 0, errorCheck);
        modifiedContent = lines.join('\n');
      }
      
      fs.writeFileSync(filePath, modifiedContent);
      filesModified++;
      console.log(`✅ Cleaned credentials in: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
  }
});

console.log(`\n🎯 Cleanup Summary:`);
console.log(`   Files checked: ${scriptFiles.length}`);
console.log(`   Credentials found: ${credentialsFound}`);
console.log(`   Files modified: ${filesModified}`);

if (filesModified > 0) {
  console.log(`\n✅ Hardcoded credentials cleaned successfully!`);
  console.log(`⚠️  Remember: DATABASE_URL is already set in your .env file`);
} else {
  console.log(`\n🎉 No hardcoded credentials found - scripts are clean!`);
}