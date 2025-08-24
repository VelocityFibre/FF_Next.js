/**
 * RFQ CRUD Operations Tests
 * Tests for basic RFQ create, read, update operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { procurementApiService } from '../../procurementApiService';
import { auditLogger } from '../../auditLogger';
import {
  createMockContext,
  setupMocks,
  cleanupMocks,
  mockRfqData,
  generateRfqData
} from '../shared/testHelpers';

// Mock dependencies
import { vi } from 'vitest';
vi.mock('../../middleware/projectAccessMiddleware');
vi.mock('../../middleware/rbacMiddleware');
vi.mock('../../auditLogger');
vi.mock('@/lib/neon/connection');

describe('RFQ CRUD Operations', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  describe('createRFQ', () => {
    it('should create RFQ with valid data', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'rfq-123',
            projectId: 'test-project-id',
            rfqNumber: 'RFQ-001',
            title: 'Test RFQ',
            status: 'draft'
          }])
        })
      });

      const context = createMockContext({ permissions: ['rfq:create'] });
      const rfqData = generateRfqData();

      const result = await procurementApiService.createRFQ(context, rfqData);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('rfq-123');
      expect(result.data?.title).toBe('Test RFQ');
    });

    it('should validate RFQ data before creation', async () => {
      const context = createMockContext({ permissions: ['rfq:create'] });
      const invalidRfqData = {
        // Missing required title
        description: 'Test description',
        responseDeadline: new Date('2024-12-31'),
        supplierIds: []
      };

      const result = await procurementApiService.createRFQ(context, invalidRfqData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid RFQ data');
    });

    it('should generate unique RFQ number', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock existing RFQ number check
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ rfqNumber: 'RFQ-001' }])
            })
          })
        })
      });

      // Mock RFQ insert
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'rfq-124',
            projectId: 'test-project-id',
            rfqNumber: 'RFQ-002',
            title: 'Another Test RFQ',
            status: 'draft'
          }])
        })
      });

      const context = createMockContext({ permissions: ['rfq:create'] });
      const rfqData = generateRfqData();

      const result = await procurementApiService.createRFQ(context, rfqData);

      expect(result.success).toBe(true);
      expect(result.data?.rfqNumber).toMatch(/^RFQ-\d+$/);
    });

    it('should log RFQ creation', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockRfqData])
        })
      });

      const context = createMockContext({ permissions: ['rfq:create'] });
      const rfqData = generateRfqData();

      await procurementApiService.createRFQ(context, rfqData);

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'create',
        'rfq',
        mockRfqData.id,
        null,
        expect.any(Object),
        expect.objectContaining({
          title: rfqData.title,
          supplierCount: rfqData.supplierIds.length
        })
      );
    });

    it('should validate response deadline is in the future', async () => {
      const context = createMockContext({ permissions: ['rfq:create'] });
      const pastDeadlineData = {
        ...generateRfqData(),
        responseDeadline: new Date('2020-01-01') // Past date
      };

      const result = await procurementApiService.createRFQ(context, pastDeadlineData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Response deadline must be in the future');
    });

    it('should validate supplier IDs exist', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock supplier validation - return empty array (no suppliers found)
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([])
        })
      });

      const context = createMockContext({ permissions: ['rfq:create'] });
      const invalidSuppliersData = {
        ...generateRfqData(),
        supplierIds: ['non-existent-supplier']
      };

      const result = await procurementApiService.createRFQ(context, invalidSuppliersData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid supplier IDs');
    });

    it('should handle database errors during creation', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.insert.mockImplementation(() => {
        throw new Error('Database constraint violation');
      });

      const context = createMockContext({ permissions: ['rfq:create'] });
      const rfqData = generateRfqData();

      const result = await procurementApiService.createRFQ(context, rfqData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create RFQ');
    });

    it('should validate required permissions for creation', async () => {
      const context = createMockContext({ permissions: ['rfq:read'] }); // Missing create permission
      const rfqData = generateRfqData();

      const result = await procurementApiService.createRFQ(context, rfqData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });
  });

  describe('getRFQs', () => {
    it('should return paginated RFQs', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([mockRfqData])
              })
            })
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQs(context);

      expect(result.success).toBe(true);
      expect(result.data?.rfqs).toEqual([mockRfqData]);
      expect(result.data?.page).toBe(1);
      expect(result.data?.limit).toBe(20);
    });

    it('should filter RFQs by status', async () => {
      const draftRfqs = [{ ...mockRfqData, status: 'draft' }];
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(draftRfqs)
              })
            })
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const filters = { status: 'draft' };

      const result = await procurementApiService.getRFQs(context, filters);

      expect(result.success).toBe(true);
      expect(result.data?.rfqs).toEqual(draftRfqs);
    });

    it('should filter RFQs by date range', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([mockRfqData])
              })
            })
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const filters = {
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-12-31')
      };

      const result = await procurementApiService.getRFQs(context, filters);

      expect(result.success).toBe(true);
      expect(result.data?.rfqs).toEqual([mockRfqData]);
    });

    it('should search RFQs by title and description', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([mockRfqData])
              })
            })
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const filters = {
        search: 'Test RFQ',
        searchFields: ['title', 'description']
      };

      const result = await procurementApiService.getRFQs(context, filters);

      expect(result.success).toBe(true);
      expect(result.data?.rfqs).toEqual([mockRfqData]);
    });

    it('should handle empty results gracefully', async () => {
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

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQs(context);

      expect(result.success).toBe(true);
      expect(result.data?.rfqs).toEqual([]);
      expect(result.data?.total).toBe(0);
    });

    it('should validate pagination parameters', async () => {
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

      const context = createMockContext({ permissions: ['rfq:read'] });
      const invalidFilters = {
        page: -1,
        limit: 1000
      };

      const result = await procurementApiService.getRFQs(context, invalidFilters);

      expect(result.success).toBe(true);
      expect(result.data?.page).toBeGreaterThan(0);
      expect(result.data?.limit).toBeLessThanOrEqual(100);
    });
  });

  describe('getRFQById', () => {
    it('should return RFQ with full details', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRfqData])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQById(context, 'rfq-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRfqData);
    });

    it('should return 404 for non-existent RFQ', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQById(context, 'non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('RFQ not found');
    });

    it('should include supplier response status', async () => {
      const rfqWithResponses = {
        ...mockRfqData,
        suppliers: [
          { id: 'supplier-1', status: 'responded' },
          { id: 'supplier-2', status: 'pending' }
        ]
      };
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([rfqWithResponses])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQById(context, 'rfq-123');

      expect(result.success).toBe(true);
      expect(result.data?.suppliers).toHaveLength(2);
      expect(result.data?.suppliers[0].status).toBe('responded');
    });

    it('should validate RFQ ID parameter', async () => {
      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQById(context, '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid RFQ ID');
    });

    it('should log audit trail for RFQ access', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRfqData])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      await procurementApiService.getRFQById(context, 'rfq-123');

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'view',
        'rfq',
        'rfq-123',
        null,
        null,
        expect.any(Object)
      );
    });
  });

  describe('updateRFQ', () => {
    it('should update RFQ with valid data', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock existing RFQ check
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRfqData])
          })
        })
      });

      // Mock update
      const updatedRfq = { ...mockRfqData, title: 'Updated RFQ Title' };
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const updateData = { title: 'Updated RFQ Title' };

      const result = await procurementApiService.updateRFQ(context, 'rfq-123', updateData);

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Updated RFQ Title');
    });

    it('should prevent updates to published RFQs', async () => {
      const publishedRfq = { ...mockRfqData, status: 'published' };
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([publishedRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const updateData = { title: 'Updated Title' };

      const result = await procurementApiService.updateRFQ(context, 'rfq-123', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot update published RFQ');
    });

    it('should log RFQ updates', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRfqData])
          })
        })
      });

      const updatedRfq = { ...mockRfqData, title: 'Updated RFQ Title' };
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const updateData = { title: 'Updated RFQ Title' };

      await procurementApiService.updateRFQ(context, 'rfq-123', updateData);

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'update',
        'rfq',
        'rfq-123',
        expect.any(Object),
        updateData,
        null
      );
    });

    it('should validate update data', async () => {
      const context = createMockContext({ permissions: ['rfq:update'] });
      const invalidUpdateData = {
        responseDeadline: 'invalid-date' // Should be Date object
      };

      const result = await procurementApiService.updateRFQ(context, 'rfq-123', invalidUpdateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid update data');
    });

    it('should handle non-existent RFQ updates', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const updateData = { title: 'Updated Title' };

      const result = await procurementApiService.updateRFQ(context, 'non-existent', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('RFQ not found');
    });
  });
});