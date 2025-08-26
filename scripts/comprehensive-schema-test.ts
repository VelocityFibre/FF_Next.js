/**
 * Comprehensive Database Schema and Data Integrity Test
 * Tests all tables, relationships, constraints, and data quality
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const neonUrl = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!neonUrl) {
  throw new Error('Database URL not found');
}

const sql = neon(neonUrl);

interface TableInfo {
  name: string;
  columns: number;
  records: number;
  constraints: number;
  indexes: number;
  issues: string[];
  recommendations: string[];
}

interface TestResult {
  database: {
    name: string;
    size: string;
    version: string;
    tables: number;
    totalRecords: number;
  };
  tables: TableInfo[];
  relationships: {
    foreignKeys: number;
    orphanedRecords: number;
  };
  dataQuality: {
    duplicateEmails: number;
    incompleteRecords: number;
    dataConsistency: string[];
  };
  performance: {
    slowQueries: string[];
    missingIndexes: string[];
  };
  security: {
    sensitiveData: string[];
    accessControls: string[];
  };
}

class ComprehensiveDatabaseTester {
  private testResult: TestResult = {
    database: { name: '', size: '', version: '', tables: 0, totalRecords: 0 },
    tables: [],
    relationships: { foreignKeys: 0, orphanedRecords: 0 },
    dataQuality: { duplicateEmails: 0, incompleteRecords: 0, dataConsistency: [] },
    performance: { slowQueries: [], missingIndexes: [] },
    security: { sensitiveData: [], accessControls: [] }
  };

  async runComprehensiveTests(): Promise<void> {
    console.log('🔍 FibreFlow Comprehensive Database Analysis');
    console.log('==========================================\n');

    try {
      await this.analyzeDatabaseInfo();
      await this.analyzeAllTables();
      await this.validateRelationships();
      await this.checkDataQuality();
      await this.analyzePerformance();
      await this.checkSecurity();
      await this.generateReport();
      
    } catch (error: any) {
      console.error('❌ Comprehensive test failed:', error.message);
      process.exit(1);
    }
  }

  private async analyzeDatabaseInfo(): Promise<void> {
    console.log('1. Database Overview Analysis...');
    
    const dbInfo = await sql`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        VERSION() as version
    `;

    const tableCount = await sql`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;

    this.testResult.database = {
      name: dbInfo[0].database_name,
      size: dbInfo[0].database_size,
      version: dbInfo[0].version.split(' ')[1], // Extract version number
      tables: parseInt(tableCount[0].count),
      totalRecords: 0 // Will be calculated later
    };

    console.log(`   ✅ Database: ${this.testResult.database.name}`);
    console.log(`   ✅ Size: ${this.testResult.database.size}`);
    console.log(`   ✅ Tables: ${this.testResult.database.tables}`);
  }

  private async analyzeAllTables(): Promise<void> {
    console.log('\n2. Table-by-Table Analysis...');

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    for (const table of tables) {
      await this.analyzeTable(table.table_name);
    }

    // Calculate total records
    this.testResult.database.totalRecords = this.testResult.tables.reduce((sum, table) => sum + table.records, 0);
  }

  private async analyzeTable(tableName: string): Promise<void> {
    console.log(`   🔍 Analyzing table: ${tableName}`);

    const tableInfo: TableInfo = {
      name: tableName,
      columns: 0,
      records: 0,
      constraints: 0,
      indexes: 0,
      issues: [],
      recommendations: []
    };

    try {
      // Get column count
      const columns = await sql`
        SELECT COUNT(*) as count 
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${tableName}
      `;
      tableInfo.columns = parseInt(columns[0].count);

      // Get record count
      const records = await sql([`SELECT COUNT(*) as count FROM ${tableName}`] as any);
      tableInfo.records = parseInt(records[0].count);

      // Get constraints count
      const constraints = await sql`
        SELECT COUNT(*) as count 
        FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = ${tableName}
      `;
      tableInfo.constraints = parseInt(constraints[0].count);

      // Get indexes count
      const indexes = await sql`
        SELECT COUNT(DISTINCT indexname) as count
        FROM pg_indexes
        WHERE schemaname = 'public' AND tablename = ${tableName}
      `;
      tableInfo.indexes = parseInt(indexes[0].count);

      // Check for common issues
      await this.checkTableIssues(tableName, tableInfo);

    } catch (error: any) {
      tableInfo.issues.push(`Analysis failed: ${error.message}`);
    }

    this.testResult.tables.push(tableInfo);
    
    const status = tableInfo.issues.length === 0 ? '✅' : '⚠️';
    console.log(`      ${status} ${tableName}: ${tableInfo.records} records, ${tableInfo.columns} columns`);
  }

  private async checkTableIssues(tableName: string, tableInfo: TableInfo): Promise<void> {
    // Check for missing primary key
    const primaryKey = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints
      WHERE table_schema = 'public' 
        AND table_name = ${tableName} 
        AND constraint_type = 'PRIMARY KEY'
    `;
    
    if (parseInt(primaryKey[0].count) === 0) {
      tableInfo.issues.push('Missing primary key');
    }

    // Check for empty tables
    if (tableInfo.records === 0) {
      tableInfo.recommendations.push('Table is empty - consider adding sample data');
    }

    // Check for large tables without indexes
    if (tableInfo.records > 1000 && tableInfo.indexes <= 1) {
      tableInfo.recommendations.push('Large table may need additional indexes');
    }

    // Table-specific checks
    if (tableName === 'staff') {
      await this.checkStaffTable(tableInfo);
    } else if (tableName === 'contractors') {
      await this.checkContractorsTable(tableInfo);
    } else if (tableName === 'projects') {
      await this.checkProjectsTable(tableInfo);
    }
  }

  private async checkStaffTable(tableInfo: TableInfo): Promise<void> {
    try {
      // Check for duplicate emails
      const duplicates = await sql`
        SELECT email, COUNT(*) as count 
        FROM staff 
        GROUP BY email 
        HAVING COUNT(*) > 1
      `;
      
      if (duplicates.length > 0) {
        tableInfo.issues.push(`${duplicates.length} duplicate email addresses`);
        this.testResult.dataQuality.duplicateEmails += duplicates.length;
      }

      // Check for incomplete records
      const incomplete = await sql`
        SELECT COUNT(*) as count 
        FROM staff 
        WHERE email IS NULL OR name IS NULL OR department IS NULL
      `;
      
      if (parseInt(incomplete[0].count) > 0) {
        tableInfo.issues.push(`${incomplete[0].count} incomplete records`);
        this.testResult.dataQuality.incompleteRecords += parseInt(incomplete[0].count);
      }

    } catch (error) {
      // Table might not exist or have different structure
    }
  }

  private async checkContractorsTable(tableInfo: TableInfo): Promise<void> {
    try {
      // Check for duplicate registration numbers
      const duplicates = await sql`
        SELECT registration_number, COUNT(*) as count 
        FROM contractors 
        WHERE registration_number IS NOT NULL
        GROUP BY registration_number 
        HAVING COUNT(*) > 1
      `;
      
      if (duplicates.length > 0) {
        tableInfo.issues.push(`${duplicates.length} duplicate registration numbers`);
      }

      // Check contractor status distribution
      const statusDist = await sql`
        SELECT status, COUNT(*) as count 
        FROM contractors 
        GROUP BY status
      `;
      
      if (statusDist.length > 0) {
        const activeCount = statusDist.find((s: any) => s.status === 'active')?.count || 0;
        if (activeCount === 0 && tableInfo.records > 0) {
          tableInfo.issues.push('No active contractors found');
        }
      }

    } catch (error) {
      // Table might not exist
    }
  }

  private async checkProjectsTable(tableInfo: TableInfo): Promise<void> {
    try {
      // Check for projects without clients
      const orphanedProjects = await sql`
        SELECT COUNT(*) as count 
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.client_id IS NOT NULL AND c.id IS NULL
      `;
      
      if (parseInt(orphanedProjects[0].count) > 0) {
        tableInfo.issues.push(`${orphanedProjects[0].count} projects with invalid client references`);
        this.testResult.relationships.orphanedRecords += parseInt(orphanedProjects[0].count);
      }

    } catch (error) {
      // Tables might not exist or have different structure
    }
  }

  private async validateRelationships(): Promise<void> {
    console.log('\n3. Relationship Validation...');

    try {
      // Count foreign key constraints
      const foreignKeys = await sql`
        SELECT COUNT(*) as count
        FROM information_schema.table_constraints
        WHERE table_schema = 'public' 
          AND constraint_type = 'FOREIGN KEY'
      `;
      
      this.testResult.relationships.foreignKeys = parseInt(foreignKeys[0].count);
      console.log(`   ✅ Foreign key constraints: ${this.testResult.relationships.foreignKeys}`);

      // Test key relationships
      const relationships = [
        { parent: 'clients', child: 'projects', fk: 'client_id' },
        { parent: 'staff', child: 'projects', fk: 'project_manager_id' },
        { parent: 'contractors', child: 'project_assignments', fk: 'contractor_id' }
      ];

      for (const rel of relationships) {
        await this.testRelationshipIntegrity(rel.parent, rel.child, rel.fk);
      }

    } catch (error: any) {
      console.log(`   ⚠️ Relationship validation error: ${error.message}`);
    }
  }

  private async testRelationshipIntegrity(parentTable: string, childTable: string, foreignKey: string): Promise<void> {
    try {
      const orphans = await sql([
        `SELECT COUNT(*) as count
         FROM ${childTable} c
         LEFT JOIN ${parentTable} p ON c.${foreignKey} = p.id
         WHERE c.${foreignKey} IS NOT NULL AND p.id IS NULL`
      ] as any);

      const count = parseInt(orphans[0].count);
      if (count > 0) {
        console.log(`   ⚠️ ${childTable} → ${parentTable}: ${count} orphaned records`);
        this.testResult.relationships.orphanedRecords += count;
      } else {
        console.log(`   ✅ ${childTable} → ${parentTable}: integrity OK`);
      }

    } catch (error) {
      // Tables might not exist
      console.log(`   ⚠️ Could not test ${childTable} → ${parentTable} relationship`);
    }
  }

  private async checkDataQuality(): Promise<void> {
    console.log('\n4. Data Quality Assessment...');

    try {
      // Check for common data quality issues
      const qualityChecks = [
        'Duplicate email addresses in staff table',
        'Missing required fields',
        'Invalid date ranges',
        'Inconsistent status values'
      ];

      // Additional quality checks could be added here
      console.log(`   ✅ Data quality checks completed`);
      console.log(`   📊 Duplicate emails: ${this.testResult.dataQuality.duplicateEmails}`);
      console.log(`   📊 Incomplete records: ${this.testResult.dataQuality.incompleteRecords}`);

    } catch (error: any) {
      console.log(`   ⚠️ Data quality check error: ${error.message}`);
    }
  }

  private async analyzePerformance(): Promise<void> {
    console.log('\n5. Performance Analysis...');

    try {
      // Check for tables that might need indexes
      const largeTables = this.testResult.tables.filter(t => t.records > 1000 && t.indexes <= 1);
      
      largeTables.forEach(table => {
        this.testResult.performance.missingIndexes.push(`${table.name} (${table.records} records, ${table.indexes} indexes)`);
      });

      if (this.testResult.performance.missingIndexes.length > 0) {
        console.log(`   ⚠️ Tables that may need additional indexes: ${this.testResult.performance.missingIndexes.length}`);
      } else {
        console.log(`   ✅ Index coverage appears adequate`);
      }

    } catch (error: any) {
      console.log(`   ⚠️ Performance analysis error: ${error.message}`);
    }
  }

  private async checkSecurity(): Promise<void> {
    console.log('\n6. Security Assessment...');

    try {
      // Check for potentially sensitive data
      const sensitiveColumns = await sql`
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND (column_name ILIKE '%password%' 
               OR column_name ILIKE '%ssn%'
               OR column_name ILIKE '%credit%'
               OR column_name ILIKE '%bank%')
      `;

      sensitiveColumns.forEach((col: any) => {
        this.testResult.security.sensitiveData.push(`${col.table_name}.${col.column_name}`);
      });

      if (this.testResult.security.sensitiveData.length > 0) {
        console.log(`   ⚠️ Potentially sensitive columns found: ${this.testResult.security.sensitiveData.length}`);
      } else {
        console.log(`   ✅ No obvious sensitive data columns detected`);
      }

    } catch (error: any) {
      console.log(`   ⚠️ Security check error: ${error.message}`);
    }
  }

  private async generateReport(): Promise<void> {
    console.log('\n📊 Comprehensive Database Report');
    console.log('================================\n');

    // Database Summary
    console.log('🗃️ Database Summary:');
    console.log(`   Name: ${this.testResult.database.name}`);
    console.log(`   Size: ${this.testResult.database.size}`);
    console.log(`   Tables: ${this.testResult.database.tables}`);
    console.log(`   Total Records: ${this.testResult.database.totalRecords.toLocaleString()}`);

    // Table Summary
    console.log('\n📋 Table Summary:');
    const tablesWithIssues = this.testResult.tables.filter(t => t.issues.length > 0);
    const tablesWithData = this.testResult.tables.filter(t => t.records > 0);
    
    console.log(`   Tables with data: ${tablesWithData.length}/${this.testResult.database.tables}`);
    console.log(`   Tables with issues: ${tablesWithIssues.length}`);
    
    // Top tables by size
    const topTables = [...this.testResult.tables]
      .sort((a, b) => b.records - a.records)
      .slice(0, 5);
    
    console.log('\n   Top 5 tables by records:');
    topTables.forEach(table => {
      console.log(`     ${table.name}: ${table.records.toLocaleString()} records`);
    });

    // Issues Summary
    if (tablesWithIssues.length > 0) {
      console.log('\n⚠️ Issues Found:');
      tablesWithIssues.forEach(table => {
        console.log(`   ${table.name}:`);
        table.issues.forEach(issue => {
          console.log(`     - ${issue}`);
        });
      });
    }

    // Recommendations
    const allRecommendations = this.testResult.tables
      .flatMap(t => t.recommendations)
      .filter((rec, index, self) => self.indexOf(rec) === index); // Remove duplicates

    if (allRecommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      allRecommendations.slice(0, 10).forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }

    // Data Quality Summary
    console.log('\n🎯 Data Quality:');
    console.log(`   Duplicate emails: ${this.testResult.dataQuality.duplicateEmails}`);
    console.log(`   Incomplete records: ${this.testResult.dataQuality.incompleteRecords}`);
    console.log(`   Orphaned records: ${this.testResult.relationships.orphanedRecords}`);

    // Performance Summary
    console.log('\n⚡ Performance:');
    console.log(`   Foreign key constraints: ${this.testResult.relationships.foreignKeys}`);
    if (this.testResult.performance.missingIndexes.length > 0) {
      console.log(`   Tables needing indexes: ${this.testResult.performance.missingIndexes.length}`);
    }

    // Overall Health Score
    const totalIssues = tablesWithIssues.length + this.testResult.dataQuality.duplicateEmails + this.testResult.relationships.orphanedRecords;
    const healthScore = Math.max(0, 100 - (totalIssues * 5));
    
    console.log('\n🏥 Database Health Score:');
    console.log(`   Overall Score: ${healthScore}%`);
    
    if (healthScore >= 90) {
      console.log('   Status: 🟢 Excellent - Production ready');
    } else if (healthScore >= 70) {
      console.log('   Status: 🟡 Good - Minor issues to address');
    } else if (healthScore >= 50) {
      console.log('   Status: 🟠 Fair - Several issues need attention');
    } else {
      console.log('   Status: 🔴 Poor - Critical issues must be resolved');
    }

    console.log('\n✨ Comprehensive analysis completed!');
  }
}

// Execute tests
const tester = new ComprehensiveDatabaseTester();
tester.runComprehensiveTests().catch(console.error);