#!/usr/bin/env tsx

import { testConnection, healthCheck } from './src/lib/neon/connectionPool';

async function testDatabaseConnection() {
  console.log('🔍 Testing Neon Database Connection...\n');
  
  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const connectionTest = await testConnection();
    
    if (connectionTest.success) {
      console.log(`   ✅ Connection successful! (${connectionTest.timing}ms)`);
    } else {
      console.log(`   ❌ Connection failed: ${connectionTest.error}`);
      return;
    }
    
    // Test health check
    console.log('\n2. Running health check...');
    const healthTest = await healthCheck();
    
    if (healthTest.isHealthy) {
      console.log(`   ✅ Health check passed! (${healthTest.timing}ms)`);
      console.log(`   🕐 Last check: ${healthTest.lastCheck.toISOString()}`);
    } else {
      console.log(`   ❌ Health check failed: ${healthTest.error}`);
    }
    
    console.log('\n🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Database connection test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();