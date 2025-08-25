#!/usr/bin/env node

/**
 * Apply RFQ Schema Migration Script
 * Fixes the database schema mismatch for RFQ functionality
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const connectionString = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ No database connection string found in environment variables');
  console.error('Please set VITE_NEON_DATABASE_URL or DATABASE_URL');
  process.exit(1);
}

async function applyRfqMigration() {
  console.log('🔧 Applying RFQ Schema Migration...');
  console.log('=====================================\n');

  try {
    const sql = neon(connectionString);
    
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'drizzle', 'migrations', '0001_fix_rfq_schema.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Migration file loaded successfully');
    console.log('🚀 Executing migration...\n');
    
    // Split migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== '');
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const shortStatement = statement.substring(0, 80) + (statement.length > 80 ? '...' : '');
      
      try {
        console.log(`⏳ [${i + 1}/${statements.length}] ${shortStatement}`);
        
        // Execute statement
        await sql.unsafe(statement);
        
        console.log(`✅ [${i + 1}/${statements.length}] Success`);
        successCount++;
        
      } catch (error) {
        console.log(`❌ [${i + 1}/${statements.length}] Error: ${error.message}`);
        errors.push({
          statement: shortStatement,
          error: error.message,
          index: i + 1
        });
        errorCount++;
      }
      
      console.log(''); // Add spacing
    }
    
    // Summary
    console.log('📊 MIGRATION RESULTS');
    console.log('=====================');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📈 Total statements: ${statements.length}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 ERRORS ENCOUNTERED:');
      errors.forEach(error => {
        console.log(`   [${error.index}] ${error.statement}`);
        console.log(`       Error: ${error.error}`);
      });
    }
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('✅ RFQ functionality should now work properly');
    } else if (successCount > 0) {
      console.log('\n⚠️  Migration partially completed');
      console.log('Some statements failed but others succeeded');
      console.log('Review errors and manually fix if needed');
    } else {
      console.log('\n💥 Migration failed completely');
      console.log('Please check database connection and permissions');
    }
    
    // Verify critical tables exist
    console.log('\n🔍 Verifying RFQ tables exist...');
    const criticalTables = ['rfqs', 'rfq_items', 'supplier_invitations', 'quotes', 'quote_items', 'quote_documents'];
    
    for (const tableName of criticalTables) {
      try {
        const result = await sql`SELECT COUNT(*) as count FROM ${sql(tableName)}`;
        console.log(`✅ ${tableName}: EXISTS (${result[0].count} records)`);
      } catch (error) {
        console.log(`❌ ${tableName}: MISSING or INACCESSIBLE`);
      }
    }
    
    // Check for response_deadline column specifically
    console.log('\n🎯 Verifying RFQ response_deadline column...');
    try {
      const columnCheck = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'rfqs' 
          AND column_name = 'response_deadline'
          AND table_schema = 'public'
      `;
      
      if (columnCheck.length > 0) {
        console.log('✅ response_deadline column: EXISTS');
        console.log('🎉 The original error should be fixed!');
      } else {
        console.log('❌ response_deadline column: STILL MISSING');
        console.log('⚠️  Manual intervention may be required');
      }
    } catch (error) {
      console.log(`❌ Could not verify response_deadline column: ${error.message}`);
    }
    
  } catch (error) {
    console.error('💥 Migration failed with error:', error);
    process.exit(1);
  }
}

// Run migration
console.log('Starting RFQ Schema Migration...\n');
applyRfqMigration().catch(console.error);