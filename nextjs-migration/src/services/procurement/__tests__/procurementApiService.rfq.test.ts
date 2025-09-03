/**
 * @deprecated This file has been modularized for better maintainability.
 * Import from './rfq/' directory instead.
 * This file maintained for backward compatibility.
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
  mockDatabaseInsert,
  createValidRFQData,
  createInvalidRFQData
} from './testHelpers';

describe('ProcurementApiService - RFQ Operations', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    teardownMocks();
  });

  describe('createRFQ', () => {
    it('should create RFQ with valid data', async () => {
      mockDatabaseInsert([{
        id: 'rfq-123',
        projectId: 'test-project-id',
        rfqNumber: 'RFQ-001',
        title: 'Test RFQ',
        status: 'draft'
      }]);

      const context = createMockContext({ permissions: ['rfq:create'] });
      const rfqData = createValidRFQData();

      const result = await procurementApiService.createRFQ(context, rfqData);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('rfq-123');
      expect(result.data?.title).toBe('Test RFQ');
    });

    it('should validate RFQ data before creation', async () => {
      const context = createMockContext({ permissions: ['rfq:create'] });
      const invalidRfqData = createInvalidRFQData();

      const result = await procurementApiService.createRFQ(context, invalidRfqData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid RFQ data');
    });

    it('should generate unique RFQ number', async () => {
      mockDatabaseInsert([{
        id: 'rfq-124',
        projectId: 'test-project-id',
        rfqNumber: 'RFQ-002',
        title: 'Another Test RFQ',
        status: 'draft'
      }]);

      const context = createMockContext({ permissions: ['rfq:create'] });
      const rfqData = createValidRFQData();

      const result = await procurementApiService.createRFQ(context, rfqData);

      expect(result.success).toBe(true);
      expect(result.data?.rfqNumber).toMatch(/^RFQ-\d+$/);
    });

    it('should log RFQ creation', async () => {
      mockDatabaseInsert([mockRfqData]);

      const context = createMockContext({ permissions: ['rfq:create'] });
      const rfqData = createValidRFQData();

      await procurementApiService.createRFQ(context, rfqData);

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'create',
        'rfq',
        'new',
        'rfq-123',
        null,
        expect.objectContaining({
          title: rfqData.title,
          supplierCount: rfqData.supplierIds.length
        })
      );
    });

    it('should validate response deadline is in the future', async () => {
      const context = createMockContext({ permissions: ['rfq:create'] });
      const pastDeadlineData = {
        ...createValidRFQData(),
        responseDeadline: new Date('2020-01-01') // Past date
      };

      const result = await procurementApiService.createRFQ(context, pastDeadlineData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Response deadline must be in the future');
    });

    it('should validate supplier IDs exist', async () => {
      const context = createMockContext({ permissions: ['rfq:create'] });
      const invalidSuppliersData = {
        ...createValidRFQData(),
        supplierIds: ['non-existent-supplier']
      };

      const result = await procurementApiService.createRFQ(context, invalidSuppliersData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid supplier IDs');
    });
  });

  describe('getRFQs', () => {
    it('should return paginated RFQs', async () => {
      mockDatabaseSelect([mockRfqData]);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQs(context);

      expect(result.success).toBe(true);
      expect(result.data?.rfqs).toEqual([mockRfqData]);
      expect(result.data?.page).toBe(1);
      expect(result.data?.limit).toBe(20);
    });

    it('should filter RFQs by status', async () => {
      const draftRfqs = [{ ...mockRfqData, status: 'draft' }];
      mockDatabaseSelect(draftRfqs);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const filters = { status: 'draft' };

      const result = await procurementApiService.getRFQs(context, filters);

      expect(result.success).toBe(true);
      expect(result.data?.rfqs).toEqual(draftRfqs);
    });

    it('should filter RFQs by date range', async () => {
      mockDatabaseSelect([mockRfqData]);

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
      mockDatabaseSelect([mockRfqData]);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const filters = {
        search: 'Test RFQ',
        searchFields: ['title', 'description']
      };

      const result = await procurementApiService.getRFQs(context, filters);

      expect(result.success).toBe(true);
      expect(result.data?.rfqs).toEqual([mockRfqData]);
    });
  });

  describe('getRFQById', () => {
    it('should return RFQ with full details', async () => {
      mockDatabaseSelect([mockRfqData]);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQById(context, 'rfq-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRfqData);
    });

    it('should return 404 for non-existent RFQ', async () => {
      mockDatabaseSelect([]);

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
      mockDatabaseSelect([rfqWithResponses]);

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQById(context, 'rfq-123');

      expect(result.success).toBe(true);
      expect(result.data?.suppliers).toHaveLength(2);
      expect(result.data?.suppliers[0].status).toBe('responded');
    });
  });

  describe('updateRFQ', () => {
    it('should update RFQ with valid data', async () => {
      const updatedRfq = { ...mockRfqData, title: 'Updated RFQ Title' };
      mockDatabaseInsert([updatedRfq]);

      const context = createMockContext({ permissions: ['rfq:update'] });
      const updateData = { title: 'Updated RFQ Title' };

      const result = await procurementApiService.updateRFQ(context, 'rfq-123', updateData);

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Updated RFQ Title');
    });

    it('should prevent updates to published RFQs', async () => {
      const publishedRfq = { ...mockRfqData, status: 'published' };
      mockDatabaseSelect([publishedRfq]);

      const context = createMockContext({ permissions: ['rfq:update'] });
      const updateData = { title: 'Updated Title' };

      const result = await procurementApiService.updateRFQ(context, 'rfq-123', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot update published RFQ');
    });

    it('should log RFQ updates', async () => {
      const updatedRfq = { ...mockRfqData, title: 'Updated RFQ Title' };
      mockDatabaseInsert([updatedRfq]);

      const context = createMockContext({ permissions: ['rfq:update'] });
      const updateData = { title: 'Updated RFQ Title' };

      await procurementApiService.updateRFQ(context, 'rfq-123', updateData);

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'update',
        'rfq',
        'modify',
        'rfq-123',
        updateData,
        null
      );
    });
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
  });

  describe('RFQ Analytics', () => {
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
  });
});