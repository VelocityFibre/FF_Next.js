#!/usr/bin/env node

/**
 * Debug SQL Parsing - Check what statements are being parsed from the migration file
 */

const fs = require('fs').promises;
const path = require('path');

async function debugSqlParsing() {
  console.log('🔍 Debugging SQL Statement Parsing...\n');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'create-onemap-tracking-tables.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');

    console.log('📄 Raw SQL file content (first 500 chars):');
    console.log(migrationSQL.substring(0, 500));
    console.log('\n...\n');

    // Split the SQL into individual statements (same logic as migration script)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} statements after filtering:\n`);

    statements.forEach((stmt, index) => {
      console.log(`Statement ${index + 1}:`);
      console.log(`  "${stmt.substring(0, 100)}${stmt.length > 100 ? '...' : ''}"`);
      console.log(`  Starts with: "${stmt.substring(0, 20)}"`);
      console.log(`  Length: ${stmt.length}`);
      console.log('');
    });

    // Check for CREATE TABLE statements specifically
    const createTableStatements = statements.filter(stmt =>
      stmt.toUpperCase().includes('CREATE TABLE')
    );

    console.log(`📊 Found ${createTableStatements.length} CREATE TABLE statements:`);
    createTableStatements.forEach((stmt, index) => {
      console.log(`  ${index + 1}: ${stmt.substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  debugSqlParsing().catch(console.error);
}

module.exports = { debugSqlParsing };