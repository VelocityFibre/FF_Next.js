/**
 * Procurement API Service - Health Check and Error Handling Tests
 * Tests for system health monitoring and error scenarios
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { procurementApiService } from '../procurementApiService';
import {
  createMockContext,
  setupMocks,
  teardownMocks,
  mockDatabaseSelect,
  mockDatabaseError
} from './testHelpers';

describe('ProcurementApiService - Health Check & Error Handling', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    teardownMocks();
  });

  describe('Health Check', () => {
    it('should return healthy status when database is accessible', async () => {
      mockDatabaseSelect([{ count: 1 }]);

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('healthy');
      expect(result.data?.details?.database).toBe('connected');
    });

    it('should return unhealthy status when database is not accessible', async () => {
      mockDatabaseError('Connection failed');

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('unhealthy');
      expect(result.data?.details?.error).toBe('Connection failed');
    });

    it('should include service version in health check', async () => {
      mockDatabaseSelect([{ count: 1 }]);

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.version).toBeDefined();
      expect(result.data?.timestamp).toBeDefined();
    });

    it('should check middleware health', async () => {
      mockDatabaseSelect([{ count: 1 }]);

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.details?.middleware).toBeDefined();
    });

    it('should report response time metrics', async () => {
      mockDatabaseSelect([{ count: 1 }]);

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.responseTime).toBeDefined();
      expect(typeof result.data?.responseTime).toBe('number');
    });
  });

  describe('Database Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      mockDatabaseError('Database connection failed');

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');
      expect(result.code).toBe('DATABASE_ERROR');
    });

    it('should handle timeout errors', async () => {
      mockDatabaseError('Connection timeout');

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection timeout');
      expect(result.code).toBe('DATABASE_ERROR');
    });

    it('should handle constraint violation errors', async () => {
      mockDatabaseError('Unique constraint violation');

      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = {
        fileName: 'test.xlsx',
        fileSize: 1000,
        version: 'v1.0',
        title: 'Test',
        rows: []
      };

      const result = await procurementApiService.importBOQ(context, importData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unique constraint violation');
    });

    it('should handle transaction rollback errors', async () => {
      mockDatabaseError('Transaction rollback failed');

      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = {
        fileName: 'test.xlsx',
        fileSize: 1000,
        version: 'v1.0',
        title: 'Test',
        rows: [{ lineNumber: 1, description: 'Test', quantity: 1, uom: 'pcs', unitPrice: 10 }]
      };

      const result = await procurementApiService.importBOQ(context, importData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Transaction rollback failed');
    });
  });

  describe('Validation Error Handling', () => {
    it('should handle null/undefined data properly', async () => {
      const context = createMockContext();
      const result = await procurementApiService.importBOQ(context, null);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid BOQ import data');
      expect(result.code).toBe('VALIDATION_ERROR');
    });

    it('should handle malformed data structures', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const malformedData = {
        fileName: 123, // Should be string
        rows: 'not-an-array' // Should be array
      };

      const result = await procurementApiService.importBOQ(context, malformedData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid BOQ import data');
    });

    it('should handle missing required fields', async () => {
      const context = createMockContext({ permissions: ['rfq:create'] });
      const incompleteRfq = {
        // Missing title
        description: 'Test description'
      };

      const result = await procurementApiService.createRFQ(context, incompleteRfq);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid RFQ data');
    });

    it('should validate data type constraints', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const invalidTypeData = {
        fileName: 'test.xlsx',
        fileSize: 'not-a-number',
        version: 'v1.0',
        title: 'Test',
        rows: [{
          lineNumber: 'not-a-number',
          description: 'Test',
          quantity: 'not-a-number',
          uom: 'pcs',
          unitPrice: 'not-a-number'
        }]
      };

      const result = await procurementApiService.importBOQ(context, invalidTypeData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid data types');
    });
  });

  describe('Network and External Service Errors', () => {
    it('should handle external service timeouts', async () => {
      // Mock external service call that times out
      const context = createMockContext();
      
      // This would mock an actual external service call
      const result = await procurementApiService.validateSuppliers(context, ['external-supplier-id']);

      // Should handle timeout gracefully
      expect(result.success).toBe(false);
      expect(result.error).toContain('External service timeout');
    });

    it('should handle rate limiting errors', async () => {
      // Mock rate limiting response
      const context = createMockContext();
      
      const result = await procurementApiService.getBOQs(context, { page: 1000 });

      // Should handle rate limiting
      expect(result.success).toBe(false);
      expect(result.error).toContain('Rate limit exceeded');
    });
  });

  describe('Memory and Resource Management', () => {
    it('should handle large dataset operations gracefully', async () => {
      const context = createMockContext();
      const largeFilters = {
        page: 1,
        limit: 100000 // Very large limit
      };

      const result = await procurementApiService.getBOQs(context, largeFilters);

      // Should either succeed with reasonable limits or fail gracefully
      if (!result.success) {
        expect(result.error).toContain('Limit exceeded');
      } else {
        expect(result.data?.limit).toBeLessThanOrEqual(1000); // Should enforce max limit
      }
    });

    it('should handle concurrent operation limits', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = {
        fileName: 'concurrent-test.xlsx',
        fileSize: 1000,
        version: 'v1.0',
        title: 'Concurrent Test',
        rows: []
      };

      // Simulate multiple concurrent imports
      const promises = Array(10).fill(null).map(() => 
        procurementApiService.importBOQ(context, importData)
      );

      const results = await Promise.all(promises);
      
      // Should handle concurrency gracefully
      const failures = results.filter(r => !r.success);
      expect(failures.some(f => f.error?.includes('concurrency'))).toBe(true);
    });
  });

  describe('Recovery and Resilience', () => {
    it('should implement circuit breaker pattern', async () => {
      // Mock multiple consecutive failures
      mockDatabaseError('Service unavailable');

      const context = createMockContext();
      
      // Multiple failed requests should trigger circuit breaker
      for (let i = 0; i < 5; i++) {
        await procurementApiService.getBOQs(context);
      }

      const result = await procurementApiService.getBOQs(context);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Circuit breaker');
    });

    it('should provide fallback responses when appropriate', async () => {
      mockDatabaseError('Database unavailable');

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true); // Health check should still respond
      expect(result.data?.status).toBe('unhealthy');
      expect(result.data?.fallbackMode).toBe(true);
    });

    it('should log critical errors appropriately', async () => {
      mockDatabaseError('Critical database failure');

      const context = createMockContext();
      await procurementApiService.getBOQs(context);

      // Should log critical errors (mocked audit logger should be called)
      expect(require('../auditLogger').auditLogger.logError).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'critical',
          error: 'Critical database failure'
        })
      );
    });
  });

  describe('Performance Monitoring', () => {
    it('should track operation response times', async () => {
      mockDatabaseSelect([]);

      const context = createMockContext();
      const startTime = Date.now();
      
      await procurementApiService.getBOQs(context);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should monitor memory usage for large operations', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const largeImportData = {
        fileName: 'large-import.xlsx',
        fileSize: 100 * 1024 * 1024, // 100MB
        version: 'v1.0',
        title: 'Large Import',
        rows: Array(50000).fill({
          lineNumber: 1,
          description: 'Test item',
          quantity: 100,
          uom: 'pcs',
          unitPrice: 10.50
        })
      };

      const initialMemory = process.memoryUsage().heapUsed;
      await procurementApiService.importBOQ(context, largeImportData);
      const finalMemory = process.memoryUsage().heapUsed;

      // Should not cause excessive memory growth
      const memoryGrowth = finalMemory - initialMemory;
      expect(memoryGrowth).toBeLessThan(200 * 1024 * 1024); // Less than 200MB growth
    });
  });
});