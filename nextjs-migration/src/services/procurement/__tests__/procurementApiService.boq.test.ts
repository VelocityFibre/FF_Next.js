/**
 * Procurement API Service - BOQ Operations Tests
 * Tests for BOQ listing, fetching, and import operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { procurementApiService } from '../procurementApiService';
import { auditLogger } from '../auditLogger';
import {
  createMockContext,
  setupMocks,
  teardownMocks,
  mockBoqData,
  mockBoqItems,
  mockDatabaseSelect,
  mockDatabaseInsert,
  createValidBOQImportData
} from './testHelpers';

describe('ProcurementApiService - BOQ Operations', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    teardownMocks();
  });

  describe('getBOQs', () => {
    it('should return paginated BOQs with default parameters', async () => {
      mockDatabaseSelect([mockBoqData]);

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        boqs: [mockBoqData],
        total: expect.any(Number),
        page: 1,
        limit: 20
      });
    });

    it('should apply filters correctly', async () => {
      mockDatabaseSelect([]);

      const context = createMockContext();
      const filters = {
        status: 'approved',
        page: 2,
        limit: 10
      };

      const result = await procurementApiService.getBOQs(context, filters);

      expect(result.success).toBe(true);
      expect(result.data?.page).toBe(2);
      expect(result.data?.limit).toBe(10);
    });

    it('should handle empty results', async () => {
      mockDatabaseSelect([]);

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(true);
      expect(result.data?.boqs).toEqual([]);
      expect(result.data?.total).toBe(0);
    });

    it('should log audit trail for view operations', async () => {
      mockDatabaseSelect([mockBoqData]);

      const context = createMockContext();
      await procurementApiService.getBOQs(context);

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'view',
        'boq',
        'list',
        null,
        null,
        expect.objectContaining({
          resultCount: expect.any(Number),
          total: expect.any(Number)
        })
      );
    });

    it('should support search functionality', async () => {
      mockDatabaseSelect([mockBoqData]);

      const context = createMockContext();
      const filters = {
        search: 'Fiber',
        searchFields: ['title', 'description']
      };

      const result = await procurementApiService.getBOQs(context, filters);

      expect(result.success).toBe(true);
      expect(result.data?.boqs).toEqual([mockBoqData]);
    });

    it('should handle date range filters', async () => {
      mockDatabaseSelect([mockBoqData]);

      const context = createMockContext();
      const filters = {
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-12-31')
      };

      const result = await procurementApiService.getBOQs(context, filters);

      expect(result.success).toBe(true);
      expect(result.data?.boqs).toEqual([mockBoqData]);
    });
  });

  describe('getBOQById', () => {
    it('should return BOQ with items and exceptions', async () => {
      const mockDb = require('@/lib/neon/connection').db;
      
      // Mock BOQ query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockBoqData])
          })
        })
      });

      // Mock items query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockBoqItems)
          })
        })
      });

      // Mock exceptions query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([])
          })
        })
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQById(context, 'boq-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        ...mockBoqData,
        items: mockBoqItems,
        exceptions: []
      });
    });

    it('should return 404 for non-existent BOQ', async () => {
      mockDatabaseSelect([]);

      const context = createMockContext();
      const result = await procurementApiService.getBOQById(context, 'non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('BOQ not found');
    });

    it('should log audit trail for individual BOQ views', async () => {
      mockDatabaseSelect([mockBoqData]);

      const context = createMockContext();
      await procurementApiService.getBOQById(context, 'boq-123');

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'view',
        'boq',
        'detail',
        'boq-123',
        null,
        expect.any(Object)
      );
    });

    it('should include version information', async () => {
      const versionedBoq = { ...mockBoqData, version: 'v2.0' };
      mockDatabaseSelect([versionedBoq]);

      const context = createMockContext();
      const result = await procurementApiService.getBOQById(context, 'boq-123');

      expect(result.success).toBe(true);
      expect(result.data?.version).toBe('v2.0');
    });
  });

  describe('importBOQ', () => {
    it('should import BOQ with valid data', async () => {
      const newBoqId = 'new-boq-id';
      mockDatabaseInsert([{ ...mockBoqData, id: newBoqId }]);

      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = createValidBOQImportData();

      const result = await procurementApiService.importBOQ(context, importData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        boqId: newBoqId,
        itemCount: 1,
        exceptionsCount: 0
      });
    });

    it('should validate import data structure', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const invalidData = {
        fileName: 'test.xlsx',
        // Missing required fields
        rows: []
      };

      const result = await procurementApiService.importBOQ(context, invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid BOQ import data');
    });

    it('should handle duplicate import attempts', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = {
        ...createValidBOQImportData(),
        fileName: 'duplicate_boq.xlsx'
      };

      // First import should succeed
      mockDatabaseInsert([{ ...mockBoqData, id: 'boq-1' }]);
      const result1 = await procurementApiService.importBOQ(context, importData);
      expect(result1.success).toBe(true);

      // Second import should be detected as duplicate
      const result2 = await procurementApiService.importBOQ(context, importData);
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('duplicate');
    });

    it('should log import operations', async () => {
      mockDatabaseInsert([{ ...mockBoqData, id: 'new-boq-id' }]);

      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = createValidBOQImportData();

      await procurementApiService.importBOQ(context, importData);

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'create',
        'boq',
        'import',
        'new-boq-id',
        null,
        expect.objectContaining({
          fileName: importData.fileName,
          itemCount: 1
        })
      );
    });

    it('should handle large import files', async () => {
      mockDatabaseInsert([{ ...mockBoqData, id: 'large-boq-id' }]);

      const context = createMockContext({ permissions: ['boq:create'] });
      const largeImportData = {
        ...createValidBOQImportData(),
        fileSize: 50 * 1024 * 1024, // 50MB
        rows: Array(10000).fill({
          lineNumber: 1,
          description: 'Test item',
          quantity: 100,
          uom: 'pcs',
          unitPrice: 10.50
        })
      };

      const result = await procurementApiService.importBOQ(context, largeImportData);

      expect(result.success).toBe(true);
      expect(result.data?.itemCount).toBe(10000);
    });

    it('should validate data types in import rows', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const invalidRowData = {
        ...createValidBOQImportData(),
        rows: [{
          lineNumber: 'not-a-number',
          description: 'Test item',
          quantity: 'invalid-quantity',
          uom: 'pcs',
          unitPrice: 'not-a-price'
        }]
      };

      const result = await procurementApiService.importBOQ(context, invalidRowData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid data types');
    });
  });

  describe('BOQ Statistics and Analytics', () => {
    it('should calculate BOQ statistics correctly', async () => {
      const boqsWithStats = [
        { ...mockBoqData, status: 'draft', totalEstimatedValue: 10000 },
        { ...mockBoqData, status: 'approved', totalEstimatedValue: 20000 },
        { ...mockBoqData, status: 'in_progress', totalEstimatedValue: 15000 }
      ];
      mockDatabaseSelect(boqsWithStats);

      const context = createMockContext();
      const result = await procurementApiService.getBOQStatistics(context);

      expect(result.success).toBe(true);
      expect(result.data?.totalValue).toBe(45000);
      expect(result.data?.statusBreakdown.draft).toBe(1);
      expect(result.data?.statusBreakdown.approved).toBe(1);
    });

    it('should provide BOQ completion metrics', async () => {
      mockDatabaseSelect([mockBoqData]);

      const context = createMockContext();
      const result = await procurementApiService.getBOQCompletionMetrics(context, 'boq-123');

      expect(result.success).toBe(true);
      expect(result.data?.completionPercentage).toBeDefined();
      expect(result.data?.mappingProgress).toBeDefined();
    });
  });
});