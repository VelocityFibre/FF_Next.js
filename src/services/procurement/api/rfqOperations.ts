/**
 * RFQ API Operations
 * Handles all RFQ-related API operations
 */

import { BaseService, type ServiceResponse } from '../../core/BaseService';
import { ProcurementError, RFQValidationError } from '../procurementErrors';
import { validateSchema, ProcurementSchemas } from '@/lib/validation/procurement.schemas';
import { auditLogger } from '../auditLogger';
import { db } from '@/lib/neon/connection';
import { rfqs } from '@/lib/neon/schema';
import { eq, and, desc, asc, gte, lte } from 'drizzle-orm';
import type { RFQ, NewRFQ } from '@/lib/neon/schema';
import type { ApiContext, RFQFilters } from './types';

export class RFQOperations {
  constructor(private service: BaseService) {}

  /**
   * GET /api/v1/projects/{projectId}/rfqs
   */
  async getRFQList(context: ApiContext, filters: RFQFilters = {}): Promise<ServiceResponse<{ rfqs: RFQ[], total: number, page: number, limit: number }>> {
    try {
      const { page = 1, limit = 50, sortOrder = 'desc' } = filters;
      const offset = (page - 1) * limit;

      // Build query with filters
      const queryConditions = [eq(rfqs.projectId, context.projectId)];
      
      if (filters.status) {
        queryConditions.push(eq(rfqs.status, filters.status as any));
      }
      if (filters.createdBy) {
        queryConditions.push(eq(rfqs.createdBy, filters.createdBy));
      }
      if (filters.responseDeadline?.from) {
        queryConditions.push(gte(rfqs.responseDeadline, new Date(filters.responseDeadline.from)));
      }
      if (filters.responseDeadline?.to) {
        queryConditions.push(lte(rfqs.responseDeadline, new Date(filters.responseDeadline.to)));
      }

      // Execute query
      const rfqList = await db
        .select()
        .from(rfqs)
        .where(and(...queryConditions))
        .orderBy(sortOrder === 'desc' ? desc(rfqs.createdAt) : asc(rfqs.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const totalResult = await db
        .select({ count: rfqs.id })
        .from(rfqs)
        .where(and(...queryConditions));
      const total = totalResult.length;

      // Log audit trail
      await auditLogger.logAction(context, 'view', 'rfq', 'list', null, null, {
        filters,
        resultCount: rfqList.length,
        total
      });

      return this.service.success({
        rfqs: rfqList,
        total,
        page,
        limit
      });
    } catch (error) {
      return this.service.handleError(error, 'getRFQList');
    }
  }

  /**
   * GET /api/v1/projects/{projectId}/rfqs/{rfqId}
   */
  async getRFQById(context: ApiContext, rfqId: string): Promise<ServiceResponse<RFQ>> {
    try {
      const rfqResult = await db
        .select()
        .from(rfqs)
        .where(and(eq(rfqs.id, rfqId), eq(rfqs.projectId, context.projectId)))
        .limit(1);

      if (rfqResult.length === 0) {
        return this.service.handleError(new ProcurementError('RFQ not found', 'RFQ_NOT_FOUND', 404), 'getRFQById');
      }

      // Log audit trail
      await auditLogger.logAction(context, 'view', 'rfq', rfqId);

      return this.service.success(rfqResult[0]);
    } catch (error) {
      return this.service.handleError(error, 'getRFQById');
    }
  }

  /**
   * POST /api/v1/projects/{projectId}/rfqs
   */
  async createRFQ(context: ApiContext, rfqData: any): Promise<ServiceResponse<RFQ>> {
    try {
      // Validate RFQ data
      const validation = validateSchema(ProcurementSchemas.RFQCreate, rfqData);
      if (!validation.success) {
        return this.service.handleError(
          new RFQValidationError('Invalid RFQ data', validation.error!.issues),
          'createRFQ'
        );
      }

      const validData = validation.data!;

      // Create RFQ record
      const newRFQ: NewRFQ = {
        projectId: context.projectId,
        rfqNumber: validData.rfqNumber,
        boqId: validData.boqId,
        title: validData.title,
        description: validData.description,
        status: 'draft',
        responseDeadline: new Date(validData.responseDeadline),
        issuedDate: new Date(),
        paymentTerms: validData.paymentTerms,
        deliveryTerms: validData.deliveryTerms,
        validityPeriod: validData.validityPeriod,
        currency: validData.currency,
        technicalRequirements: validData.technicalRequirements,
        supplierIds: validData.supplierIds,
        createdBy: context.userId,
        createdAt: new Date()
      };

      const rfqResult = await db.insert(rfqs).values(newRFQ).returning();
      const rfq = rfqResult[0];

      // Send invitations to suppliers
      if (validData.supplierIds && validData.supplierIds.length > 0) {
        // TODO: Implement supplier invitation logic
      }

      // Log audit trail
      await auditLogger.logAction(context, 'create', 'rfq', rfq.id, null, rfq, {
        operation: 'create',
        supplierCount: validData.supplierIds?.length || 0
      });

      return this.service.success(rfq);
    } catch (error) {
      return this.service.handleError(error, 'createRFQ');
    }
  }

  /**
   * PUT /api/v1/projects/{projectId}/rfqs/{rfqId}
   */
  async updateRFQ(context: ApiContext, rfqId: string, updateData: any): Promise<ServiceResponse<RFQ>> {
    try {
      // Validate input data
      const validData = validateSchema(ProcurementSchemas.UpdateRFQ, updateData);
      if (!validData.isValid) {
        throw new RFQValidationError('Invalid RFQ update data', validData.errors);
      }

      // Get existing RFQ
      const existing = await db
        .select()
        .from(rfqs)
        .where(and(eq(rfqs.id, rfqId), eq(rfqs.projectId, context.projectId)))
        .limit(1);

      if (existing.length === 0) {
        throw new ProcurementError('RFQ not found', 'RFQ_NOT_FOUND', 404);
      }

      const oldRFQ = existing[0];

      // Update RFQ
      const [rfq] = await db
        .update(rfqs)
        .set({
          ...validData.data,
          updatedBy: context.userId,
          updatedAt: new Date()
        })
        .where(and(eq(rfqs.id, rfqId), eq(rfqs.projectId, context.projectId)))
        .returning();

      // Log audit trail
      await auditLogger.logAction(context, 'update', 'rfq', rfq.id, oldRFQ, rfq, {
        operation: 'update',
        changedFields: Object.keys(validData.data)
      });

      return this.service.success(rfq);
    } catch (error) {
      return this.service.handleError(error, 'updateRFQ');
    }
  }

  /**
   * DELETE /api/v1/projects/{projectId}/rfqs/{rfqId}
   */
  async deleteRFQ(context: ApiContext, rfqId: string): Promise<ServiceResponse<void>> {
    try {
      // Get existing RFQ for audit trail
      const existing = await db
        .select()
        .from(rfqs)
        .where(and(eq(rfqs.id, rfqId), eq(rfqs.projectId, context.projectId)))
        .limit(1);

      if (existing.length === 0) {
        throw new ProcurementError('RFQ not found', 'RFQ_NOT_FOUND', 404);
      }

      const oldRFQ = existing[0];

      // Delete RFQ
      await db
        .delete(rfqs)
        .where(and(eq(rfqs.id, rfqId), eq(rfqs.projectId, context.projectId)));

      // Log audit trail
      await auditLogger.logAction(context, 'delete', 'rfq', rfqId, oldRFQ, null, {
        operation: 'delete'
      });

      return this.service.success(undefined);
    } catch (error) {
      return this.service.handleError(error, 'deleteRFQ');
    }
  }

  /**
   * POST /api/v1/projects/{projectId}/rfqs/{rfqId}/suppliers
   */
  async addSuppliersToRFQ(context: ApiContext, rfqId: string, supplierIds: string[]): Promise<ServiceResponse<void>> {
    try {
      // Validate RFQ exists
      const existing = await db
        .select()
        .from(rfqs)
        .where(and(eq(rfqs.id, rfqId), eq(rfqs.projectId, context.projectId)))
        .limit(1);

      if (existing.length === 0) {
        throw new ProcurementError('RFQ not found', 'RFQ_NOT_FOUND', 404);
      }

      const rfq = existing[0];
      const currentSuppliers = rfq.supplierIds || [];
      const newSuppliers = [...new Set([...currentSuppliers, ...supplierIds])];

      // Update RFQ with new suppliers
      const [updatedRFQ] = await db
        .update(rfqs)
        .set({
          supplierIds: newSuppliers,
          updatedBy: context.userId,
          updatedAt: new Date()
        })
        .where(and(eq(rfqs.id, rfqId), eq(rfqs.projectId, context.projectId)))
        .returning();

      // Log audit trail
      await auditLogger.logAction(context, 'update', 'rfq', rfqId, rfq, updatedRFQ, {
        operation: 'add_suppliers',
        addedSuppliers: supplierIds
      });

      return this.service.success(undefined);
    } catch (error) {
      return this.service.handleError(error, 'addSuppliersToRFQ');
    }
  }

  /**
   * DELETE /api/v1/projects/{projectId}/rfqs/{rfqId}/suppliers
   */
  async removeSuppliersFromRFQ(context: ApiContext, rfqId: string, supplierIds: string[]): Promise<ServiceResponse<void>> {
    try {
      // Validate RFQ exists
      const existing = await db
        .select()
        .from(rfqs)
        .where(and(eq(rfqs.id, rfqId), eq(rfqs.projectId, context.projectId)))
        .limit(1);

      if (existing.length === 0) {
        throw new ProcurementError('RFQ not found', 'RFQ_NOT_FOUND', 404);
      }

      const rfq = existing[0];
      const currentSuppliers = rfq.supplierIds || [];
      const remainingSuppliers = currentSuppliers.filter(id => !supplierIds.includes(id));

      // Update RFQ with remaining suppliers
      const [updatedRFQ] = await db
        .update(rfqs)
        .set({
          supplierIds: remainingSuppliers,
          updatedBy: context.userId,
          updatedAt: new Date()
        })
        .where(and(eq(rfqs.id, rfqId), eq(rfqs.projectId, context.projectId)))
        .returning();

      // Log audit trail
      await auditLogger.logAction(context, 'update', 'rfq', rfqId, rfq, updatedRFQ, {
        operation: 'remove_suppliers',
        removedSuppliers: supplierIds
      });

      return this.service.success(undefined);
    } catch (error) {
      return this.service.handleError(error, 'removeSuppliersFromRFQ');
    }
  }

  /**
   * PUT /api/v1/projects/{projectId}/rfqs/{rfqId}/suppliers
   */
  async replaceRFQSuppliers(context: ApiContext, rfqId: string, supplierIds: string[]): Promise<ServiceResponse<void>> {
    try {
      // Validate RFQ exists
      const existing = await db
        .select()
        .from(rfqs)
        .where(and(eq(rfqs.id, rfqId), eq(rfqs.projectId, context.projectId)))
        .limit(1);

      if (existing.length === 0) {
        throw new ProcurementError('RFQ not found', 'RFQ_NOT_FOUND', 404);
      }

      const rfq = existing[0];

      // Replace suppliers
      const [updatedRFQ] = await db
        .update(rfqs)
        .set({
          supplierIds: supplierIds,
          updatedBy: context.userId,
          updatedAt: new Date()
        })
        .where(and(eq(rfqs.id, rfqId), eq(rfqs.projectId, context.projectId)))
        .returning();

      // Log audit trail
      await auditLogger.logAction(context, 'update', 'rfq', rfqId, rfq, updatedRFQ, {
        operation: 'replace_suppliers',
        previousSuppliers: rfq.supplierIds || [],
        newSuppliers: supplierIds
      });

      return this.service.success(undefined);
    } catch (error) {
      return this.service.handleError(error, 'replaceRFQSuppliers');
    }
  }

  /**
   * GET /api/v1/projects/{projectId}/suppliers/{supplierId}/rfqs
   */
  async getSupplierRFQHistory(context: ApiContext, supplierId: string, filters: RFQFilters = {}): Promise<ServiceResponse<{ rfqs: RFQ[], total: number }>> {
    try {
      const { page = 1, limit = 50, sortOrder = 'desc' } = filters;
      const offset = (page - 1) * limit;

      // Build query to find RFQs that include this supplier
      const queryConditions = [eq(rfqs.projectId, context.projectId)];
      
      // Get RFQs where supplier is in the supplierIds array
      const rfqList = await db
        .select()
        .from(rfqs)
        .where(and(...queryConditions))
        .orderBy(sortOrder === 'desc' ? desc(rfqs.createdAt) : asc(rfqs.createdAt))
        .limit(limit)
        .offset(offset);

      // Filter RFQs that include the supplier (since we can't use array contains in basic SQL)
      const supplierRFQs = rfqList.filter(rfq => 
        rfq.supplierIds && rfq.supplierIds.includes(supplierId)
      );

      // Get total count for pagination
      const allRFQs = await db
        .select()
        .from(rfqs)
        .where(and(...queryConditions));
      
      const totalSupplierRFQs = allRFQs.filter(rfq => 
        rfq.supplierIds && rfq.supplierIds.includes(supplierId)
      ).length;

      return this.service.success({
        rfqs: supplierRFQs,
        total: totalSupplierRFQs
      });
    } catch (error) {
      return this.service.handleError(error, 'getSupplierRFQHistory');
    }
  }
}