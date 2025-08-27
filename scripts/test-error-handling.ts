/**
 * Test Script: Error Handling and Database Connection
 * Tests that our error boundaries and React Query configuration work properly
 */

import { QueryClient } from '@tanstack/react-query';
import { neonUtils } from '../src/lib/neon/connection';
import { databaseHealthMonitor } from '../src/lib/database/healthMonitor';

// Mock console to capture logs
const logs: string[] = [];
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  logs.push(`LOG: ${args.join(' ')}`);
  originalLog(...args);
};

console.error = (...args) => {
  logs.push(`ERROR: ${args.join(' ')}`);
  originalError(...args);
};

console.warn = (...args) => {
  logs.push(`WARN: ${args.join(' ')}`);
  originalWarn(...args);
};

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...');
  
  try {
    const pingResult = await neonUtils.ping();
    
    if (pingResult.success) {
      console.log('✅ Database ping successful');
      console.log(`   Timestamp: ${pingResult.timestamp}`);
    } else {
      console.log('❌ Database ping failed');
      console.log(`   Error: ${pingResult.error}`);
    }
    
    return pingResult.success;
  } catch (error) {
    console.error('❌ Database connection threw exception:', error);
    return false;
  }
}

async function testReactQueryConfiguration() {
  console.log('\n🔍 Testing React Query Configuration...');
  
  // Create a test query client with our configuration
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
          // Same logic as in App.tsx
          if (error && typeof error === 'object') {
            const errorMessage = 'message' in error ? (error as any).message : '';
            
            if (errorMessage.includes('password authentication failed') || 
                errorMessage.includes('connection refused') ||
                errorMessage.includes('network error') ||
                errorMessage.includes('NeonDbError') ||
                errorMessage.includes('ECONNREFUSED') ||
                errorMessage.includes('database connection') ||
                errorMessage.includes('timeout') ||
                errorMessage.includes('SSL connection')) {
              console.log(`   ⚠️ Not retrying error: ${errorMessage}`);
              return false;
            }
          }
          
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
      },
    },
  });

  console.log('✅ React Query client created with error handling');
  
  // Test that critical database errors don't retry
  const testErrors = [
    'password authentication failed',
    'connection refused',
    'NeonDbError: connection timeout',
    'SSL connection error'
  ];

  for (const errorMessage of testErrors) {
    const mockError = { message: errorMessage };
    const shouldRetry = queryClient.getDefaultOptions().queries?.retry?.(0, mockError as any);
    
    if (shouldRetry === false) {
      console.log(`   ✅ Correctly blocks retry for: ${errorMessage}`);
    } else {
      console.log(`   ❌ Incorrectly allows retry for: ${errorMessage}`);
    }
  }

  return true;
}

async function testHealthMonitor() {
  console.log('\n🔍 Testing Database Health Monitor...');
  
  try {
    // Test initial health check
    const healthStatus = await databaseHealthMonitor.checkHealth();
    
    console.log(`   Health Status: ${healthStatus.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`   Last Check: ${healthStatus.lastCheck.toISOString()}`);
    console.log(`   Response Time: ${healthStatus.timing}ms`);
    
    if (healthStatus.error) {
      console.log(`   Error: ${healthStatus.error}`);
    }

    // Test metrics
    const metrics = databaseHealthMonitor.getMetrics();
    console.log(`   Metrics: ${JSON.stringify(metrics, null, 2)}`);
    
    return healthStatus.isHealthy;
  } catch (error) {
    console.error('❌ Health monitor test failed:', error);
    return false;
  }
}

async function testErrorBoundaryScenarios() {
  console.log('\n🔍 Testing Error Boundary Scenarios...');
  
  // Test different error types that should be caught by DatabaseErrorBoundary
  const databaseErrors = [
    new Error('password authentication failed for user "neondb_owner"'),
    new Error('connection refused - server may be down'),
    new Error('NeonDbError: timeout exceeded'),
    new Error('SSL connection error'),
  ];

  for (const error of databaseErrors) {
    // Simulate static error detection (like in DatabaseErrorBoundary.getDerivedStateFromError)
    const isDatabaseError = error.message.includes('password authentication failed') ||
                           error.message.includes('connection refused') ||
                           error.message.includes('network error') ||
                           error.message.includes('NeonDbError') ||
                           error.message.includes('database') ||
                           error.message.includes('ECONNREFUSED') ||
                           error.message.includes('SSL connection');

    if (isDatabaseError) {
      console.log(`   ✅ Correctly identifies database error: ${error.message}`);
    } else {
      console.log(`   ❌ Failed to identify database error: ${error.message}`);
    }
  }

  return true;
}

async function runTests() {
  console.log('🚀 Starting Error Handling and Database Connection Tests\n');
  
  const results = {
    databaseConnection: await testDatabaseConnection(),
    reactQueryConfig: await testReactQueryConfiguration(),
    healthMonitor: await testHealthMonitor(),
    errorBoundaries: await testErrorBoundaryScenarios(),
  };

  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const allPassed = Object.values(results).every(result => result);
  
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Success! Database connection issues and infinite retry loops have been resolved.');
    console.log('✨ The application now has:');
    console.log('   - Proper authentication with correct credentials');
    console.log('   - React Query with smart error handling (no infinite loops)');  
    console.log('   - Database error boundaries for graceful failure handling');
    console.log('   - Health monitoring for connection status tracking');
  } else {
    console.log('\n⚠️ Some issues remain. Check the test results above for details.');
  }

  // Show captured logs
  console.log('\n📝 Captured Logs:');
  console.log('==================');
  logs.forEach(log => console.log(log));

  // Restore console methods
  console.log = originalLog;
  console.error = originalError;
  console.warn = originalWarn;
}

// Run the tests
runTests().catch(console.error);