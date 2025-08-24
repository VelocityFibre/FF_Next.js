const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript and JavaScript files
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
});

let totalRemoved = 0;
const filesModified = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Pattern to match console.log, console.error, console.warn, console.info, console.debug
  // This regex handles multiline console statements
  const consolePattern = /^\s*console\.(log|error|warn|info|debug)\([^)]*\);?\s*$/gm;
  
  // Also match multiline console statements
  const multilinePattern = /^\s*console\.(log|error|warn|info|debug)\([^;]*;/gms;
  
  const newContent = content
    .replace(consolePattern, '')
    .replace(multilinePattern, '');
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    const removedCount = (content.match(consolePattern) || []).length;
    totalRemoved += removedCount;
    filesModified.push({ file, count: removedCount });
  }
});

console.log(`\nRemoved ${totalRemoved} console statements from ${filesModified.length} files`);
console.log('\nFiles modified:');
filesModified.forEach(({ file, count }) => {
  console.log(`  ${file}: ${count} statements removed`);
});