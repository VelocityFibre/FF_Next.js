#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixLogSyntaxInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix common log syntax errors
  const fixes = [
    // Fix malformed log.info calls
    {
      pattern: /log\.(info|warn|error|debug)\('([^']+)',\s*{\s*data:\s*([^}]+)\s*},\s*'([^']+)'\)\s*;/g,
      replacement: "log.$1('$2', { data: $3 }, '$4');"
    },
    // Fix missing closing brackets in log data
    {
      pattern: /{\s*data:\s*([^}]+)\s*},\s*'([^']+)'\)\s*;/g,
      replacement: "{ data: $1 }, '$2');"
    },
    // Fix double semicolons
    {
      pattern: /;;/g,
      replacement: ';'
    },
    // Fix stray semicolons in comments
    {
      pattern: /\/\/ ([^;\n]+);(\s*)$/gm,
      replacement: '// $1$2'
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

function findTypeScriptFiles(dir) {
  const files = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const files = findTypeScriptFiles(srcDir);

console.log(`Processing ${files.length} TypeScript files...`);

let totalFixed = 0;
files.forEach(file => {
  if (fixLogSyntaxInFile(file)) {
    totalFixed++;
  }
});

console.log(`Fixed ${totalFixed} files`);