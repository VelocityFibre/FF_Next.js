/**
 * RFQ Lifecycle Management Tests
 * Tests for RFQ publishing, status management, and lifecycle operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { procurementApiService } from '../../procurementApiService';
import { auditLogger } from '../../auditLogger';
import {
  createMockContext,
  setupMocks,
  cleanupMocks,
  mockRfqData
} from '../shared/testHelpers';

// Mock dependencies
vi.mock('../../middleware/projectAccessMiddleware');
vi.mock('../../middleware/rbacMiddleware');
vi.mock('../../auditLogger');
vi.mock('@/lib/neon/connection');

describe('RFQ Lifecycle Management', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  describe('publishRFQ', () => {
    it('should publish draft RFQ', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock existing RFQ check (draft status)
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ ...mockRfqData, status: 'draft' }])
          })
        })
      });

      // Mock publish update
      const publishedRfq = { ...mockRfqData, status: 'published', publishedAt: new Date() };
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([publishedRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:publish'] });
      const result = await procurementApiService.publishRFQ(context, 'rfq-123');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('published');
      expect(result.data?.publishedAt).toBeDefined();
    });

    it('should send notifications to suppliers on publish', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock RFQ with suppliers
      const rfqWithSuppliers = { 
        ...mockRfqData, 
        status: 'draft',
        supplierIds: ['supplier-1', 'supplier-2']
      };
      
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([rfqWithSuppliers])
          })
        })
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ ...rfqWithSuppliers, status: 'published' }])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:publish'] });
      await procurementApiService.publishRFQ(context, 'rfq-123');

      // Verify notification service was called
      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'publish',
        'rfq',
        'rfq-123',
        null,
        null,
        expect.objectContaining({
          supplierCount: 2,
          notificationsSent: true
        })
      );
    });

    it('should prevent publishing RFQ without suppliers', async () => {
      const rfqWithoutSuppliers = { 
        ...mockRfqData, 
        status: 'draft',
        supplierIds: [] 
      };
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([rfqWithoutSuppliers])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:publish'] });
      const result = await procurementApiService.publishRFQ(context, 'rfq-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot publish RFQ without suppliers');
    });

    it('should prevent publishing already published RFQ', async () => {
      const publishedRfq = { ...mockRfqData, status: 'published' };
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([publishedRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:publish'] });
      const result = await procurementApiService.publishRFQ(context, 'rfq-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('RFQ is already published');
    });

    it('should validate RFQ completeness before publishing', async () => {
      const incompleteRfq = { 
        ...mockRfqData, 
        status: 'draft',
        description: '', // Missing description
        responseDeadline: null // Missing deadline
      };
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([incompleteRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:publish'] });
      const result = await procurementApiService.publishRFQ(context, 'rfq-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('RFQ is incomplete');
    });

    it('should set publish timestamp and publish user', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ ...mockRfqData, status: 'draft' }])
          })
        })
      });

      const publishedRfq = { 
        ...mockRfqData, 
        status: 'published',
        publishedAt: new Date(),
        publishedBy: 'test-user-id'
      };
      
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([publishedRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:publish'] });
      const result = await procurementApiService.publishRFQ(context, 'rfq-123');

      expect(result.success).toBe(true);
      expect(result.data?.publishedBy).toBe('test-user-id');
      expect(result.data?.publishedAt).toBeDefined();
    });
  });

  describe('closeRFQ', () => {
    it('should close published RFQ', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock existing published RFQ
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ ...mockRfqData, status: 'published' }])
          })
        })
      });

      // Mock close update
      const closedRfq = { 
        ...mockRfqData, 
        status: 'closed',
        closedAt: new Date(),
        closedBy: 'test-user-id'
      };
      
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([closedRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:close'] });
      const result = await procurementApiService.closeRFQ(context, 'rfq-123');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('closed');
      expect(result.data?.closedAt).toBeDefined();
    });

    it('should prevent closing draft RFQ', async () => {
      const draftRfq = { ...mockRfqData, status: 'draft' };
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([draftRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:close'] });
      const result = await procurementApiService.closeRFQ(context, 'rfq-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Can only close published RFQs');
    });

    it('should prevent closing already closed RFQ', async () => {
      const closedRfq = { ...mockRfqData, status: 'closed' };
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([closedRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:close'] });
      const result = await procurementApiService.closeRFQ(context, 'rfq-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('RFQ is already closed');
    });

    it('should notify suppliers when RFQ is closed', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      const publishedRfq = { 
        ...mockRfqData, 
        status: 'published',
        supplierIds: ['supplier-1', 'supplier-2']
      };
      
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([publishedRfq])
          })
        })
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ ...publishedRfq, status: 'closed' }])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:close'] });
      await procurementApiService.closeRFQ(context, 'rfq-123');

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'close',
        'rfq',
        'rfq-123',
        null,
        null,
        expect.objectContaining({
          notificationsSent: true,
          supplierCount: 2
        })
      );
    });
  });

  describe('cancelRFQ', () => {
    it('should cancel draft RFQ', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock existing draft RFQ
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ ...mockRfqData, status: 'draft' }])
          })
        })
      });

      // Mock cancel update
      const cancelledRfq = { 
        ...mockRfqData, 
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: 'test-user-id'
      };
      
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([cancelledRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:cancel'] });
      const cancellationReason = 'Project requirements changed';
      
      const result = await procurementApiService.cancelRFQ(context, 'rfq-123', cancellationReason);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('cancelled');
      expect(result.data?.cancellationReason).toBe(cancellationReason);
    });

    it('should cancel published RFQ with supplier notification', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      const publishedRfq = { 
        ...mockRfqData, 
        status: 'published',
        supplierIds: ['supplier-1', 'supplier-2']
      };
      
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([publishedRfq])
          })
        })
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ ...publishedRfq, status: 'cancelled' }])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:cancel'] });
      const cancellationReason = 'Budget constraints';
      
      await procurementApiService.cancelRFQ(context, 'rfq-123', cancellationReason);

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'cancel',
        'rfq',
        'rfq-123',
        null,
        expect.objectContaining({
          cancellationReason
        }),
        expect.objectContaining({
          suppliersNotified: true,
          supplierCount: 2
        })
      );
    });

    it('should prevent cancelling closed RFQ', async () => {
      const closedRfq = { ...mockRfqData, status: 'closed' };
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([closedRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:cancel'] });
      const result = await procurementApiService.cancelRFQ(context, 'rfq-123', 'Test reason');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot cancel closed RFQ');
    });

    it('should require cancellation reason', async () => {
      const context = createMockContext({ permissions: ['rfq:cancel'] });
      const result = await procurementApiService.cancelRFQ(context, 'rfq-123', '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cancellation reason is required');
    });
  });

  describe('extendRFQDeadline', () => {
    it('should extend deadline for published RFQ', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      const publishedRfq = { 
        ...mockRfqData, 
        status: 'published',
        responseDeadline: new Date('2024-12-31')
      };
      
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([publishedRfq])
          })
        })
      });

      const newDeadline = new Date('2025-01-15');
      const extendedRfq = { 
        ...publishedRfq, 
        responseDeadline: newDeadline,
        deadlineExtensions: [
          {
            previousDeadline: publishedRfq.responseDeadline,
            newDeadline,
            reason: 'Additional time requested by suppliers',
            extendedAt: new Date(),
            extendedBy: 'test-user-id'
          }
        ]
      };
      
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([extendedRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const extensionReason = 'Additional time requested by suppliers';
      
      const result = await procurementApiService.extendRFQDeadline(
        context, 
        'rfq-123', 
        newDeadline, 
        extensionReason
      );

      expect(result.success).toBe(true);
      expect(result.data?.responseDeadline).toEqual(newDeadline);
      expect(result.data?.deadlineExtensions).toHaveLength(1);
    });

    it('should notify suppliers of deadline extension', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      const publishedRfq = { 
        ...mockRfqData, 
        status: 'published',
        supplierIds: ['supplier-1', 'supplier-2'],
        responseDeadline: new Date('2024-12-31')
      };
      
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([publishedRfq])
          })
        })
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([publishedRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const newDeadline = new Date('2025-01-15');
      
      await procurementApiService.extendRFQDeadline(
        context, 
        'rfq-123', 
        newDeadline, 
        'Additional time needed'
      );

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'extend_deadline',
        'rfq',
        'rfq-123',
        expect.any(Object),
        expect.objectContaining({
          newDeadline,
          reason: 'Additional time needed'
        }),
        expect.objectContaining({
          suppliersNotified: true,
          supplierCount: 2
        })
      );
    });

    it('should prevent extending deadline to past date', async () => {
      const context = createMockContext({ permissions: ['rfq:update'] });
      const pastDate = new Date('2020-01-01');
      
      const result = await procurementApiService.extendRFQDeadline(
        context, 
        'rfq-123', 
        pastDate, 
        'Test reason'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('New deadline must be in the future');
    });

    it('should prevent extending deadline for draft RFQ', async () => {
      const draftRfq = { ...mockRfqData, status: 'draft' };
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([draftRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const newDeadline = new Date('2025-01-15');
      
      const result = await procurementApiService.extendRFQDeadline(
        context, 
        'rfq-123', 
        newDeadline, 
        'Test reason'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Can only extend deadline for published RFQs');
    });
  });

  describe('getRFQStatus', () => {
    it('should return current RFQ status with timeline', async () => {
      const rfqWithTimeline = {
        ...mockRfqData,
        status: 'published',
        createdAt: new Date('2024-01-01'),
        publishedAt: new Date('2024-01-02'),
        responseDeadline: new Date('2024-02-01'),
        timeline: [
          { status: 'draft', timestamp: new Date('2024-01-01'), user: 'creator' },
          { status: 'published', timestamp: new Date('2024-01-02'), user: 'publisher' }
        ]
      };
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([rfqWithTimeline])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQStatus(context, 'rfq-123');

      expect(result.success).toBe(true);
      expect(result.data?.currentStatus).toBe('published');
      expect(result.data?.timeline).toHaveLength(2);
      expect(result.data?.daysUntilDeadline).toBeDefined();
    });

    it('should calculate response statistics', async () => {
      const rfqWithResponses = {
        ...mockRfqData,
        status: 'published',
        supplierIds: ['supplier-1', 'supplier-2', 'supplier-3'],
        responses: [
          { supplierId: 'supplier-1', submittedAt: new Date(), status: 'submitted' },
          { supplierId: 'supplier-2', status: 'pending' }
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
      const result = await procurementApiService.getRFQStatus(context, 'rfq-123');

      expect(result.success).toBe(true);
      expect(result.data?.responseStatistics).toEqual({
        totalSuppliers: 3,
        responsesReceived: 1,
        responsesPending: 2,
        responseRate: expect.closeTo(33.33, 2)
      });
    });
  });
});