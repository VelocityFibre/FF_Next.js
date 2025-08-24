/**
 * RFQ Supplier Management Tests
 * Tests for managing suppliers in RFQ context
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

describe('RFQ Supplier Management', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  describe('addSuppliersToRFQ', () => {
    it('should add suppliers to draft RFQ', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock existing RFQ check (draft status)
      const draftRfq = { 
        ...mockRfqData, 
        status: 'draft',
        supplierIds: ['supplier-1', 'supplier-2']
      };
      
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([draftRfq])
          })
        })
      });

      // Mock supplier validation
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { id: 'supplier-3', name: 'Supplier 3', status: 'active' },
            { id: 'supplier-4', name: 'Supplier 4', status: 'active' }
          ])
        })
      });

      // Mock RFQ update
      const updatedRfq = { 
        ...draftRfq, 
        supplierIds: ['supplier-1', 'supplier-2', 'supplier-3', 'supplier-4']
      };
      
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const supplierIds = ['supplier-3', 'supplier-4'];

      const result = await procurementApiService.addSuppliersToRFQ(context, 'rfq-123', supplierIds);

      expect(result.success).toBe(true);
      expect(result.data?.suppliersAdded).toBe(2);
      expect(result.data?.totalSuppliers).toBe(4);
    });

    it('should prevent adding invalid suppliers', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock existing RFQ
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ ...mockRfqData, status: 'draft' }])
          })
        })
      });

      // Mock supplier validation - return empty (invalid suppliers)
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([])
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const invalidSupplierIds = ['non-existent-supplier'];

      const result = await procurementApiService.addSuppliersToRFQ(context, 'rfq-123', invalidSupplierIds);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid supplier IDs');
    });

    it('should prevent adding suppliers to published RFQ', async () => {
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
      const supplierIds = ['supplier-3'];

      const result = await procurementApiService.addSuppliersToRFQ(context, 'rfq-123', supplierIds);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot modify suppliers of published RFQ');
    });

    it('should prevent adding duplicate suppliers', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock existing RFQ with suppliers
      const rfqWithSuppliers = { 
        ...mockRfqData, 
        status: 'draft',
        supplierIds: ['supplier-1', 'supplier-2']
      };
      
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([rfqWithSuppliers])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const duplicateSupplierIds = ['supplier-1']; // Already exists

      const result = await procurementApiService.addSuppliersToRFQ(context, 'rfq-123', duplicateSupplierIds);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Suppliers already invited');
    });

    it('should log supplier additions', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      const draftRfq = { 
        ...mockRfqData, 
        status: 'draft',
        supplierIds: ['supplier-1']
      };
      
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([draftRfq])
          })
        })
      });

      // Mock valid suppliers
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { id: 'supplier-2', name: 'Supplier 2', status: 'active' }
          ])
        })
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{
              ...draftRfq,
              supplierIds: ['supplier-1', 'supplier-2']
            }])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      await procurementApiService.addSuppliersToRFQ(context, 'rfq-123', ['supplier-2']);

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'update',
        'rfq',
        'rfq-123',
        null,
        expect.objectContaining({
          addedSuppliers: ['supplier-2']
        }),
        expect.objectContaining({
          suppliersAdded: 1
        })
      );
    });

    it('should validate supplier status before adding', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ ...mockRfqData, status: 'draft' }])
          })
        })
      });

      // Mock suppliers with inactive status
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { id: 'supplier-3', name: 'Inactive Supplier', status: 'inactive' }
          ])
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const supplierIds = ['supplier-3'];

      const result = await procurementApiService.addSuppliersToRFQ(context, 'rfq-123', supplierIds);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Some suppliers are not active');
    });
  });

  describe('removeSuppliersFromRFQ', () => {
    it('should remove suppliers from draft RFQ', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock existing RFQ with suppliers
      const rfqWithSuppliers = { 
        ...mockRfqData, 
        status: 'draft',
        supplierIds: ['supplier-1', 'supplier-2', 'supplier-3']
      };
      
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([rfqWithSuppliers])
          })
        })
      });

      // Mock RFQ update
      const updatedRfq = { 
        ...rfqWithSuppliers, 
        supplierIds: ['supplier-2', 'supplier-3']
      };
      
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const supplierIds = ['supplier-1'];

      const result = await procurementApiService.removeSuppliersFromRFQ(context, 'rfq-123', supplierIds);

      expect(result.success).toBe(true);
      expect(result.data?.suppliersRemoved).toBe(1);
      expect(result.data?.remainingSuppliers).toBe(2);
    });

    it('should prevent removing suppliers from published RFQ', async () => {
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
      const supplierIds = ['supplier-1'];

      const result = await procurementApiService.removeSuppliersFromRFQ(context, 'rfq-123', supplierIds);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot modify suppliers of published RFQ');
    });

    it('should prevent removing all suppliers', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock RFQ with only one supplier
      const rfqWithOneSupplier = { 
        ...mockRfqData, 
        status: 'draft',
        supplierIds: ['supplier-1']
      };
      
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([rfqWithOneSupplier])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const supplierIds = ['supplier-1']; // This would remove the last supplier

      const result = await procurementApiService.removeSuppliersFromRFQ(context, 'rfq-123', supplierIds);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot remove all suppliers from RFQ');
    });

    it('should handle removing non-existent suppliers gracefully', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
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

      const context = createMockContext({ permissions: ['rfq:update'] });
      const nonExistentSuppliers = ['supplier-99']; // Not in the RFQ

      const result = await procurementApiService.removeSuppliersFromRFQ(context, 'rfq-123', nonExistentSuppliers);

      expect(result.success).toBe(true);
      expect(result.data?.suppliersRemoved).toBe(0);
      expect(result.data?.warnings).toContain('Some suppliers were not found in RFQ');
    });

    it('should log supplier removals', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
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
            returning: vi.fn().mockResolvedValue([{
              ...rfqWithSuppliers,
              supplierIds: ['supplier-2']
            }])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      await procurementApiService.removeSuppliersFromRFQ(context, 'rfq-123', ['supplier-1']);

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'update',
        'rfq',
        'rfq-123',
        null,
        expect.objectContaining({
          removedSuppliers: ['supplier-1']
        }),
        expect.objectContaining({
          suppliersRemoved: 1
        })
      );
    });
  });

  describe('replaceRFQSuppliers', () => {
    it('should replace all suppliers in draft RFQ', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock existing RFQ
      const existingRfq = { 
        ...mockRfqData, 
        status: 'draft',
        supplierIds: ['supplier-1', 'supplier-2']
      };
      
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([existingRfq])
          })
        })
      });

      // Mock supplier validation
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { id: 'supplier-3', name: 'Supplier 3', status: 'active' },
            { id: 'supplier-4', name: 'Supplier 4', status: 'active' }
          ])
        })
      });

      // Mock RFQ update
      const updatedRfq = { 
        ...existingRfq, 
        supplierIds: ['supplier-3', 'supplier-4']
      };
      
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedRfq])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const newSupplierIds = ['supplier-3', 'supplier-4'];

      const result = await procurementApiService.replaceRFQSuppliers(context, 'rfq-123', newSupplierIds);

      expect(result.success).toBe(true);
      expect(result.data?.suppliersReplaced).toBe(2);
      expect(result.data?.newSupplierCount).toBe(2);
    });

    it('should prevent replacing suppliers in published RFQ', async () => {
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
      const newSupplierIds = ['supplier-3', 'supplier-4'];

      const result = await procurementApiService.replaceRFQSuppliers(context, 'rfq-123', newSupplierIds);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot modify suppliers of published RFQ');
    });

    it('should require at least one supplier', async () => {
      const context = createMockContext({ permissions: ['rfq:update'] });
      const emptySupplierIds: string[] = [];

      const result = await procurementApiService.replaceRFQSuppliers(context, 'rfq-123', emptySupplierIds);

      expect(result.success).toBe(false);
      expect(result.error).toContain('At least one supplier is required');
    });
  });

  describe('getSupplierRFQHistory', () => {
    it('should return supplier RFQ participation history', async () => {
      const supplierRfqHistory = [
        {
          rfqId: 'rfq-1',
          title: 'Network Equipment RFQ',
          invitedAt: new Date('2024-01-01'),
          respondedAt: new Date('2024-01-05'),
          status: 'responded',
          awarded: false
        },
        {
          rfqId: 'rfq-2',
          title: 'Fiber Cable RFQ',
          invitedAt: new Date('2024-02-01'),
          respondedAt: new Date('2024-02-03'),
          status: 'responded',
          awarded: true
        }
      ];
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(supplierRfqHistory)
            })
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getSupplierRFQHistory(context, 'supplier-1');

      expect(result.success).toBe(true);
      expect(result.data?.history).toHaveLength(2);
      expect(result.data?.statistics).toEqual({
        totalInvitations: 2,
        totalResponses: 2,
        totalAwards: 1,
        responseRate: 100,
        winRate: 50
      });
    });

    it('should filter history by date range', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([])
            })
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const dateFilter = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      const result = await procurementApiService.getSupplierRFQHistory(context, 'supplier-1', dateFilter);

      expect(result.success).toBe(true);
      expect(result.data?.dateRange).toEqual(dateFilter);
    });
  });

  describe('notifySuppliers', () => {
    it('should send custom notification to RFQ suppliers', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      const rfqWithSuppliers = { 
        ...mockRfqData, 
        status: 'published',
        supplierIds: ['supplier-1', 'supplier-2', 'supplier-3']
      };
      
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([rfqWithSuppliers])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:notify'] });
      const notification = {
        subject: 'Urgent: RFQ Deadline Reminder',
        message: 'Please submit your quotes by the end of this week.',
        type: 'reminder'
      };

      const result = await procurementApiService.notifyRFQSuppliers(context, 'rfq-123', notification);

      expect(result.success).toBe(true);
      expect(result.data?.notificationsSent).toBe(3);
      expect(result.data?.notificationType).toBe('reminder');
    });

    it('should allow targeting specific suppliers', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRfqData])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:notify'] });
      const notification = {
        subject: 'Follow-up Required',
        message: 'We noticed you haven\'t responded yet.',
        targetSuppliers: ['supplier-1']
      };

      const result = await procurementApiService.notifyRFQSuppliers(context, 'rfq-123', notification);

      expect(result.success).toBe(true);
      expect(result.data?.notificationsSent).toBe(1);
      expect(result.data?.targetedNotification).toBe(true);
    });

    it('should log notification activities', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              ...mockRfqData,
              supplierIds: ['supplier-1', 'supplier-2']
            }])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:notify'] });
      const notification = {
        subject: 'Test Notification',
        message: 'Test message',
        type: 'general'
      };

      await procurementApiService.notifyRFQSuppliers(context, 'rfq-123', notification);

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'notify',
        'rfq',
        'rfq-123',
        null,
        notification,
        expect.objectContaining({
          notificationsSent: 2,
          notificationType: 'general'
        })
      );
    });
  });
});