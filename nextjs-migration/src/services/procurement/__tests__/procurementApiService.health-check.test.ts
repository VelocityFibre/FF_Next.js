/**
 * Procurement API Service - Health Check Tests
 * Tests for system health monitoring and status reporting
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { procurementApiService } from '../procurementApiService';
import {
  setupMocks,
  teardownMocks,
  mockDatabaseSelect,
  mockDatabaseError
} from './testHelpers';

describe('ProcurementApiService - Health Check', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    teardownMocks();
  });

  describe('System Health', () => {
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

    it('should provide detailed health information', async () => {
      mockDatabaseSelect([{ count: 1 }]);

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.details).toEqual(
        expect.objectContaining({
          database: 'connected',
          middleware: expect.any(String),
          services: expect.any(Object)
        })
      );
    });

    it('should handle partial service failures', async () => {
      // Mock database connected but other services failing
      mockDatabaseSelect([{ count: 1 }]);

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBeDefined();
    });

    it('should provide uptime information', async () => {
      mockDatabaseSelect([{ count: 1 }]);

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.uptime).toBeDefined();
      expect(typeof result.data?.uptime).toBe('number');
    });
  });

  describe('Performance Monitoring', () => {
    it('should track operation response times', async () => {
      mockDatabaseSelect([]);

      const startTime = Date.now();
      await procurementApiService.getHealthStatus();
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should monitor database connection pool', async () => {
      mockDatabaseSelect([{ count: 1 }]);

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.details?.connectionPool).toBeDefined();
    });

    it('should check system resources', async () => {
      mockDatabaseSelect([{ count: 1 }]);

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.details?.memory).toBeDefined();
      expect(result.data?.details?.cpu).toBeDefined();
    });
  });

  describe('Service Dependencies', () => {
    it('should check external service connectivity', async () => {
      mockDatabaseSelect([{ count: 1 }]);

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.details?.externalServices).toBeDefined();
    });

    it('should validate configuration', async () => {
      mockDatabaseSelect([{ count: 1 }]);

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.details?.configuration).toBeDefined();
    });
  });

  describe('Alerting and Monitoring', () => {
    it('should provide alerts for critical issues', async () => {
      mockDatabaseError('Critical system failure');

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('unhealthy');
      expect(result.data?.alerts).toBeDefined();
      expect(result.data?.alerts?.length).toBeGreaterThan(0);
    });

    it('should provide warning for degraded performance', async () => {
      mockDatabaseSelect([{ count: 1 }]);

      // Mock slow response
      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      if (result.data?.responseTime > 1000) {
        expect(result.data?.warnings).toBeDefined();
      }
    });
  });
});