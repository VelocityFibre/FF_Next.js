#!/usr/bin/env node

/**
 * Final RFQ Fix - Ensure all columns exist correctly
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL;

async function finalRfqFix() {
  console.log('🔧 FINAL RFQ SCHEMA FIX');
  console.log('========================\n');

  const sql = neon(connectionString);

  try {
    // Get current column list
    console.log('1️⃣ Getting current RFQ table schema...');
    const currentColumns = await sql`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'rfqs' 
        AND table_schema = 'public'
      ORDER BY column_name
    `;
    
    const currentColumnNames = currentColumns.map(c => c.column_name);
    console.log(`Current columns: ${currentColumnNames.join(', ')}`);

    // Define expected columns
    const expectedColumns = [
      'id', 'project_id', 'rfq_number', 'title', 'description', 'status',
      'issue_date', 'response_deadline', 'extended_deadline', 'closed_at',
      'created_by', 'issued_by', 'payment_terms', 'delivery_terms',
      'validity_period', 'currency', 'evaluation_criteria', 'technical_requirements',
      'invited_suppliers', 'responded_suppliers', 'item_count', 'total_budget_estimate',
      'lowest_quote_value', 'highest_quote_value', 'average_quote_value',
      'awarded_at', 'awarded_to', 'award_notes', 'created_at', 'updated_at'
    ];

    // Find missing columns
    const missingColumns = expectedColumns.filter(col => !currentColumnNames.includes(col));
    console.log(`\n2️⃣ Missing columns: ${missingColumns.length > 0 ? missingColumns.join(', ') : 'None'}`);

    // Add missing columns one by one with proper error handling
    if (missingColumns.length > 0) {
      console.log('\n3️⃣ Adding missing columns...');
      
      for (const column of missingColumns) {
        try {
          let columnDef = '';
          switch (column) {
            case 'extended_deadline':
            case 'closed_at':
            case 'awarded_at':
              columnDef = 'TIMESTAMP';
              break;
            case 'issued_by':
            case 'awarded_to':
              columnDef = 'VARCHAR(255)';
              break;
            case 'delivery_terms':
            case 'technical_requirements':
            case 'award_notes':
              columnDef = 'TEXT';
              break;
            case 'validity_period':
            case 'item_count':
              columnDef = 'INTEGER DEFAULT 0';
              break;
            case 'currency':
              columnDef = 'VARCHAR(3) DEFAULT \'ZAR\'';
              break;
            case 'evaluation_criteria':
            case 'invited_suppliers':
            case 'responded_suppliers':
              columnDef = 'JSON';
              break;
            case 'total_budget_estimate':
            case 'lowest_quote_value':
            case 'highest_quote_value':
            case 'average_quote_value':
              columnDef = 'DECIMAL(15,2)';
              break;
            default:
              columnDef = 'TEXT'; // fallback
          }
          
          console.log(`  ➕ Adding ${column} as ${columnDef}...`);
          await sql.unsafe(`ALTER TABLE rfqs ADD COLUMN ${column} ${columnDef}`);
          console.log(`  ✅ ${column} added successfully`);
          
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`  ✓ ${column} already exists`);
          } else {
            console.log(`  ⚠️ Error adding ${column}: ${error.message}`);
          }
        }
      }
    }

    // Final verification - get updated schema
    console.log('\n4️⃣ Final verification...');
    const finalColumns = await sql`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'rfqs' 
        AND table_schema = 'public'
      ORDER BY column_name
    `;
    
    const finalColumnNames = finalColumns.map(c => c.column_name);
    const stillMissing = expectedColumns.filter(col => !finalColumnNames.includes(col));
    
    console.log(`Final column count: ${finalColumnNames.length}`);
    console.log(`Still missing: ${stillMissing.length > 0 ? stillMissing.join(', ') : 'None'}`);

    // Test the exact failing query
    console.log('\n5️⃣ Testing the exact failing query...');
    try {
      const result = await sql`
        SELECT id, project_id, rfq_number, title, description, status,
               issue_date, response_deadline, extended_deadline, closed_at,
               created_by, issued_by, payment_terms, delivery_terms,
               validity_period, currency, evaluation_criteria, technical_requirements,
               invited_suppliers, responded_suppliers, item_count, total_budget_estimate,
               lowest_quote_value, highest_quote_value, average_quote_value,
               awarded_at, awarded_to, award_notes, created_at, updated_at
        FROM rfqs 
        WHERE project_id = 'current-project-id'
        ORDER BY created_at DESC 
        LIMIT 20
      `;
      
      console.log(`🎉 SUCCESS! Query executed successfully, returned ${result.length} rows`);
      console.log('✅ RFQ functionality should now work in the application!');
      
    } catch (error) {
      console.log(`❌ Query still failing: ${error.message}`);
      
      // Try to identify which specific column is missing
      const errorMatch = error.message.match(/column "([^"]+)" does not exist/);
      if (errorMatch) {
        const problemColumn = errorMatch[1];
        console.log(`🎯 Problem column: ${problemColumn}`);
        console.log(`Column exists in schema: ${finalColumnNames.includes(problemColumn)}`);
      }
    }

  } catch (error) {
    console.error('💥 Final fix failed:', error);
  }
}

finalRfqFix().catch(console.error);