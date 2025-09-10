#!/usr/bin/env node

/**
 * Debug RFQ database entries
 */

const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const sql = neon(process.env.DATABASE_URL);

async function debug() {
  try {
    console.log('Checking RFQ data in database...\n');
    
    // Get all RFQs
    const rfqs = await sql`
      SELECT id, rfq_number, project_id, invited_suppliers, created_at 
      FROM rfqs 
      WHERE project_id = 'test-project-123'
      ORDER BY created_at DESC 
      LIMIT 5`;
    
    console.log(`Found ${rfqs.length} RFQs for test-project-123:\n`);
    
    for (const rfq of rfqs) {
      console.log(`RFQ ID: ${rfq.id}`);
      console.log(`RFQ Number: ${rfq.rfq_number}`);
      console.log(`Created: ${rfq.created_at}`);
      console.log(`Invited Suppliers (raw):`, rfq.invited_suppliers);
      console.log(`Type:`, typeof rfq.invited_suppliers);
      
      // Try to parse if it's a string
      if (typeof rfq.invited_suppliers === 'string') {
        try {
          const parsed = JSON.parse(rfq.invited_suppliers);
          console.log(`Parsed successfully:`, parsed);
        } catch (e) {
          console.log(`Failed to parse:`, e.message);
          console.log(`String value:`, rfq.invited_suppliers);
        }
      }
      console.log('-'.repeat(60));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debug();