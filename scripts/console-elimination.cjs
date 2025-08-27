#!/usr/bin/env node

/**
 * Console.log Elimination Script
 * Zero Tolerance Enforcement - Remove ALL console.* statements
 * Replace with proper logging using @/lib/logger
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ConsoleEliminator {
  constructor() {
    this.totalFiles = 0;
    this.processedFiles = 0;
    this.totalReplacements = 0;
    this.errors = [];
    this.skippedFiles = [];
    
    // Patterns for different console methods
    this.patterns = [
      // console.log patterns
      {
        regex: /console\.log\s*\(\s*([^)]*)\s*\);?/g,
        replacement: (match, content) => {
          return this.generateLogReplacement('info', content);
        },
        type: 'log'
      },
      // console.error patterns
      {
        regex: /console\.error\s*\(\s*([^)]*)\s*\);?/g,
        replacement: (match, content) => {
          return this.generateLogReplacement('error', content);
        },
        type: 'error'
      },
      // console.warn patterns
      {
        regex: /console\.warn\s*\(\s*([^)]*)\s*\);?/g,
        replacement: (match, content) => {
          return this.generateLogReplacement('warn', content);
        },
        type: 'warn'
      },
      // console.debug patterns
      {
        regex: /console\.debug\s*\(\s*([^)]*)\s*\);?/g,
        replacement: (match, content) => {
          return this.generateLogReplacement('debug', content);
        },
        type: 'debug'
      },
      // console.info patterns
      {
        regex: /console\.info\s*\(\s*([^)]*)\s*\);?/g,
        replacement: (match, content) => {
          return this.generateLogReplacement('info', content);
        },
        type: 'info'
      },
      // console.trace, console.table, etc. - remove entirely
      {
        regex: /console\.(trace|table|group|groupEnd|time|timeEnd|count|clear|assert|dir|dirxml)\s*\([^)]*\);?/g,
        replacement: () => '// Console statement removed for zero tolerance compliance',
        type: 'other'
      }
    ];
  }

  /**
   * Generate proper log replacement
   */
  generateLogReplacement(level, content) {
    // Parse content to extract message and data
    const trimmedContent = content.trim();
    
    // Handle common patterns
    if (trimmedContent.includes(',')) {
      const parts = this.parseConsoleArguments(trimmedContent);
      if (parts.length >= 2) {
        const message = parts[0];
        const data = parts.slice(1).join(', ');
        return `log.${level}(${message}, { data: ${data} }, '${this.getComponentName()}')`;
      }
    }
    
    // Simple message only
    return `log.${level}(${trimmedContent}, undefined, '${this.getComponentName()}')`;
  }

  /**
   * Parse console arguments more intelligently
   */
  parseConsoleArguments(content) {
    const parts = [];
    let currentPart = '';
    let parenDepth = 0;
    let braceDepth = 0;
    let bracketDepth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';

      if (!inString) {
        if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
          inString = true;
          stringChar = char;
        } else if (char === '(') {
          parenDepth++;
        } else if (char === ')') {
          parenDepth--;
        } else if (char === '{') {
          braceDepth++;
        } else if (char === '}') {
          braceDepth--;
        } else if (char === '[') {
          bracketDepth++;
        } else if (char === ']') {
          bracketDepth--;
        } else if (char === ',' && parenDepth === 0 && braceDepth === 0 && bracketDepth === 0) {
          parts.push(currentPart.trim());
          currentPart = '';
          continue;
        }
      } else {
        if (char === stringChar && prevChar !== '\\') {
          inString = false;
          stringChar = '';
        }
      }

      currentPart += char;
    }

    if (currentPart.trim()) {
      parts.push(currentPart.trim());
    }

    return parts;
  }

  /**
   * Get component name from current file path
   */
  getComponentName() {
    // This will be set during file processing
    return this.currentComponentName || 'Unknown';
  }

  /**
   * Find all TypeScript and JavaScript files
   */
  findSourceFiles(dir = 'src') {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
          files.push(...this.findSourceFiles(fullPath));
        }
      } else if (entry.isFile()) {
        // Include TypeScript and JavaScript files
        if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let modifiedContent = content;
      let fileReplacements = 0;
      
      // Set current component name for logging context
      this.currentComponentName = this.extractComponentName(filePath);
      
      // Track if we need to add logger import
      let needsLoggerImport = false;
      
      // Apply all patterns
      for (const pattern of this.patterns) {
        const matches = modifiedContent.match(pattern.regex);
        if (matches) {
          needsLoggerImport = true;
          fileReplacements += matches.length;
          modifiedContent = modifiedContent.replace(pattern.regex, pattern.replacement);
        }
      }

      // Add logger import if needed and not already present
      if (needsLoggerImport && !modifiedContent.includes("from '@/lib/logger'")) {
        modifiedContent = this.addLoggerImport(modifiedContent);
      }

      // Only write if changes were made
      if (fileReplacements > 0) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        console.log(`✅ ${filePath}: ${fileReplacements} console statements replaced`);
        this.totalReplacements += fileReplacements;
      }

      this.processedFiles++;
    } catch (error) {
      this.errors.push(`❌ Error processing ${filePath}: ${error.message}`);
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Extract component name from file path
   */
  extractComponentName(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Convert from various naming conventions to component name
    if (fileName.includes('.')) {
      return fileName.split('.')[0];
    }
    
    return fileName;
  }

  /**
   * Add logger import to file content
   */
  addLoggerImport(content) {
    // Find existing imports
    const importRegex = /^import\s+.*?from\s+['"][^'"]*['"];?$/gm;
    const imports = content.match(importRegex) || [];
    
    if (imports.length > 0) {
      // Add after last import
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.indexOf(lastImport) + lastImport.length;
      
      const loggerImport = "\nimport { log } from '@/lib/logger';";
      return content.slice(0, lastImportIndex) + loggerImport + content.slice(lastImportIndex);
    } else {
      // Add at the beginning of the file
      return "import { log } from '@/lib/logger';\n\n" + content;
    }
  }

  /**
   * Run the elimination process
   */
  async run() {
    console.log('🚀 Starting Console.log Elimination Process...');
    console.log('📋 Zero Tolerance Enforcement: ALL console.* statements will be removed');
    
    const sourceFiles = this.findSourceFiles();
    this.totalFiles = sourceFiles.length;
    
    console.log(`📊 Found ${this.totalFiles} files to process\n`);

    // Process each file
    for (const filePath of sourceFiles) {
      this.processFile(filePath);
    }

    // Generate summary
    this.generateSummary();
    
    // Run validation
    await this.runValidation();
  }

  /**
   * Generate processing summary
   */
  generateSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 CONSOLE ELIMINATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`📁 Total files processed: ${this.processedFiles}/${this.totalFiles}`);
    console.log(`🔧 Total console statements replaced: ${this.totalReplacements}`);
    
    if (this.errors.length > 0) {
      console.log(`❌ Errors encountered: ${this.errors.length}`);
      this.errors.forEach(error => console.log(`   ${error}`));
    } else {
      console.log('✅ No errors encountered');
    }
    
    if (this.skippedFiles.length > 0) {
      console.log(`⚠️ Skipped files: ${this.skippedFiles.length}`);
      this.skippedFiles.forEach(file => console.log(`   ${file}`));
    }
    
    console.log('='.repeat(60));
  }

  /**
   * Run validation to confirm zero console statements
   */
  async runValidation() {
    console.log('\n🔍 Running validation check...');
    
    try {
      // Run the zero tolerance check
      execSync('node scripts/zero-tolerance-check.js', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      console.log('✅ Validation passed: Zero console statements detected');
    } catch (error) {
      console.log('❌ Validation failed - console statements still present');
      console.log(error.stdout || error.message);
      
      // Show remaining violations
      this.showRemainingViolations();
    }
  }

  /**
   * Show any remaining console violations
   */
  showRemainingViolations() {
    try {
      const result = execSync('grep -r "console\\." src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | head -20', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('\n❌ Remaining console statements found:');
      console.log(result);
    } catch (error) {
      // No violations found or grep command failed
      console.log('✅ No remaining console statements detected');
    }
  }
}

// Run the elimination process
if (require.main === module) {
  const eliminator = new ConsoleEliminator();
  eliminator.run().catch(error => {
    console.error('💥 Fatal error during elimination:', error);
    process.exit(1);
  });
}

module.exports = ConsoleEliminator;