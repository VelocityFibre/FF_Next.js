/**
 * Response Time Performance Tests
 * Tests for API endpoint response time monitoring and optimization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { procurementApiService } from '../../procurementApiService';
import {
  createMockContext,
  setupMocks,
  cleanupMocks
} from '../shared/testHelpers';

// Mock dependencies
vi.mock('../../middleware/projectAccessMiddleware');
vi.mock('../../middleware/rbacMiddleware');
vi.mock('../../auditLogger');
vi.mock('@/lib/neon/connection');

describe('Response Time Performance', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  describe('Basic Response Time Monitoring', () => {
    it('should track operation response times', async () => {
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
      const startTime = Date.now();
      
      await procurementApiService.getBOQs(context);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should monitor query performance with complex filters', async () => {
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
      const startTime = performance.now();
      
      await procurementApiService.getBOQs(context, {
        page: 1,
        limit: 100,
        search: 'complex query with multiple terms',
        status: 'approved',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      const endTime = performance.now();
      const queryTime = endTime - startTime;

      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should track database connection performance', async () => {
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

    it('should measure API endpoint latency across different operations', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Setup different mock responses for different endpoints
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
      const endpoints = [
        { name: 'getBOQs', fn: () => procurementApiService.getBOQs(context) },
        { name: 'getRFQs', fn: () => procurementApiService.getRFQs(context) },
        { name: 'getHealthStatus', fn: () => procurementApiService.getHealthStatus() }
      ];
      
      const results = [];
      
      for (const endpoint of endpoints) {
        const startTime = performance.now();
        await endpoint.fn();
        const latency = performance.now() - startTime;
        results.push({ name: endpoint.name, latency });
      }
      
      const maxLatency = Math.max(...results.map(r => r.latency));
      expect(maxLatency).toBeLessThan(3000); // All endpoints under 3 seconds

      // Log performance for analysis
      console.log('Endpoint Performance:', results);
    });
  });

  describe('Response Time Under Load', () => {
    it('should maintain reasonable response times under concurrent load', async () => {
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
      const concurrentRequests = 25;
      
      const startTime = performance.now();
      const promises = Array(concurrentRequests).fill(null).map(async (_, index) => {
        // Stagger requests slightly
        await new Promise(resolve => setTimeout(resolve, index * 5));
        const requestStart = performance.now();
        await procurementApiService.getBOQs(context, { limit: 10 });
        return performance.now() - requestStart;
      });
      
      const times = await Promise.all(promises);
      const totalTime = performance.now() - startTime;
      const avgResponseTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxResponseTime = Math.max(...times);

      expect(avgResponseTime).toBeLessThan(1500); // Average under 1.5 seconds
      expect(maxResponseTime).toBeLessThan(3000); // Max under 3 seconds
      expect(totalTime).toBeLessThan(10000); // Total time under 10 seconds

      console.log(`Load Test Results: ${concurrentRequests} requests, avg: ${avgResponseTime.toFixed(2)}ms, max: ${maxResponseTime.toFixed(2)}ms`);
    });

    it('should scale response times linearly with request complexity', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(Array(100).fill({}).map((_, i) => ({ id: i })))
              })
            })
          })
        })
      });

      const context = createMockContext();
      const complexityLevels = [
        { name: 'simple', limit: 10, filters: {} },
        { name: 'moderate', limit: 50, filters: { status: 'approved' } },
        { name: 'complex', limit: 100, filters: { status: 'approved', search: 'fiber optic', sortBy: 'createdAt' } }
      ];

      const results = [];

      for (const level of complexityLevels) {
        const startTime = performance.now();
        await procurementApiService.getBOQs(context, { 
          limit: level.limit, 
          ...level.filters 
        });
        const responseTime = performance.now() - startTime;
        results.push({ level: level.name, time: responseTime });
      }

      // Response times should scale reasonably
      const simpleTime = results[0].time;
      const complexTime = results[2].time;
      const scalingFactor = complexTime / simpleTime;

      expect(scalingFactor).toBeLessThan(5); // Complex queries shouldn't be > 5x slower than simple ones

      console.log('Scaling Results:', results);
    });
  });

  describe('Response Time Optimization', () => {
    it('should optimize queries with proper indexing', async () => {
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
      
      // Test queries that should use indexes
      const indexedQueries = [
        { name: 'status_index', filters: { status: 'approved' } },
        { name: 'created_date_index', filters: { sortBy: 'createdAt', sortOrder: 'desc' } },
        { name: 'project_index', filters: { projectId: 'test-project-id' } }
      ];

      for (const query of indexedQueries) {
        const startTime = performance.now();
        await procurementApiService.getBOQs(context, query.filters);
        const queryTime = performance.now() - startTime;
        
        // Indexed queries should be fast
        expect(queryTime).toBeLessThan(500); // Under 500ms for indexed queries
        
        console.log(`${query.name}: ${queryTime.toFixed(2)}ms`);
      }
    });

    it('should implement efficient pagination for large datasets', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock large dataset
      const mockLargeDataset = Array(1000).fill({}).map((_, i) => ({
        id: `item-${i}`,
        title: `Item ${i}`,
        createdAt: new Date()
      }));

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockImplementation((offset) => {
                  const start = offset || 0;
                  return Promise.resolve(mockLargeDataset.slice(start, start + 20));
                })
              })
            })
          })
        })
      });

      const context = createMockContext();
      const pageSize = 20;
      const totalPages = 10;
      
      const pageTimes = [];
      
      for (let page = 1; page <= totalPages; page++) {
        const startTime = performance.now();
        const result = await procurementApiService.getBOQs(context, { 
          page, 
          limit: pageSize 
        });
        const pageTime = performance.now() - startTime;
        pageTimes.push(pageTime);
        
        expect(result.success).toBe(true);
      }
      
      // Later pages shouldn't be significantly slower (indicates good pagination)
      const firstPageTime = pageTimes[0];
      const lastPageTime = pageTimes[pageTimes.length - 1];
      const performanceRatio = lastPageTime / firstPageTime;
      
      expect(performanceRatio).toBeLessThan(3); // Last page < 3x first page time
      
      console.log('Pagination Performance:', {
        firstPage: firstPageTime.toFixed(2) + 'ms',
        lastPage: lastPageTime.toFixed(2) + 'ms',
        ratio: performanceRatio.toFixed(2)
      });
    });

    it('should handle timeout scenarios gracefully', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock slow database response
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockImplementation(() => 
                  new Promise(resolve => setTimeout(() => resolve([]), 6000)) // 6 second delay
                )
              })
            })
          })
        })
      });

      const context = createMockContext();
      const startTime = performance.now();

      try {
        const result = await procurementApiService.getBOQs(context);
        const responseTime = performance.now() - startTime;

        // Should either timeout or complete within reasonable time
        if (result.success) {
          expect(responseTime).toBeLessThan(10000); // Max 10 seconds
        } else {
          expect(result.error).toContain('timeout');
        }
      } catch (error) {
        const responseTime = performance.now() - startTime;
        expect(responseTime).toBeLessThan(10000); // Should timeout before 10 seconds
      }
    });
  });

  describe('Performance Monitoring and Alerting', () => {
    it('should track performance metrics over time', async () => {
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
      const measurements = [];
      
      // Take multiple measurements over time
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        await procurementApiService.getBOQs(context);
        const responseTime = performance.now() - startTime;
        measurements.push(responseTime);
        
        // Small delay between measurements
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const averageTime = measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
      const minTime = Math.min(...measurements);
      const maxTime = Math.max(...measurements);
      const standardDeviation = Math.sqrt(
        measurements.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / measurements.length
      );

      // Performance should be consistent
      expect(standardDeviation).toBeLessThan(averageTime * 0.5); // StdDev < 50% of average
      expect(maxTime).toBeLessThan(averageTime * 3); // Max < 3x average

      console.log('Performance Statistics:', {
        average: averageTime.toFixed(2) + 'ms',
        min: minTime.toFixed(2) + 'ms',
        max: maxTime.toFixed(2) + 'ms',
        stdDev: standardDeviation.toFixed(2) + 'ms'
      });
    });

    it('should detect performance degradation', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // First set of measurements (good performance)
      mockDb.select.mockReturnValueOnce({
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
      
      // Baseline measurement
      const baselineStart = performance.now();
      await procurementApiService.getBOQs(context);
      const baselineTime = performance.now() - baselineStart;

      // Simulate degraded performance
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockImplementation(() => 
                  new Promise(resolve => setTimeout(() => resolve([]), 1000)) // 1 second delay
                )
              })
            })
          })
        })
      });

      // Degraded measurement
      const degradedStart = performance.now();
      await procurementApiService.getBOQs(context);
      const degradedTime = performance.now() - degradedStart;

      // Should detect significant performance degradation
      const performanceDegradation = degradedTime / baselineTime;
      
      if (performanceDegradation > 2) {
        console.warn(`Performance degradation detected: ${performanceDegradation.toFixed(2)}x slower`);
      }

      expect(performanceDegradation).toBeGreaterThan(1); // Should be noticeably slower
    });
  });
});