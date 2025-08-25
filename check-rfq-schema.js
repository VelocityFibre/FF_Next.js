#!/usr/bin/env node

/**
 * Check existing RFQ schema and fix it
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL;

async function checkAndFixRfqSchema() {
  console.log('🔍 CHECKING EXISTING RFQ SCHEMA');
  console.log('================================\n');

  const sql = neon(connectionString);

  try {
    // Check if RFQs table exists and what columns it has
    console.log('1️⃣ Checking existing RFQs table...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'rfqs' 
        AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    console.log(`Found ${columns.length} columns in RFQs table:`);
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    // Check if response_deadline exists
    const hasResponseDeadline = columns.some(col => col.column_name === 'response_deadline');
    console.log(`\n❓ Has response_deadline: ${hasResponseDeadline ? '✅ YES' : '❌ NO'}`);

    if (!hasResponseDeadline) {
      console.log('\n2️⃣ Adding missing response_deadline column...');
      
      // Check if closing_date exists to migrate data
      const hasClosingDate = columns.some(col => col.column_name === 'closing_date');
      
      if (hasClosingDate) {
        console.log('🔄 Found closing_date column - migrating data...');
        // Add response_deadline column
        await sql`ALTER TABLE rfqs ADD COLUMN response_deadline TIMESTAMP`;
        
        // Copy data from closing_date
        await sql`UPDATE rfqs SET response_deadline = closing_date WHERE response_deadline IS NULL`;
        
        // Drop the old column
        await sql`ALTER TABLE rfqs DROP COLUMN closing_date`;
        
        console.log('✅ Successfully migrated closing_date to response_deadline');
      } else {
        console.log('➕ Adding response_deadline column (no data to migrate)...');
        await sql`ALTER TABLE rfqs ADD COLUMN response_deadline TIMESTAMP`;
        console.log('✅ response_deadline column added');
      }
    }

    // Add all other missing columns
    console.log('\n3️⃣ Adding other missing columns...');
    
    const requiredColumns = [
      { name: 'extended_deadline', type: 'TIMESTAMP' },
      { name: 'closed_at', type: 'TIMESTAMP' },
      { name: 'issued_by', type: 'VARCHAR(255)' },
      { name: 'delivery_terms', type: 'TEXT' },
      { name: 'validity_period', type: 'INTEGER' },
      { name: 'currency', type: 'VARCHAR(3) DEFAULT \'ZAR\'' },
      { name: 'technical_requirements', type: 'TEXT' },
      { name: 'responded_suppliers', type: 'JSON' },
      { name: 'item_count', type: 'INTEGER DEFAULT 0' },
      { name: 'total_budget_estimate', type: 'DECIMAL(15,2)' },
      { name: 'lowest_quote_value', type: 'DECIMAL(15,2)' },
      { name: 'highest_quote_value', type: 'DECIMAL(15,2)' },
      { name: 'average_quote_value', type: 'DECIMAL(15,2)' },
      { name: 'awarded_at', type: 'TIMESTAMP' },
      { name: 'awarded_to', type: 'VARCHAR(255)' },
      { name: 'award_notes', type: 'TEXT' }
    ];

    for (const col of requiredColumns) {
      const exists = columns.some(existingCol => existingCol.column_name === col.name);
      if (!exists) {
        try {
          console.log(`➕ Adding ${col.name}...`);
          await sql.unsafe(`ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
          console.log(`✅ Added ${col.name}`);
        } catch (error) {
          console.log(`⚠️ Could not add ${col.name}: ${error.message}`);
        }
      } else {
        console.log(`✓ ${col.name} already exists`);
      }
    }

    // Final verification
    console.log('\n4️⃣ Final verification...');
    const updatedColumns = await sql`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'rfqs' 
        AND table_schema = 'public'
      ORDER BY ordinal_position
    `;

    const hasResponseDeadlineNow = updatedColumns.some(col => col.column_name === 'response_deadline');
    console.log(`✅ response_deadline exists: ${hasResponseDeadlineNow ? 'YES' : 'NO'}`);

    // Test the failing query
    console.log('\n5️⃣ Testing the original failing query...');
    try {
      const testResult = await sql`
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
      console.log(`✅ RFQ Query Test: SUCCESS! Query works correctly`);
      
    } catch (error) {
      console.log(`❌ RFQ Query Test: STILL FAILING - ${error.message}`);
    }

    console.log('\n🎉 RFQ SCHEMA FIX COMPLETE!');

  } catch (error) {
    console.error('💥 Schema check/fix failed:', error);
  }
}

checkAndFixRfqSchema().catch(console.error);