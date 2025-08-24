/**
 * Stock API Operations
 * Handles all stock-related API operations
 */

import { BaseService, type ServiceResponse } from '../../core/BaseService';
import { auditLogger } from '../auditLogger';
import { db } from '@/lib/neon/connection';
import { stockPositions } from '@/lib/neon/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import type { StockPosition } from '@/lib/neon/schema';
import type { ApiContext, StockFilters } from './types';

export class StockOperations {
  constructor(private service: BaseService) {}

  /**
   * GET /api/v1/projects/{projectId}/stock/positions
   */
  async getStockPositions(context: ApiContext, filters: StockFilters = {}): Promise<ServiceResponse<{ positions: StockPosition[], total: number, page: number, limit: number }>> {
    try {
      const { page = 1, limit = 50, sortOrder = 'asc' } = filters;
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
        .orderBy(sortOrder === 'desc' ? desc(stockPositions.itemCode) : asc(stockPositions.itemCode))
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

      return this.service.success({
        positions: positionList,
        total,
        page,
        limit
      });
    } catch (error) {
      return this.service.handleError(error, 'getStockPositions');
    }
  }
}