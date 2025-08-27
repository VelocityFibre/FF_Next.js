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

    // Fix 1: Missing closing braces in object literals - be more specific
    content = content.replace(
      /(\{\s*[^}]*),\s*}\s*$/gm,
      (match, inside) => {
        // Only fix if this looks like an incomplete object
        if (inside.includes(':') && !inside.includes('function') && !inside.includes('=>')) {
          return `${inside} }`;
        }
        return match;
      }
    );

    // Fix 2: Import statement fixes - missing closing braces
    content = content.replace(
      /import\s*\{\s*([^}]*)\s*}\s*$/gm,
      (match, imports) => {
        if (!imports.includes('}')) {
          return `import { ${imports.trim()} }`;
        }
        return match;
      }
    );

    // Fix 3: Object destructuring fixes - missing closing braces
    content = content.replace(
      /const\s*\{\s*([^}]*)\s*}\s*=\s*/g,
      (match, destructure) => {
        if (!match.includes('} =')) {
          return `const { ${destructure.trim()} } = `;
        }
        return match;
      }
    );

    // Fix 4: Function parameter object fixes
    content = content.replace(
      /\(\{\s*([^}]*)\s*}\s*\)/g,
      (match, params) => {
        if (!params.includes('}')) {
          return `({ ${params.trim()} })`;
        }
        return match;
      }
    );

    // Fix 5: React component props spread fixes
    content = content.replace(
      /\.\.\.[a-zA-Z_$][a-zA-Z0-9_$]*\s*}\s*$/gm,
      (match) => {
        if (!match.includes(' }')) {
          return match.replace(/\s*}\s*$/, ' }');
        }
        return match;
      }
    );

    // Fix 6: Return statement object fixes
    content = content.replace(
      /return\s*\{\s*([^}]*),\s*$/gm,
      (match, returnContent) => {
        return `return { ${returnContent.trim()} }`;
      }
    );

    // Fix 7: Function call argument fixes - objects with missing closing braces
    content = content.replace(
      /\(\s*\{\s*([^}]*),\s*$/gm,
      (match, args) => {
        return `({ ${args.trim()} })`;
      }
    );

    // Fix 8: Type assertion fixes
    content = content.replace(
      /as\s+[a-zA-Z_$][a-zA-Z0-9_$<>]*\s*}\s*$/gm,
      (match) => {
        if (match.includes(' as ')) {
          return match.replace(/\s*}\s*$/, '');
        }
        return match;
      }
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