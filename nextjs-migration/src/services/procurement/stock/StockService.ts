/**
 * StockService - Main Stock Management Service
 * Central interface for all stock operations with enterprise-grade error handling
 */

import { BaseService, type ServiceResponse } from '../../core/BaseService';
import { StockQueryService } from './core/StockQueryService';
import { StockCommandService } from './core/StockCommandService';
import { StockMovementService } from './core/StockMovementService';
import { stockCalculations } from './utils/stockCalculations';
import { auditLogger } from '../auditLogger';
import { db } from '@/lib/neon/connection';
import { 
  StockError,
  InsufficientStockError,
  StockMovementError,
  isStockError
} from '../errors/stock';
import type {
  StockPosition,
  StockMovement,
  StockMovementItem,
  CableDrum,
  DrumUsageHistory,
  MovementTypeType,
  StockStatusType
} from '@/types/procurement/stock';
import type { ProcurementApiContext } from '../index';
import { log } from '@/lib/logger';

export interface StockFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: string;
  stockStatus?: StockStatusType;
  warehouseLocation?: string;
  binLocation?: string;
  itemCode?: string;
  lowStock?: boolean;
}

export interface MovementFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  movementType?: MovementTypeType;
  status?: string;
  fromDate?: Date;
  toDate?: Date;
  referenceNumber?: string;
}

export interface StockDashboardData {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  criticalStockItems: number;
  recentMovements: StockMovement[];
  topCategories: Array<{
    category: string;
    itemCount: number;
    totalValue: number;
  }>;
  stockLevels: Array<{
    status: StockStatusType;
    count: number;
    percentage: number;
  }>;
}

export interface BulkMovementRequest {
  movementType: MovementTypeType;
  referenceNumber: string;
  referenceType?: string;
  referenceId?: string;
  fromLocation?: string;
  toLocation?: string;
  fromProjectId?: string;
  toProjectId?: string;
  notes?: string;
  reason?: string;
  items: Array<{
    itemCode: string;
    plannedQuantity: number;
    unitCost?: number;
    lotNumbers?: string[];
    serialNumbers?: string[];
  }>;
}

export class StockService extends BaseService {
  private queryService: StockQueryService;
  private commandService: StockCommandService;
  private movementService: StockMovementService;

  constructor() {
    super('StockService', {
      timeout: 45000, // Extended timeout for stock operations
      retries: 2,
      cache: false, // Real-time data required
    });

    this.queryService = new StockQueryService();
    this.commandService = new StockCommandService();
    this.movementService = new StockMovementService();
  }

  /**
   * Get health status of stock service
   */
  async getHealthStatus(): Promise<ServiceResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details?: Record<string, unknown>;
  }>> {
    try {
      const dbHealthy = await this.checkDatabaseConnection();
      const queryServiceHealthy = await this.queryService.getHealthStatus();
      const commandServiceHealthy = await this.commandService.getHealthStatus();
      const movementServiceHealthy = await this.movementService.getHealthStatus();

      const allHealthy = dbHealthy && 
                         queryServiceHealthy.success && 
                         commandServiceHealthy.success && 
                         movementServiceHealthy.success;

      return this.success({
        status: allHealthy ? 'healthy' : 'degraded',
        details: {
          database: dbHealthy ? 'healthy' : 'unhealthy',
          queryService: queryServiceHealthy.success ? 'healthy' : 'unhealthy',
          commandService: commandServiceHealthy.success ? 'healthy' : 'unhealthy',
          movementService: movementServiceHealthy.success ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      return this.handleError(error, 'getHealthStatus');
    }
  }

  // 🟢 WORKING: Stock Position Operations
  async getStockPositions(
    context: ProcurementApiContext,
    filters: StockFilters = {}
  ): Promise<ServiceResponse<{ positions: StockPosition[], total: number, page: number, limit: number }>> {
    try {
      await auditLogger.logAction(context, 'read', 'stock_position', 'list_request', null, null, { filters });
      
      const result = await this.queryService.getStockPositions(context.projectId, filters);
      if (!result.success) {
        throw new StockError(result.error || 'Failed to get stock positions', 'QUERY_FAILED');
      }

      await auditLogger.logAction(context, 'read', 'stock_position', 'list_success', null, null, { 
        resultCount: result.data!.positions.length,
        total: result.data!.total 
      });

      return result;
    } catch (error) {
      if (isStockError(error)) {
        return this.handleError(error, 'stock_operation');
      }
      return this.handleError(error, 'getStockPositions');
    }
  }

  async getStockPositionById(
    context: ProcurementApiContext,
    positionId: string
  ): Promise<ServiceResponse<StockPosition>> {
    try {
      await auditLogger.logAction(context, 'read', 'stock_position', 'detail_request', positionId);
      
      const result = await this.queryService.getStockPositionById(positionId, context.projectId);
      if (!result.success) {
        throw new StockError(result.error || 'Stock position not found', 'NOT_FOUND');
      }

      await auditLogger.logAction(context, 'read', 'stock_position', 'detail_success', positionId);
      return result;
    } catch (error) {
      if (isStockError(error)) {
        return this.handleError(error, 'stock_operation');
      }
      return this.handleError(error, 'getStockPositionById');
    }
  }

  async createStockPosition(
    context: ProcurementApiContext,
    positionData: Omit<StockPosition, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ServiceResponse<StockPosition>> {
    try {
      await auditLogger.logAction(context, 'create', 'stock_position', 'create_request', null, null, { positionData });
      
      const result = await this.commandService.createStockPosition(positionData);
      if (!result.success) {
        throw new StockError(result.error || 'Failed to create stock position', 'CREATE_FAILED');
      }

      await auditLogger.logAction(context, 'create', 'stock_position', 'create_success', result.data!.id, null, { 
        itemCode: result.data!.itemCode 
      });

      return result;
    } catch (error) {
      if (isStockError(error)) {
        return this.handleError(error, 'stock_operation');
      }
      return this.handleError(error, 'createStockPosition');
    }
  }

  async updateStockPosition(
    context: ProcurementApiContext,
    positionId: string,
    updateData: Partial<StockPosition>
  ): Promise<ServiceResponse<StockPosition>> {
    try {
      await auditLogger.logAction(context, 'update', 'stock_position', 'update_request', positionId, null, { updateData });
      
      const result = await this.commandService.updateStockPosition(positionId, updateData, context.projectId);
      if (!result.success) {
        throw new StockError(result.error || 'Failed to update stock position', 'UPDATE_FAILED');
      }

      await auditLogger.logAction(context, 'update', 'stock_position', 'update_success', positionId, null, { 
        itemCode: result.data!.itemCode 
      });

      return result;
    } catch (error) {
      if (isStockError(error)) {
        return this.handleError(error, 'stock_operation');
      }
      return this.handleError(error, 'updateStockPosition');
    }
  }

  // 🟢 WORKING: Stock Movement Operations
  async getStockMovements(
    context: ProcurementApiContext,
    filters: MovementFilters = {}
  ): Promise<ServiceResponse<{ movements: StockMovement[], total: number, page: number, limit: number }>> {
    try {
      await auditLogger.logAction(context, 'read', 'stock_movement', 'list_request', null, null, { filters });
      
      const result = await this.queryService.getStockMovements(context.projectId, filters);
      if (!result.success) {
        throw new StockError(result.error || 'Failed to get stock movements', 'QUERY_FAILED');
      }

      await auditLogger.logAction(context, 'read', 'stock_movement', 'list_success', null, null, { 
        resultCount: result.data!.movements.length,
        total: result.data!.total 
      });

      return result;
    } catch (error) {
      if (isStockError(error)) {
        return this.handleError(error, 'stock_operation');
      }
      return this.handleError(error, 'getStockMovements');
    }
  }

  async createStockMovement(
    context: ProcurementApiContext,
    movementData: Omit<StockMovement, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ServiceResponse<StockMovement>> {
    try {
      await auditLogger.logAction(context, 'create', 'stock_movement', 'create_request', null, null, { movementData });
      
      const result = await this.movementService.createMovement(movementData);
      if (!result.success) {
        throw new StockMovementError(
          result.error || 'Failed to create stock movement',
          'outbound',
          movementData.referenceId || 'unknown',
          0
        );
      }

      await auditLogger.logAction(context, 'create', 'stock_movement', 'create_success', result.data!.id, null, { 
        movementType: result.data!.movementType,
        referenceNumber: result.data!.referenceNumber
      });

      return result;
    } catch (error) {
      if (isStockError(error)) {
        return this.handleError(error, 'stock_operation');
      }
      return this.handleError(error, 'createStockMovement');
    }
  }

  async processBulkMovement(
    context: ProcurementApiContext,
    bulkMovementData: BulkMovementRequest
  ): Promise<ServiceResponse<{ movement: StockMovement, items: StockMovementItem[] }>> {
    try {
      await auditLogger.logAction(context, 'create', 'stock_movement', 'bulk_request', null, null, { bulkMovementData });
      
      const result = await this.movementService.processBulkMovement(
        bulkMovementData,
        context.projectId,
        context.userId
      );
      
      if (!result.success) {
        throw new StockMovementError(
          result.error || 'Failed to process bulk movement',
          'adjustment',
          'bulk_operation',
          1
        );
      }

      await auditLogger.logAction(context, 'create', 'stock_movement', 'bulk_success', result.data!.movement.id, null, { 
        movementType: result.data!.movement.movementType,
        itemCount: result.data!.items.length,
        referenceNumber: result.data!.movement.referenceNumber
      });

      return result;
    } catch (error) {
      if (isStockError(error)) {
        return this.handleError(error, 'stock_operation');
      }
      return this.handleError(error, 'processBulkMovement');
    }
  }

  // 🟢 WORKING: Cable Drum Operations
  async getCableDrums(
    context: ProcurementApiContext,
    filters: { page?: number; limit?: number; cableType?: string; installationStatus?: string; currentLocation?: string } = {}
  ): Promise<ServiceResponse<{ drums: CableDrum[], total: number, page: number, limit: number }>> {
    try {
      await auditLogger.logAction(context, 'read', 'cable_drum', 'list_request', null, null, { filters });
      
      const result = await this.queryService.getCableDrums(context.projectId, filters);
      if (!result.success) {
        throw new StockError(result.error || 'Failed to get cable drums', 'QUERY_FAILED');
      }

      await auditLogger.logAction(context, 'read', 'cable_drum', 'list_success', null, null, { 
        resultCount: result.data!.drums.length,
        total: result.data!.total 
      });

      return result;
    } catch (error) {
      if (isStockError(error)) {
        return this.handleError(error, 'stock_operation');
      }
      return this.handleError(error, 'getCableDrums');
    }
  }

  async updateDrumUsage(
    context: ProcurementApiContext,
    drumId: string,
    usageData: Omit<DrumUsageHistory, 'id' | 'drumId' | 'createdAt' | 'updatedAt'>
  ): Promise<ServiceResponse<DrumUsageHistory>> {
    try {
      await auditLogger.logAction(context, 'update', 'cable_drum', 'usage_update_request', drumId, null, { usageData });
      
      const result = await this.movementService.updateDrumUsage(drumId, usageData);
      if (!result.success) {
        throw new StockError(result.error || 'Failed to update drum usage', 'UPDATE_FAILED');
      }

      await auditLogger.logAction(context, 'update', 'cable_drum', 'usage_update_success', drumId, null, { 
        usedLength: usageData.usedLength,
        currentReading: usageData.currentReading
      });

      return result;
    } catch (error) {
      if (isStockError(error)) {
        return this.handleError(error, 'stock_operation');
      }
      return this.handleError(error, 'updateDrumUsage');
    }
  }

  // 🟢 WORKING: Dashboard and Analytics
  async getDashboardData(
    context: ProcurementApiContext
  ): Promise<ServiceResponse<StockDashboardData>> {
    try {
      await auditLogger.logAction(context, 'read', 'stock_dashboard', 'request', null);
      
      const result = await this.queryService.getDashboardData(context.projectId);
      if (!result.success) {
        throw new StockError(result.error || 'Failed to get dashboard data', 'QUERY_FAILED');
      }

      await auditLogger.logAction(context, 'read', 'stock_dashboard', 'success', null, null, { 
        totalItems: result.data!.totalItems,
        lowStockItems: result.data!.lowStockItems,
        criticalStockItems: result.data!.criticalStockItems
      });

      return result;
    } catch (error) {
      if (isStockError(error)) {
        return this.handleError(error, 'stock_operation');
      }
      return this.handleError(error, 'getDashboardData');
    }
  }

  // 🟢 WORKING: Utility Methods
  async calculateStockValue(context: ProcurementApiContext): Promise<ServiceResponse<{ totalValue: number, breakdown: Array<{ category: string, value: number }> }>> {
    try {
      const positions = await this.queryService.getStockPositions(context.projectId, { limit: 1000 });
      if (!positions.success) {
        throw new StockError(positions.error || 'Failed to get positions for calculation', 'QUERY_FAILED');
      }

      const result = stockCalculations.calculateTotalStockValue(positions.data!.positions);
      
      await auditLogger.logAction(context, 'calculate', 'stock_value', 'success', null, null, { 
        totalValue: result.totalValue,
        categoryCount: result.breakdown.length
      });

      return this.success(result);
    } catch (error) {
      if (isStockError(error)) {
        return this.handleError(error, 'stock_operation');
      }
      return this.handleError(error, 'calculateStockValue');
    }
  }

  async validateStockLevel(
    context: ProcurementApiContext,
    itemCode: string,
    requiredQuantity: number
  ): Promise<ServiceResponse<{ available: boolean, availableQuantity: number, shortfall?: number }>> {
    try {
      const result = await this.queryService.validateStockAvailability(context.projectId, itemCode, requiredQuantity);
      if (!result.success) {
        throw new InsufficientStockError(
          itemCode,
          requiredQuantity,
          0,
          {},
          { error: result.error || 'Stock validation failed' }
        );
      }

      return result;
    } catch (error) {
      if (isStockError(error)) {
        return this.handleError(error, 'stock_operation');
      }
      return this.handleError(error, 'validateStockLevel');
    }
  }

  // 🔵 HELPER: Private Methods
  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      await db.execute('SELECT 1');
      return true;
    } catch (error) {
      log.error('[StockService] Database connection failed:', { data: error }, 'StockService');
      return false;
    }
  }
}

export default StockService;