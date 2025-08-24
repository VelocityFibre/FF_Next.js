/**
 * Procurement API Service - RFQ Lifecycle Tests
 * Tests for RFQ publishing, status management, and workflow operations
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

describe('ProcurementApiService - RFQ Lifecycle', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    teardownMocks();
  });

  describe('publishRFQ', () => {
    it('should publish draft RFQ', async () => {
      const publishedRfq = { ...mockRfqData, status: 'published' };
      mockDatabaseInsert([publishedRfq]);

      const context = createMockContext({ permissions: ['rfq:publish'] });
      const result = await procurementApiService.publishRFQ(context, 'rfq-123');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('published');
    });

    it('should send notifications to suppliers on publish', async () => {
      mockDatabaseInsert([{ ...mockRfqData, status: 'published' }]);

      const context = createMockContext({ permissions: ['rfq:publish'] });
      await procurementApiService.publishRFQ(context, 'rfq-123');

      // Verify notification service was called
      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'publish',
        'rfq',
        'notify_suppliers',
        'rfq-123',
        null,
        expect.objectContaining({
          supplierCount: expect.any(Number)
        })
      );
    });

    it('should prevent publishing RFQ without suppliers', async () => {
      const rfqWithoutSuppliers = { ...mockRfqData, supplierIds: [] };
      mockDatabaseSelect([rfqWithoutSuppliers]);

      const context = createMockContext({ permissions: ['rfq:publish'] });
      const result = await procurementApiService.publishRFQ(context, 'rfq-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot publish RFQ without suppliers');
    });

    it('should validate RFQ completeness before publishing', async () => {
      const incompleteRfq = { ...mockRfqData, description: '' };
      mockDatabaseSelect([incompleteRfq]);

      const context = createMockContext({ permissions: ['rfq:publish'] });
      const result = await procurementApiService.publishRFQ(context, 'rfq-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('RFQ incomplete');
    });

    it('should prevent re-publishing already published RFQ', async () => {
      const publishedRfq = { ...mockRfqData, status: 'published' };
      mockDatabaseSelect([publishedRfq]);

      const context = createMockContext({ permissions: ['rfq:publish'] });
      const result = await procurementApiService.publishRFQ(context, 'rfq-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('RFQ already published');
    });
  });

  describe('RFQ Status Management', () => {
    it('should close RFQ after deadline', async () => {
      const expiredRfq = {
        ...mockRfqData,
        status: 'published',
        responseDeadline: new Date('2020-01-01') // Past date
      };
      mockDatabaseSelect([expiredRfq]);
      mockDatabaseInsert([{ ...expiredRfq, status: 'closed' }]);

      const context = createMockContext({ permissions: ['rfq:update'] });
      const result = await procurementApiService.closeRFQ(context, 'rfq-123');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('closed');
    });

    it('should cancel draft RFQ', async () => {
      const draftRfq = { ...mockRfqData, status: 'draft' };
      mockDatabaseSelect([draftRfq]);
      mockDatabaseInsert([{ ...draftRfq, status: 'cancelled' }]);

      const context = createMockContext({ permissions: ['rfq:update'] });
      const result = await procurementApiService.cancelRFQ(context, 'rfq-123');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('cancelled');
    });

    it('should prevent cancelling published RFQ', async () => {
      const publishedRfq = { ...mockRfqData, status: 'published' };
      mockDatabaseSelect([publishedRfq]);

      const context = createMockContext({ permissions: ['rfq:update'] });
      const result = await procurementApiService.cancelRFQ(context, 'rfq-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot cancel published RFQ');
    });

    it('should extend RFQ deadline', async () => {
      const activeRfq = { ...mockRfqData, status: 'published' };
      mockDatabaseSelect([activeRfq]);
      
      const newDeadline = new Date('2024-03-15');
      const extendedRfq = { ...activeRfq, responseDeadline: newDeadline };
      mockDatabaseInsert([extendedRfq]);

      const context = createMockContext({ permissions: ['rfq:update'] });
      const result = await procurementApiService.extendRFQDeadline(context, 'rfq-123', newDeadline);

      expect(result.success).toBe(true);
      expect(result.data?.responseDeadline).toEqual(newDeadline);
    });

    it('should log status changes', async () => {
      const draftRfq = { ...mockRfqData, status: 'draft' };
      mockDatabaseSelect([draftRfq]);
      mockDatabaseInsert([{ ...draftRfq, status: 'cancelled' }]);

      const context = createMockContext({ permissions: ['rfq:update'] });
      await procurementApiService.cancelRFQ(context, 'rfq-123');

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'update',
        'rfq',
        'status_change',
        'rfq-123',
        { from: 'draft', to: 'cancelled' },
        null
      );
    });
  });

  describe('RFQ Workflow', () => {
    it('should handle RFQ approval workflow', async () => {
      const draftRfq = { ...mockRfqData, status: 'draft' };
      mockDatabaseSelect([draftRfq]);
      mockDatabaseInsert([{ ...draftRfq, status: 'approved' }]);

      const context = createMockContext({ permissions: ['rfq:approve'] });
      const result = await procurementApiService.approveRFQ(context, 'rfq-123');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('approved');
    });

    it('should require approval before publishing', async () => {
      const draftRfq = { ...mockRfqData, status: 'draft' };
      mockDatabaseSelect([draftRfq]);

      const context = createMockContext({ permissions: ['rfq:publish'] });
      const result = await procurementApiService.publishRFQ(context, 'rfq-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('RFQ must be approved before publishing');
    });

    it('should handle RFQ rejection workflow', async () => {
      const draftRfq = { ...mockRfqData, status: 'draft' };
      mockDatabaseSelect([draftRfq]);
      mockDatabaseInsert([{ ...draftRfq, status: 'rejected' }]);

      const context = createMockContext({ permissions: ['rfq:approve'] });
      const result = await procurementApiService.rejectRFQ(context, 'rfq-123', 'Incomplete requirements');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('rejected');
      expect(result.data?.rejectionReason).toBe('Incomplete requirements');
    });
  });

  describe('RFQ Notifications', () => {
    it('should notify suppliers when RFQ is published', async () => {
      mockDatabaseInsert([{ ...mockRfqData, status: 'published' }]);

      const context = createMockContext({ permissions: ['rfq:publish'] });
      await procurementApiService.publishRFQ(context, 'rfq-123');

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'notify',
        'rfq',
        'suppliers_notified',
        'rfq-123',
        null,
        expect.objectContaining({
          notificationType: 'email',
          recipientCount: expect.any(Number)
        })
      );
    });

    it('should send reminder notifications before deadline', async () => {
      const activeRfq = {
        ...mockRfqData,
        status: 'published',
        responseDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      };
      mockDatabaseSelect([activeRfq]);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.sendRFQReminders(context, 'rfq-123');

      expect(result.success).toBe(true);
      expect(result.data?.remindersSent).toBeGreaterThan(0);
    });
  });
});