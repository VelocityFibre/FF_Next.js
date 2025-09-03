/**
 * @deprecated This file has been modularized for better maintainability.
 * Import from './performance/' directory instead.
 * This file maintained for backward compatibility.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { procurementApiService } from '../procurementApiService';
import {
  createMockContext,
  setupMocks,
  teardownMocks,
  mockDatabaseSelect
} from './testHelpers';

describe('ProcurementApiService - Performance', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    teardownMocks();
  });

  describe('Response Time Monitoring', () => {
    it('should track operation response times', async () => {
      mockDatabaseSelect([]);

      const context = createMockContext();
      const startTime = Date.now();
      
      await procurementApiService.getBOQs(context);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should monitor query performance', async () => {
      mockDatabaseSelect([]);

      const context = createMockContext();
      const startTime = performance.now();
      
      await procurementApiService.getBOQs(context, {
        page: 1,
        limit: 100,
        search: 'complex query'
      });
      
      const endTime = performance.now();
      const queryTime = endTime - startTime;

      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should track database connection performance', async () => {
      mockDatabaseSelect([]);

      const context = createMockContext();
      const results = [];
      
      // Test multiple concurrent queries
      const promises = Array(10).fill(null).map(async () => {
        const startTime = performance.now();
        await procurementApiService.getBOQs(context, { limit: 10 });
        return performance.now() - startTime;
      });
      
      const times = await Promise.all(promises);
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;

      expect(avgTime).toBeLessThan(2000); // Average should be under 2 seconds
    });

    it('should measure API endpoint latency', async () => {
      mockDatabaseSelect([]);

      const context = createMockContext();
      const endpoints = [
        () => procurementApiService.getBOQs(context),
        () => procurementApiService.getRFQs(context),
        () => procurementApiService.getHealthStatus()
      ];
      
      const latencies = [];
      
      for (const endpoint of endpoints) {
        const startTime = performance.now();
        await endpoint();
        latencies.push(performance.now() - startTime);
      }
      
      const maxLatency = Math.max(...latencies);
      expect(maxLatency).toBeLessThan(3000); // All endpoints under 3 seconds
    });
  });

  describe('Memory Management', () => {
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

    it('should prevent memory leaks in bulk operations', async () => {
      const context = createMockContext();
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform multiple operations
      for (let i = 0; i < 100; i++) {
        await procurementApiService.getBOQs(context, { limit: 10 });
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;
      
      // Memory growth should be minimal
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });

    it('should handle memory pressure gracefully', async () => {
      const context = createMockContext();
      
      // Simulate memory pressure by creating large objects
      const largeArrays = Array(10).fill(null).map(() => new Array(100000).fill('data'));
      
      const result = await procurementApiService.getBOQs(context);
      
      // Should still function under memory pressure
      expect(result.success).toBe(true);
      
      // Cleanup
      largeArrays.length = 0;
    });
  });

  describe('Concurrent Operations', () => {
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

    it('should manage connection pool efficiently', async () => {
      const context = createMockContext();
      
      // Test high concurrent load
      const promises = Array(50).fill(null).map(async (_, index) => {
        await new Promise(resolve => setTimeout(resolve, index * 10)); // Stagger requests
        return procurementApiService.getBOQs(context, { page: 1, limit: 5 });
      });
      
      const results = await Promise.all(promises);
      const successfulResults = results.filter(r => r.success);
      
      // Most requests should succeed
      expect(successfulResults.length).toBeGreaterThan(40);
    });

    it('should throttle excessive concurrent requests', async () => {
      const context = createMockContext();
      
      // Fire many requests simultaneously
      const startTime = Date.now();
      const promises = Array(100).fill(null).map(() => 
        procurementApiService.getBOQs(context, { limit: 1 })
      );
      
      await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should take reasonable time (indicating throttling)
      expect(totalTime).toBeGreaterThan(100); // At least 100ms for 100 requests
    });
  });

  describe('Resource Optimization', () => {
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

    it('should optimize query performance with indexes', async () => {
      mockDatabaseSelect([]);

      const context = createMockContext();
      const startTime = performance.now();
      
      // Query that should use database indexes
      await procurementApiService.getBOQs(context, {
        status: 'approved',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      const endTime = performance.now();
      const queryTime = endTime - startTime;
      
      // Indexed queries should be fast
      expect(queryTime).toBeLessThan(500); // Under 500ms
    });

    it('should implement efficient pagination', async () => {
      mockDatabaseSelect([]);

      const context = createMockContext();
      const pageSize = 20;
      const totalPages = 5;
      
      const pageTimes = [];
      
      for (let page = 1; page <= totalPages; page++) {
        const startTime = performance.now();
        await procurementApiService.getBOQs(context, { page, limit: pageSize });
        pageTimes.push(performance.now() - startTime);
      }
      
      // Later pages shouldn't be significantly slower
      const firstPageTime = pageTimes[0];
      const lastPageTime = pageTimes[pageTimes.length - 1];
      const performanceRatio = lastPageTime / firstPageTime;
      
      expect(performanceRatio).toBeLessThan(3); // Last page < 3x first page time
    });
  });

  describe('Caching and Optimization', () => {
    it('should utilize caching for repeated queries', async () => {
      mockDatabaseSelect([]);

      const context = createMockContext();
      const queryParams = { status: 'approved', limit: 10 };
      
      // First query - should hit database
      const firstStart = performance.now();
      await procurementApiService.getBOQs(context, queryParams);
      const firstTime = performance.now() - firstStart;
      
      // Second identical query - should be faster (cached)
      const secondStart = performance.now();
      await procurementApiService.getBOQs(context, queryParams);
      const secondTime = performance.now() - secondStart;
      
      // Second query should be faster due to caching
      expect(secondTime).toBeLessThan(firstTime * 0.8);
    });

    it('should invalidate cache appropriately', async () => {
      mockDatabaseSelect([]);

      const context = createMockContext({ permissions: ['boq:create'] });
      
      // Query data first (populate cache)
      await procurementApiService.getBOQs(context);
      
      // Modify data (should invalidate cache)
      await procurementApiService.importBOQ(context, {
        fileName: 'test.xlsx',
        fileSize: 1000,
        version: 'v1.0',
        title: 'Test',
        rows: []
      });
      
      // Next query should hit database again
      const postModifyStart = performance.now();
      await procurementApiService.getBOQs(context);
      const postModifyTime = performance.now() - postModifyStart;
      
      // Should be reasonable time (cache was invalidated)
      expect(postModifyTime).toBeGreaterThan(10); // Some processing time expected
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet performance SLAs', async () => {
      const context = createMockContext();
      const operations = [
        { name: 'getBOQs', fn: () => procurementApiService.getBOQs(context), sla: 1000 },
        { name: 'getRFQs', fn: () => procurementApiService.getRFQs(context), sla: 1000 },
        { name: 'getHealthStatus', fn: () => procurementApiService.getHealthStatus(), sla: 500 }
      ];
      
      for (const operation of operations) {
        const startTime = performance.now();
        await operation.fn();
        const duration = performance.now() - startTime;
        
        expect(duration).toBeLessThan(operation.sla);
      }
    });

    it('should maintain performance under load', async () => {
      const context = createMockContext();
      const loadTest = async () => {
        const promises = Array(20).fill(null).map(() => 
          procurementApiService.getBOQs(context, { limit: 10 })
        );
        
        const startTime = performance.now();
        await Promise.all(promises);
        return performance.now() - startTime;
      };
      
      // Run load test multiple times
      const times = [];
      for (let i = 0; i < 3; i++) {
        times.push(await loadTest());
        await new Promise(resolve => setTimeout(resolve, 100)); // Brief pause
      }
      
      // Performance should remain consistent
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      
      expect(maxTime).toBeLessThan(avgTime * 2); // Max time < 2x average
    });
  });
});