#!/usr/bin/env node

/**
 * Console Syntax Error Fixer
 * Fixes syntax errors introduced during console.log replacement
 */

const fs = require('fs');
const path = require('path');

class ConsoleSyntaxFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.errors = [];
  }

  /**
   * Find all source files
   */
  findSourceFiles(dir = 'src') {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          files.push(...this.findSourceFiles(fullPath));
        }
      } else if (entry.isFile()) {
        if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  /**
   * Fix syntax issues in a file
   */
  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let fixes = 0;
      const originalContent = content;

      // Fix 1: Incomplete log function calls - missing closing parameters
      content = content.replace(
        /log\.(info|error|warn|debug)\([^)]*\}, '[^']*'\)/g, 
        (match) => {
          // Count opening and closing braces
          const openBraces = (match.match(/\{/g) || []).length;
          const closeBraces = (match.match(/\}/g) || []).length;
          
          if (openBraces > closeBraces) {
            fixes++;
            return match + '}';
          }
          return match;
        }
      );

      // Fix 2: Broken log calls with syntax errors
      const patterns = [
        // Fix missing closing braces in data objects
        {
          regex: /log\.(info|error|warn|debug)\([^,]+,\s*\{\s*data:\s*\{[^}]*\}\s*\},\s*'[^']*'\)[^;}]*$/gm,
          replacement: (match) => {
            if (!match.endsWith(';')) return match + ';';
            return match;
          }
        },
        // Fix incomplete parameter lists
        {
          regex: /log\.(info|error|warn|debug)\([^,]+,\s*\{[^}]*\}\s*\},\s*'[^']*'\)/g,
          replacement: (match) => {
            // Ensure proper semicolon termination
            return match + ';';
          }
        },
        // Fix malformed data objects
        {
          regex: /log\.(info|error|warn|debug)\([^,]+,\s*\{\s*([^}]+)\s*\}\s*\},\s*'[^']*'\)/g,
          replacement: (match, level, data) => {
            // Fix missing 'data:' prefix
            if (!data.includes('data:')) {
              return match.replace(`{ ${data} }`, `{ data: ${data} }`);
            }
            return match;
          }
        }
      ];

      patterns.forEach(pattern => {
        const newContent = content.replace(pattern.regex, pattern.replacement);
        if (newContent !== content) {
          fixes++;
          content = newContent;
        }
      });

      // Fix 3: Specific common errors
      const specificFixes = [
        // Fix incomplete string concatenations
        {
          from: /log\.(info|error|warn|debug)\([^,]+,\s*\{\s*data:\s*[^}]*\}\s*,\s*'[^']*'\)\s*\.trim\(\)/g,
          to: (match) => match.replace('.trim()', '') + ';'
        },
        // Fix broken closing braces
        {
          from: /log\.(info|error|warn|debug)\([^,]+,\s*\{\s*data:\s*[^}]*\}\s*\}\s*,\s*'[^']*'\)/g,
          to: (match) => match.replace('} }', '}') + ';'
        },
        // Fix missing semicolons
        {
          from: /log\.(info|error|warn|debug)\([^)]+\)(?![;,])/g,
          to: (match) => match + ';'
        }
      ];

      specificFixes.forEach(fix => {
        const newContent = content.replace(fix.from, fix.to);
        if (newContent !== content) {
          fixes++;
          content = newContent;
        }
      });

      // Only write if fixes were made
      if (fixes > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed ${fixes} syntax errors in ${filePath}`);
        this.fixedFiles++;
        this.totalFixes += fixes;
      }

    } catch (error) {
      this.errors.push(`❌ Error processing ${filePath}: ${error.message}`);
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Run the fixing process
   */
  async run() {
    console.log('🔧 Starting Console Syntax Error Fixing...');
    
    const sourceFiles = this.findSourceFiles();
    console.log(`📊 Found ${sourceFiles.length} files to check\n`);

    // Process each file
    for (const filePath of sourceFiles) {
      this.fixFile(filePath);
    }

    // Generate summary
    this.generateSummary();
  }

  /**
   * Generate summary
   */
  generateSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 SYNTAX ERROR FIXING SUMMARY');
    console.log('='.repeat(60));
    console.log(`📁 Files with fixes: ${this.fixedFiles}`);
    console.log(`🔧 Total fixes applied: ${this.totalFixes}`);
    
    if (this.errors.length > 0) {
      console.log(`❌ Errors encountered: ${this.errors.length}`);
      this.errors.forEach(error => console.log(`   ${error}`));
    } else {
      console.log('✅ No errors encountered');
    }
    
    console.log('='.repeat(60));
  }
}

// Run the fixing process
if (require.main === module) {
  const fixer = new ConsoleSyntaxFixer();
  fixer.run().catch(error => {
    console.error('💥 Fatal error during fixing:', error);
    process.exit(1);
  });
}

module.exports = ConsoleSyntaxFixer;