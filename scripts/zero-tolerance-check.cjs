#!/usr/bin/env node

/**
 * Zero Tolerance Quality Check Script - FF2 Enhanced
 * Validates production code quality while excluding test files
 * 
 * Usage: node scripts/zero-tolerance-check.js [--fix]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const PRODUCTION_PATTERNS = [
  'src/**/*.ts',
  'src/**/*.tsx',
  '!src/**/*.test.*',
  '!src/**/*.spec.*', 
  '!src/**/__tests__/**/*',
  '!src/**/__mocks__/**/*',
  '!src/**/*.stories.*',
  '!src/**/test-utils.*'
];

const CONSOLE_PATTERNS = [
  'console.log',
  'console.warn', 
  'console.error',
  'console.info',
  'console.debug'
];

class ZeroToleranceValidator {
  constructor(options = {}) {
    this.fix = options.fix || false;
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const colors = {
      error: '\x1b[31m',
      warning: '\x1b[33m', 
      success: '\x1b[32m',
      info: '\x1b[36m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  // 1. TypeScript Compilation Check
  async checkTypeScriptErrors() {
    this.log('🔍 Checking TypeScript compilation...', 'info');
    
    try {
      execSync('npx tsc --noEmit', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      this.log('✅ TypeScript compilation: PASSED', 'success');
      return true;
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || '';
      const errorLines = errorOutput.split('\n').filter(line => line.includes('error TS'));
      
      // Filter out test file errors
      const productionErrors = errorLines.filter(line => {
        return !line.includes('.test.') && 
               !line.includes('.spec.') &&
               !line.includes('__tests__') &&
               !line.includes('__mocks__') &&
               !line.includes('.stories.');
      });

      if (productionErrors.length > 0) {
        this.log(`❌ TypeScript compilation: ${productionErrors.length} PRODUCTION ERRORS`, 'error');
        productionErrors.slice(0, 10).forEach(error => {
          this.log(`  ${error}`, 'error');
        });
        if (productionErrors.length > 10) {
          this.log(`  ... and ${productionErrors.length - 10} more errors`, 'error');
        }
        this.errors.push(`TypeScript: ${productionErrors.length} production compilation errors`);
        return false;
      } else {
        this.log('✅ TypeScript compilation: PASSED (test errors ignored)', 'success');
        return true;
      }
    }
  }

  // 2. Console.log Detection (Production Only)
  async checkConsoleStatements() {
    this.log('🔍 Checking for console statements in production code...', 'info');
    
    const productionFiles = glob.sync(PRODUCTION_PATTERNS.join(' '), { ignore: PRODUCTION_PATTERNS.filter(p => p.startsWith('!')) });
    let totalConsoleStatements = 0;
    const violatingFiles = [];

    for (const file of productionFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        let fileConsoleCount = 0;
        
        for (const pattern of CONSOLE_PATTERNS) {
          const matches = content.match(new RegExp(pattern, 'g'));
          if (matches) {
            fileConsoleCount += matches.length;
          }
        }
        
        if (fileConsoleCount > 0) {
          totalConsoleStatements += fileConsoleCount;
          violatingFiles.push({ file, count: fileConsoleCount });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    if (totalConsoleStatements > 0) {
      this.log(`❌ Console statements: ${totalConsoleStatements} found in ${violatingFiles.length} files`, 'error');
      violatingFiles.slice(0, 10).forEach(({ file, count }) => {
        this.log(`  ${file}: ${count} statements`, 'error');
      });
      this.errors.push(`Console statements: ${totalConsoleStatements} in production code`);
      
      if (this.fix) {
        this.log('🔧 Auto-fixing console statements...', 'info');
        await this.fixConsoleStatements(violatingFiles);
      }
      return false;
    } else {
      this.log('✅ Console statements: NONE in production code', 'success');
      return true;
    }
  }

  // 3. ESLint Check (Production Only)
  async checkESLintErrors() {
    this.log('🔍 Running ESLint on production code...', 'info');
    
    try {
      // Create temporary ESLint config that excludes test files
      const eslintConfig = {
        ignorePatterns: [
          '**/*.test.*',
          '**/*.spec.*', 
          '**/__tests__/**/*',
          '**/__mocks__/**/*',
          '**/*.stories.*',
          '**/test-utils.*'
        ]
      };
      
      fs.writeFileSync('.eslintrc.temp.json', JSON.stringify(eslintConfig, null, 2));
      
      execSync('npx eslint src --config .eslintrc.temp.json --max-warnings 0', {
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      this.log('✅ ESLint: PASSED (production code only)', 'success');
      return true;
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || '';
      const errorLines = errorOutput.split('\n').filter(line => line.trim());
      
      this.log(`❌ ESLint: FAILED with production code violations`, 'error');
      errorLines.slice(0, 10).forEach(line => {
        this.log(`  ${line}`, 'error');
      });
      this.errors.push('ESLint: Production code violations found');
      return false;
    } finally {
      // Clean up temp config
      if (fs.existsSync('.eslintrc.temp.json')) {
        fs.unlinkSync('.eslintrc.temp.json');
      }
    }
  }

  // 4. Catch Block Validation
  async checkCatchBlocks() {
    this.log('🔍 Checking catch block patterns in production code...', 'info');
    
    const productionFiles = glob.sync(PRODUCTION_PATTERNS.join(' '), { ignore: PRODUCTION_PATTERNS.filter(p => p.startsWith('!')) });
    const violations = [];

    for (const file of productionFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for undefined error references in catch blocks
        const catchBlockPattern = /catch\s*\(\s*(\w+)\s*\)\s*{[^}]*}/g;
        let match;
        
        while ((match = catchBlockPattern.exec(content)) !== null) {
          const catchBlock = match[0];
          const errorParam = match[1];
          
          // Check if error parameter is used
          if (errorParam && errorParam !== '_' && !catchBlock.includes(errorParam)) {
            violations.push(`${file}: Unused error parameter '${errorParam}' in catch block`);
          }
          
          // Check for void error anti-patterns
          if (catchBlock.includes('void _error') || catchBlock.includes('void error')) {
            violations.push(`${file}: Void error anti-pattern detected`);
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    if (violations.length > 0) {
      this.log(`❌ Catch blocks: ${violations.length} violations`, 'error');
      violations.slice(0, 5).forEach(violation => {
        this.log(`  ${violation}`, 'error');
      });
      this.errors.push(`Catch blocks: ${violations.length} violations`);
      return false;
    } else {
      this.log('✅ Catch blocks: All properly handled', 'success');
      return true;
    }
  }

  // Auto-fix console statements
  async fixConsoleStatements(violatingFiles) {
    for (const { file } of violatingFiles) {
      try {
        let content = fs.readFileSync(file, 'utf8');
        
        // Replace console statements with proper logging
        for (const pattern of CONSOLE_PATTERNS) {
          content = content.replace(
            new RegExp(`${pattern}\\([^)]*\\);?`, 'g'),
            '// TODO: Replace with proper logging'
          );
        }
        
        fs.writeFileSync(file, content);
        this.log(`🔧 Fixed console statements in ${file}`, 'success');
      } catch (error) {
        this.log(`⚠️ Could not fix ${file}: ${error.message}`, 'warning');
      }
    }
  }

  // Main validation runner
  async run() {
    this.log('🚀 Starting Zero Tolerance Quality Check (Production Code Only)...', 'info');
    this.log('📋 Excluding: Test files, spec files, stories, mocks', 'info');
    
    const checks = [
      this.checkTypeScriptErrors(),
      this.checkConsoleStatements(), 
      this.checkESLintErrors(),
      this.checkCatchBlocks()
    ];

    const results = await Promise.all(checks);
    const passed = results.every(result => result === true);

    this.log('\n📊 VALIDATION SUMMARY', 'info');
    this.log('=' .repeat(50), 'info');
    
    if (passed) {
      this.log('🎉 ALL CHECKS PASSED - PRODUCTION READY!', 'success');
      this.log('✅ TypeScript compilation clean', 'success');
      this.log('✅ No console statements in production', 'success'); 
      this.log('✅ ESLint violations resolved', 'success');
      this.log('✅ Catch blocks properly handled', 'success');
    } else {
      this.log('❌ VALIDATION FAILED - FIX REQUIRED', 'error');
      this.errors.forEach(error => {
        this.log(`  • ${error}`, 'error');
      });
    }

    this.log('=' .repeat(50), 'info');
    
    return passed ? 0 : 1;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const fix = args.includes('--fix');
  
  const validator = new ZeroToleranceValidator({ fix });
  validator.run().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = ZeroToleranceValidator;