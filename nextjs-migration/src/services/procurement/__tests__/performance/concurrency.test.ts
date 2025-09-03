/**
 * Concurrency Performance Tests
 * Tests for concurrent operations, connection pooling, and resource management
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

describe('Concurrency Performance', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  describe('Concurrent Operation Limits', () => {
    it('should handle reasonable concurrent operation limits', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      let concurrentCallCount = 0;
      const maxConcurrent = 5; // Simulate connection pool limit
      
      mockDb.insert.mockImplementation(() => {
        concurrentCallCount++;
        
        if (concurrentCallCount > maxConcurrent) {
          throw new Error('Too many concurrent connections');
        }
        
        return {
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockImplementation(async () => {
              // Simulate work
              await new Promise(resolve => setTimeout(resolve, 100));
              concurrentCallCount--;
              return [{ id: `boq-${Date.now()}` }];
            })
          })
        };
      });

      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = generateBoqImportData({
        title: 'Concurrent Test',
        rows: [{ lineNumber: 1, description: 'Test', quantity: 1, uom: 'pcs', unitPrice: 10 }]
      });

      // Simulate multiple concurrent imports
      const concurrentRequests = 10;
      const promises = Array(concurrentRequests).fill(null).map(async (_, index) => {
        try {
          const result = await procurementApiService.importBOQ(context, {
            ...importData,
            title: `Concurrent Test ${index}`
          });
          return { index, success: result.success, error: result.error };
        } catch (error) {
          return { 
            index, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      });

      const results = await Promise.all(promises);
      
      // Should handle concurrency gracefully - some may succeed, some may be throttled
      const successfulResults = results.filter(r => r.success);
      const throttledResults = results.filter(r => !r.success && r.error?.includes('concurrent'));
      
      expect(successfulResults.length).toBeGreaterThan(0); // At least some should succeed
      expect(successfulResults.length + throttledResults.length).toBe(concurrentRequests);
      
      log.info('Concurrent Operations Test:', { data: {
        total: concurrentRequests,
        successful: successfulResults.length,
        throttled: throttledResults.length,
        successRate: `${(successfulResults.length / concurrentRequests * 100 }, 'concurrency');}.toFixed(1)}%`
      });
    });

    it('should manage connection pool efficiently', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      let activeConnections = 0;
      const maxConnections = 10;
      const connectionTimes: number[] = [];
      
      mockDb.select.mockImplementation(() => {
        activeConnections++;
        const connectionStart = performance.now();
        
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockImplementation(async () => {
                    // Simulate query time
                    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
                    
                    const connectionTime = performance.now() - connectionStart;
                    connectionTimes.push(connectionTime);
                    
                    activeConnections--;
                    
                    return [];
                  })
                })
              })
            })
          })
        };
      });

      const context = createMockContext();
      
      // Test high concurrent load
      const concurrentRequests = 50;
      const promises = Array(concurrentRequests).fill(null).map(async (_, index) => {
        // Stagger requests slightly to simulate real-world usage
        await new Promise(resolve => setTimeout(resolve, index * 10));
        
        const startTime = performance.now();
        const result = await procurementApiService.getBOQs(context, { 
          page: 1, 
          limit: 5,
          search: `query-${index}` // Vary queries to prevent caching
        });
        const responseTime = performance.now() - startTime;
        
        return { 
          success: result.success, 
          responseTime,
          connectionWaitTime: Math.max(0, responseTime - 150) // Estimate wait time
        };
      });
      
      const results = await Promise.all(promises);
      const successfulResults = results.filter(r => r.success);
      
      // Most requests should succeed with reasonable response times
      expect(successfulResults.length).toBeGreaterThan(concurrentRequests * 0.8); // > 80% success rate
      
      const averageResponseTime = successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length;
      const maxResponseTime = Math.max(...successfulResults.map(r => r.responseTime));
      
      expect(averageResponseTime).toBeLessThan(5000); // Average under 5 seconds
      expect(maxResponseTime).toBeLessThan(10000); // Max under 10 seconds
      
      log.info('Connection Pool Test:', { data: {
        totalRequests: concurrentRequests,
        successful: successfulResults.length,
        successRate: `${(successfulResults.length / concurrentRequests * 100 }, 'concurrency');}.toFixed(1)}%`,
        avgResponseTime: `${averageResponseTime.toFixed(0)}ms`,
        maxResponseTime: `${maxResponseTime.toFixed(0)}ms`
      });
    });

    it('should throttle excessive concurrent requests', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      const requestTimestamps: number[] = [];
      const throttleWindow = 1000; // 1 second window
      const maxRequestsPerWindow = 20;
      
      mockDb.select.mockImplementation(() => {
        const now = Date.now();
        requestTimestamps.push(now);
        
        // Clean old timestamps
        const windowStart = now - throttleWindow;
        const recentRequests = requestTimestamps.filter(ts => ts > windowStart);
        
        if (recentRequests.length > maxRequestsPerWindow) {
          throw new Error('Rate limit exceeded');
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
      
      // Fire many requests simultaneously
      const burstRequests = 100;
      const startTime = Date.now();
      
      const promises = Array(burstRequests).fill(null).map(async (_, index) => {
        try {
          const result = await procurementApiService.getBOQs(context, { 
            limit: 1,
            search: `burst-${index}`
          });
          return { success: result.success, index, error: null };
        } catch (error) {
          return { 
            success: false, 
            index, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      });
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const successfulRequests = results.filter(r => r.success);
      const throttledRequests = results.filter(r => r.error?.includes('Rate limit'));
      
      // Should have throttled some requests
      expect(throttledRequests.length).toBeGreaterThan(0);
      expect(successfulRequests.length).toBeLessThan(burstRequests);
      
      // Should take reasonable time (indicating throttling is working)
      expect(totalTime).toBeGreaterThan(100); // At least 100ms for 100 requests (shows throttling)
      
      log.info('Throttling Test:', { data: {
        totalRequests: burstRequests,
        successful: successfulRequests.length,
        throttled: throttledRequests.length,
        totalTime: `${totalTime}ms`,
        requestsPerSecond: (burstRequests / (totalTime / 1000 }, 'concurrency');}).toFixed(1)
      });
    });
  });

  describe('Resource Contention', () => {
    it('should handle database lock contention', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      let lockHeld = false;
      const lockWaitTimes: number[] = [];
      
      mockDb.update.mockImplementation(() => {
        const waitStart = performance.now();
        
        return {
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockImplementation(async () => {
                // Simulate waiting for lock
                while (lockHeld) {
                  await new Promise(resolve => setTimeout(resolve, 10));
                }
                
                lockHeld = true;
                const waitTime = performance.now() - waitStart;
                lockWaitTimes.push(waitTime);
                
                try {
                  // Simulate work under lock
                  await new Promise(resolve => setTimeout(resolve, 50));
                  return [{ id: 'updated-item' }];
                } finally {
                  lockHeld = false;
                }
              })
            })
          })
        };
      });

      // Mock existing RFQ for update
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'rfq-123',
              status: 'draft',
              title: 'Test RFQ'
            }])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      
      // Simulate concurrent updates that would contend for locks
      const concurrentUpdates = 10;
      const promises = Array(concurrentUpdates).fill(null).map(async (_, index) => {
        const startTime = performance.now();
        try {
          const result = await procurementApiService.updateRFQ(context, 'rfq-123', {
            title: `Updated Title ${index}`
          });
          return { 
            success: result.success, 
            responseTime: performance.now() - startTime,
            index 
          };
        } catch (error) {
          return { 
            success: false, 
            responseTime: performance.now() - startTime,
            index,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const results = await Promise.all(promises);
      const successfulResults = results.filter(r => r.success);
      
      // Most should succeed, but with varying response times due to lock contention
      expect(successfulResults.length).toBeGreaterThan(concurrentUpdates * 0.7); // > 70% success
      
      const responseTimes = successfulResults.map(r => r.responseTime);
      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      
      // Response times should vary due to lock contention
      expect(maxResponseTime).toBeGreaterThan(minResponseTime * 1.5); // Max > 1.5x min (shows contention)
      
      log.info('Lock Contention Test:', { data: {
        concurrentUpdates,
        successful: successfulResults.length,
        avgResponseTime: `${avgResponseTime.toFixed(0 }, 'concurrency');}}ms`,
        minResponseTime: `${minResponseTime.toFixed(0)}ms`,
        maxResponseTime: `${maxResponseTime.toFixed(0)}ms`,
        contentionRatio: (maxResponseTime / minResponseTime).toFixed(2)
      });
    });

    it('should manage transaction isolation effectively', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      const transactionStates = new Map();
      let globalCounter = 0;
      
      // Mock transaction behavior
      mockDb.transaction = vi.fn().mockImplementation(async (callback) => {
        const transactionId = `tx-${Date.now()}-${Math.random()}`;
        transactionStates.set(transactionId, { started: Date.now(), counter: globalCounter });
        
        try {
          const result = await callback({
            select: mockDb.select,
            insert: mockDb.insert,
            update: mockDb.update
          });
          
          globalCounter++;
          return result;
        } finally {
          transactionStates.delete(transactionId);
        }
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'new-item' }])
        })
      });

      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = generateBoqImportData({ rows: [{ lineNumber: 1, description: 'Test', quantity: 1, uom: 'pcs', unitPrice: 10 }] });
      
      // Simulate concurrent transactions
      const concurrentTransactions = 15;
      const promises = Array(concurrentTransactions).fill(null).map(async (_, index) => {
        const startTime = performance.now();
        
        try {
          const result = await procurementApiService.importBOQ(context, {
            ...importData,
            title: `Transaction Test ${index}`
          });
          
          return {
            success: result.success,
            transactionTime: performance.now() - startTime,
            index
          };
        } catch (error) {
          return {
            success: false,
            transactionTime: performance.now() - startTime,
            index,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const results = await Promise.all(promises);
      const successfulTransactions = results.filter(r => r.success);
      
      // Should handle concurrent transactions with good isolation
      expect(successfulTransactions.length).toBeGreaterThan(concurrentTransactions * 0.8); // > 80% success
      
      const transactionTimes = successfulTransactions.map(r => r.transactionTime);
      const avgTransactionTime = transactionTimes.reduce((sum, time) => sum + time, 0) / transactionTimes.length;
      
      expect(avgTransactionTime).toBeLessThan(3000); // Average transaction time under 3 seconds
      
      log.info('Transaction Isolation Test:', { data: {
        concurrentTransactions,
        successful: successfulTransactions.length,
        avgTransactionTime: `${avgTransactionTime.toFixed(0 }, 'concurrency');}}ms`,
        isolationEfficiency: `${(successfulTransactions.length / concurrentTransactions * 100).toFixed(1)}%`
      });
    });
  });

  describe('Load Balancing and Distribution', () => {
    it('should distribute load across available resources', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Simulate multiple database instances/connections
      const dbInstances = ['db-1', 'db-2', 'db-3'];
      const instanceLoad = new Map(dbInstances.map(id => [id, 0]));
      
      mockDb.select.mockImplementation(() => {
        // Simple round-robin load distribution simulation
        const sortedInstances = Array.from(instanceLoad.entries()).sort((a, b) => a[1] - b[1]);
        const selectedInstance = sortedInstances[0][0];
        instanceLoad.set(selectedInstance, instanceLoad.get(selectedInstance)! + 1);
        
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockImplementation(async () => {
                    // Simulate work
                    await new Promise(resolve => setTimeout(resolve, 50));
                    instanceLoad.set(selectedInstance, instanceLoad.get(selectedInstance)! - 1);
                    return [];
                  })
                })
              })
            })
          })
        };
      });

      const context = createMockContext();
      
      // Generate load across the system
      const totalRequests = 30;
      const promises = Array(totalRequests).fill(null).map(async (_, index) => {
        const startTime = performance.now();
        const result = await procurementApiService.getBOQs(context, {
          page: (index % 5) + 1,
          limit: 10
        });
        
        return {
          success: result.success,
          responseTime: performance.now() - startTime,
          index
        };
      });

      const results = await Promise.all(promises);
      const successfulRequests = results.filter(r => r.success);
      
      // Should distribute load evenly
      expect(successfulRequests.length).toBe(totalRequests);
      
      const finalLoad = Array.from(instanceLoad.values());
      const maxLoad = Math.max(...finalLoad);
      const minLoad = Math.min(...finalLoad);
      const loadImbalance = (maxLoad - minLoad) / (totalRequests / dbInstances.length);
      
      // Load should be reasonably balanced (some imbalance is normal)
      expect(loadImbalance).toBeLessThan(0.3); // Less than 30% imbalance
      
      log.info('Load Balancing Test:', { data: {
        totalRequests,
        successful: successfulRequests.length,
        instanceLoads: Object.fromEntries(instanceLoad }, 'concurrency');},
        loadImbalance: `${(loadImbalance * 100).toFixed(1)}%`
      });
    });

    it('should handle failover scenarios gracefully', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      const dbInstances = ['primary', 'secondary-1', 'secondary-2'];
      const instanceHealth = new Map(dbInstances.map(id => [id, true]));
      let primaryFailureTime: number | null = null;
      
      mockDb.select.mockImplementation(() => {
        // Simulate primary failure halfway through test
        const now = Date.now();
        if (!primaryFailureTime) {
          primaryFailureTime = now;
        }
        
        const timeSinceStart = now - primaryFailureTime;
        if (timeSinceStart > 1000) { // Fail primary after 1 second
          instanceHealth.set('primary', false);
        }
        
        // Find healthy instance
        const healthyInstance = Array.from(instanceHealth.entries()).find(([, healthy]) => healthy)?.[0];
        
        if (!healthyInstance) {
          throw new Error('All database instances unavailable');
        }
        
        // Simulate slower response from secondary instances
        const responseDelay = healthyInstance === 'primary' ? 50 : 100;
        
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockImplementation(async () => {
                    await new Promise(resolve => setTimeout(resolve, responseDelay));
                    return [];
                  })
                })
              })
            })
          })
        };
      });

      const context = createMockContext();
      
      // Generate requests over time to test failover
      const totalRequests = 20;
      const results = [];
      
      for (let i = 0; i < totalRequests; i++) {
        const startTime = performance.now();
        
        try {
          const result = await procurementApiService.getBOQs(context, {
            page: 1,
            limit: 10,
            search: `failover-test-${i}`
          });
          
          results.push({
            success: result.success,
            responseTime: performance.now() - startTime,
            requestIndex: i,
            error: null
          });
        } catch (error) {
          results.push({
            success: false,
            responseTime: performance.now() - startTime,
            requestIndex: i,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const successfulRequests = results.filter(r => r.success);
      const failedRequests = results.filter(r => !r.success);
      
      // Should maintain high availability despite failover
      expect(successfulRequests.length).toBeGreaterThan(totalRequests * 0.7); // > 70% success rate
      
      log.info('Failover Test:', { data: {
        totalRequests,
        successful: successfulRequests.length,
        failed: failedRequests.length,
        availability: `${(successfulRequests.length / totalRequests * 100 }, 'concurrency');}.toFixed(1)}%`,
        primaryHealthy: instanceHealth.get('primary')
      });
    });
  });
});