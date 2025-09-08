#!/usr/bin/env tsx
// Simple Migration Runner - Uses raw SQL files for database migrations

import { sql } from '../../lib/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Migration {
  version: string;
  name: string;
  applied_at: Date;
}

async function ensureMigrationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      version VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW(),
      execution_time_ms INTEGER,
      success BOOLEAN DEFAULT true,
      error_message TEXT
    )
  `;
}

async function getAppliedMigrations(): Promise<string[]> {
  const migrations = await sql`
    SELECT version FROM migrations 
    WHERE success = true
    ORDER BY version
  `;
  return migrations.map(m => m.version);
}

async function runMigration(filePath: string, fileName: string) {
  // Parse filename: 001_initial_schema.sql -> version: 001, name: initial_schema
  const match = fileName.match(/^(\d{3})_(.+)\.sql$/);
  if (!match) {
    throw new Error(`Invalid migration filename: ${fileName}`);
  }
  
  const [, version, name] = match;
  const migrationContent = fs.readFileSync(filePath, 'utf-8');
  const startTime = Date.now();
  
  console.log(`Running migration ${version}: ${name}`);
  
  try {
    // Begin transaction
    await sql`BEGIN`;
    
    // Execute migration statements
    const statements = migrationContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement) {
        await sql.unsafe(statement);
      }
    }
    
    // Record migration
    await sql`
      INSERT INTO migrations (version, name, execution_time_ms, success) 
      VALUES (${version}, ${name.replace(/_/g, ' ')}, ${Date.now() - startTime}, true)
    `;
    
    // Commit transaction
    await sql`COMMIT`;
    
    console.log(`✓ Migration ${version} completed in ${Date.now() - startTime}ms`);
  } catch (error) {
    // Rollback on error
    try {
      await sql`ROLLBACK`;
    } catch (rollbackError) {
      console.error('⚠️ Rollback failed:', rollbackError);
    }
    
    console.error(`✗ Migration ${fileName} failed:`, error);
    throw error;
  }
}

async function runPendingMigrations() {
  console.log('Starting database migrations...\n');
  
  // Ensure migrations table exists
  await ensureMigrationsTable();
  
  // Get applied migrations
  const appliedMigrations = await getAppliedMigrations();
  console.log(`Found ${appliedMigrations.length} applied migrations`);
  
  // Get all migration files
  const migrationsDir = path.join(__dirname, 'sql');
  
  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log('Created migrations/sql directory');
  }
  
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // Ensure migrations run in order
  
  // Find pending migrations - check by version number
  const pendingMigrations = migrationFiles.filter(f => {
    const match = f.match(/^(\d{3})_/);
    if (!match) return false;
    const version = match[1];
    return !appliedMigrations.includes(version);
  });
  
  if (pendingMigrations.length === 0) {
    console.log('No pending migrations');
    return;
  }
  
  console.log(`\nFound ${pendingMigrations.length} pending migrations:`);
  pendingMigrations.forEach(m => console.log(`  - ${m}`));
  console.log('');
  
  // Run pending migrations
  for (const migration of pendingMigrations) {
    const migrationPath = path.join(migrationsDir, migration);
    await runMigration(migrationPath, migration);
  }
  
  console.log('\n✓ All migrations completed successfully');
}

// Handle rollback if needed
async function rollbackMigration(migrationId: string) {
  console.log(`Rolling back migration: ${migrationId}`);
  
  // Check if rollback file exists
  const rollbackPath = path.join(__dirname, 'sql', 'rollbacks', `${migrationId}.down.sql`);
  
  if (!fs.existsSync(rollbackPath)) {
    throw new Error(`No rollback file found for migration ${migrationId}`);
  }
  
  const rollbackContent = fs.readFileSync(rollbackPath, 'utf-8');
  
  try {
    // Execute rollback
    await sql(rollbackContent);
    
    // Remove migration record
    await sql`
      DELETE FROM migrations WHERE id = ${migrationId}
    `;
    
    console.log(`✓ Rollback ${migrationId} completed`);
  } catch (error) {
    console.error(`✗ Rollback ${migrationId} failed:`, error);
    throw error;
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  try {
    if (command === 'rollback') {
      const migrationId = process.argv[3];
      if (!migrationId) {
        console.error('Please specify migration ID to rollback');
        process.exit(1);
      }
      await rollbackMigration(migrationId);
    } else {
      await runPendingMigrations();
    }
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();