#!/usr/bin/env node

/**
 * Schema Validation Script
 * Prevents schema drift by validating database matches application expectations
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const connectionString = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL;

// Critical schema validations
const CRITICAL_VALIDATIONS = [
  {
    name: 'RFQ Response Deadline Column',
    description: 'Ensures rfqs.response_deadline column exists',
    query: `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'rfqs' 
        AND column_name = 'response_deadline'
        AND table_schema = 'public'
    `,
    validate: (result) => result.length > 0,
    errorMessage: 'RFQ response_deadline column is missing - this will break RFQ listing functionality'
  },
  
  {
    name: 'RFQ Items Table Exists',
    description: 'Ensures rfq_items table exists',
    query: `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'rfq_items' 
        AND table_schema = 'public'
    `,
    validate: (result) => result.length > 0,
    errorMessage: 'rfq_items table is missing - RFQ functionality will not work'
  },
  
  {
    name: 'Supplier Invitations Table Exists',
    description: 'Ensures supplier_invitations table exists',
    query: `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'supplier_invitations' 
        AND table_schema = 'public'
    `,
    validate: (result) => result.length > 0,
    errorMessage: 'supplier_invitations table is missing - Supplier invitation functionality will not work'
  },
  
  {
    name: 'Quotes Table Exists',
    description: 'Ensures quotes table exists',
    query: `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'quotes' 
        AND table_schema = 'public'
    `,
    validate: (result) => result.length > 0,
    errorMessage: 'quotes table is missing - Quote management functionality will not work'
  },
  
  {
    name: 'Core Tables Foreign Keys',
    description: 'Ensures critical foreign key relationships exist',
    query: `
      SELECT 
        tc.table_name, 
        tc.constraint_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name IN ('rfq_items', 'supplier_invitations', 'quotes', 'quote_items')
        AND tc.table_schema = 'public'
    `,
    validate: (result) => result.length >= 4, // At least 4 key relationships
    errorMessage: 'Critical foreign key relationships are missing - Data integrity issues may occur'
  }
];

const PERFORMANCE_VALIDATIONS = [
  {
    name: 'RFQ Performance Indexes',
    description: 'Ensures performance indexes exist on RFQ tables',
    query: `
      SELECT 
        t.relname as table_name,
        i.relname as index_name,
        a.attname as column_name
      FROM pg_class t, pg_class i, pg_index ix, pg_attribute a
      WHERE t.oid = ix.indrelid
        AND i.oid = ix.indexrelid
        AND a.attrelid = t.oid
        AND a.attnum = ANY(ix.indkey)
        AND t.relkind = 'r'
        AND t.relname IN ('rfqs', 'rfq_items', 'quotes')
      ORDER BY t.relname, i.relname
    `,
    validate: (result) => result.length >= 3, // At least 3 indexes
    errorMessage: 'Performance indexes are missing - RFQ queries may be slow'
  }
];

async function validateSchema() {
  console.log('🔍 DATABASE SCHEMA VALIDATION');
  console.log('==============================\n');

  if (!connectionString) {
    console.error('❌ No database connection string found');
    console.error('Please set VITE_NEON_DATABASE_URL or DATABASE_URL');
    return false;
  }

  try {
    const sql = neon(connectionString);
    
    let allPassed = true;
    const results = [];
    
    // Run critical validations
    console.log('🚨 CRITICAL VALIDATIONS');
    console.log('========================');
    
    for (const validation of CRITICAL_VALIDATIONS) {
      try {
        console.log(`⏳ ${validation.name}...`);
        
        const result = await sql.unsafe(validation.query);
        const passed = validation.validate(result);
        
        if (passed) {
          console.log(`✅ ${validation.name}: PASSED`);
          results.push({ ...validation, status: 'PASSED', critical: true });
        } else {
          console.log(`❌ ${validation.name}: FAILED`);
          console.log(`   Error: ${validation.errorMessage}`);
          results.push({ ...validation, status: 'FAILED', critical: true });
          allPassed = false;
        }
        
      } catch (error) {
        console.log(`💥 ${validation.name}: ERROR`);
        console.log(`   Database Error: ${error.message}`);
        results.push({ ...validation, status: 'ERROR', error: error.message, critical: true });
        allPassed = false;
      }
      
      console.log('');
    }
    
    // Run performance validations
    console.log('⚡ PERFORMANCE VALIDATIONS');
    console.log('==========================');
    
    for (const validation of PERFORMANCE_VALIDATIONS) {
      try {
        console.log(`⏳ ${validation.name}...`);
        
        const result = await sql.unsafe(validation.query);
        const passed = validation.validate(result);
        
        if (passed) {
          console.log(`✅ ${validation.name}: PASSED`);
          results.push({ ...validation, status: 'PASSED', critical: false });
        } else {
          console.log(`⚠️  ${validation.name}: WARNING`);
          console.log(`   Warning: ${validation.errorMessage}`);
          results.push({ ...validation, status: 'WARNING', critical: false });
          // Performance issues don't fail the validation
        }
        
      } catch (error) {
        console.log(`💥 ${validation.name}: ERROR`);
        console.log(`   Database Error: ${error.message}`);
        results.push({ ...validation, status: 'ERROR', error: error.message, critical: false });
      }
      
      console.log('');
    }
    
    // Summary
    console.log('📊 VALIDATION SUMMARY');
    console.log('=====================');
    
    const criticalPassed = results.filter(r => r.critical && r.status === 'PASSED').length;
    const criticalFailed = results.filter(r => r.critical && (r.status === 'FAILED' || r.status === 'ERROR')).length;
    const performancePassed = results.filter(r => !r.critical && r.status === 'PASSED').length;
    const performanceWarnings = results.filter(r => !r.critical && r.status === 'WARNING').length;
    
    console.log(`✅ Critical validations passed: ${criticalPassed}/${CRITICAL_VALIDATIONS.length}`);
    console.log(`❌ Critical validations failed: ${criticalFailed}`);
    console.log(`⚡ Performance validations passed: ${performancePassed}`);
    console.log(`⚠️  Performance warnings: ${performanceWarnings}`);
    
    if (allPassed) {
      console.log('\n🎉 ALL CRITICAL VALIDATIONS PASSED!');
      console.log('✅ Database schema is valid and RFQ functionality should work');
    } else {
      console.log('\n💥 CRITICAL VALIDATIONS FAILED!');
      console.log('❌ Database schema issues detected - functionality may be broken');
      
      console.log('\n🔧 RECOMMENDED ACTIONS:');
      console.log('1. Run: npx tsx scripts/applyRfqMigration.js');
      console.log('2. Verify all migrations completed successfully');
      console.log('3. Re-run this validation script');
      console.log('4. Test RFQ functionality in the application');
    }
    
    // Write validation report
    const reportData = {
      timestamp: new Date().toISOString(),
      allPassed,
      results,
      summary: {
        criticalPassed,
        criticalFailed,
        performancePassed,
        performanceWarnings
      }
    };
    
    fs.writeFileSync('schema-validation-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📝 Detailed report saved to: schema-validation-report.json');
    
    return allPassed;
    
  } catch (error) {
    console.error('💥 Validation failed with error:', error);
    return false;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  validateSchema().then(passed => {
    process.exit(passed ? 0 : 1);
  });
}

export default validateSchema;