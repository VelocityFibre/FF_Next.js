/**
 * BOQ API Service - Specialized service for BOQ operations
 * Extends the base procurement API with BOQ-specific functionality
 */

import { BaseService, type ServiceResponse, type ServiceOptions } from '../core/BaseService';
import { procurementApiService } from './procurementApiService';
import { validateSchema, ProcurementSchemas } from '@/lib/validation/procurement.schemas';
import { auditLogger, AuditAction } from './auditLogger';
import { BOQError, BOQMappingError, createProcurementError } from './procurementErrors';
import { db } from '@/lib/neon/connection';
import { 
  boqs, boqItems, boqExceptions,
  type BOQ, type NewBOQ, type BOQItem, type NewBOQItem, type BOQException, type NewBOQException
} from '@/lib/neon/schema';
import { eq, and, desc, asc, count } from 'drizzle-orm';

// BOQ Import result interface
interface BOQImportResult {
  boqId: string;
  itemCount: number;
  mappedItems: number;
  unmappedItems: number;
  exceptionsCount: number;
  exceptions: BOQException[];
}

// BOQ mapping result interface
interface BOQMappingResult {
  boqId: string;
  totalItems: number;
  mappedItems: number;
  unmappedItems: number;
  exceptions: BOQException[];
  mappingConfidence: number;
}

// API Context type
interface ApiContext {
  userId: string;
  userName?: string;
  userRole?: string;
  projectId: string;
  permissions: string[];
  ipAddress?: string;
  userAgent?: string;
}

class BOQApiService extends BaseService {
  constructor(options: ServiceOptions = {}) {
    super('BOQService', {
      timeout: 60000, // Extended timeout for file processing
      retries: 2,
      ...options,
    });
  }

  /**
   * Import BOQ from uploaded Excel file with automatic mapping
   */
  async importBOQWithMapping(
    context: ApiContext,
    importData: {
      fileName: string;
      fileSize: number;
      version: string;
      title?: string;
      description?: string;
      rows: Array<{
        lineNumber: number;
        itemCode?: string;
        description: string;
        category?: string;
        subcategory?: string;
        quantity: number;
        uom: string;
        unitPrice?: number;
        totalPrice?: number;
        phase?: string;
        task?: string;
        site?: string;
        location?: string;
        specifications?: string;
        technicalNotes?: string;
      }>;
    }
  ): Promise<ServiceResponse<BOQImportResult>> {
    try {
      // First, import the BOQ using base service
      const importResult = await procurementApiService.importBOQ(context, importData);
      if (!importResult.success) {
        return importResult as any;
      }

      const boqId = importResult.data!.boqId;

      // Now perform automatic mapping
      const mappingResult = await this.performAutomaticMapping(context, boqId);
      if (!mappingResult.success) {
        // Import succeeded but mapping failed - log warning but don't fail
        console.warn('[BOQService] Mapping failed after successful import:', mappingResult.error);
        
        return {
          success: true,
          data: {
            boqId,
            itemCount: importData.rows.length,
            mappedItems: 0,
            unmappedItems: importData.rows.length,
            exceptionsCount: 0,
            exceptions: []
          }
        };
      }

      // Combine import and mapping results
      const result: BOQImportResult = {
        boqId,
        itemCount: importData.rows.length,
        mappedItems: mappingResult.data!.mappedItems,
        unmappedItems: mappingResult.data!.unmappedItems,
        exceptionsCount: mappingResult.data!.exceptions.length,
        exceptions: mappingResult.data!.exceptions
      };

      // Log comprehensive audit trail
      await auditLogger.logBOQAction(
        context,
        AuditAction.IMPORT,
        boqId,
        null,
        result,
        {
          fileName: importData.fileName,
          fileSize: importData.fileSize,
          itemCount: importData.rows.length,
          mappingPerformed: true,
          mappingConfidence: mappingResult.data!.mappingConfidence
        }
      );

      return this.success(result);
    } catch (error) {
      return this.handleError(error, 'importBOQWithMapping');
    }
  }

  /**
   * Perform automatic catalog mapping for BOQ items
   */
  async performAutomaticMapping(
    context: ApiContext,
    boqId: string
  ): Promise<ServiceResponse<BOQMappingResult>> {
    try {
      // Get BOQ items that need mapping
      const unmappedItems = await db
        .select()
        .from(boqItems)
        .where(
          and(
            eq(boqItems.boqId, boqId),
            eq(boqItems.projectId, context.projectId),
            eq(boqItems.mappingStatus, 'pending')
          )
        );

      if (unmappedItems.length === 0) {
        return this.success({
          boqId,
          totalItems: 0,
          mappedItems: 0,
          unmappedItems: 0,
          exceptions: [],
          mappingConfidence: 100
        });
      }

      let mappedCount = 0;
      let totalConfidence = 0;
      const exceptions: BOQException[] = [];

      // Process each item for mapping
      for (const item of unmappedItems) {
        try {
          // Simulate catalog matching (in real implementation, this would query a catalog service)
          const mappingResult = await this.findCatalogMatch(item);
          
          if (mappingResult.confidence >= 80) {
            // High confidence match - apply automatically
            await db
              .update(boqItems)
              .set({
                catalogItemId: mappingResult.catalogItem.id,
                catalogItemCode: mappingResult.catalogItem.code,
                catalogItemName: mappingResult.catalogItem.name,
                mappingConfidence: mappingResult.confidence,
                mappingStatus: 'mapped',
                updatedAt: new Date()
              })
              .where(eq(boqItems.id, item.id));

            mappedCount++;
            totalConfidence += mappingResult.confidence;
          } else if (mappingResult.confidence >= 50) {
            // Medium confidence - create exception for manual review
            const exception = await this.createMappingException(
              item,
              'multiple_matches',
              'medium',
              'Multiple catalog matches found. Manual review required.',
              `${mappingResult.suggestions.length} possible matches found with confidence ${mappingResult.confidence}%`,
              mappingResult.suggestions
            );
            exceptions.push(exception);
          } else {
            // Low confidence - create exception for no match
            const exception = await this.createMappingException(
              item,
              'no_match',
              'high',
              'No suitable catalog match found.',
              'Item description does not match any catalog items with sufficient confidence.',
              []
            );
            exceptions.push(exception);
          }
        } catch (itemError) {
          // Create data issue exception
          const exception = await this.createMappingException(
            item,
            'data_issue',
            'medium',
            'Error processing item for mapping.',
            itemError instanceof Error ? itemError.message : 'Unknown processing error',
            []
          );
          exceptions.push(exception);
        }
      }

      // Calculate overall mapping confidence
      const overallConfidence = mappedCount > 0 ? totalConfidence / mappedCount : 0;

      // Update BOQ with mapping statistics
      await db
        .update(boqs)
        .set({
          mappingStatus: exceptions.length > 0 ? 'completed' : 'completed',
          mappingConfidence: overallConfidence,
          mappedItems: mappedCount,
          unmappedItems: unmappedItems.length - mappedCount,
          exceptionsCount: exceptions.length,
          updatedAt: new Date()
        })
        .where(eq(boqs.id, boqId));

      const result: BOQMappingResult = {
        boqId,
        totalItems: unmappedItems.length,
        mappedItems: mappedCount,
        unmappedItems: unmappedItems.length - mappedCount,
        exceptions,
        mappingConfidence: overallConfidence
      };

      // Log mapping action
      await auditLogger.logBOQAction(
        context,
        AuditAction.UPDATE,
        boqId,
        null,
        result,
        {
          operation: 'automatic_mapping',
          mappingConfidence: overallConfidence,
          exceptionsCreated: exceptions.length
        }
      );

      return this.success(result);
    } catch (error) {
      return this.handleError(error, 'performAutomaticMapping');
    }
  }

  /**
   * Resolve a BOQ mapping exception manually
   */
  async resolveMappingException(
    context: ApiContext,
    exceptionId: string,
    resolution: {
      action: 'manual_mapping' | 'catalog_update' | 'item_split' | 'item_ignore';
      catalogItemId?: string;
      catalogItemCode?: string;
      catalogItemName?: string;
      resolutionNotes: string;
    }
  ): Promise<ServiceResponse<BOQException>> {
    try {
      // Get the exception
      const exceptionResult = await db
        .select()
        .from(boqExceptions)
        .where(
          and(
            eq(boqExceptions.id, exceptionId),
            eq(boqExceptions.projectId, context.projectId)
          )
        )
        .limit(1);

      if (exceptionResult.length === 0) {
        return this.handleError(createProcurementError('BOQ_EXCEPTION_NOT_FOUND', 'BOQ exception not found'), 'resolveMappingException');
      }

      const exception = exceptionResult[0];

      // Apply resolution based on action
      if (resolution.action === 'manual_mapping' && resolution.catalogItemId) {
        // Update the BOQ item with manual mapping
        await db
          .update(boqItems)
          .set({
            catalogItemId: resolution.catalogItemId,
            catalogItemCode: resolution.catalogItemCode,
            catalogItemName: resolution.catalogItemName,
            mappingConfidence: 100, // Manual mapping has 100% confidence
            mappingStatus: 'mapped',
            updatedAt: new Date()
          })
          .where(eq(boqItems.id, exception.boqItemId));
      }

      // Update the exception as resolved
      const resolvedExceptionResult = await db
        .update(boqExceptions)
        .set({
          status: 'resolved',
          resolvedBy: context.userId,
          resolvedAt: new Date(),
          resolutionAction: resolution.action,
          resolutionNotes: resolution.resolutionNotes,
          updatedAt: new Date()
        })
        .where(eq(boqExceptions.id, exceptionId))
        .returning();

      const resolvedException = resolvedExceptionResult[0];

      // Log resolution action
      await auditLogger.logAction(
        context,
        AuditAction.UPDATE,
        'boq_exception',
        exceptionId,
        exception,
        resolvedException,
        {
          operation: 'resolve_exception',
          resolutionAction: resolution.action,
          catalogItemMapped: resolution.catalogItemId
        }
      );

      return this.success(resolvedException);
    } catch (error) {
      return this.handleError(error, 'resolveMappingException');
    }
  }

  /**
   * Get BOQ mapping statistics
   */
  async getBOQMappingStatistics(
    context: ApiContext,
    boqId: string
  ): Promise<ServiceResponse<{
    totalItems: number;
    mappedItems: number;
    unmappedItems: number;
    exceptionsCount: number;
    mappingConfidence: number;
    statusBreakdown: Record<string, number>;
  }>> {
    try {
      // Get BOQ
      const boqResult = await db
        .select()
        .from(boqs)
        .where(
          and(
            eq(boqs.id, boqId),
            eq(boqs.projectId, context.projectId)
          )
        )
        .limit(1);

      if (boqResult.length === 0) {
        return this.handleError(createProcurementError('BOQ_NOT_FOUND', 'BOQ not found'), 'getBOQMappingStatistics');
      }

      const boq = boqResult[0];

      // Get status breakdown
      const statusBreakdownResult = await db
        .select({
          mappingStatus: boqItems.mappingStatus,
          count: count(boqItems.id)
        })
        .from(boqItems)
        .where(eq(boqItems.boqId, boqId))
        .groupBy(boqItems.mappingStatus);

      const statusBreakdown: Record<string, number> = {};
      statusBreakdownResult.forEach(row => {
        statusBreakdown[row.mappingStatus] = Number(row.count);
      });

      return this.success({
        totalItems: Number(boq.itemCount) || 0,
        mappedItems: Number(boq.mappedItems) || 0,
        unmappedItems: Number(boq.unmappedItems) || 0,
        exceptionsCount: Number(boq.exceptionsCount) || 0,
        mappingConfidence: Number(boq.mappingConfidence) || 0,
        statusBreakdown
      });
    } catch (error) {
      return this.handleError(error, 'getBOQMappingStatistics');
    }
  }

  // ==============================================
  // PRIVATE HELPER METHODS
  // ==============================================

  /**
   * Find catalog match for a BOQ item (simulated implementation)
   */
  private async findCatalogMatch(item: BOQItem): Promise<{
    confidence: number;
    catalogItem: { id: string; code: string; name: string };
    suggestions: Array<{ id: string; code: string; name: string; confidence: number }>;
  }> {
    // Simulate catalog matching logic
    // In a real implementation, this would query a product catalog service
    
    const mockCatalogItems = [
      { id: 'cat-001', code: 'FIBER-SM-4C', name: 'Single Mode Fiber Cable 4 Core' },
      { id: 'cat-002', code: 'POLE-STEEL-9M', name: 'Steel Pole 9 Meters' },
      { id: 'cat-003', code: 'CABINET-DIST-12P', name: 'Distribution Cabinet 12 Port' }
    ];

    // Simple text matching simulation
    const description = item.description.toLowerCase();
    let bestMatch = mockCatalogItems[0];
    let confidence = 0;

    // Basic keyword matching
    if (description.includes('fiber') || description.includes('cable')) {
      bestMatch = mockCatalogItems[0];
      confidence = 85;
    } else if (description.includes('pole')) {
      bestMatch = mockCatalogItems[1];
      confidence = 90;
    } else if (description.includes('cabinet') || description.includes('distribution')) {
      bestMatch = mockCatalogItems[2];
      confidence = 80;
    } else {
      confidence = 45; // Low confidence for unknown items
    }

    return {
      confidence,
      catalogItem: bestMatch,
      suggestions: mockCatalogItems.map(item => ({
        ...item,
        confidence: item === bestMatch ? confidence : Math.random() * 60 + 20
      }))
    };
  }

  /**
   * Create a mapping exception
   */
  private async createMappingException(
    item: BOQItem,
    exceptionType: 'no_match' | 'multiple_matches' | 'data_issue' | 'manual_review',
    severity: 'low' | 'medium' | 'high' | 'critical',
    issueDescription: string,
    suggestedAction: string,
    systemSuggestions: any[]
  ): Promise<BOQException> {
    const newException: NewBOQException = {
      boqId: item.boqId,
      boqItemId: item.id,
      projectId: item.projectId,
      exceptionType,
      severity,
      issueDescription,
      suggestedAction,
      systemSuggestions,
      status: 'open',
      priority: severity === 'critical' ? 'urgent' : severity
    };

    const exceptionResult = await db
      .insert(boqExceptions)
      .values(newException)
      .returning();

    return exceptionResult[0];
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<ServiceResponse<{ status: 'healthy' | 'degraded' | 'unhealthy'; details?: Record<string, unknown> }>> {
    try {
      // Test BOQ table access
      const testQuery = await db.select({ count: count(boqs.id) }).from(boqs).limit(1);
      
      return this.success({
        status: 'healthy',
        details: {
          database: 'connected',
          tablesAccessible: ['boqs', 'boq_items', 'boq_exceptions'],
          timestamp: new Date().toISOString()
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

export const boqApiService = new BOQApiService();
export default boqApiService;