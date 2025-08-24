/**
 * Health Check Tests
 * Tests for system health check and monitoring endpoints
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { procurementApiService } from '../../procurementApiService';
import { setupMocks, cleanupMocks } from '../shared/testHelpers';

// Mock dependencies
vi.mock('../../middleware/projectAccessMiddleware');
vi.mock('../../middleware/rbacMiddleware');
vi.mock('../../auditLogger');
vi.mock('@/lib/neon/connection');

describe('ProcurementApiService - Health Check', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  describe('Basic Health Check', () => {
    it('should return healthy status when database is accessible', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('healthy');
      expect(result.data?.details?.database).toBe('connected');
    });

    it('should return unhealthy status when database is not accessible', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('unhealthy');
      expect(result.data?.details?.error).toBe('Connection failed');
    });

    it('should include timestamp in health check response', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      const beforeCheck = Date.now();
      const result = await procurementApiService.getHealthStatus();
      const afterCheck = Date.now();

      expect(result.success).toBe(true);
      expect(result.data?.timestamp).toBeGreaterThanOrEqual(beforeCheck);
      expect(result.data?.timestamp).toBeLessThanOrEqual(afterCheck);
    });

    it('should include version information', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.version).toBeDefined();
      expect(typeof result.data?.version).toBe('string');
    });
  });

  describe('Detailed Health Check', () => {
    it('should include database connection details', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.details?.database).toBe('connected');
      expect(result.data?.details?.databaseLatency).toBeDefined();
    });

    it('should check dependent services status', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.details?.services).toBeDefined();
      expect(result.data?.details?.services?.authentication).toBeDefined();
      expect(result.data?.details?.services?.authorization).toBeDefined();
    });

    it('should measure response time', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.responseTime).toBeDefined();
      expect(typeof result.data?.responseTime).toBe('number');
      expect(result.data?.responseTime).toBeGreaterThan(0);
    });

    it('should include system metrics', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.metrics).toBeDefined();
      expect(result.data?.metrics?.uptime).toBeDefined();
      expect(result.data?.metrics?.memoryUsage).toBeDefined();
    });
  });

  describe('Database Health Monitoring', () => {
    it('should detect slow database queries', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockImplementation(() => {
            // Simulate slow query
            return new Promise(resolve => {
              setTimeout(() => resolve([{ count: 1 }]), 2000);
            });
          })
        })
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.warnings).toBeDefined();
      expect(result.data?.warnings).toContain('Slow database response');
    });

    it('should check database connection pool status', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      // Mock connection pool info
      const mockConnectionInfo = {
        totalConnections: 10,
        activeConnections: 3,
        idleConnections: 7,
        waitingClients: 0
      };
      
      vi.mocked(require('@/lib/neon/connection')).getConnectionPoolInfo = vi.fn()
        .mockReturnValue(mockConnectionInfo);

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.details?.connectionPool).toEqual(mockConnectionInfo);
    });

    it('should detect database lock issues', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock query to check for locks
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      // Mock lock detection query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { query: 'SELECT * FROM boqs', wait_time: '00:05:30' }
          ])
        })
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.warnings).toContain('Database locks detected');
    });
  });

  describe('Service Dependencies Health', () => {
    it('should check authentication service health', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      // Mock authentication service check
      const { projectAccessMiddleware } = await import('../../middleware/projectAccessMiddleware');
      vi.mocked(projectAccessMiddleware.healthCheck).mockResolvedValue({
        success: true,
        data: { status: 'healthy', responseTime: 150 }
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.details?.services?.authentication?.status).toBe('healthy');
    });

    it('should check authorization service health', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      // Mock authorization service check
      const { rbacMiddleware } = await import('../../middleware/rbacMiddleware');
      vi.mocked(rbacMiddleware.healthCheck).mockResolvedValue({
        success: true,
        data: { status: 'healthy', cacheHitRate: 0.95 }
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.details?.services?.authorization?.status).toBe('healthy');
    });

    it('should detect unhealthy dependencies', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      // Mock unhealthy authentication service
      const { projectAccessMiddleware } = await import('../../middleware/projectAccessMiddleware');
      vi.mocked(projectAccessMiddleware.healthCheck).mockRejectedValue(
        new Error('Service unavailable')
      );

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('degraded');
      expect(result.data?.details?.services?.authentication?.status).toBe('unhealthy');
    });
  });

  describe('Performance Metrics', () => {
    it('should track API endpoint response times', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.performance?.endpoints).toBeDefined();
      expect(result.data?.performance?.endpoints?.getBOQs).toBeDefined();
      expect(result.data?.performance?.endpoints?.createRFQ).toBeDefined();
    });

    it('should monitor memory usage trends', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      // Mock memory usage info
      const mockMemoryUsage = {
        rss: 52428800,
        heapTotal: 31457280,
        heapUsed: 20971520,
        external: 1048576,
        arrayBuffers: 524288
      };
      
      vi.spyOn(process, 'memoryUsage').mockReturnValue(mockMemoryUsage);

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.metrics?.memoryUsage).toEqual(mockMemoryUsage);
    });

    it('should detect performance degradation', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockImplementation(() => {
            // Simulate very slow query
            return new Promise(resolve => {
              setTimeout(() => resolve([{ count: 1 }]), 5000);
            });
          })
        })
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('degraded');
      expect(result.data?.alerts).toContain('Performance degradation detected');
    });
  });

  describe('Error Rate Monitoring', () => {
    it('should track error rates over time', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.errorRates).toBeDefined();
      expect(result.data?.errorRates?.last1Hour).toBeDefined();
      expect(result.data?.errorRates?.last24Hours).toBeDefined();
    });

    it('should alert on high error rates', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      // Mock high error rate scenario
      vi.spyOn(procurementApiService as any, 'getErrorRateMetrics').mockReturnValue({
        last1Hour: 0.15, // 15% error rate - above threshold
        last24Hours: 0.08
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.alerts).toContain('High error rate detected');
    });
  });

  describe('Health Check Caching', () => {
    it('should cache health check results', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      const selectSpy = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });
      mockDb.select = selectSpy;

      // First call
      await procurementApiService.getHealthStatus();
      expect(selectSpy).toHaveBeenCalledTimes(1);

      // Second call within cache period
      await procurementApiService.getHealthStatus();
      expect(selectSpy).toHaveBeenCalledTimes(1); // Should use cache
    });

    it('should invalidate cache after TTL expires', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      const selectSpy = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });
      mockDb.select = selectSpy;

      // First call
      await procurementApiService.getHealthStatus();
      expect(selectSpy).toHaveBeenCalledTimes(1);

      // Mock time passage beyond cache TTL
      vi.advanceTimersByTime(60000); // Advance by 1 minute

      // Second call after cache expiry
      await procurementApiService.getHealthStatus();
      expect(selectSpy).toHaveBeenCalledTimes(2); // Should query database again
    });
  });
});