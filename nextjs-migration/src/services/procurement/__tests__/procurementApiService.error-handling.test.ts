/**
 * Procurement API Service - Error Handling Tests
 * Tests for database errors, validation errors, and recovery scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { procurementApiService } from '../procurementApiService';
import {
  createMockContext,
  setupMocks,
  teardownMocks,
  mockDatabaseError
} from './testHelpers';

describe('ProcurementApiService - Error Handling', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    teardownMocks();
  });

  describe('Database Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockDatabaseError('Database connection failed');

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');
    });

    it('should handle timeout errors', async () => {
      mockDatabaseError('Connection timeout');

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection timeout');
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

    it('should validate file size limits', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const oversizedData = {
        fileName: 'huge-file.xlsx',
        fileSize: 100 * 1024 * 1024, // 100MB - exceeds limit
        version: 'v1.0',
        title: 'Test',
        rows: []
      };

      const result = await procurementApiService.importBOQ(context, oversizedData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File size exceeds limit');
    });

    it('should validate required context fields', async () => {
      const incompleteContext = {
        userId: 'user-1',
        projectId: 'project-1'
        // Missing other required fields
      };

      const result = await procurementApiService.getBOQs(incompleteContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid context');
    });
  });

  describe('Network and External Service Errors', () => {
    it('should handle external service timeouts', async () => {
      const context = createMockContext();
      
      // Mock external service call that times out
      const result = await procurementApiService.validateSuppliers(context, ['external-supplier-id']);

      expect(result.success).toBe(false);
      expect(result.error).toContain('External service timeout');
    });

    it('should handle rate limiting errors', async () => {
      const context = createMockContext();
      
      const result = await procurementApiService.getBOQs(context, { page: 1000 });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Rate limit exceeded');
    });

    it('should handle service unavailable errors', async () => {
      mockDatabaseError('Service temporarily unavailable');

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Service temporarily unavailable');
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

    it('should prevent memory leaks in large operations', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const largeImportData = {
        fileName: 'memory-test.xlsx',
        fileSize: 50 * 1024 * 1024, // 50MB
        version: 'v1.0',
        title: 'Memory Test',
        rows: Array(10000).fill({
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
      expect(memoryGrowth).toBeLessThan(100 * 1024 * 1024); // Less than 100MB growth
    });
  });

  describe('Recovery and Resilience', () => {
    it('should implement retry logic for transient failures', async () => {
      let attemptCount = 0;
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      mockDb.select.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Transient failure');
        }
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue([])
                })
              })
            })
          })
        };
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(true);
      expect(attemptCount).toBe(3); // Should retry twice
    });

    it('should provide meaningful error messages', async () => {
      mockDatabaseError('Connection pool exhausted');

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection pool exhausted');
      expect(result.code).toBeDefined();
      expect(result.timestamp).toBeDefined();
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
});