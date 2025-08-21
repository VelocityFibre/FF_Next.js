/**
 * Neon Database Setup Script
 * Creates tables and initial data
 */

import { neonDb, neonUtils } from '../src/lib/neon/connection';
import { 
  projectAnalytics, 
  clientAnalytics, 
  kpiMetrics, 
  auditLog,
  staffPerformance,
  materialUsage,
  financialTransactions,
  reportCache
} from '../src/lib/neon/schema';

async function setupDatabase() {
  console.log('🚀 Setting up Neon database...');

  try {
    // Test connection
    console.log('📡 Testing connection...');
    const pingResult = await neonUtils.ping();
    
    if (!pingResult.success) {
      throw new Error(`Connection failed: ${pingResult.error}`);
    }
    
    console.log('✅ Connection successful:', pingResult.timestamp);

    // Get database info
    const dbInfo = await neonUtils.getInfo();
    console.log('📊 Database info:', dbInfo);

    // The tables are automatically created by Drizzle migrations
    // This script can be used for initial data setup or validation

    console.log('🎯 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the sync service to populate data from Firebase');
    console.log('2. Set up scheduled sync jobs');
    console.log('3. Configure analytics dashboards');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Additional utility functions
export async function validateSchema() {
  console.log('🔍 Validating database schema...');
  
  try {
    const tables = await neonUtils.getTableStats();
    console.log('📊 Available tables:', tables.map(t => t.tablename));
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found. Run database migrations first.');
      return false;
    }
    
    const expectedTables = [
      'project_analytics',
      'client_analytics', 
      'kpi_metrics',
      'audit_log',
      'staff_performance',
      'material_usage',
      'financial_transactions',
      'report_cache'
    ];
    
    const existingTables = tables.map(t => t.tablename);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('⚠️  Missing tables:', missingTables);
      return false;
    }
    
    console.log('✅ Schema validation passed');
    return true;
    
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    return false;
  }
}

export async function seedSampleData() {
  console.log('🌱 Seeding sample data...');
  
  try {
    // Sample project analytics
    await neonDb.insert(projectAnalytics).values([
      {
        projectId: 'sample-project-1',
        projectName: 'Sample Fiber Installation Project',
        clientId: 'sample-client-1',
        clientName: 'Sample Client Corp',
        totalPoles: 100,
        completedPoles: 75,
        totalDrops: 400,
        completedDrops: 300,
        totalBudget: '500000',
        spentBudget: '375000',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        completionPercentage: '75.00',
        onTimeDelivery: true,
        qualityScore: '90.00',
      }
    ]);
    
    // Sample client analytics
    await neonDb.insert(clientAnalytics).values([
      {
        clientId: 'sample-client-1',
        clientName: 'Sample Client Corp',
        totalProjects: 3,
        activeProjects: 1,
        completedProjects: 2,
        totalRevenue: '1500000',
        outstandingBalance: '50000',
        averageProjectValue: '500000',
        paymentScore: '85.00',
        averageProjectDuration: 180,
        onTimeCompletionRate: '90.00',
        satisfactionScore: '95.00',
        clientCategory: 'Premium',
        lifetimeValue: '2000000',
      }
    ]);
    
    // Sample KPI metrics
    await neonDb.insert(kpiMetrics).values([
      {
        projectId: 'sample-project-1',
        metricType: 'productivity',
        metricName: 'Poles Installed per Day',
        metricValue: '8.5',
        unit: 'poles/day',
        recordedDate: new Date(),
        weekNumber: 33,
        monthNumber: 8,
        year: 2024,
      },
      {
        projectId: 'sample-project-1',
        metricType: 'quality',
        metricName: 'Defect Rate',
        metricValue: '2.1',
        unit: '%',
        recordedDate: new Date(),
        weekNumber: 33,
        monthNumber: 8,
        year: 2024,
      }
    ]);
    
    console.log('✅ Sample data seeded successfully');
    
  } catch (error) {
    console.error('❌ Failed to seed sample data:', error);
    throw error;
  }
}

export async function cleanupDatabase() {
  console.log('🧹 Cleaning up database...');
  
  try {
    // Clear sample data (be careful with this in production!)
    const tables = [
      projectAnalytics,
      clientAnalytics,
      kpiMetrics,
      auditLog,
      staffPerformance,
      materialUsage,
      financialTransactions,
      reportCache
    ];
    
    for (const table of tables) {
      try {
        await neonDb.delete(table);
        console.log(`✅ Cleared table: ${table}`);
      } catch (error) {
        console.warn(`⚠️  Could not clear table ${table}:`, error);
      }
    }
    
    console.log('✅ Database cleanup completed');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    throw error;
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'setup':
      setupDatabase();
      break;
    case 'validate':
      validateSchema();
      break;
    case 'seed':
      seedSampleData();
      break;
    case 'cleanup':
      cleanupDatabase();
      break;
    default:
      console.log('Available commands:');
      console.log('  setup    - Set up database and test connection');
      console.log('  validate - Validate database schema');
      console.log('  seed     - Add sample data');
      console.log('  cleanup  - Remove all data (dangerous!)');
      break;
  }
}

export default setupDatabase;