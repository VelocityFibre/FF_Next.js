/**
 * Procurement API Service Tests - Entry Point
 * Exports all test modules for unified access
 */

// Re-export test helpers for use in other test files - resolve duplicates
export {
  createMockContext,
  mockSuccessfulAuth,
  mockBoqData,
  mockBoqItems,
  mockRfqData,
  setupMocks
} from './shared/testHelpers';

// Additional exports from main testHelpers
export {
  mockFailedProjectAccess,
  mockInsufficientPermissions,
  mockDatabaseSelect,
  mockDatabaseInsert,
  mockDatabaseError,
  teardownMocks,
  createValidBOQImportData,
  createValidRFQData,
  createInvalidRFQData
} from './testHelpers';

// Re-export the main service for testing
export { procurementApiService } from '../procurementApiService';

// Import modularized test suites
import './auth/authentication.test';
import './boq/boqCrud.test';
import './rfq/rfqOperations.test';
import './errors/errorHandling.test';
import './health/healthCheck.test';

// Import existing test suites (for backward compatibility)
import './procurementApiService.auth.test';
import './procurementApiService.boq.test';
import './procurementApiService.boq-crud.test';
import './procurementApiService.boq-analytics.test';
import './procurementApiService.rfq.test';
import './procurementApiService.rfq-crud.test';
import './procurementApiService.rfq-lifecycle.test';
import './procurementApiService.rfq-analytics.test';
import './procurementApiService.health.test';
import './procurementApiService.health-check.test';
import './procurementApiService.error-handling.test';
import './procurementApiService.performance.test';

/**
 * Test Suites Overview:
 * 
 * 1. Authentication & Authorization (procurementApiService.auth.test.ts)
 *    - User context validation
 *    - Project access control
 *    - Permission-based access control
 *    - Role-based operations
 * 
 * 2. BOQ Operations
 *    - BOQ CRUD (procurementApiService.boq-crud.test.ts): Listing, fetching, importing
 *    - BOQ Analytics (procurementApiService.boq-analytics.test.ts): Statistics, trends, reporting
 *    - Legacy BOQ (procurementApiService.boq.test.ts): Original comprehensive tests
 * 
 * 3. RFQ Operations
 *    - RFQ CRUD (procurementApiService.rfq-crud.test.ts): Creation, reading, updating
 *    - RFQ Lifecycle (procurementApiService.rfq-lifecycle.test.ts): Publishing, status management
 *    - RFQ Analytics (procurementApiService.rfq-analytics.test.ts): Statistics, supplier metrics
 *    - Legacy RFQ (procurementApiService.rfq.test.ts): Original comprehensive tests
 * 
 * 4. System Health & Performance
 *    - Health Check (procurementApiService.health-check.test.ts): Service health monitoring
 *    - Error Handling (procurementApiService.error-handling.test.ts): Database, validation errors
 *    - Performance (procurementApiService.performance.test.ts): Response times, memory usage
 *    - Legacy Health (procurementApiService.health.test.ts): Original comprehensive tests
 */