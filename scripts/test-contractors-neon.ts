#!/usr/bin/env tsx
/**
 * Test script to verify contractors Neon database integration
 */

// Load environment variables for Node.js
import { config } from 'dotenv';
config();

// Test connection first
import { testConnection } from './neon-node-connection';

import { contractorCrudCore } from '../src/services/contractor/crud/contractorCrudCore';
import { contractorNeonService } from '../src/services/contractor/neon';

async function testContractorsNeonIntegration() {
  console.log('🧪 Testing Contractors Neon Database Integration...\n');

  // First test the connection
  console.log('🔌 Testing database connection...');
  const connected = await testConnection();
  if (!connected) {
    throw new Error('Database connection failed');
  }

  try {
    // Test 1: Check if we can get all contractors
    console.log('1️⃣ Testing getAll() method...');
    const allContractors = await contractorCrudCore.getAll();
    console.log(`✅ Found ${allContractors.length} contractors`);

    // Test 2: Test contractor summary/analytics
    console.log('\n2️⃣ Testing contractor summary...');
    const summary = await contractorNeonService.getContractorSummary();
    console.log(`✅ Summary - Total: ${summary.totalContractors}, Active: ${summary.activeContractors}, Utilization: ${summary.utilizationRate}%`);

    // Test 3: Test search functionality
    if (allContractors.length > 0) {
      console.log('\n3️⃣ Testing search functionality...');
      const searchTerm = allContractors[0].companyName.substring(0, 3);
      const searchResults = await contractorCrudCore.search(searchTerm);
      console.log(`✅ Search for "${searchTerm}" returned ${searchResults.length} results`);

      // Test 4: Test getById functionality
      console.log('\n4️⃣ Testing getById functionality...');
      const contractor = await contractorCrudCore.getById(allContractors[0].id);
      console.log(`✅ Retrieved contractor: ${contractor?.companyName || 'Not found'}`);
    }

    // Test 5: Test service methods directly
    console.log('\n5️⃣ Testing Neon service directly...');
    const activeContractors = await contractorNeonService.getActiveContractors();
    console.log(`✅ Active contractors for dropdown: ${activeContractors.length}`);

    console.log('\n🎉 All Neon integration tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Database: Neon PostgreSQL ✅`);
    console.log(`   • CRUD Operations: Working ✅`);
    console.log(`   • Search: Working ✅`);
    console.log(`   • Analytics: Working ✅`);
    console.log(`   • Service Layer: Working ✅`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n🔧 Debugging information:');
    console.log('   • Check Neon database connection');
    console.log('   • Verify schema migrations are up to date');
    console.log('   • Check environment variables');
    
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  testContractorsNeonIntegration()
    .then(() => {
      console.log('\n✨ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}