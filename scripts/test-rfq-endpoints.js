#!/usr/bin/env node

/**
 * Test script for RFQ API endpoints
 * Verifies that all RFQ endpoints are working correctly
 */

const API_BASE = 'http://localhost:3005/api';

// Test data
const testProjectId = 'test-project-123';
const testRFQ = {
  projectId: testProjectId,
  title: 'Test RFQ for Materials',
  description: 'Testing RFQ endpoints migration to Neon',
  supplierIds: ['supplier-1', 'supplier-2'],
  responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  paymentTerms: 'Net 30 days',
  deliveryTerms: 'FOB Destination',
  currency: 'ZAR',
  totalBudgetEstimate: 100000,
  items: [
    {
      description: 'Fiber optic cable',
      quantity: 1000,
      unit: 'meters',
      specifications: '12-core single mode',
      estimatedUnitPrice: 50
    },
    {
      description: 'Connectors',
      quantity: 100,
      unit: 'pieces',
      specifications: 'SC/APC type',
      estimatedUnitPrice: 10
    }
  ]
};

async function testEndpoint(method, endpoint, body = null, description = '') {
  console.log(`\n📝 Testing: ${description || endpoint}`);
  console.log(`   Method: ${method}`);
  console.log(`   URL: ${API_BASE}${endpoint}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
      console.log(`   Body: ${JSON.stringify(body, null, 2).substring(0, 200)}...`);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Success (${response.status})`);
      console.log(`   Response: ${JSON.stringify(data, null, 2).substring(0, 300)}...`);
      return { success: true, data };
    } else {
      console.log(`   ❌ Failed (${response.status})`);
      console.log(`   Error: ${JSON.stringify(data, null, 2)}`);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('🚀 RFQ API Endpoint Tests');
  console.log('='.repeat(60));
  
  let createdRFQId = null;
  let testResults = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Test 1: Get all RFQs
  const test1 = await testEndpoint('GET', '/procurement/rfq', null, 'Get all RFQs');
  testResults.tests.push({ name: 'Get all RFQs', ...test1 });
  if (test1.success) testResults.passed++; else testResults.failed++;
  
  // Test 2: Create new RFQ
  const test2 = await testEndpoint('POST', '/procurement/rfq', testRFQ, 'Create new RFQ');
  testResults.tests.push({ name: 'Create new RFQ', ...test2 });
  if (test2.success) {
    testResults.passed++;
    createdRFQId = test2.data.data?.id || test2.data.id;
    console.log(`   📌 Created RFQ ID: ${createdRFQId}`);
  } else {
    testResults.failed++;
  }
  
  // Test 3: Get RFQ by ID (if created)
  if (createdRFQId) {
    const test3 = await testEndpoint('GET', `/procurement/rfq/${createdRFQId}`, null, 'Get RFQ by ID');
    testResults.tests.push({ name: 'Get RFQ by ID', ...test3 });
    if (test3.success) testResults.passed++; else testResults.failed++;
    
    // Test 4: Update RFQ
    const updateData = {
      title: 'Updated Test RFQ',
      description: 'Updated description for testing'
    };
    const test4 = await testEndpoint('PUT', `/procurement/rfq/${createdRFQId}`, updateData, 'Update RFQ');
    testResults.tests.push({ name: 'Update RFQ', ...test4 });
    if (test4.success) testResults.passed++; else testResults.failed++;
    
    // Test 5: Submit response
    const responseData = {
      supplierId: 'supplier-1',
      supplierName: 'Test Supplier Co.',
      totalAmount: 95000,
      currency: 'ZAR',
      paymentTerms: 'Net 45 days',
      deliveryTerms: 'Ex Works',
      deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          rfqItemId: 'item-1',
          unitPrice: 48,
          totalPrice: 48000,
          deliveryDays: 10
        }
      ]
    };
    const test5 = await testEndpoint('POST', `/procurement/rfq/${createdRFQId}/response`, responseData, 'Submit RFQ response');
    testResults.tests.push({ name: 'Submit RFQ response', ...test5 });
    if (test5.success) testResults.passed++; else testResults.failed++;
    
    // Test 6: Get RFQ responses
    const test6 = await testEndpoint('GET', `/procurement/rfq/${createdRFQId}/responses`, null, 'Get RFQ responses');
    testResults.tests.push({ name: 'Get RFQ responses', ...test6 });
    if (test6.success) testResults.passed++; else testResults.failed++;
  }
  
  // Test 7: Get RFQs by project
  const test7 = await testEndpoint('GET', `/procurement/rfq?projectId=${testProjectId}`, null, 'Get RFQs by project');
  testResults.tests.push({ name: 'Get RFQs by project', ...test7 });
  if (test7.success) testResults.passed++; else testResults.failed++;
  
  // Test 8: Test BOQ endpoint
  const test8 = await testEndpoint('GET', '/procurement/boq', null, 'Get all BOQs');
  testResults.tests.push({ name: 'Get all BOQs', ...test8 });
  if (test8.success) testResults.passed++; else testResults.failed++;
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  // Detailed results
  console.log('\n📋 Detailed Results:');
  testResults.tests.forEach((test, index) => {
    const status = test.success ? '✅' : '❌';
    console.log(`   ${index + 1}. ${status} ${test.name}`);
  });
  
  // Exit code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (response.ok) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   npm run build && PORT=3005 npm start');
    return false;
  }
}

// Main execution
(async () => {
  console.log('🔍 Checking server status...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await runTests();
})();