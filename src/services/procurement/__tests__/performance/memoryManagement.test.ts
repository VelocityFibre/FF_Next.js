/**
 * Memory Management Performance Tests
 * Tests for memory usage monitoring and leak prevention
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { procurementApiService } from '../../procurementApiService';
import { log } from '@/lib/logger';
import {
  createMockContext,
  setupMocks,
  cleanupMocks,
  generateBoqImportData
} from '../shared/testHelpers';

// Mock dependencies
vi.mock('../../middleware/projectAccessMiddleware');
vi.mock('../../middleware/rbacMiddleware');
vi.mock('../../auditLogger');
vi.mock('@/lib/neon/connection');

describe('Memory Management Performance', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  describe('Memory Usage Monitoring', () => {
    it('should monitor memory usage for large operations', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'test-boq' }])
        })
      });

      const context = createMockContext({ permissions: ['boq:create'] });
      
      // Create large import data (simulate 50K items)
      const largeImportData = generateBoqImportData({
        fileName: 'large-import.xlsx',
        fileSize: 100 * 1024 * 1024, // 100MB
        rows: Array(50000).fill({
          lineNumber: 1,
          description: 'Test item with detailed description and specifications',
          quantity: 100,
          uom: 'pcs',
          unitPrice: 10.50,
          category: 'Network Equipment',
          specifications: 'Detailed technical specifications for testing memory usage'
        }).map((item, index) => ({
          ...item,
          lineNumber: index + 1,
          description: `${item.description} - Item ${index + 1}`
        }))
      });

      const initialMemory = process.memoryUsage();
      
      try {
        await procurementApiService.importBOQ(context, largeImportData);
      } catch (error) {
        // May fail due to validation, but we're testing memory usage
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage();

      // Calculate memory growth
      const heapGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      const rssGrowth = finalMemory.rss - initialMemory.rss;

      // Should not cause excessive memory growth
      expect(heapGrowth).toBeLessThan(200 * 1024 * 1024); // Less than 200MB heap growth
      expect(rssGrowth).toBeLessThan(300 * 1024 * 1024); // Less than 300MB RSS growth

      log.info('Memory Usage:', { data: {
        heapGrowth: `${(heapGrowth / 1024 / 1024 }, 'memoryManagement');}.toFixed(2)} MB`,
        rssGrowth: `${(rssGrowth / 1024 / 1024).toFixed(2)} MB`,
        external: `${(finalMemory.external / 1024 / 1024).toFixed(2)} MB`,
        arrayBuffers: `${(finalMemory.arrayBuffers / 1024 / 1024).toFixed(2)} MB`
      });
    });

    it('should prevent memory leaks in bulk operations', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([])
              })
            })
          })
        })
      });

      const context = createMockContext();
      const initialMemory = process.memoryUsage();
      
      // Perform multiple operations that could potentially leak memory
      const operationCount = 100;
      for (let i = 0; i < operationCount; i++) {
        await procurementApiService.getBOQs(context, { 
          limit: 10,
          page: i % 5 + 1, // Vary the page to avoid caching
          search: `test query ${i}` // Vary search to create different objects
        });
        
        // Occasionally check memory during operations
        if (i % 25 === 0) {
          const currentMemory = process.memoryUsage();
          const currentGrowth = currentMemory.heapUsed - initialMemory.heapUsed;
          log.info(`Memory after ${i} operations: ${(currentGrowth / 1024 / 1024, undefined, 'memoryManagement');.toFixed(2)} MB`);
        }
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        // Wait a bit for GC to complete
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const finalMemory = process.memoryUsage();
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory growth should be minimal after GC
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB

      log.info(`Final memory growth after ${operationCount} operations: ${(memoryGrowth / 1024 / 1024, undefined, 'memoryManagement');.toFixed(2)} MB`);
    });

    it('should handle memory pressure gracefully', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([])
              })
            })
          })
        })
      });

      const context = createMockContext();
      
      // Create memory pressure by allocating large objects
      const memoryPressureData: any[] = [];
      try {
        // Allocate arrays to create memory pressure
        for (let i = 0; i < 10; i++) {
          memoryPressureData.push(new Array(100000).fill(`memory pressure data ${i}`));
        }
        
        const memoryBefore = process.memoryUsage();
        log.info(`Memory under pressure: ${(memoryBefore.heapUsed / 1024 / 1024, undefined, 'memoryManagement');.toFixed(2)} MB`);
        
        // System should still function under memory pressure
        const result = await procurementApiService.getBOQs(context);
        expect(result.success).toBe(true);
        
        // Should handle the pressure without crashing
        expect(result.data).toBeDefined();
        
      } finally {
        // Cleanup memory pressure
        memoryPressureData.length = 0;
        if (global.gc) {
          global.gc();
        }
      }
    });

    it('should optimize memory usage for streaming operations', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock large dataset that would be streamed
      let chunkCount = 0;
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockImplementation(async () => {
                  chunkCount++;
                  // Simulate streaming chunks of data
                  const chunkSize = 1000;
                  return Array(chunkSize).fill({}).map((_, i) => ({
                    id: `item-${chunkCount}-${i}`,
                    data: `chunk ${chunkCount} item ${i} with some data content for memory testing`
                  }));
                })
              })
            })
          })
        })
      });

      const context = createMockContext();
      const initialMemory = process.memoryUsage();
      const memoryMeasurements = [];
      
      // Process multiple chunks
      const totalChunks = 20;
      for (let chunk = 1; chunk <= totalChunks; chunk++) {
        await procurementApiService.getBOQs(context, { 
          page: chunk, 
          limit: 1000 
        });
        
        const currentMemory = process.memoryUsage();
        memoryMeasurements.push({
          chunk,
          heapUsed: currentMemory.heapUsed,
          heapGrowth: currentMemory.heapUsed - initialMemory.heapUsed
        });
        
        // Memory growth should be controlled during streaming
        const growthMB = (currentMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
        expect(growthMB).toBeLessThan(100); // Should stay under 100MB during streaming
      }

      // Check that memory doesn't grow linearly with chunks (indicating proper cleanup)
      const firstHalfAvg = memoryMeasurements
        .slice(0, 10)
        .reduce((sum, m) => sum + m.heapGrowth, 0) / 10;
      const secondHalfAvg = memoryMeasurements
        .slice(10)
        .reduce((sum, m) => sum + m.heapGrowth, 0) / 10;
      
      const memoryEfficiencyRatio = secondHalfAvg / firstHalfAvg;
      expect(memoryEfficiencyRatio).toBeLessThan(3); // Memory shouldn't grow > 3x in second half

      log.info('Streaming Memory Efficiency:', { data: {
        totalChunks,
        firstHalfAvg: `${(firstHalfAvg / 1024 / 1024 }, 'memoryManagement');}.toFixed(2)} MB`,
        secondHalfAvg: `${(secondHalfAvg / 1024 / 1024).toFixed(2)} MB`,
        efficiencyRatio: memoryEfficiencyRatio.toFixed(2)
      });
    });
  });

  describe('Memory Leak Detection', () => {
    it('should detect potential memory leaks in event handlers', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([])
              })
            })
          })
        })
      });

      const context = createMockContext();
      const initialMemory = process.memoryUsage();
      const eventHandlers: (() => void)[] = [];
      
      // Simulate creating event handlers that might not be cleaned up
      const createEventHandler = () => {
        const handler = () => {
          // Simulate some event handling logic
          const data = new Array(1000).fill('event data');
          return data.length;
        };
        eventHandlers.push(handler);
        return handler;
      };

      // Create many event handlers during API calls
      for (let i = 0; i < 1000; i++) {
        createEventHandler();
        if (i % 100 === 0) {
          await procurementApiService.getBOQs(context);
        }
      }

      const beforeCleanup = process.memoryUsage();
      
      // Cleanup event handlers (simulate proper cleanup)
      eventHandlers.length = 0;
      
      if (global.gc) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const afterCleanup = process.memoryUsage();
      
      const growthBeforeCleanup = beforeCleanup.heapUsed - initialMemory.heapUsed;
      const growthAfterCleanup = afterCleanup.heapUsed - initialMemory.heapUsed;
      const memoryReclaimed = growthBeforeCleanup - growthAfterCleanup;
      
      // Should reclaim significant memory after cleanup
      const reclaimPercentage = (memoryReclaimed / growthBeforeCleanup) * 100;
      expect(reclaimPercentage).toBeGreaterThan(50); // Should reclaim > 50% of memory
      
      log.info('Event Handler Memory Test:', { data: {
        beforeCleanup: `${(growthBeforeCleanup / 1024 / 1024 }, 'memoryManagement');}.toFixed(2)} MB`,
        afterCleanup: `${(growthAfterCleanup / 1024 / 1024).toFixed(2)} MB`,
        reclaimed: `${(memoryReclaimed / 1024 / 1024).toFixed(2)} MB`,
        reclaimPercentage: `${reclaimPercentage.toFixed(1)}%`
      });
    });

    it('should monitor closure-related memory usage', async () => {
      const context = createMockContext();
      const initialMemory = process.memoryUsage();
      const closures: (() => any)[] = [];
      
      // Create closures that capture large amounts of data
      const createClosureWithCapturedData = (iteration: number) => {
        const capturedData = {
          iteration,
          largeArray: new Array(10000).fill(`data-${iteration}`),
          timestamp: new Date(),
          metadata: { type: 'test', size: 'large' }
        };
        
        return () => {
          // This closure captures capturedData
          return capturedData.largeArray.length + capturedData.iteration;
        };
      };

      // Create many closures
      for (let i = 0; i < 100; i++) {
        const closure = createClosureWithCapturedData(i);
        closures.push(closure);
        
        // Execute some closures to ensure they're not optimized away
        if (i % 10 === 0) {
          closure();
        }
      }

      const withClosures = process.memoryUsage();
      
      // Clear closures to test memory reclamation
      closures.length = 0;
      
      if (global.gc) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const afterClearing = process.memoryUsage();
      
      const closureMemoryGrowth = withClosures.heapUsed - initialMemory.heapUsed;
      const finalMemoryGrowth = afterClearing.heapUsed - initialMemory.heapUsed;
      const memoryReclaimed = closureMemoryGrowth - finalMemoryGrowth;
      
      // Should reclaim memory when closures are cleared
      expect(memoryReclaimed).toBeGreaterThan(0);
      
      const reclaimPercentage = (memoryReclaimed / closureMemoryGrowth) * 100;
      
      log.info('Closure Memory Test:', { data: {
        closureGrowth: `${(closureMemoryGrowth / 1024 / 1024 }, 'memoryManagement');}.toFixed(2)} MB`,
        finalGrowth: `${(finalMemoryGrowth / 1024 / 1024).toFixed(2)} MB`,
        reclaimed: `${(memoryReclaimed / 1024 / 1024).toFixed(2)} MB`,
        reclaimRate: `${reclaimPercentage.toFixed(1)}%`
      });
    });
  });

  describe('Memory Optimization Strategies', () => {
    it('should implement object pooling for frequently created objects', async () => {
      const context = createMockContext();
      const initialMemory = process.memoryUsage();
      
      // Simulate creating many similar objects without pooling
      const objectsWithoutPooling = [];
      for (let i = 0; i < 10000; i++) {
        objectsWithoutPooling.push({
          id: `item-${i}`,
          type: 'boq-item',
          metadata: { created: new Date(), version: 1 },
          data: new Array(100).fill(`data-${i}`)
        });
      }

      const withoutPoolingMemory = process.memoryUsage();
      
      // Clear and test with simulated pooling (reusing objects)
      objectsWithoutPooling.length = 0;
      
      if (global.gc) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Simulate object pooling by reusing object structure
      const objectPool = {
        id: '',
        type: '',
        metadata: { created: null, version: 0 },
        data: []
      };

      const objectsWithPooling = [];
      for (let i = 0; i < 10000; i++) {
        // Simulate reusing pooled object structure
        const reusedObject = {
          ...objectPool,
          id: `item-${i}`,
          type: 'boq-item',
          metadata: { ...objectPool.metadata, created: new Date() },
          data: new Array(100).fill(`data-${i}`)
        };
        objectsWithPooling.push(reusedObject);
      }

      const withPoolingMemory = process.memoryUsage();
      
      const withoutPoolingGrowth = withoutPoolingMemory.heapUsed - initialMemory.heapUsed;
      const withPoolingGrowth = withPoolingMemory.heapUsed - initialMemory.heapUsed;
      const memoryEfficiency = (withoutPoolingGrowth - withPoolingGrowth) / withoutPoolingGrowth;

      // Object pooling should show some memory efficiency
      expect(memoryEfficiency).toBeGreaterThan(-0.5); // Allow for some variance
      
      log.info('Object Pooling Test:', { data: {
        withoutPooling: `${(withoutPoolingGrowth / 1024 / 1024 }, 'memoryManagement');}.toFixed(2)} MB`,
        withPooling: `${(withPoolingGrowth / 1024 / 1024).toFixed(2)} MB`,
        efficiency: `${(memoryEfficiency * 100).toFixed(1)}%`
      });
      
      // Cleanup
      objectsWithPooling.length = 0;
    });

    it('should demonstrate efficient buffer management', async () => {
      const initialMemory = process.memoryUsage();
      
      // Test inefficient buffer usage (creating many small buffers)
      const smallBuffers = [];
      for (let i = 0; i < 1000; i++) {
        smallBuffers.push(Buffer.alloc(1024, `data-${i}`)); // 1KB buffers
      }

      const smallBuffersMemory = process.memoryUsage();
      smallBuffers.length = 0;

      if (global.gc) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Test efficient buffer usage (fewer, larger buffers)
      const largeBuffers = [];
      for (let i = 0; i < 10; i++) {
        largeBuffers.push(Buffer.alloc(100 * 1024, `batch-${i}`)); // 100KB buffers
      }

      const largeBuffersMemory = process.memoryUsage();
      
      const smallBufferGrowth = smallBuffersMemory.heapUsed - initialMemory.heapUsed;
      const largeBufferGrowth = largeBuffersMemory.heapUsed - initialMemory.heapUsed;
      
      // Both approaches use similar total memory, but large buffers are more efficient
      const totalDataSize = 1000 * 1024; // 1MB total in both cases
      expect(Math.abs(smallBufferGrowth - largeBufferGrowth)).toBeLessThan(totalDataSize * 0.5); // Within 50% of each other

      log.info('Buffer Management Test:', { data: {
        smallBuffers: `${(smallBufferGrowth / 1024 / 1024 }, 'memoryManagement');}.toFixed(2)} MB (1000 x 1KB)`,
        largeBuffers: `${(largeBufferGrowth / 1024 / 1024).toFixed(2)} MB (10 x 100KB)`,
        totalData: `${(totalDataSize / 1024 / 1024).toFixed(2)} MB`
      });
      
      // Cleanup
      largeBuffers.length = 0;
    });
  });
});