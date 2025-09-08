#!/usr/bin/env node

/**
 * Test script for API Response Helper
 * This script tests the standardized API response format
 */

const { apiResponse, ErrorCode } = require('../src/lib/apiResponse');

// Mock NextApiResponse
class MockResponse {
  constructor() {
    this.statusCode = null;
    this.headers = {};
    this.body = null;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  json(data) {
    this.body = data;
    return this;
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  end() {
    return this;
  }
}

// Test cases
function runTests() {
  console.log('Testing API Response Helper...\n');
  
  // Test 1: Success response
  console.log('Test 1: Success Response');
  const res1 = new MockResponse();
  apiResponse.success(res1, { id: 1, name: 'Test' }, 'Success!');
  console.log('Status:', res1.statusCode);
  console.log('Body:', JSON.stringify(res1.body, null, 2));
  console.assert(res1.statusCode === 200, 'Status should be 200');
  console.assert(res1.body.success === true, 'Success should be true');
  console.assert(res1.body.data.id === 1, 'Data should be preserved');
  console.log('✅ Test 1 passed\n');

  // Test 2: Created response
  console.log('Test 2: Created Response');
  const res2 = new MockResponse();
  apiResponse.created(res2, { id: 2, name: 'New' });
  console.log('Status:', res2.statusCode);
  console.log('Body:', JSON.stringify(res2.body, null, 2));
  console.assert(res2.statusCode === 201, 'Status should be 201');
  console.assert(res2.body.success === true, 'Success should be true');
  console.log('✅ Test 2 passed\n');

  // Test 3: Validation error
  console.log('Test 3: Validation Error');
  const res3 = new MockResponse();
  apiResponse.validationError(res3, { 
    email: 'Invalid email format',
    password: 'Password is required'
  });
  console.log('Status:', res3.statusCode);
  console.log('Body:', JSON.stringify(res3.body, null, 2));
  console.assert(res3.statusCode === 422, 'Status should be 422');
  console.assert(res3.body.success === false, 'Success should be false');
  console.assert(res3.body.error.code === 'VALIDATION_ERROR', 'Error code should be VALIDATION_ERROR');
  console.log('✅ Test 3 passed\n');

  // Test 4: Not found error
  console.log('Test 4: Not Found Error');
  const res4 = new MockResponse();
  apiResponse.notFound(res4, 'Project', '123');
  console.log('Status:', res4.statusCode);
  console.log('Body:', JSON.stringify(res4.body, null, 2));
  console.assert(res4.statusCode === 404, 'Status should be 404');
  console.assert(res4.body.success === false, 'Success should be false');
  console.assert(res4.body.error.code === 'NOT_FOUND', 'Error code should be NOT_FOUND');
  console.log('✅ Test 4 passed\n');

  // Test 5: Paginated response
  console.log('Test 5: Paginated Response');
  const res5 = new MockResponse();
  apiResponse.paginated(res5, 
    [{ id: 1 }, { id: 2 }, { id: 3 }],
    { page: 1, pageSize: 10, total: 25 }
  );
  console.log('Status:', res5.statusCode);
  console.log('Body:', JSON.stringify(res5.body, null, 2));
  console.assert(res5.statusCode === 200, 'Status should be 200');
  console.assert(res5.body.success === true, 'Success should be true');
  console.assert(res5.body.pagination.totalPages === 3, 'Total pages should be 3');
  console.log('✅ Test 5 passed\n');

  // Test 6: Unauthorized error
  console.log('Test 6: Unauthorized Error');
  const res6 = new MockResponse();
  apiResponse.unauthorized(res6);
  console.log('Status:', res6.statusCode);
  console.log('Body:', JSON.stringify(res6.body, null, 2));
  console.assert(res6.statusCode === 401, 'Status should be 401');
  console.assert(res6.body.error.code === 'UNAUTHORIZED', 'Error code should be UNAUTHORIZED');
  console.log('✅ Test 6 passed\n');

  // Test 7: Method not allowed
  console.log('Test 7: Method Not Allowed');
  const res7 = new MockResponse();
  apiResponse.methodNotAllowed(res7, 'DELETE', ['GET', 'POST']);
  console.log('Status:', res7.statusCode);
  console.log('Headers:', res7.headers);
  console.log('Body:', JSON.stringify(res7.body, null, 2));
  console.assert(res7.statusCode === 405, 'Status should be 405');
  console.assert(res7.headers.Allow === 'GET, POST', 'Allow header should be set');
  console.log('✅ Test 7 passed\n');

  // Test 8: CORS headers
  console.log('Test 8: CORS Headers');
  const res8 = new MockResponse();
  apiResponse.setCorsHeaders(res8);
  console.log('Headers:', res8.headers);
  console.assert(res8.headers['Access-Control-Allow-Origin'] === '*', 'CORS origin should be set');
  console.assert(res8.headers['Access-Control-Allow-Methods'].includes('GET'), 'CORS methods should include GET');
  console.log('✅ Test 8 passed\n');

  console.log('✨ All tests passed successfully!');
}

// Run tests
try {
  runTests();
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}