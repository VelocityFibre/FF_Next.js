#!/usr/bin/env node
/**
 * Test script for structured logging implementation
 * Demonstrates all logger features and validates functionality
 */

import { 
  logger, 
  apiLogger, 
  dbLogger, 
  authLogger,
  sowLogger,
  scriptLogger,
  safeLog,
  isLogLevelEnabled,
  LOG_LEVELS,
  createLogger
} from '../lib/logger';
import { createScriptRunner } from '../lib/script-logger';

const runner = createScriptRunner('test-logger');

runner.run(async () => {
  runner.log('🧪 Testing Structured Logging Implementation');
  runner.log('================================================');
  
  // Test 1: Basic logging at different levels
  runner.log('\n📝 Test 1: Basic Logging Levels');
  runner.log('--------------------------------');
  logger.fatal({ test: 'fatal' }, 'Fatal error test');
  logger.error({ test: 'error' }, 'Error test');
  logger.warn({ test: 'warn' }, 'Warning test');
  logger.info({ test: 'info' }, 'Info test');
  logger.debug({ test: 'debug' }, 'Debug test');
  logger.trace({ test: 'trace' }, 'Trace test');
  runner.success('Basic logging levels tested');
  
  // Test 2: Module-specific loggers
  runner.log('\n🎯 Test 2: Module-Specific Loggers');
  runner.log('-----------------------------------');
  apiLogger.info({ endpoint: '/api/test' }, 'API logger test');
  dbLogger.info({ query: 'SELECT * FROM users' }, 'Database logger test');
  authLogger.info({ userId: '123' }, 'Auth logger test');
  sowLogger.info({ projectId: 'proj_456' }, 'SOW logger test');
  scriptLogger.info({ script: 'test-logger' }, 'Script logger test');
  runner.success('Module-specific loggers tested');
  
  // Test 3: Sensitive data redaction
  runner.log('\n🔒 Test 3: Sensitive Data Redaction');
  runner.log('------------------------------------');
  const sensitiveData = {
    email: 'user@example.com',
    password: 'secretPassword123',
    apiKey: 'sk_live_abcdef123456',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    creditCard: '4111111111111111',
    ssn: '123-45-6789',
    normalField: 'This should be visible'
  };
  
  logger.info(sensitiveData, 'Testing sensitive data redaction');
  runner.success('Sensitive data redaction tested (check output for [REDACTED] values)');
  
  // Test 4: Error logging with stack traces
  runner.log('\n❌ Test 4: Error Logging');
  runner.log('------------------------');
  try {
    throw new Error('Test error with stack trace');
  } catch (error) {
    logger.error({ error }, 'Caught test error');
    runner.success('Error logging with stack trace tested');
  }
  
  // Test 5: Nested object logging
  runner.log('\n📦 Test 5: Complex Object Logging');
  runner.log('---------------------------------');
  const complexObject = {
    user: {
      id: 'user_123',
      name: 'John Doe',
      credentials: {
        password: 'shouldBeRedacted',
        apiKey: 'alsoShouldBeRedacted'
      }
    },
    metadata: {
      timestamp: new Date(),
      version: '1.0.0',
      environment: process.env.NODE_ENV
    },
    data: {
      items: [1, 2, 3],
      settings: {
        theme: 'dark',
        notifications: true
      }
    }
  };
  
  logger.info(complexObject, 'Complex nested object');
  runner.success('Complex object logging tested');
  
  // Test 6: Safe logging with circular references
  runner.log('\n🔄 Test 6: Circular Reference Handling');
  runner.log('--------------------------------------');
  const obj: any = { name: 'test' };
  obj.circular = obj; // Create circular reference
  
  safeLog('info', 'Object with circular reference', obj);
  runner.success('Circular reference handling tested');
  
  // Test 7: Request/Response logging simulation
  runner.log('\n🌐 Test 7: API Request/Response Simulation');
  runner.log('------------------------------------------');
  const mockRequest = {
    method: 'POST',
    url: '/api/users',
    headers: {
      'content-type': 'application/json',
      'authorization': 'Bearer secret_token_xyz',
      'user-agent': 'Mozilla/5.0'
    },
    body: {
      email: 'test@example.com',
      password: 'testPassword'
    }
  };
  
  const mockResponse = {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
      'set-cookie': 'session=abc123; HttpOnly'
    }
  };
  
  apiLogger.info({ req: mockRequest, res: mockResponse }, 'API request completed');
  runner.success('Request/Response logging tested');
  
  // Test 8: Progress tracking
  runner.log('\n📊 Test 8: Progress Tracking');
  runner.log('----------------------------');
  const progress = runner.startProgress(10, 'Processing items');
  
  for (let i = 1; i <= 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 100));
    progress.update(i, `Item ${i}`);
  }
  
  progress.complete();
  runner.success('Progress tracking tested');
  
  // Test 9: Custom child logger
  runner.log('\n👶 Test 9: Child Logger Creation');
  runner.log('--------------------------------');
  const customLogger = createLogger('custom-module');
  customLogger.info({ customField: 'test' }, 'Custom module logger');
  runner.success('Child logger creation tested');
  
  // Test 10: Log level checking
  runner.log('\n🎚️ Test 10: Log Level Checking');
  runner.log('-------------------------------');
  runner.log(`Current LOG_LEVEL: ${process.env.LOG_LEVEL || 'info'}`);
  runner.log(`Is DEBUG enabled: ${isLogLevelEnabled(LOG_LEVELS.DEBUG)}`);
  runner.log(`Is INFO enabled: ${isLogLevelEnabled(LOG_LEVELS.INFO)}`);
  runner.log(`Is WARN enabled: ${isLogLevelEnabled(LOG_LEVELS.WARN)}`);
  runner.log(`Is ERROR enabled: ${isLogLevelEnabled(LOG_LEVELS.ERROR)}`);
  runner.success('Log level checking tested');
  
  // Summary
  runner.log('\n✅ All Logger Tests Completed Successfully!');
  runner.log('============================================');
  runner.log('\nNext steps:');
  runner.log('1. Set LOG_LEVEL environment variable to control output');
  runner.log('2. Use NODE_ENV=production for JSON output');
  runner.log('3. Use NODE_ENV=development for pretty printing');
  runner.log('4. Check logs for [REDACTED] values in sensitive fields');
  
  // Demonstrate different log levels
  runner.log('\n📋 To test different log levels, run:');
  runner.log('LOG_LEVEL=debug npm run test:logger');
  runner.log('LOG_LEVEL=trace npm run test:logger');
  runner.log('LOG_LEVEL=error npm run test:logger');
});