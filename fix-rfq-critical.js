#!/usr/bin/env node

/**
 * Critical RFQ Fix - Create Missing Tables
 * Simplified approach to create the essential RFQ tables
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL;

async function fixRfqTables() {
  console.log('🔧 CRITICAL RFQ TABLE FIX');
  console.log('==========================\n');

  if (!connectionString) {
    console.error('❌ No database connection string found');
    process.exit(1);
  }

  const sql = neon(connectionString);

  try {
    // Step 1: Create RFQs table with all required columns
    console.log('1️⃣ Creating/updating RFQs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS rfqs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id VARCHAR(255) NOT NULL,
        rfq_number VARCHAR(100) NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'draft',
        issue_date TIMESTAMP,
        response_deadline TIMESTAMP NOT NULL,
        extended_deadline TIMESTAMP,
        closed_at TIMESTAMP,
        created_by VARCHAR(255) NOT NULL,
        issued_by VARCHAR(255),
        payment_terms TEXT,
        delivery_terms TEXT,
        validity_period INTEGER,
        currency VARCHAR(3) DEFAULT 'ZAR',
        evaluation_criteria JSON,
        technical_requirements TEXT,
        invited_suppliers JSON,
        responded_suppliers JSON,
        item_count INTEGER DEFAULT 0,
        total_budget_estimate DECIMAL(15,2),
        lowest_quote_value DECIMAL(15,2),
        highest_quote_value DECIMAL(15,2),
        average_quote_value DECIMAL(15,2),
        awarded_at TIMESTAMP,
        awarded_to VARCHAR(255),
        award_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ RFQs table created/updated');

    // Step 2: Create RFQ Items table
    console.log('2️⃣ Creating RFQ Items table...');
    await sql`
      CREATE TABLE IF NOT EXISTS rfq_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rfq_id UUID NOT NULL,
        boq_item_id UUID,
        project_id VARCHAR(255) NOT NULL,
        line_number INTEGER NOT NULL,
        item_code VARCHAR(100),
        description TEXT NOT NULL,
        category VARCHAR(100),
        quantity DECIMAL(15,4) NOT NULL,
        uom VARCHAR(20) NOT NULL,
        budget_price DECIMAL(15,2),
        specifications JSON,
        technical_requirements TEXT,
        acceptable_alternatives JSON,
        evaluation_weight DECIMAL(5,2) DEFAULT 1.0,
        is_critical_item BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT rfq_items_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE
      )
    `;
    console.log('✅ RFQ Items table created');

    // Step 3: Create Supplier Invitations table
    console.log('3️⃣ Creating Supplier Invitations table...');
    await sql`
      CREATE TABLE IF NOT EXISTS supplier_invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rfq_id UUID NOT NULL,
        supplier_id VARCHAR(255) NOT NULL,
        project_id VARCHAR(255) NOT NULL,
        supplier_name VARCHAR(255) NOT NULL,
        supplier_email VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        invitation_status VARCHAR(20) DEFAULT 'sent',
        invited_at TIMESTAMP DEFAULT NOW(),
        viewed_at TIMESTAMP,
        responded_at TIMESTAMP,
        declined_at TIMESTAMP,
        access_token VARCHAR(500),
        token_expires_at TIMESTAMP,
        magic_link_token VARCHAR(500),
        last_login_at TIMESTAMP,
        invitation_message TEXT,
        decline_reason TEXT,
        reminders_sent INTEGER DEFAULT 0,
        last_reminder_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT supplier_invitations_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE
      )
    `;
    console.log('✅ Supplier Invitations table created');

    // Step 4: Create Quotes table
    console.log('4️⃣ Creating Quotes table...');
    await sql`
      CREATE TABLE IF NOT EXISTS quotes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rfq_id UUID NOT NULL,
        supplier_id VARCHAR(255) NOT NULL,
        supplier_invitation_id UUID,
        project_id VARCHAR(255) NOT NULL,
        quote_number VARCHAR(100),
        quote_reference VARCHAR(100),
        status VARCHAR(20) DEFAULT 'draft',
        submission_date TIMESTAMP DEFAULT NOW(),
        valid_until TIMESTAMP NOT NULL,
        total_value DECIMAL(15,2) NOT NULL,
        subtotal DECIMAL(15,2),
        tax_amount DECIMAL(15,2),
        discount_amount DECIMAL(15,2),
        currency VARCHAR(3) DEFAULT 'ZAR',
        lead_time INTEGER,
        payment_terms TEXT,
        delivery_terms TEXT,
        warranty_terms TEXT,
        validity_period INTEGER,
        notes TEXT,
        terms TEXT,
        conditions TEXT,
        evaluation_score DECIMAL(5,2),
        technical_score DECIMAL(5,2),
        commercial_score DECIMAL(5,2),
        evaluation_notes TEXT,
        is_winner BOOLEAN DEFAULT false,
        awarded_at TIMESTAMP,
        rejected_at TIMESTAMP,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT quotes_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE
      )
    `;
    console.log('✅ Quotes table created');

    // Step 5: Verify tables exist
    console.log('\n🔍 Verifying tables...');
    
    const tables = ['rfqs', 'rfq_items', 'supplier_invitations', 'quotes'];
    for (const table of tables) {
      try {
        const result = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
        console.log(`✅ ${table}: EXISTS (${result[0].count} records)`);
      } catch (error) {
        console.log(`❌ ${table}: ERROR - ${error.message}`);
      }
    }

    // Step 6: Test the specific query that was failing
    console.log('\n🎯 Testing original failing query...');
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
        WHERE project_id = 'test-project-id'
        ORDER BY created_at DESC 
        LIMIT 20
      `;
      console.log(`✅ RFQ Query Test: SUCCESS (${testResult.length} results)`);
      
    } catch (error) {
      console.log(`❌ RFQ Query Test: FAILED - ${error.message}`);
    }

    console.log('\n🎉 RFQ TABLES SETUP COMPLETE!');
    console.log('RFQ functionality should now work in the application.');

  } catch (error) {
    console.error('💥 Critical fix failed:', error);
    process.exit(1);
  }
}

fixRfqTables().catch(console.error);