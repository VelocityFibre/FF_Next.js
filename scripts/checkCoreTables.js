
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required. Check your .env file.');
}
#!/usr/bin/env node

/**
 * Database Schema Audit Script
 * Compares expected application schema vs actual database schema
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const connectionString = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL || 
  'process.env.DATABASE_URL';

// Expected schemas from application code
const expectedSchemas = {
  rfqs: [
    'id', 'project_id', 'rfq_number', 'title', 'description', 'status',
    'issue_date', 'response_deadline', 'extended_deadline', 'closed_at',
    'created_by', 'issued_by', 'payment_terms', 'delivery_terms',
    'validity_period', 'currency', 'evaluation_criteria', 'technical_requirements',
    'invited_suppliers', 'responded_suppliers', 'item_count', 'total_budget_estimate',
    'lowest_quote_value', 'highest_quote_value', 'average_quote_value',
    'awarded_at', 'awarded_to', 'award_notes', 'created_at', 'updated_at'
  ],
  
  rfq_items: [
    'id', 'rfq_id', 'boq_item_id', 'project_id', 'line_number', 'item_code',
    'description', 'category', 'quantity', 'uom', 'budget_price',
    'specifications', 'technical_requirements', 'acceptable_alternatives',
    'evaluation_weight', 'is_critical_item', 'created_at', 'updated_at'
  ],

  supplier_invitations: [
    'id', 'rfq_id', 'supplier_id', 'project_id', 'supplier_name',
    'supplier_email', 'contact_person', 'invitation_status', 'invited_at',
    'viewed_at', 'responded_at', 'declined_at', 'access_token', 'token_expires_at',
    'magic_link_token', 'last_login_at', 'invitation_message', 'decline_reason',
    'reminders_sent', 'last_reminder_at', 'created_at', 'updated_at'
  ],

  quotes: [
    'id', 'rfq_id', 'supplier_id', 'supplier_invitation_id', 'project_id',
    'quote_number', 'quote_reference', 'status', 'submission_date', 'valid_until',
    'total_value', 'subtotal', 'tax_amount', 'discount_amount', 'currency',
    'lead_time', 'payment_terms', 'delivery_terms', 'warranty_terms',
    'validity_period', 'notes', 'terms', 'conditions', 'evaluation_score',
    'technical_score', 'commercial_score', 'evaluation_notes', 'is_winner',
    'awarded_at', 'rejected_at', 'rejection_reason', 'created_at', 'updated_at'
  ],

  quote_items: [
    'id', 'quote_id', 'rfq_item_id', 'project_id', 'line_number', 'item_code',
    'description', 'quoted_quantity', 'unit_price', 'total_price',
    'discount_percentage', 'discount_amount', 'alternate_offered',
    'alternate_description', 'alternate_part_number', 'alternate_unit_price',
    'lead_time', 'minimum_order_quantity', 'packaging_unit', 'manufacturer_name',
    'part_number', 'model_number', 'technical_notes', 'compliance_certificates',
    'technical_compliance', 'commercial_score', 'technical_score',
    'created_at', 'updated_at'
  ],

  quote_documents: [
    'id', 'quote_id', 'project_id', 'file_name', 'original_name', 'file_size',
    'file_type', 'document_type', 'file_url', 'file_path', 'storage_provider',
    'uploaded_by', 'description', 'is_public', 'created_at', 'updated_at'
  ]
};

async function getActualTableColumns(sql, tableName) {
  try {
    const result = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = ${tableName} 
        AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    return result.map(row => row.column_name);
  } catch (error) {
    return null; // Table doesn't exist
  }
}

async function auditSchemas() {
  console.log('🔍 DATABASE SCHEMA AUDIT REPORT');
  console.log('=====================================\n');

  const sql = neon(connectionString);
  const issues = [];
  
  for (const [tableName, expectedColumns] of Object.entries(expectedSchemas)) {
    console.log(`📋 TABLE: ${tableName}`);
    
    const actualColumns = await getActualTableColumns(sql, tableName);
    
    if (!actualColumns) {
      console.log(`❌ CRITICAL: Table '${tableName}' DOES NOT EXIST in database`);
      issues.push({
        table: tableName,
        type: 'MISSING_TABLE',
        severity: 'CRITICAL',
        description: `Table '${tableName}' expected by application but missing from database`
      });
      console.log('');
      continue;
    }

    // Find missing columns
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    if (missingColumns.length > 0) {
      console.log(`🔴 MISSING COLUMNS (${missingColumns.length}):`);
      missingColumns.forEach(col => {
        console.log(`   - ${col}`);
        issues.push({
          table: tableName,
          type: 'MISSING_COLUMN',
          severity: 'HIGH',
          column: col,
          description: `Column '${col}' expected by application but missing from database`
        });
      });
    }

    // Find extra columns
    const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
    if (extraColumns.length > 0) {
      console.log(`🟡 EXTRA COLUMNS (${extraColumns.length}):`);
      extraColumns.forEach(col => {
        console.log(`   + ${col}`);
        issues.push({
          table: tableName,
          type: 'EXTRA_COLUMN',
          severity: 'LOW',
          column: col,
          description: `Column '${col}' exists in database but not expected by application`
        });
      });
    }

    // Show matching columns
    const matchingColumns = expectedColumns.filter(col => actualColumns.includes(col));
    if (matchingColumns.length > 0) {
      console.log(`✅ MATCHING COLUMNS (${matchingColumns.length}): ${matchingColumns.length}/${expectedColumns.length}`);
    }

    console.log('');
  }

  // Summary
  console.log('📊 SUMMARY');
  console.log('===========');
  
  const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
  const highIssues = issues.filter(i => i.severity === 'HIGH');
  const lowIssues = issues.filter(i => i.severity === 'LOW');
  
  console.log(`🔴 Critical Issues: ${criticalIssues.length}`);
  console.log(`🟠 High Priority: ${highIssues.length}`);
  console.log(`🟡 Low Priority: ${lowIssues.length}`);
  console.log(`📈 Total Issues: ${issues.length}`);

  // Critical issues detail
  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES - IMMEDIATE ACTION REQUIRED:');
    criticalIssues.forEach(issue => {
      console.log(`   ${issue.table}: ${issue.description}`);
    });
  }

  // High priority issues detail  
  if (highIssues.length > 0) {
    console.log('\n⚠️ HIGH PRIORITY ISSUES - BLOCKING FUNCTIONALITY:');
    highIssues.forEach(issue => {
      console.log(`   ${issue.table}.${issue.column}: ${issue.description}`);
    });
  }

  // Generate migration recommendations
  console.log('\n🔧 MIGRATION RECOMMENDATIONS:');
  console.log('==============================');

  const missingTables = issues.filter(i => i.type === 'MISSING_TABLE');
  const missingColumns = issues.filter(i => i.type === 'MISSING_COLUMN');

  if (missingTables.length > 0) {
    console.log('1. CREATE MISSING TABLES:');
    missingTables.forEach(issue => {
      console.log(`   CREATE TABLE ${issue.table} (...);`);
    });
  }

  if (missingColumns.length > 0) {
    console.log('2. ADD MISSING COLUMNS:');
    const columnsByTable = {};
    missingColumns.forEach(issue => {
      if (!columnsByTable[issue.table]) {
        columnsByTable[issue.table] = [];
      }
      columnsByTable[issue.table].push(issue.column);
    });

    for (const [table, columns] of Object.entries(columnsByTable)) {
      console.log(`   ALTER TABLE ${table}`);
      columns.forEach(col => {
        console.log(`     ADD COLUMN ${col} [type];`);
      });
    }
  }

  // Write validation report
  const reportPath = path.join(process.cwd(), 'validation-report.md');
  const reportContent = `# Database Schema Validation Report

Generated: ${new Date().toISOString()}

## Issues Found: ${issues.length}

${issues.map(issue => `
### ${issue.severity}: ${issue.table}${issue.column ? `.${issue.column}` : ''}
- **Type**: ${issue.type}
- **Description**: ${issue.description}
`).join('')}

## Next Steps
1. Run migration scripts to add missing columns
2. Update application code to handle extra columns
3. Verify all functionality after schema updates
4. Add validation to prevent future schema drift
`;

  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`\n📝 Full report written to: ${reportPath}`);

  return issues;
}

// Run the audit
auditSchemas().catch(console.error);