/**
 * RFQ Operations Tests
 * Tests for RFQ-related API operations (createRFQ, updateRFQ, getRFQs)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { procurementApiService } from '../../procurementApiService';
import { auditLogger } from '../../auditLogger';
import { 
  createMockContext, 
  setupMocks, 
  cleanupMocks, 
  mockRfqData,
  generateRfqData,
  createMockDbInsert
} from '../shared/testHelpers';

// Mock dependencies
vi.mock('../../middleware/projectAccessMiddleware');
vi.mock('../../middleware/rbacMiddleware');
vi.mock('../../auditLogger');
vi.mock('@/lib/neon/connection');

describe('ProcurementApiService - RFQ Operations', () => {
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
        responseDeadline: new Date('2024-02-15'),
        supplierIds: []
      };

      const result = await procurementApiService.createRFQ(context, invalidRfqData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid RFQ data');
    });

    it('should generate unique RFQ number', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock existing RFQ check
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
      mockDb.insert.mockReturnValue(createMockDbInsert([{
        ...mockRfqData,
        rfqNumber: 'RFQ-002' // Should generate next number
      }]));

      const context = createMockContext({ permissions: ['rfq:create'] });
      const rfqData = generateRfqData();

      const result = await procurementApiService.createRFQ(context, rfqData);

      expect(result.success).toBe(true);
      expect(result.data?.rfqNumber).toBe('RFQ-002');
    });

    it('should validate supplier IDs', async () => {
      const context = createMockContext({ permissions: ['rfq:create'] });
      const rfqDataWithInvalidSuppliers = generateRfqData({
        supplierIds: ['invalid-supplier-1', 'invalid-supplier-2']
      });

      // Mock supplier validation
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]) // No suppliers found
        })
      });

      const result = await procurementApiService.createRFQ(context, rfqDataWithInvalidSuppliers);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid supplier IDs');
    });

    it('should validate response deadline', async () => {
      const context = createMockContext({ permissions: ['rfq:create'] });
      const rfqDataWithPastDeadline = generateRfqData({
        responseDeadline: new Date('2020-01-01') // Past date
      });

      const result = await procurementApiService.createRFQ(context, rfqDataWithPastDeadline);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Response deadline must be in the future');
    });

    it('should log audit trail for RFQ creation', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.insert.mockReturnValue(createMockDbInsert([mockRfqData]));

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
          suppliersCount: expect.any(Number)
        })
      );
    });
  });

  describe('getRFQs', () => {
    it('should return paginated RFQs with default parameters', async () => {
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

      const context = createMockContext();
      const result = await procurementApiService.getRFQs(context);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        rfqs: [mockRfqData],
        total: expect.any(Number),
        page: 1,
        limit: 20
      });
    });

    it('should apply status filters', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      const whereCondition = vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockResolvedValue([])
          })
        })
      });

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: whereCondition
        })
      });

      const context = createMockContext();
      const filters = { status: 'published' };

      await procurementApiService.getRFQs(context, filters);

      expect(whereCondition).toHaveBeenCalled();
    });

    it('should handle date range filters', async () => {
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
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      const result = await procurementApiService.getRFQs(context, filters);

      expect(result.success).toBe(true);
    });
  });

  describe('updateRFQ', () => {
    it('should update RFQ with valid data', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock RFQ existence check
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRfqData])
          })
        })
      });

      // Mock update
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{
              ...mockRfqData,
              title: 'Updated RFQ Title'
            }])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const updateData = { title: 'Updated RFQ Title' };

      const result = await procurementApiService.updateRFQ(context, mockRfqData.id, updateData);

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Updated RFQ Title');
    });

    it('should prevent updating published RFQs', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              ...mockRfqData,
              status: 'published'
            }])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const updateData = { title: 'New Title' };

      const result = await procurementApiService.updateRFQ(context, mockRfqData.id, updateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot update published RFQ');
    });

    it('should validate update permissions', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRfqData])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] }); // No update permission
      const updateData = { title: 'New Title' };

      const result = await procurementApiService.updateRFQ(context, mockRfqData.id, updateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });
  });

  describe('deleteRFQ', () => {
    it('should delete draft RFQ', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock RFQ existence check
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              ...mockRfqData,
              status: 'draft'
            }])
          })
        })
      });

      // Mock delete
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockRfqData])
        })
      });

      const context = createMockContext({ permissions: ['rfq:delete'] });

      const result = await procurementApiService.deleteRFQ(context, mockRfqData.id);

      expect(result.success).toBe(true);
    });

    it('should prevent deleting published RFQs', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              ...mockRfqData,
              status: 'published'
            }])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:delete'] });

      const result = await procurementApiService.deleteRFQ(context, mockRfqData.id);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot delete published RFQ');
    });

    it('should log audit trail for RFQ deletion', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ ...mockRfqData, status: 'draft' }])
          })
        })
      });
      
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockRfqData])
        })
      });

      const context = createMockContext({ permissions: ['rfq:delete'] });
      await procurementApiService.deleteRFQ(context, mockRfqData.id);

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'delete',
        'rfq',
        mockRfqData.id,
        expect.any(Object),
        null,
        null
      );
    });
  });
});