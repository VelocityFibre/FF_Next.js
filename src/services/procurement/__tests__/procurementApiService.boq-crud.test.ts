/**
 * Procurement API Service - BOQ CRUD Operations Tests
 * Tests for BOQ listing, fetching, and import operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { procurementApiService } from '../procurementApiService';
import { auditLogger } from '../auditLogger';
import {
  createMockContext,
  setupMocks,
  teardownMocks,
  mockBoqData,
  mockBoqItems,
  mockDatabaseSelect,
  mockDatabaseInsert
} from './testHelpers';

describe('ProcurementApiService - BOQ CRUD Operations', () => {
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

    it('should handle empty results gracefully', async () => {
      mockDatabaseSelect([]);

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(true);
      expect(result.data?.boqs).toEqual([]);
      expect(result.data?.total).toBe(0);
    });

    it('should apply search filters', async () => {
      mockDatabaseSelect([mockBoqData]);

      const context = createMockContext();
      const filters = {
        search: 'Test BOQ',
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

    it('should sort BOQs by specified field', async () => {
      const sortedBoqs = [
        { ...mockBoqData, title: 'A BOQ' },
        { ...mockBoqData, title: 'B BOQ' }
      ];
      mockDatabaseSelect(sortedBoqs);

      const context = createMockContext();
      const filters = {
        sortBy: 'title',
        sortOrder: 'asc'
      };

      const result = await procurementApiService.getBOQs(context, filters);

      expect(result.success).toBe(true);
      expect(result.data?.boqs).toEqual(sortedBoqs);
    });
  });

  describe('getBOQById', () => {
    it('should return BOQ with items and exceptions', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock BOQ query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockBoqData])
          })
        })
      });

      // Mock items query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockBoqItems)
          })
        })
      });

      // Mock exceptions query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([])
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

    it('should include related data in BOQ response', async () => {
      const boqWithRelations = {
        ...mockBoqData,
        items: mockBoqItems,
        exceptions: [],
        totalItems: 1,
        mappedPercentage: 100
      };
      
      mockDatabaseSelect([boqWithRelations]);

      const context = createMockContext();
      const result = await procurementApiService.getBOQById(context, 'boq-123');

      expect(result.success).toBe(true);
      expect(result.data?.totalItems).toBeDefined();
      expect(result.data?.mappedPercentage).toBeDefined();
    });
  });

  describe('importBOQ', () => {
    it('should import BOQ with valid data', async () => {
      const newBoqId = 'new-boq-id';
      mockDatabaseInsert([{ ...mockBoqData, id: newBoqId }]);

      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = {
        fileName: 'test_boq.xlsx',
        fileSize: 1024000,
        version: 'v1.0',
        title: 'Test BOQ Import',
        rows: [
          {
            lineNumber: 1,
            description: 'Test item',
            quantity: 100,
            uom: 'pcs',
            unitPrice: 10.50
          }
        ]
      };

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

    it('should handle duplicate import detection', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = {
        fileName: 'duplicate_boq.xlsx',
        fileSize: 1000,
        version: 'v1.0',
        title: 'Duplicate BOQ',
        rows: []
      };

      // Mock duplicate detection
      mockDatabaseSelect([mockBoqData]); // Existing BOQ found

      const result = await procurementApiService.importBOQ(context, importData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('duplicate');
    });

    it('should log import operations', async () => {
      mockDatabaseInsert([{ ...mockBoqData, id: 'new-boq-id' }]);

      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = {
        fileName: 'test_boq.xlsx',
        fileSize: 1000,
        version: 'v1.0',
        title: 'Test BOQ',
        rows: []
      };

      await procurementApiService.importBOQ(context, importData);

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'create',
        'boq',
        'import',
        'new-boq-id',
        null,
        expect.objectContaining({
          fileName: importData.fileName
        })
      );
    });
  });
});