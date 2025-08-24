/**
 * Test all database connections and verify tables are accessible
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_Jq8OGXiWcYK0@ep-wandering-dew-a14qgf25-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function testConnections() {
  console.log('🔍 Testing Database Connections...\n');
  
  const sql = neon(connectionString);
  
  const tests = [
    // Contractor Management
    { name: 'Contractors Portal', table: 'contractors', feature: 'Contractor CRUD operations' },
    { name: 'Contractor Teams', table: 'contractor_teams', feature: 'Team management' },
    { name: 'Team Members', table: 'team_members', feature: 'Member assignments' },
    { name: 'Contractor Documents', table: 'contractor_documents', feature: 'Document management' },
    { name: 'Project Assignments', table: 'project_assignments', feature: 'RAG scoring' },
    
    // Procurement
    { name: 'BOQ Management', table: 'boqs', feature: 'Bill of Quantities' },
    { name: 'BOQ Items', table: 'boq_items', feature: 'BOQ line items' },
    { name: 'Purchase Orders', table: 'purchase_orders', feature: 'PO creation' },
    { name: 'Suppliers', table: 'suppliers', feature: 'Supplier management' },
    { name: 'RFQs', table: 'rfqs', feature: 'Request for Quotations' },
    
    // Analytics
    { name: 'Project Analytics', table: 'project_analytics', feature: 'Project reporting' },
    { name: 'Client Analytics', table: 'client_analytics', feature: 'Client dashboard' },
    { name: 'KPI Metrics', table: 'kpi_metrics', feature: 'Performance tracking' },
    { name: 'Audit Log', table: 'audit_log', feature: 'Audit trail' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await sql.query(`SELECT COUNT(*) as count FROM ${test.table}`);
      console.log(`✅ ${test.name}: ${test.table} (${result[0].count} records) - ${test.feature}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}: ${test.table} - FAILED`);
      console.log(`   Feature affected: ${test.feature}`);
      console.log(`   Error: ${error.message}\n`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All database connections working perfectly!');
    console.log('✨ The contractor portal and all features should work now.');
  } else {
    console.log('\n⚠️ Some features may not work properly.');
    console.log('Run: npm run db:create-all to fix missing tables');
  }
}

testConnections().catch(console.error);