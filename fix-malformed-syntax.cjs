const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', { 
  ignore: ['node_modules/**', 'dist/**', 'build/**'] 
});

console.log(`Found ${files.length} TypeScript files to check`);

let fixedFiles = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    let hasChanges = false;

    // Fix 1: Malformed log statements with missing closing braces
    // Pattern: log.xyz('message:', { data: something }, 'component') }
    content = content.replace(
      /log\.(info|error|warn|debug)\([^)]*\)\s*}/g, 
      (match) => {
        const withoutTrailingBrace = match.slice(0, -1).trim();
        if (withoutTrailingBrace.endsWith(')')) {
          return withoutTrailingBrace + ';';
        }
        return match;
      }
    );

    // Fix 2: Malformed object literals in log parameters
    // Pattern: { data: error   } -> { data: error }
    content = content.replace(
      /\{\s*data:\s*([^}]*?)\s{2,}\}/g,
      '{ data: $1 }'
    );

    // Fix 3: Malformed function calls with extra braces
    // Pattern: someFunction(param) } -> someFunction(param);
    content = content.replace(
      /(\w+\([^)]*\))\s*}/g,
      (match, functionCall) => {
        // Only replace if it looks like a statement, not inside an object
        const lines = content.split('\n');
        const matchIndex = content.indexOf(match);
        const beforeMatch = content.substring(0, matchIndex);
        const lineStart = beforeMatch.lastIndexOf('\n');
        const currentLine = content.substring(lineStart + 1, matchIndex + match.length);
        
        // If the line starts with whitespace and the function call, it's likely a statement
        if (/^\s*\w+\([^)]*\)\s*}$/.test(currentLine.trim())) {
          return functionCall + ';';
        }
        return match;
      }
    );

    // Fix 4: Missing closing braces in objects
    // Pattern: { key: value, -> { key: value, }
    content = content.replace(
      /\{\s*([^}]*),\s*$/gm,
      '{ $1 }'
    );

    // Fix 5: Fix malformed try-catch blocks
    // Pattern: } catch (err) { -> } } catch (err) {
    content = content.replace(
      /}\s*catch\s*\(/g,
      '} catch ('
    );

    // Fix 6: Fix missing semicolons after statements
    content = content.replace(
      /^(\s*)(await\s+\w+[^;{}]*)\s*}\s*$/gm,
      '$1$2;'
    );

    // Fix 7: Fix malformed object property assignments
    // Pattern: property: value, } -> property: value }
    content = content.replace(
      /:\s*([^,}]+),\s*}/g,
      ': $1 }'
    );

    // Fix 8: Fix commented log statements that are malformed
    content = content.replace(
      /\/\/\s*log\.[^)]*\)\s*}/g,
      (match) => match.slice(0, -1).trim()
    );

    // Fix 9: Fix object literals with trailing commas and missing closing braces
    content = content.replace(
      /\{\s*([^}]+),\s*$/gm,
      (match, inside) => {
        // Count open and close braces to see if we need a closing brace
        const openBraces = (inside.match(/\{/g) || []).length;
        const closeBraces = (inside.match(/\}/g) || []).length;
        if (openBraces > closeBraces) {
          return `{ ${inside.trim()} }`;
        }
        return match;
      }
    );

    // Fix 10: Fix function calls with missing closing parentheses
    content = content.replace(
      /(\w+\([^)]*),\s*}\s*$/gm,
      '$1);'
    );

    // Check if content changed
    if (content !== originalContent) {
      hasChanges = true;
    }

    if (hasChanges) {
      fs.writeFileSync(file, content);
      fixedFiles++;
      console.log(`Fixed: ${file}`);
    }

  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`\nCompleted! Fixed ${fixedFiles} files.`);