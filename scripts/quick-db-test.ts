/**
 * Quick Database Connection Test
 * Simple test to verify database connections
 */

import 'dotenv/config';
import { neonUtils } from '../src/lib/neon/connection';

async function quickTest() {
  console.log('🔍 FibreFlow Quick Database Connection Test\n');
  
  try {
    // Test Neon connection
    console.log('Testing Neon PostgreSQL connection...');
    const pingResult = await neonUtils.ping();
    
    if (pingResult.success) {
      console.log('✅ Neon PostgreSQL: Connected successfully');
      console.log(`   Timestamp: ${pingResult.timestamp}`);
      
      // Get database info
      const info = await neonUtils.getInfo();
      if (info) {
        console.log(`   Database: ${info.database_name}`);
        console.log(`   Size: ${info.database_size}`);
        console.log(`   User: ${info.user_name}`);
      }
      
      // Get table stats
      const tableStats = await neonUtils.getTableStats();
      console.log(`   Tables with data: ${tableStats.length}`);
      
      if (tableStats.length > 0) {
        console.log('   Top 5 tables by size:');
        tableStats
          .filter((table: any) => table.live_tuples > 0)
          .sort((a: any, b: any) => b.live_tuples - a.live_tuples)
          .slice(0, 5)
          .forEach((table: any) => {
            console.log(`     ${table.tablename}: ${table.live_tuples} records`);
          });
      }
      
    } else {
      console.log('❌ Neon PostgreSQL: Connection failed');
      console.log(`   Error: ${pingResult.error}`);
    }
    
  } catch (error: any) {
    console.log('❌ Test failed:', error.message);
  }

  // Test environment variables
  console.log('\n🔧 Environment Check:');
  const envVars = [
    'VITE_NEON_DATABASE_URL',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_API_KEY',
    'DATABASE_URL'
  ];
  
  envVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const display = value ? (value.length > 50 ? value.substring(0, 47) + '...' : value) : 'Not set';
    console.log(`   ${status} ${varName}: ${display}`);
  });

  console.log('\n✨ Quick test completed!');
}

quickTest().catch(console.error);