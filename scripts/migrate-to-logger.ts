#!/usr/bin/env node
/**
 * Script to migrate console.log statements to structured logging
 * Automatically updates files to use the appropriate logger
 */

import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import { createScriptRunner } from '../lib/script-logger';

const runner = createScriptRunner('migrate-to-logger');

// Define logger mappings for different file types
const LOGGER_MAPPINGS = {
  'api': {
    import: "import { apiLogger } from '@/lib/logger';",
    logger: 'apiLogger'
  },
  'script': {
    import: "import { scriptLogger } from '../lib/logger';",
    logger: 'scriptLogger'
  },
  'db': {
    import: "import { dbLogger } from '@/lib/logger';",
    logger: 'dbLogger'
  },
  'sow': {
    import: "import { sowLogger } from '@/lib/logger';",
    logger: 'sowLogger'
  },
  'analytics': {
    import: "import { analyticsLogger } from '@/lib/logger';",
    logger: 'analyticsLogger'
  },
  'default': {
    import: "import { logger } from '@/lib/logger';",
    logger: 'logger'
  }
};

// Determine the appropriate logger based on file path
function getLoggerForFile(filePath: string) {
  if (filePath.includes('pages/api') || filePath.includes('app/api')) return LOGGER_MAPPINGS.api;
  if (filePath.includes('scripts/')) return LOGGER_MAPPINGS.script;
  if (filePath.includes('db') || filePath.includes('database')) return LOGGER_MAPPINGS.db;
  if (filePath.includes('sow') || filePath.includes('SOW')) return LOGGER_MAPPINGS.sow;
  if (filePath.includes('analytics')) return LOGGER_MAPPINGS.analytics;
  return LOGGER_MAPPINGS.default;
}

// Replace console statements in a file
async function migrateFile(filePath: string): Promise<boolean> {
  try {
    let content = await readFile(filePath, 'utf-8');
    const originalContent = content;
    
    // Skip if already using logger
    if (content.includes('from \'@/lib/logger\'') || 
        content.includes('from \'../lib/logger\'') ||
        content.includes('from \'../../lib/logger\'')) {
      return false;
    }
    
    // Count console statements
    const consoleMatches = content.match(/console\.(log|error|warn|info|debug)/g);
    if (!consoleMatches || consoleMatches.length === 0) {
      return false;
    }
    
    const loggerConfig = getLoggerForFile(filePath);
    const logger = loggerConfig.logger;
    
    // Add import at the top of the file
    const importRegex = /^(import .+|const .+ = require.+)/m;
    const hasImports = importRegex.test(content);
    
    if (hasImports) {
      // Add after existing imports
      content = content.replace(importRegex, (match) => {
        return `${match}\n${loggerConfig.import}`;
      });
    } else {
      // Add at the beginning of the file
      content = `${loggerConfig.import}\n\n${content}`;
    }
    
    // Replace console.log statements
    content = content.replace(
      /console\.log\(([^)]+)\)/g,
      (match, args) => {
        // Check if it's a simple string or complex expression
        if (args.includes(',')) {
          // Multiple arguments - convert to structured logging
          const parts = args.split(',').map(p => p.trim());
          const message = parts[0].replace(/['"]/g, '');
          const data = parts.slice(1).join(', ');
          return `${logger}.info({ data: ${data} }, ${parts[0]})`;
        } else if (args.startsWith('\'') || args.startsWith('"') || args.startsWith('`')) {
          // Simple string message
          return `${logger}.info(${args})`;
        } else {
          // Variable or expression
          return `${logger}.info({ value: ${args} }, 'Log output')`;
        }
      }
    );
    
    // Replace console.error statements
    content = content.replace(
      /console\.error\(([^)]+)\)/g,
      (match, args) => {
        if (args.includes(',')) {
          const parts = args.split(',').map(p => p.trim());
          const message = parts[0].replace(/['"]/g, '');
          const error = parts.slice(1).join(', ');
          return `${logger}.error({ error: ${error} }, ${parts[0]})`;
        } else {
          return `${logger}.error(${args})`;
        }
      }
    );
    
    // Replace console.warn statements
    content = content.replace(
      /console\.warn\(([^)]+)\)/g,
      (match, args) => {
        if (args.includes(',')) {
          const parts = args.split(',').map(p => p.trim());
          return `${logger}.warn({ data: ${parts.slice(1).join(', ')} }, ${parts[0]})`;
        } else {
          return `${logger}.warn(${args})`;
        }
      }
    );
    
    // Replace console.info statements
    content = content.replace(
      /console\.info\(([^)]+)\)/g,
      (match, args) => {
        if (args.includes(',')) {
          const parts = args.split(',').map(p => p.trim());
          return `${logger}.info({ data: ${parts.slice(1).join(', ')} }, ${parts[0]})`;
        } else {
          return `${logger}.info(${args})`;
        }
      }
    );
    
    // Replace console.debug statements
    content = content.replace(
      /console\.debug\(([^)]+)\)/g,
      (match, args) => {
        if (args.includes(',')) {
          const parts = args.split(',').map(p => p.trim());
          return `${logger}.debug({ data: ${parts.slice(1).join(', ')} }, ${parts[0]})`;
        } else {
          return `${logger}.debug(${args})`;
        }
      }
    );
    
    // Write the file back if changed
    if (content !== originalContent) {
      await writeFile(filePath, content, 'utf-8');
      return true;
    }
    
    return false;
  } catch (error) {
    runner.error(`Failed to migrate file ${filePath}`, error);
    return false;
  }
}

runner.run(async () => {
  runner.log('Starting console.log migration to structured logging');
  
  // Get all JavaScript/TypeScript files
  const patterns = [
    'pages/api/**/*.{js,ts}',
    'scripts/**/*.{js,ts,mjs}',
    'src/services/**/*.{js,ts,tsx}',
    'src/modules/**/*.{js,ts,tsx}',
    'lib/**/*.{js,ts}',
    'api/**/*.{js,ts}'
  ];
  
  let totalFiles = 0;
  let migratedFiles = 0;
  
  for (const pattern of patterns) {
    runner.log(`Scanning pattern: ${pattern}`);
    const files = await glob(pattern, { 
      ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**']
    });
    
    const progress = runner.startProgress(files.length, `Processing ${pattern}`);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      totalFiles++;
      
      const migrated = await migrateFile(file);
      if (migrated) {
        migratedFiles++;
        runner.log(`✅ Migrated: ${file}`);
      }
      
      progress.update(i + 1, file);
    }
    
    progress.complete();
  }
  
  runner.success(`Migration complete! Migrated ${migratedFiles} out of ${totalFiles} files`);
  
  // Show next steps
  runner.log('\n📋 Next Steps:');
  runner.log('1. Review the changes with: git diff');
  runner.log('2. Run tests to ensure everything works: npm test');
  runner.log('3. Run linter to fix any issues: npm run lint:fix');
  runner.log('4. Commit the changes: git commit -m "chore: migrate to structured logging"');
});