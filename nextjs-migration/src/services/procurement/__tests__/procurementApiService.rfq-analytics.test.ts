/**
 * Procurement API Service - RFQ Analytics Tests
 * Tests for RFQ statistics, analytics, and supplier management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { procurementApiService } from '../procurementApiService';
import { auditLogger } from '../auditLogger';
import {
  createMockContext,
  setupMocks,
  teardownMocks,
  mockRfqData,
  mockDatabaseSelect,
  mockDatabaseInsert
} from './testHelpers';

describe('ProcurementApiService - RFQ Analytics', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    teardownMocks();
  });

  describe('RFQ Statistics', () => {
    it('should provide RFQ statistics', async () => {
      const rfqsWithStats = [
        { ...mockRfqData, status: 'draft' },
        { ...mockRfqData, status: 'published' },
        { ...mockRfqData, status: 'closed' }
      ];
      mockDatabaseSelect(rfqsWithStats);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQStatistics(context);

      expect(result.success).toBe(true);
      expect(result.data?.totalRfqs).toBe(3);
      expect(result.data?.statusBreakdown.draft).toBe(1);
      expect(result.data?.statusBreakdown.published).toBe(1);
    });

    it('should calculate response rates', async () => {
      mockDatabaseSelect([mockRfqData]);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQResponseRates(context);

      expect(result.success).toBe(true);
      expect(result.data?.averageResponseRate).toBeDefined();
      expect(result.data?.supplierEngagement).toBeDefined();
    });

    it('should provide time-based analytics', async () => {
      const monthlyRfqs = [
        { ...mockRfqData, createdAt: new Date('2024-01-15') },
        { ...mockRfqData, createdAt: new Date('2024-02-15') },
        { ...mockRfqData, createdAt: new Date('2024-03-15') }
      ];
      mockDatabaseSelect(monthlyRfqs);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQTrends(context, {
        period: 'monthly',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      });

      expect(result.success).toBe(true);
      expect(result.data?.trends).toBeDefined();
      expect(result.data?.trends.length).toBe(3);
    });

    it('should calculate average RFQ duration', async () => {
      const completedRfqs = [
        {
          ...mockRfqData,
          status: 'closed',
          createdAt: new Date('2024-01-01'),
          closedAt: new Date('2024-01-15') // 14 days
        },
        {
          ...mockRfqData,
          status: 'closed',
          createdAt: new Date('2024-02-01'),
          closedAt: new Date('2024-02-21') // 20 days
        }
      ];
      mockDatabaseSelect(completedRfqs);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQDurationMetrics(context);

      expect(result.success).toBe(true);
      expect(result.data?.averageDuration).toBe(17); // (14 + 20) / 2
      expect(result.data?.medianDuration).toBeDefined();
    });

    it('should provide value-based analytics', async () => {
      const valueRfqs = [
        { ...mockRfqData, estimatedValue: 10000 },
        { ...mockRfqData, estimatedValue: 25000 },
        { ...mockRfqData, estimatedValue: 50000 }
      ];
      mockDatabaseSelect(valueRfqs);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQValueAnalytics(context);

      expect(result.success).toBe(true);
      expect(result.data?.totalValue).toBe(85000);
      expect(result.data?.averageValue).toBe(28333.33);
    });
  });

  describe('Supplier Management', () => {
    it('should add suppliers to RFQ', async () => {
      mockDatabaseInsert([mockRfqData]);

      const context = createMockContext({ permissions: ['rfq:update'] });
      const supplierIds = ['supplier-3', 'supplier-4'];

      const result = await procurementApiService.addSuppliersToRFQ(context, 'rfq-123', supplierIds);

      expect(result.success).toBe(true);
      expect(result.data?.suppliersAdded).toBe(2);
    });

    it('should remove suppliers from RFQ', async () => {
      mockDatabaseInsert([mockRfqData]);

      const context = createMockContext({ permissions: ['rfq:update'] });
      const supplierIds = ['supplier-1'];

      const result = await procurementApiService.removeSuppliersFromRFQ(context, 'rfq-123', supplierIds);

      expect(result.success).toBe(true);
      expect(result.data?.suppliersRemoved).toBe(1);
    });

    it('should prevent supplier changes to published RFQ', async () => {
      const publishedRfq = { ...mockRfqData, status: 'published' };
      mockDatabaseSelect([publishedRfq]);

      const context = createMockContext({ permissions: ['rfq:update'] });
      const supplierIds = ['supplier-3'];

      const result = await procurementApiService.addSuppliersToRFQ(context, 'rfq-123', supplierIds);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot modify suppliers of published RFQ');
    });

    it('should validate supplier existence before adding', async () => {
      mockDatabaseSelect([]); // No suppliers found

      const context = createMockContext({ permissions: ['rfq:update'] });
      const supplierIds = ['non-existent-supplier'];

      const result = await procurementApiService.addSuppliersToRFQ(context, 'rfq-123', supplierIds);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid supplier IDs');
    });

    it('should prevent duplicate supplier additions', async () => {
      const rfqWithSuppliers = {
        ...mockRfqData,
        suppliers: [{ id: 'supplier-1' }, { id: 'supplier-2' }]
      };
      mockDatabaseSelect([rfqWithSuppliers]);

      const context = createMockContext({ permissions: ['rfq:update'] });
      const supplierIds = ['supplier-1']; // Already exists

      const result = await procurementApiService.addSuppliersToRFQ(context, 'rfq-123', supplierIds);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Supplier already added to RFQ');
    });

    it('should log supplier management actions', async () => {
      mockDatabaseInsert([mockRfqData]);

      const context = createMockContext({ permissions: ['rfq:update'] });
      const supplierIds = ['supplier-3'];

      await procurementApiService.addSuppliersToRFQ(context, 'rfq-123', supplierIds);

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'update',
        'rfq',
        'add_suppliers',
        'rfq-123',
        { supplierIds },
        expect.objectContaining({
          suppliersAdded: 1
        })
      );
    });
  });

  describe('Supplier Performance Analytics', () => {
    it('should track supplier response rates', async () => {
      const supplierPerformance = [
        { supplierId: 'supplier-1', responseRate: 0.85, avgResponseTime: 2.5 },
        { supplierId: 'supplier-2', responseRate: 0.92, avgResponseTime: 1.8 },
        { supplierId: 'supplier-3', responseRate: 0.76, avgResponseTime: 3.2 }
      ];
      mockDatabaseSelect(supplierPerformance);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getSupplierPerformanceMetrics(context);

      expect(result.success).toBe(true);
      expect(result.data?.suppliers).toHaveLength(3);
      expect(result.data?.overallResponseRate).toBeDefined();
    });

    it('should rank suppliers by performance', async () => {
      mockDatabaseSelect([]);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getTopPerformingSuppliers(context, { limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data?.topSuppliers).toBeDefined();
    });

    it('should provide supplier engagement metrics', async () => {
      mockDatabaseSelect([mockRfqData]);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getSupplierEngagementMetrics(context, 'supplier-1');

      expect(result.success).toBe(true);
      expect(result.data?.totalRfqsInvited).toBeDefined();
      expect(result.data?.responsesSubmitted).toBeDefined();
      expect(result.data?.avgResponseTime).toBeDefined();
    });
  });

  describe('Performance Reporting', () => {
    it('should generate RFQ performance dashboard data', async () => {
      mockDatabaseSelect([mockRfqData]);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQDashboardData(context);

      expect(result.success).toBe(true);
      expect(result.data?.totalActive).toBeDefined();
      expect(result.data?.totalClosed).toBeDefined();
      expect(result.data?.avgResponseTime).toBeDefined();
      expect(result.data?.supplierEngagement).toBeDefined();
    });

    it('should export RFQ analytics data', async () => {
      mockDatabaseSelect([mockRfqData]);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.exportRFQAnalytics(context, {
        format: 'csv',
        dateRange: {
          from: new Date('2024-01-01'),
          to: new Date('2024-12-31')
        }
      });

      expect(result.success).toBe(true);
      expect(result.data?.exportUrl).toBeDefined();
      expect(result.data?.recordCount).toBeDefined();
    });
  });
});