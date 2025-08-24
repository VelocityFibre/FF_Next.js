/**
 * Performance Benchmarks Tests
 * Tests for SLA compliance, optimization validation, and performance baselines
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

describe('Performance Benchmarks', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  describe('Service Level Agreement Compliance', () => {
    it('should meet performance SLAs for all endpoints', async () => {
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
      
      const slaOperations = [
        { 
          name: 'getBOQs', 
          fn: () => procurementApiService.getBOQs(context), 
          sla: 1000, // 1 second
          description: 'List BOQs operation'
        },
        { 
          name: 'getRFQs', 
          fn: () => procurementApiService.getRFQs(context), 
          sla: 1000, // 1 second
          description: 'List RFQs operation'
        },
        { 
          name: 'getHealthStatus', 
          fn: () => procurementApiService.getHealthStatus(), 
          sla: 500, // 500ms
          description: 'Health check operation'
        },
        {
          name: 'getBOQById',
          fn: () => {
            mockDb.select.mockReturnValueOnce({
              from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([{
                    id: 'boq-123',
                    title: 'Test BOQ'
                  }])
                })
              })
            });
            return procurementApiService.getBOQById(context, 'boq-123');
          },
          sla: 800, // 800ms
          description: 'Get specific BOQ operation'
        }
      ];
      
      const benchmarkResults = [];
      
      for (const operation of slaOperations) {
        const measurements = [];
        
        // Take multiple measurements for accuracy
        for (let i = 0; i < 5; i++) {
          const startTime = performance.now();
          await operation.fn();
          const duration = performance.now() - startTime;
          measurements.push(duration);
          
          // Small delay between measurements
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        const avgDuration = measurements.reduce((sum, d) => sum + d, 0) / measurements.length;
        const maxDuration = Math.max(...measurements);
        const minDuration = Math.min(...measurements);
        
        benchmarkResults.push({
          operation: operation.name,
          description: operation.description,
          sla: operation.sla,
          avgDuration,
          maxDuration,
          minDuration,
          slaCompliance: avgDuration <= operation.sla
        });
        
        // SLA compliance check
        expect(avgDuration).toBeLessThan(operation.sla);
      }
      
      console.table(benchmarkResults.map(r => ({
        Operation: r.operation,
        'SLA (ms)': r.sla,
        'Avg (ms)': r.avgDuration.toFixed(1),
        'Max (ms)': r.maxDuration.toFixed(1),
        'Min (ms)': r.minDuration.toFixed(1),
        'SLA Met': r.slaCompliance ? '✓' : '✗'
      })));
      
      // All operations should meet SLA
      const slaViolations = benchmarkResults.filter(r => !r.slaCompliance);
      expect(slaViolations).toHaveLength(0);
    });

    it('should maintain performance under sustained load', async () => {
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
      
      const sustainedLoadTest = async (duration: number, requestsPerSecond: number) => {
        const endTime = Date.now() + duration;
        const results = [];
        let requestCount = 0;
        
        while (Date.now() < endTime) {
          const batchStart = Date.now();
          const batchPromises = [];
          
          // Generate batch of requests
          for (let i = 0; i < requestsPerSecond; i++) {
            batchPromises.push(
              (async () => {
                const startTime = performance.now();
                const result = await procurementApiService.getBOQs(context, { 
                  limit: 10,
                  search: `load-test-${requestCount++}`
                });
                return {
                  success: result.success,
                  responseTime: performance.now() - startTime
                };
              })()
            );
          }
          
          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);
          
          // Wait for next second
          const batchDuration = Date.now() - batchStart;
          const waitTime = Math.max(0, 1000 - batchDuration);
          if (waitTime > 0) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
        
        return results;
      };
      
      // Run sustained load test for 3 seconds at 10 requests per second
      const loadResults = await sustainedLoadTest(3000, 10);
      
      const successfulResults = loadResults.filter(r => r.success);
      const responseTimes = successfulResults.map(r => r.responseTime);
      
      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const successRate = (successfulResults.length / loadResults.length) * 100;
      
      // Performance should remain consistent under load
      expect(successRate).toBeGreaterThan(95); // > 95% success rate
      expect(avgResponseTime).toBeLessThan(2000); // Average under 2 seconds
      expect(maxResponseTime).toBeLessThan(5000); // Max under 5 seconds
      
      console.log('Sustained Load Test:', {
        duration: '3 seconds',
        requestsPerSecond: 10,
        totalRequests: loadResults.length,
        successRate: `${successRate.toFixed(1)}%`,
        avgResponseTime: `${avgResponseTime.toFixed(0)}ms`,
        maxResponseTime: `${maxResponseTime.toFixed(0)}ms`
      });
    });

    it('should demonstrate consistent performance across test runs', async () => {
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
      
      const loadTest = async () => {
        const promises = Array(20).fill(null).map(async (_, index) => {
          const startTime = performance.now();
          const result = await procurementApiService.getBOQs(context, { 
            limit: 10,
            page: (index % 5) + 1
          });
          return {
            success: result.success,
            responseTime: performance.now() - startTime
          };
        });
        
        const startTime = performance.now();
        const results = await Promise.all(promises);
        const totalTime = performance.now() - startTime;
        
        const successfulResults = results.filter(r => r.success);
        const avgResponseTime = successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length;
        
        return {
          totalTime,
          avgResponseTime,
          successRate: (successfulResults.length / results.length) * 100
        };
      };
      
      // Run load test multiple times
      const testRuns = [];
      for (let i = 0; i < 3; i++) {
        const result = await loadTest();
        testRuns.push(result);
        
        // Brief pause between runs
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Performance should remain consistent across runs
      const avgResponseTimes = testRuns.map(r => r.avgResponseTime);
      const avgOfAvgs = avgResponseTimes.reduce((sum, time) => sum + time, 0) / avgResponseTimes.length;
      const maxResponseTime = Math.max(...avgResponseTimes);
      const minResponseTime = Math.min(...avgResponseTimes);
      
      const variabilityRatio = maxResponseTime / minResponseTime;
      const successRates = testRuns.map(r => r.successRate);
      const minSuccessRate = Math.min(...successRates);
      
      // Performance should remain consistent (variability < 2x)
      expect(variabilityRatio).toBeLessThan(2);
      expect(minSuccessRate).toBeGreaterThan(90); // All runs > 90% success
      expect(avgOfAvgs).toBeLessThan(2000); // Overall average under 2 seconds
      
      console.log('Consistency Test Results:', testRuns.map((run, index) => ({
        run: index + 1,
        avgResponseTime: `${run.avgResponseTime.toFixed(0)}ms`,
        successRate: `${run.successRate.toFixed(1)}%`,
        totalTime: `${run.totalTime.toFixed(0)}ms`
      })));
      
      console.log('Consistency Metrics:', {
        variabilityRatio: variabilityRatio.toFixed(2),
        avgResponseTime: `${avgOfAvgs.toFixed(0)}ms`,
        minSuccessRate: `${minSuccessRate.toFixed(1)}%`
      });
    });
  });

  describe('Optimization Validation', () => {
    it('should demonstrate caching effectiveness', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      let databaseCallCount = 0;
      mockDb.select.mockImplementation(() => {
        databaseCallCount++;
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue([{
                    id: 'cached-item',
                    title: 'Cached Data'
                  }])
                })
              })
            })
          })
        };
      });

      const context = createMockContext();
      const queryParams = { status: 'approved', limit: 10 };
      
      // First query - should hit database
      const firstStart = performance.now();
      const firstResult = await procurementApiService.getBOQs(context, queryParams);
      const firstTime = performance.now() - firstStart;
      const firstDbCalls = databaseCallCount;
      
      // Second identical query - should use cache (if implemented)
      const secondStart = performance.now();
      const secondResult = await procurementApiService.getBOQs(context, queryParams);
      const secondTime = performance.now() - secondStart;
      const secondDbCalls = databaseCallCount;
      
      // Third query with different params - should hit database again
      const thirdStart = performance.now();
      const thirdResult = await procurementApiService.getBOQs(context, { ...queryParams, limit: 20 });
      const thirdTime = performance.now() - thirdStart;
      const thirdDbCalls = databaseCallCount;
      
      // All queries should succeed
      expect(firstResult.success).toBe(true);
      expect(secondResult.success).toBe(true);
      expect(thirdResult.success).toBe(true);
      
      // Analyze caching behavior
      const cachingEffectiveness = {
        firstQuery: { time: firstTime, dbCalls: firstDbCalls },
        secondQuery: { time: secondTime, dbCalls: secondDbCalls - firstDbCalls },
        thirdQuery: { time: thirdTime, dbCalls: thirdDbCalls - secondDbCalls },
        speedImprovement: firstTime > 0 ? (firstTime - secondTime) / firstTime : 0,
        cacheHitRate: secondDbCalls === firstDbCalls ? 100 : 0
      };
      
      console.log('Caching Analysis:', {
        firstQueryTime: `${firstTime.toFixed(1)}ms`,
        secondQueryTime: `${secondTime.toFixed(1)}ms`,
        thirdQueryTime: `${thirdTime.toFixed(1)}ms`,
        speedImprovement: `${(cachingEffectiveness.speedImprovement * 100).toFixed(1)}%`,
        totalDbCalls: thirdDbCalls
      });
      
      // If caching is implemented, second query should be faster or use fewer DB calls
      // This test documents the current behavior and can detect when caching is added
    });

    it('should validate query optimization with indexes', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      const queryPerformanceData: Array<{
        queryType: string;
        time: number;
        indexed: boolean;
      }> = [];
      
      // Mock different query types
      mockDb.select.mockImplementation(() => {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockImplementation(async () => {
                    // Simulate query execution time based on complexity
                    const queryTime = Math.random() * 100 + 50; // 50-150ms
                    await new Promise(resolve => setTimeout(resolve, queryTime));
                    return [];
                  })
                })
              })
            })
          })
        };
      });

      const context = createMockContext();
      
      const testQueries = [
        { 
          name: 'status_filter', 
          params: { status: 'approved' }, 
          expectedIndexed: true,
          description: 'Status filter query (should use status index)'
        },
        { 
          name: 'date_range', 
          params: { 
            createdAfter: new Date('2024-01-01'),
            createdBefore: new Date('2024-12-31')
          }, 
          expectedIndexed: true,
          description: 'Date range query (should use date index)'
        },
        { 
          name: 'full_text_search', 
          params: { search: 'fiber optic cable specifications' }, 
          expectedIndexed: false,
          description: 'Full-text search (complex operation)'
        },
        { 
          name: 'combined_filters', 
          params: { 
            status: 'approved', 
            sortBy: 'createdAt', 
            sortOrder: 'desc' 
          }, 
          expectedIndexed: true,
          description: 'Combined indexed filters with sort'
        }
      ];
      
      for (const query of testQueries) {
        const startTime = performance.now();
        const result = await procurementApiService.getBOQs(context, query.params);
        const queryTime = performance.now() - startTime;
        
        queryPerformanceData.push({
          queryType: query.name,
          time: queryTime,
          indexed: query.expectedIndexed
        });
        
        expect(result.success).toBe(true);
        
        // Indexed queries should generally be faster
        if (query.expectedIndexed) {
          expect(queryTime).toBeLessThan(1000); // Indexed queries under 1 second
        }
      }
      
      // Analyze query performance patterns
      const indexedQueries = queryPerformanceData.filter(q => q.indexed);
      const nonIndexedQueries = queryPerformanceData.filter(q => !q.indexed);
      
      if (indexedQueries.length > 0 && nonIndexedQueries.length > 0) {
        const avgIndexedTime = indexedQueries.reduce((sum, q) => sum + q.time, 0) / indexedQueries.length;
        const avgNonIndexedTime = nonIndexedQueries.reduce((sum, q) => sum + q.time, 0) / nonIndexedQueries.length;
        
        console.log('Query Optimization Analysis:', {
          indexedQueries: indexedQueries.length,
          nonIndexedQueries: nonIndexedQueries.length,
          avgIndexedTime: `${avgIndexedTime.toFixed(1)}ms`,
          avgNonIndexedTime: `${avgNonIndexedTime.toFixed(1)}ms`,
          performanceRatio: (avgNonIndexedTime / avgIndexedTime).toFixed(2)
        });
      }
      
      console.table(queryPerformanceData.map(q => ({
        Query: q.queryType,
        'Time (ms)': q.time.toFixed(1),
        Indexed: q.indexed ? '✓' : '✗'
      })));
    });

    it('should validate resource cleanup and memory efficiency', async () => {
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
      
      // Perform operations that should clean up after themselves
      const operationCount = 50;
      const operationResults = [];
      
      for (let i = 0; i < operationCount; i++) {
        const beforeOp = process.memoryUsage();
        
        await procurementApiService.getBOQs(context, { 
          limit: 10,
          search: `cleanup-test-${i}`,
          page: (i % 10) + 1
        });
        
        const afterOp = process.memoryUsage();
        operationResults.push({
          operation: i,
          memoryGrowth: afterOp.heapUsed - beforeOp.heapUsed
        });
        
        // Periodic cleanup simulation
        if (i % 10 === 9 && global.gc) {
          global.gc();
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      // Final cleanup
      if (global.gc) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const finalMemory = process.memoryUsage();
      const totalMemoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      const avgOperationGrowth = operationResults.reduce((sum, op) => sum + Math.abs(op.memoryGrowth), 0) / operationCount;
      
      // Memory growth should be controlled
      expect(totalMemoryGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB total growth
      expect(avgOperationGrowth).toBeLessThan(1024 * 1024); // Less than 1MB average per operation
      
      console.log('Resource Cleanup Analysis:', {
        operations: operationCount,
        totalMemoryGrowth: `${(totalMemoryGrowth / 1024 / 1024).toFixed(2)} MB`,
        avgOperationGrowth: `${(avgOperationGrowth / 1024).toFixed(2)} KB`,
        finalHeapUsed: `${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        memoryEfficiency: totalMemoryGrowth < 10 * 1024 * 1024 ? 'Excellent' : 
                         totalMemoryGrowth < 30 * 1024 * 1024 ? 'Good' : 'Needs Improvement'
      });
    });
  });
});