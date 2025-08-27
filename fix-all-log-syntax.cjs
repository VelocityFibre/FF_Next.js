#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix all log syntax issues in TypeScript files
function fixAllLogSyntax() {
  const srcDir = path.join(__dirname, 'src');
  const files = getAllTypeScriptFiles(srcDir);
  
  let totalFixed = 0;
  
  files.forEach(file => {
    if (fixLogSyntaxInFile(file)) {
      totalFixed++;
    }
  });
  
  console.log(`Fixed ${totalFixed} files`);
}

function getAllTypeScriptFiles(dir) {
  let results = [];
  
  function scanDirectory(currentDir) {
    try {
      const list = fs.readdirSync(currentDir);
      
      list.forEach(file => {
        const fullPath = path.join(currentDir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat && stat.isDirectory()) {
          if (!file.startsWith('.') && file !== 'node_modules') {
            scanDirectory(fullPath);
          }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          results.push(fullPath);
        }
      });
    } catch (err) {
      console.error(`Error reading directory ${currentDir}:`, err.message);
    }
  }
  
  scanDirectory(dir);
  return results;
}

function fixLogSyntaxInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Comprehensive fix patterns
    const fixes = [
      // Fix orphaned semicolons after log statements
      {
        pattern: /;\s*;\s*$/gm,
        replacement: ';'
      },
      // Fix extra spaces in data objects: "{ data: value   }"
      {
        pattern: /{\s*data:\s*([^}]+?)\s{2,}\s*}/g,
        replacement: '{ data: $1 }'
      },
      // Fix malformed log component parameters: "}, 'component');:"
      {
        pattern: /}\s*},\s*'([^']+)'\);\s*:/g,
        replacement: "} }, '$1');"
      },
      // Fix orphaned semicolons on their own lines
      {
        pattern: /^\s*;\s*$/gm,
        replacement: ''
      },
      // Fix malformed log statements with missing parentheses
      {
        pattern: /log\.(info|warn|error|debug)\('([^']+)',\s*{\s*data:\s*([^}]+?)\s*},\s*'([^']+)'\);\s*;/g,
        replacement: "log.$1('$2', { data: $3 }, '$4');"
      },
      // Fix undefined parameters in log statements
      {
        pattern: /log\.(info|warn|error|debug)\('([^']+)',\s*undefined,\s*'([^']+)'\)/g,
        replacement: "log.$1('$2', {}, '$3')"
      },
      // Fix malformed timestamp in log data
      {
        pattern: /timestamp:\s*new\s*Date\(\s*}\s*,\s*'([^']+)'\);\}\.toISOString\(\),/g,
        replacement: "timestamp: new Date().toISOString(),"
      },
      // Fix trailing spaces before closing braces
      {
        pattern: /([^}])\s{2,}}/g,
        replacement: '$1 }'
      },
      // Fix log statements with wrong parameter structure
      {
        pattern: /log\.(info|warn|error|debug)\('([^']+)',\s*([^,]+)\s*},\s*'([^']+)'\);/g,
        replacement: "log.$1('$2', { data: $3 }, '$4');"
      }
    ];

    fixes.forEach(fix => {
      content = content.replace(fix.pattern, fix.replacement);
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Error fixing file ${filePath}:`, err.message);
    return false;
  }
}

// Run the fix
fixAllLogSyntax();