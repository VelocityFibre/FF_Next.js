/**
 * Procurement API Service - Main service orchestrator for procurement operations
 * Implements secure, project-scoped API endpoints for BOQ, RFQ, and Stock management
 */

import { BaseService, type ServiceResponse, type ServiceOptions } from '../core/BaseService';
import { ProcurementError, BOQMappingError, RFQValidationError } from './procurementErrors';
import { validateSchema, ProcurementSchemas } from '@/lib/validation/procurement.schemas';
import { auditLogger } from './auditLogger';
import { projectAccessMiddleware } from './middleware/projectAccessMiddleware';
import { rbacMiddleware } from './middleware/rbacMiddleware';
import { db } from '@/lib/neon/connection';
import { 
  boqs, boqItems, boqExceptions, 
  rfqs, rfqItems, supplierInvitations, quotes, quoteItems,
  stockPositions, stockMovements, stockMovementItems
} from '@/lib/neon/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import type { 
  BOQ, NewBOQ, BOQItem, NewBOQItem, BOQException,
  RFQ, NewRFQ, RFQItem, SupplierInvitation, Quote, QuoteItem,
  StockPosition, StockMovement, StockMovementItem
} from '@/lib/neon/schema';

// API Context type for request processing
interface ApiContext {
  userId: string;
  userName?: string;
  userRole?: string;
  projectId: string;
  permissions: string[];
  ipAddress?: string;
  userAgent?: string;
}

// Pagination interface
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter interfaces
interface BOQFilters extends PaginationParams {
  status?: string;
  mappingStatus?: string;
  uploadedBy?: string;
}

interface RFQFilters extends PaginationParams {
  status?: string;
  createdBy?: string;
  responseDeadline?: { from?: string; to?: string };
}

interface StockFilters extends PaginationParams {
  category?: string;
  stockStatus?: string;
  warehouseLocation?: string;
}

class ProcurementApiService extends BaseService {
  constructor(options: ServiceOptions = {}) {
    super('ProcurementAPI', {
      timeout: 45000, // Extended timeout for complex operations
      retries: 2,
      ...options,
    });
  }

  // ==============================================
  // MIDDLEWARE VALIDATION
  // ==============================================

  /**
   * Validate API context and permissions
   */
  private async validateContext(context: ApiContext, requiredPermission: string): Promise<ServiceResponse<null>> {
    try {
      // Check project access
      const projectAccess = await projectAccessMiddleware.checkProjectAccess(context.userId, context.projectId);
      if (!projectAccess.success) {
        return this.handleError(new ProcurementError('Access denied: Invalid project access', 'PROJECT_ACCESS_DENIED', 403), 'validateContext');
      }

      // Check RBAC permissions
      const rbacCheck = await rbacMiddleware.checkPermission(context.userId, requiredPermission, context.projectId);
      if (!rbacCheck.success) {
        return this.handleError(new ProcurementError('Access denied: Insufficient permissions', 'INSUFFICIENT_PERMISSIONS', 403), 'validateContext');
      }

      return this.success(null);
    } catch (error) {
      return this.handleError(error, 'validateContext');
    }
  }

  // ==============================================
  // BOQ MANAGEMENT ENDPOINTS
  // ==============================================

  /**
   * GET /api/v1/projects/{projectId}/boqs
   */
  async getBOQs(context: ApiContext, filters: BOQFilters = {}): Promise<ServiceResponse<{ boqs: BOQ[], total: number, page: number, limit: number }>> {
    const authCheck = await this.validateContext(context, 'boq:read');
    if (!authCheck.success) return authCheck as any;

    try {
      const { page = 1, limit = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = filters;
      const offset = (page - 1) * limit;

      // Build query with filters
      const queryConditions = [eq(boqs.projectId, context.projectId)];
      
      if (filters.status) {
        queryConditions.push(eq(boqs.status, filters.status as any));
      }
      if (filters.mappingStatus) {
        queryConditions.push(eq(boqs.mappingStatus, filters.mappingStatus as any));
      }
      if (filters.uploadedBy) {
        queryConditions.push(eq(boqs.uploadedBy, filters.uploadedBy));
      }

      // Execute query
      const boqList = await db
        .select()
        .from(boqs)
        .where(and(...queryConditions))
        .orderBy(sortOrder === 'desc' ? desc(boqs[sortBy as keyof typeof boqs]) : asc(boqs[sortBy as keyof typeof boqs]))
        .limit(limit)
        .offset(offset);

      // Get total count
      const totalResult = await db
        .select({ count: boqs.id })
        .from(boqs)
        .where(and(...queryConditions));
      const total = totalResult.length;

      // Log audit trail
      await auditLogger.logAction(context, 'view', 'boq', 'list', null, null, {
        filters,
        resultCount: boqList.length,
        total
      });

      return this.success({
        boqs: boqList,
        total,
        page,
        limit
      });
    } catch (error) {
      return this.handleError(error, 'getBOQs');
    }
  }

  /**
   * GET /api/v1/projects/{projectId}/boqs/{boqId}
   */
  async getBOQById(context: ApiContext, boqId: string): Promise<ServiceResponse<BOQ & { items: BOQItem[], exceptions: BOQException[] }>> {
    const authCheck = await this.validateContext(context, 'boq:read');
    if (!authCheck.success) return authCheck as any;

    try {
      // Get BOQ
      const boqResult = await db
        .select()
        .from(boqs)
        .where(and(eq(boqs.id, boqId), eq(boqs.projectId, context.projectId)))
        .limit(1);

      if (boqResult.length === 0) {
        return this.handleError(new ProcurementError('BOQ not found', 'BOQ_NOT_FOUND', 404), 'getBOQById');
      }

      const boq = boqResult[0];

      // Get BOQ items
      const items = await db
        .select()
        .from(boqItems)
        .where(eq(boqItems.boqId, boqId))
        .orderBy(asc(boqItems.lineNumber));

      // Get exceptions
      const exceptions = await db
        .select()
        .from(boqExceptions)
        .where(eq(boqExceptions.boqId, boqId))
        .orderBy(desc(boqExceptions.createdAt));

      // Log audit trail
      await auditLogger.logAction(context, 'view', 'boq', boqId, null, null, {
        itemCount: items.length,
        exceptionsCount: exceptions.length
      });

      return this.success({
        ...boq,
        items,
        exceptions
      });
    } catch (error) {
      return this.handleError(error, 'getBOQById');
    }
  }

  /**
   * POST /api/v1/projects/{projectId}/boqs/import
   */
  async importBOQ(context: ApiContext, importData: any): Promise<ServiceResponse<{ boqId: string, itemCount: number, exceptionsCount: number }>> {
    const authCheck = await this.validateContext(context, 'boq:create');
    if (!authCheck.success) return authCheck as any;

    try {
      // Validate import data
      const validation = validateSchema(ProcurementSchemas.BOQImport, importData);
      if (!validation.success) {
        return this.handleError(
          new RFQValidationError('Invalid BOQ import data', validation.error!.issues),
          'importBOQ'
        );
      }

      const validData = validation.data!;

      // Create BOQ record
      const newBOQ: NewBOQ = {
        projectId: context.projectId,
        version: validData.version,
        title: validData.title,
        description: validData.description,
        status: 'draft',
        mappingStatus: 'pending',
        uploadedBy: context.userId,
        uploadedAt: new Date(),
        fileName: validData.fileName,
        fileSize: validData.fileSize,
        itemCount: validData.rows.length,
        unmappedItems: validData.rows.length,
        currency: 'ZAR'
      };

      const boqResult = await db.insert(boqs).values(newBOQ).returning();
      const boq = boqResult[0];

      // Create BOQ items
      let exceptionsCount = 0;
      const boqItemsToInsert: NewBOQItem[] = [];
      
      for (const row of validData.rows) {
        const newItem: NewBOQItem = {
          boqId: boq.id,
          projectId: context.projectId,
          lineNumber: row.lineNumber,
          itemCode: row.itemCode,
          description: row.description,
          category: row.category,
          subcategory: row.subcategory,
          quantity: row.quantity,
          uom: row.uom,
          unitPrice: row.unitPrice,
          totalPrice: row.totalPrice,
          phase: row.phase,
          task: row.task,
          site: row.site,
          location: row.location,
          specifications: row.specifications ? { notes: row.specifications } : undefined,
          technicalNotes: row.technicalNotes,
          mappingStatus: 'pending',
          procurementStatus: 'pending'
        };

        boqItemsToInsert.push(newItem);
      }

      await db.insert(boqItems).values(boqItemsToInsert);

      // Log audit trail
      await auditLogger.logAction(context, 'create', 'boq', boq.id, null, boq, {
        operation: 'import',
        fileName: validData.fileName,
        itemCount: validData.rows.length
      });

      return this.success({
        boqId: boq.id,
        itemCount: validData.rows.length,
        exceptionsCount
      });
    } catch (error) {
      return this.handleError(error, 'importBOQ');
    }
  }

  /**
   * PUT /api/v1/projects/{projectId}/boqs/{boqId}
   */
  async updateBOQ(context: ApiContext, boqId: string, updateData: Partial<BOQ>): Promise<ServiceResponse<BOQ>> {
    const authCheck = await this.validateContext(context, 'boq:write');
    if (!authCheck.success) return authCheck as any;

    try {
      // Get current BOQ for audit trail
      const currentBOQ = await this.getBOQById(context, boqId);
      if (!currentBOQ.success) return currentBOQ as any;

      // Validate update data
      const allowedFields = ['title', 'description', 'status'];
      const filteredData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => ({ ...obj, [key]: updateData[key as keyof BOQ] }), {});

      // Update BOQ
      const updatedBOQ = await db
        .update(boqs)
        .set({
          ...filteredData,
          updatedAt: new Date()
        })
        .where(and(eq(boqs.id, boqId), eq(boqs.projectId, context.projectId)))
        .returning();

      if (updatedBOQ.length === 0) {
        return this.handleError(new ProcurementError('BOQ not found or no changes made', 'BOQ_UPDATE_FAILED', 404), 'updateBOQ');
      }

      // Log audit trail
      await auditLogger.logAction(context, 'update', 'boq', boqId, currentBOQ.data, updatedBOQ[0], {
        updatedFields: Object.keys(filteredData)
      });

      return this.success(updatedBOQ[0]);
    } catch (error) {
      return this.handleError(error, 'updateBOQ');
    }
  }

  // ==============================================
  // RFQ MANAGEMENT ENDPOINTS
  // ==============================================

  /**
   * GET /api/v1/projects/{projectId}/rfqs
   */
  async getRFQs(context: ApiContext, filters: RFQFilters = {}): Promise<ServiceResponse<{ rfqs: RFQ[], total: number, page: number, limit: number }>> {
    const authCheck = await this.validateContext(context, 'rfq:read');
    if (!authCheck.success) return authCheck as any;

    try {
      const { page = 1, limit = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = filters;
      const offset = (page - 1) * limit;

      // Build query with filters
      const queryConditions = [eq(rfqs.projectId, context.projectId)];
      
      if (filters.status) {
        queryConditions.push(eq(rfqs.status, filters.status as any));
      }
      if (filters.createdBy) {
        queryConditions.push(eq(rfqs.createdBy, filters.createdBy));
      }

      // Execute query
      const rfqList = await db
        .select()
        .from(rfqs)
        .where(and(...queryConditions))
        .orderBy(sortOrder === 'desc' ? desc(rfqs[sortBy as keyof typeof rfqs]) : asc(rfqs[sortBy as keyof typeof rfqs]))
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

      return this.success({
        rfqs: rfqList,
        total,
        page,
        limit
      });
    } catch (error) {
      return this.handleError(error, 'getRFQs');
    }
  }

  /**
   * POST /api/v1/projects/{projectId}/rfqs
   */
  async createRFQ(context: ApiContext, rfqData: any): Promise<ServiceResponse<RFQ>> {
    const authCheck = await this.validateContext(context, 'rfq:create');
    if (!authCheck.success) return authCheck as any;

    try {
      // Validate RFQ data
      const validation = validateSchema(ProcurementSchemas.RFQForm, rfqData);
      if (!validation.success) {
        return this.handleError(
          new RFQValidationError('Invalid RFQ data', validation.error!.issues),
          'createRFQ'
        );
      }

      const validData = validation.data!;

      // Generate RFQ number if not provided
      const rfqNumber = validData.rfqNumber || `RFQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create RFQ record
      const newRFQ: NewRFQ = {
        projectId: context.projectId,
        rfqNumber,
        title: validData.title,
        description: validData.description,
        status: 'draft',
        responseDeadline: validData.responseDeadline,
        createdBy: context.userId,
        paymentTerms: validData.paymentTerms,
        deliveryTerms: validData.deliveryTerms,
        validityPeriod: validData.validityPeriod,
        currency: validData.currency || 'ZAR',
        technicalRequirements: validData.technicalRequirements,
        invitedSuppliers: validData.supplierIds
      };

      const rfqResult = await db.insert(rfqs).values(newRFQ).returning();
      const rfq = rfqResult[0];

      // Log audit trail
      await auditLogger.logAction(context, 'create', 'rfq', rfq.id, null, rfq, {
        supplierCount: validData.supplierIds.length
      });

      return this.success(rfq);
    } catch (error) {
      return this.handleError(error, 'createRFQ');
    }
  }

  // ==============================================
  // STOCK MANAGEMENT ENDPOINTS
  // ==============================================

  /**
   * GET /api/v1/projects/{projectId}/stock/positions
   */
  async getStockPositions(context: ApiContext, filters: StockFilters = {}): Promise<ServiceResponse<{ positions: StockPosition[], total: number, page: number, limit: number }>> {
    const authCheck = await this.validateContext(context, 'stock:read');
    if (!authCheck.success) return authCheck as any;

    try {
      const { page = 1, limit = 50, sortBy = 'itemCode', sortOrder = 'asc' } = filters;
      const offset = (page - 1) * limit;

      // Build query with filters
      const queryConditions = [eq(stockPositions.projectId, context.projectId)];
      
      if (filters.category) {
        queryConditions.push(eq(stockPositions.category, filters.category));
      }
      if (filters.stockStatus) {
        queryConditions.push(eq(stockPositions.stockStatus, filters.stockStatus as any));
      }
      if (filters.warehouseLocation) {
        queryConditions.push(eq(stockPositions.warehouseLocation, filters.warehouseLocation));
      }

      // Execute query
      const positionList = await db
        .select()
        .from(stockPositions)
        .where(and(...queryConditions))
        .orderBy(sortOrder === 'desc' ? desc(stockPositions[sortBy as keyof typeof stockPositions]) : asc(stockPositions[sortBy as keyof typeof stockPositions]))
        .limit(limit)
        .offset(offset);

      // Get total count
      const totalResult = await db
        .select({ count: stockPositions.id })
        .from(stockPositions)
        .where(and(...queryConditions));
      const total = totalResult.length;

      // Log audit trail
      await auditLogger.logAction(context, 'view', 'stock_position', 'list', null, null, {
        filters,
        resultCount: positionList.length,
        total
      });

      return this.success({
        positions: positionList,
        total,
        page,
        limit
      });
    } catch (error) {
      return this.handleError(error, 'getStockPositions');
    }
  }

  // ==============================================
  // HEALTH CHECK
  // ==============================================

  async getHealthStatus(): Promise<ServiceResponse<{ status: 'healthy' | 'degraded' | 'unhealthy'; details?: Record<string, unknown> }>> {
    try {
      // Test database connection
      const testQuery = await db.select({ count: boqs.id }).from(boqs).limit(1);
      
      return this.success({
        status: 'healthy',
        details: {
          database: 'connected',
          timestamp: new Date().toISOString(),
          tablesAccessible: ['boqs', 'rfqs', 'stock_positions']
        }
      });
    } catch (error) {
      return {
        success: true,
        data: {
          status: 'unhealthy',
          details: {
            database: 'connection_failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          }
        }
      };
    }
  }
}

export const procurementApiService = new ProcurementApiService();
export default procurementApiService;