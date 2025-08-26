/**
 * FibreFlow Database Schema Validation Suite
 * Validates database schema integrity, constraints, and relationships
 */

import { neonDb, neonUtils } from '../src/lib/neon/connection';
import { sql } from 'drizzle-orm';

interface SchemaValidationResult {
  table: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  checks: {
    exists: boolean;
    columns: number;
    constraints: number;
    indexes: number;
    foreignKeys: number;
  };
  issues: string[];
  recommendations: string[];
}

interface TableConstraint {
  constraint_name: string;
  constraint_type: string;
  table_name: string;
  column_name: string;
  foreign_table_name?: string;
  foreign_column_name?: string;
}

interface TableIndex {
  index_name: string;
  table_name: string;
  column_names: string[];
  is_unique: boolean;
  is_primary: boolean;
}

class SchemaValidationSuite {
  private validationResults: SchemaValidationResult[] = [];
  
  async validateAllSchemas(): Promise<void> {
    console.log('🔍 Starting FibreFlow Schema Validation Suite\n');
    
    // Get all tables in the database
    const tables = await this.getAllTables();
    
    for (const table of tables) {
      await this.validateTable(table);
    }
    
    // Validate relationships
    await this.validateRelationships();
    
    // Generate report
    await this.generateSchemaReport();
  }

  private async getAllTables(): Promise<string[]> {
    const result = await neonUtils.rawQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    return result.map((row: any) => row.table_name);
  }

  private async validateTable(tableName: string): Promise<void> {
    console.log(`🔍 Validating table: ${tableName}`);
    
    const result: SchemaValidationResult = {
      table: tableName,
      status: 'PASS',
      checks: {
        exists: false,
        columns: 0,
        constraints: 0,
        indexes: 0,
        foreignKeys: 0
      },
      issues: [],
      recommendations: []
    };

    try {
      // Check if table exists
      const tableExists = await this.checkTableExists(tableName);
      result.checks.exists = tableExists;
      
      if (!tableExists) {
        result.status = 'FAIL';
        result.issues.push('Table does not exist');
        this.validationResults.push(result);
        return;
      }

      // Validate columns
      await this.validateColumns(tableName, result);
      
      // Validate constraints
      await this.validateConstraints(tableName, result);
      
      // Validate indexes
      await this.validateIndexes(tableName, result);
      
      // Check for common issues
      await this.checkCommonIssues(tableName, result);
      
    } catch (error: any) {
      result.status = 'FAIL';
      result.issues.push(`Validation failed: ${error.message}`);
    }

    this.validationResults.push(result);
  }

  private async checkTableExists(tableName: string): Promise<boolean> {
    const result = await neonUtils.rawQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    
    return result[0]?.exists || false;
  }

  private async validateColumns(tableName: string, result: SchemaValidationResult): Promise<void> {
    const columns = await neonUtils.rawQuery(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);

    result.checks.columns = columns.length;

    // Check for required columns
    const requiredColumns = ['id', 'created_at', 'updated_at'];
    const columnNames = columns.map((col: any) => col.column_name);
    
    for (const reqCol of requiredColumns) {
      if (tableName !== 'audit_log' && tableName !== 'report_cache') { // Skip for certain tables
        if (!columnNames.includes(reqCol)) {
          if (reqCol === 'id') {
            result.status = 'FAIL';
            result.issues.push(`Missing primary key column: ${reqCol}`);
          } else {
            result.status = 'WARN';
            result.issues.push(`Missing audit column: ${reqCol}`);
            result.recommendations.push(`Consider adding ${reqCol} for audit trail`);
          }
        }
      }
    }

    // Check for UUID primary keys
    const idColumn = columns.find((col: any) => col.column_name === 'id');
    if (idColumn && idColumn.data_type !== 'uuid' && !idColumn.data_type.includes('serial')) {
      result.recommendations.push('Consider using UUID for primary key for better scalability');
    }

    // Check for nullable issues
    const criticalColumns = ['name', 'email', 'status'];
    columns.forEach((col: any) => {
      if (criticalColumns.some(crit => col.column_name.includes(crit)) && col.is_nullable === 'YES') {
        result.recommendations.push(`Consider making ${col.column_name} NOT NULL`);
      }
    });
  }

  private async validateConstraints(tableName: string, result: SchemaValidationResult): Promise<void> {
    const constraints = await neonUtils.rawQuery(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_schema = 'public'
      AND tc.table_name = $1;
    `, [tableName]);

    result.checks.constraints = constraints.length;

    const constraintTypes = constraints.reduce((acc: any, constraint: any) => {
      acc[constraint.constraint_type] = (acc[constraint.constraint_type] || 0) + 1;
      return acc;
    }, {});

    // Check for primary key
    if (!constraintTypes['PRIMARY KEY']) {
      result.status = 'FAIL';
      result.issues.push('Missing primary key constraint');
    }

    // Count foreign keys
    result.checks.foreignKeys = constraintTypes['FOREIGN KEY'] || 0;

    // Check for check constraints on status fields
    const statusColumns = constraints.filter((c: any) => 
      c.column_name && c.column_name.toLowerCase().includes('status')
    );
    
    if (statusColumns.length > 0) {
      const checkConstraints = constraints.filter((c: any) => c.constraint_type === 'CHECK');
      if (checkConstraints.length === 0) {
        result.recommendations.push('Consider adding CHECK constraints for status fields');
      }
    }
  }

  private async validateIndexes(tableName: string, result: SchemaValidationResult): Promise<void> {
    const indexes = await neonUtils.rawQuery(`
      SELECT 
        i.relname AS index_name,
        a.attname AS column_name,
        ix.indisunique AS is_unique,
        ix.indisprimary AS is_primary
      FROM pg_class t,
           pg_class i,
           pg_index ix,
           pg_attribute a
      WHERE t.oid = ix.indrelid
      AND i.oid = ix.indexrelid
      AND a.attrelid = t.oid
      AND a.attnum = ANY(ix.indkey)
      AND t.relkind = 'r'
      AND t.relname = $1
      ORDER BY i.relname, a.attname;
    `, [tableName]);

    result.checks.indexes = [...new Set(indexes.map((idx: any) => idx.index_name))].length;

    // Check for recommended indexes
    const columns = await neonUtils.rawQuery(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = $1;
    `, [tableName]);

    const columnNames = columns.map((col: any) => col.column_name);
    const indexedColumns = indexes.map((idx: any) => idx.column_name);
    
    // Recommend indexes for common query patterns
    const recommendedIndexes = ['status', 'created_at', 'project_id', 'client_id', 'email'];
    
    recommendedIndexes.forEach(col => {
      if (columnNames.includes(col) && !indexedColumns.includes(col)) {
        result.recommendations.push(`Consider adding index on ${col} for query performance`);
      }
    });
  }

  private async checkCommonIssues(tableName: string, result: SchemaValidationResult): Promise<void> {
    try {
      // Check for empty tables
      const rowCount = await neonUtils.rawQuery(`
        SELECT COUNT(*) as count FROM ${tableName};
      `);
      
      const count = parseInt(rowCount[0]?.count || '0');
      
      if (count === 0) {
        result.recommendations.push('Table is empty - consider adding sample data for testing');
      }

      // Check for large tables without partitioning
      if (count > 1000000) {
        result.recommendations.push('Large table - consider partitioning for performance');
      }

      // Check for potential data quality issues
      if (tableName === 'staff') {
        const duplicateEmails = await neonUtils.rawQuery(`
          SELECT email, COUNT(*) as count 
          FROM staff 
          GROUP BY email 
          HAVING COUNT(*) > 1;
        `);
        
        if (duplicateEmails.length > 0) {
          result.issues.push(`Found ${duplicateEmails.length} duplicate email addresses`);
          result.status = 'WARN';
        }
      }

      if (tableName === 'contractors') {
        const duplicateRegNumbers = await neonUtils.rawQuery(`
          SELECT registration_number, COUNT(*) as count 
          FROM contractors 
          WHERE registration_number IS NOT NULL
          GROUP BY registration_number 
          HAVING COUNT(*) > 1;
        `);
        
        if (duplicateRegNumbers.length > 0) {
          result.issues.push(`Found ${duplicateRegNumbers.length} duplicate registration numbers`);
          result.status = 'WARN';
        }
      }

    } catch (error: any) {
      result.recommendations.push(`Could not perform data quality checks: ${error.message}`);
    }
  }

  private async validateRelationships(): Promise<void> {
    console.log('\n🔗 Validating database relationships...');
    
    try {
      // Check referential integrity
      const foreignKeys = await neonUtils.rawQuery(`
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public';
      `);

      console.log(`Found ${foreignKeys.length} foreign key relationships`);

      // Test a few key relationships
      const keyRelationships = [
        { parent: 'clients', child: 'projects', fk: 'client_id' },
        { parent: 'staff', child: 'projects', fk: 'project_manager_id' },
        { parent: 'contractors', child: 'project_assignments', fk: 'contractor_id' },
        { parent: 'boqs', child: 'boq_items', fk: 'boq_id' }
      ];

      for (const rel of keyRelationships) {
        await this.testRelationshipIntegrity(rel.parent, rel.child, rel.fk);
      }

    } catch (error: any) {
      console.log(`❌ Relationship validation failed: ${error.message}`);
    }
  }

  private async testRelationshipIntegrity(parentTable: string, childTable: string, foreignKey: string): Promise<void> {
    try {
      const orphanedRecords = await neonUtils.rawQuery(`
        SELECT COUNT(*) as count
        FROM ${childTable} c
        LEFT JOIN ${parentTable} p ON c.${foreignKey} = p.id
        WHERE c.${foreignKey} IS NOT NULL 
        AND p.id IS NULL;
      `);

      const count = parseInt(orphanedRecords[0]?.count || '0');
      
      if (count > 0) {
        console.log(`⚠️ Found ${count} orphaned records in ${childTable} referencing ${parentTable}`);
      } else {
        console.log(`✅ ${childTable} → ${parentTable} relationship integrity OK`);
      }

    } catch (error: any) {
      console.log(`❌ Could not test ${childTable} → ${parentTable} relationship: ${error.message}`);
    }
  }

  private async generateSchemaReport(): Promise<void> {
    console.log('\n📊 FibreFlow Schema Validation Report');
    console.log('====================================');

    const summary = {
      totalTables: this.validationResults.length,
      passed: this.validationResults.filter(r => r.status === 'PASS').length,
      failed: this.validationResults.filter(r => r.status === 'FAIL').length,
      warnings: this.validationResults.filter(r => r.status === 'WARN').length,
      totalColumns: this.validationResults.reduce((sum, r) => sum + r.checks.columns, 0),
      totalConstraints: this.validationResults.reduce((sum, r) => sum + r.checks.constraints, 0),
      totalIndexes: this.validationResults.reduce((sum, r) => sum + r.checks.indexes, 0),
      totalForeignKeys: this.validationResults.reduce((sum, r) => sum + r.checks.foreignKeys, 0)
    };

    console.log(`\n📈 Summary:`);
    console.log(`  Total Tables: ${summary.totalTables}`);
    console.log(`  ✅ Passed: ${summary.passed}`);
    console.log(`  ❌ Failed: ${summary.failed}`);
    console.log(`  ⚠️ Warnings: ${summary.warnings}`);
    console.log(`  📊 Total Columns: ${summary.totalColumns}`);
    console.log(`  🔗 Total Constraints: ${summary.totalConstraints}`);
    console.log(`  📇 Total Indexes: ${summary.totalIndexes}`);
    console.log(`  🔑 Total Foreign Keys: ${summary.totalForeignKeys}`);

    console.log(`\n📋 Table Details:`);
    this.validationResults.forEach(result => {
      const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`  ${statusIcon} ${result.table}`);
      console.log(`     Columns: ${result.checks.columns}, Constraints: ${result.checks.constraints}, Indexes: ${result.checks.indexes}`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`     🔍 Issue: ${issue}`);
        });
      }
      
      if (result.recommendations.length > 0) {
        result.recommendations.slice(0, 2).forEach(rec => { // Limit recommendations
          console.log(`     💡 Recommendation: ${rec}`);
        });
      }
    });

    // Critical Issues
    const criticalIssues = this.validationResults.filter(r => r.status === 'FAIL');
    if (criticalIssues.length > 0) {
      console.log(`\n🚨 Critical Issues:`);
      criticalIssues.forEach(result => {
        console.log(`  ❌ ${result.table}:`);
        result.issues.forEach(issue => {
          console.log(`     - ${issue}`);
        });
      });
    }

    // Top Recommendations
    const allRecommendations = this.validationResults
      .flatMap(r => r.recommendations)
      .reduce((acc: any, rec: string) => {
        acc[rec] = (acc[rec] || 0) + 1;
        return acc;
      }, {});

    const topRecommendations = Object.entries(allRecommendations)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 5);

    if (topRecommendations.length > 0) {
      console.log(`\n💡 Top Recommendations:`);
      topRecommendations.forEach(([rec, count]: any) => {
        console.log(`  ${count}x ${rec}`);
      });
    }

    // Overall Assessment
    console.log(`\n🎯 Overall Assessment:`);
    if (summary.failed === 0) {
      console.log(`  ✅ Schema validation passed! Database structure is solid.`);
    } else {
      console.log(`  ❌ ${summary.failed} critical issues need to be resolved.`);
    }
    
    if (summary.warnings > 0) {
      console.log(`  ⚠️ ${summary.warnings} tables have recommendations for improvement.`);
    }

    const healthScore = Math.round(((summary.passed + summary.warnings * 0.5) / summary.totalTables) * 100);
    console.log(`  📊 Schema Health Score: ${healthScore}%`);
  }
}

// Execute validation if run directly
if (require.main === module) {
  const validator = new SchemaValidationSuite();
  validator.validateAllSchemas().catch(console.error);
}

export { SchemaValidationSuite };