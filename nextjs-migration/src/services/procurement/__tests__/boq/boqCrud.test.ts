/**
 * BOQ CRUD Operations Tests
 * Tests for BOQ-related API operations (getBOQs, getBOQById, importBOQ)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { procurementApiService } from '../../procurementApiService';
import { auditLogger } from '../../auditLogger';
import { 
  createMockContext, 
  setupMocks, 
  cleanupMocks, 
  mockBoqData, 
  mockBoqItems,
  generateBoqImportData,
  createMockDbResponse,
  createMockDbInsert
} from '../shared/testHelpers';

// Mock dependencies
vi.mock('../../middleware/projectAccessMiddleware');
vi.mock('../../middleware/rbacMiddleware');
vi.mock('../../auditLogger');
vi.mock('@/lib/neon/connection');

describe('ProcurementApiService - BOQ Operations', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  describe('getBOQs', () => {
    it('should return paginated BOQs with default parameters', async () => {
      // Mock database response
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([mockBoqData])
              })
            })
          })
        })
      });

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
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(true);
      expect(result.data?.boqs).toEqual([]);
      expect(result.data?.total).toBe(0);
    });

    it('should log audit trail for view operations', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([mockBoqData])
              })
            })
          })
        })
      });

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

    it('should validate pagination parameters', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue(createMockDbResponse([]));

      const context = createMockContext();
      const invalidFilters = {
        page: -1,
        limit: 1000
      };

      const result = await procurementApiService.getBOQs(context, invalidFilters);

      // Should normalize invalid parameters
      expect(result.success).toBe(true);
      expect(result.data?.page).toBeGreaterThan(0);
      expect(result.data?.limit).toBeLessThanOrEqual(100);
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
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        })
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQById(context, 'non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('BOQ not found');
    });

    it('should validate BOQ ID parameter', async () => {
      const context = createMockContext();
      const result = await procurementApiService.getBOQById(context, '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid BOQ ID');
    });

    it('should log audit trail for detailed view', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockBoqData]),
            orderBy: vi.fn().mockResolvedValue([])
          })
        })
      });

      const context = createMockContext();
      await procurementApiService.getBOQById(context, 'boq-123');

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'view',
        'boq',
        'boq-123',
        null,
        null,
        expect.any(Object)
      );
    });
  });

  describe('importBOQ', () => {
    it('should import BOQ with valid data', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock BOQ insert
      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ ...mockBoqData, id: 'new-boq-id' }])
        })
      });

      // Mock items insert
      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockResolvedValue(undefined)
      });

      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = generateBoqImportData();

      const result = await procurementApiService.importBOQ(context, importData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        boqId: 'new-boq-id',
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

    it('should handle import with validation errors', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const dataWithErrors = generateBoqImportData({
        rows: [
          {
            lineNumber: 1,
            description: '', // Invalid - empty description
            quantity: -5,    // Invalid - negative quantity
            uom: 'invalid',  // Invalid - unknown unit
            unitPrice: 'not-a-number' // Invalid - not numeric
          }
        ]
      });

      const result = await procurementApiService.importBOQ(context, dataWithErrors);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation errors');
    });

    it('should log audit trail for import operations', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.insert.mockReturnValue(createMockDbInsert([{ 
        ...mockBoqData, 
        id: 'imported-boq-id' 
      }]));

      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = generateBoqImportData();

      await procurementApiService.importBOQ(context, importData);

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'create',
        'boq',
        'imported-boq-id',
        null,
        expect.any(Object),
        expect.objectContaining({
          itemCount: expect.any(Number),
          exceptionsCount: expect.any(Number)
        })
      );
    });

    it('should handle database errors during import', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.insert.mockImplementation(() => {
        throw new Error('Database constraint violation');
      });

      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = generateBoqImportData();

      const result = await procurementApiService.importBOQ(context, importData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Import failed');
    });

    it('should validate file size limits', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const oversizedData = generateBoqImportData({
        fileSize: 100 * 1024 * 1024 // 100MB - over limit
      });

      const result = await procurementApiService.importBOQ(context, oversizedData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File size exceeds limit');
    });

    it('should handle duplicate BOQ imports', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock existing BOQ check
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockBoqData])
          })
        })
      });

      const context = createMockContext({ permissions: ['boq:create'] });
      const duplicateData = generateBoqImportData({
        title: mockBoqData.title,
        version: mockBoqData.version
      });

      const result = await procurementApiService.importBOQ(context, duplicateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('BOQ already exists');
    });
  });
});