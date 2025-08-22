/**
 * Audit Logging System for Procurement Operations
 * Comprehensive audit trail for all procurement-related activities
 * Integrates with the existing audit log table in Neon database
 */

import { db } from '@/lib/neon/connection';
import { auditLog, type NewAuditLog } from '@/lib/neon/schema';
import { authService } from '@/services/auth/authService';

// Audit action types
export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  ISSUE = 'issue',
  CLOSE = 'close',
  AWARD = 'award',
  INVITE = 'invite',
  SUBMIT = 'submit',
  EVALUATE = 'evaluate'
}

// Entity types for procurement
export enum AuditEntityType {
  BOQ = 'boq',
  BOQ_ITEM = 'boq_item',
  BOQ_EXCEPTION = 'boq_exception',
  RFQ = 'rfq',
  RFQ_ITEM = 'rfq_item',
  QUOTE = 'quote',
  QUOTE_ITEM = 'quote_item',
  SUPPLIER_INVITATION = 'supplier_invitation',
  STOCK_POSITION = 'stock_position',
  STOCK_MOVEMENT = 'stock_movement',
  CABLE_DRUM = 'cable_drum',
  PROCUREMENT_REPORT = 'procurement_report'
}

// Audit context interface
interface AuditContext {
  userId: string;
  userName?: string;
  userRole?: string;
  projectId?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  source?: 'web' | 'mobile' | 'api';
}

// Audit log entry interface
interface AuditLogEntry {
  action: AuditAction | string;
  entityType: AuditEntityType | string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  changesSummary?: string;
  metadata?: Record<string, any>;
}

class AuditLogger {
  private pendingLogs: NewAuditLog[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 50;
  private readonly BATCH_TIMEOUT = 5000; // 5 seconds

  /**
   * Log a procurement action with full audit trail
   */
  async logAction(
    context: AuditContext,
    action: AuditAction | string,
    entityType: AuditEntityType | string,
    entityId: string,
    oldValue?: any,
    newValue?: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Generate changes summary
      const changesSummary = this.generateChangesSummary(action, entityType, oldValue, newValue);

      // Create audit log entry
      const auditEntry: NewAuditLog = {
        action,
        entityType,
        entityId,
        userId: context.userId,
        userName: context.userName || 'Unknown User',
        userRole: context.userRole,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        oldValue: oldValue ? this.sanitizeValue(oldValue) : null,
        newValue: newValue ? this.sanitizeValue(newValue) : null,
        changesSummary,
        timestamp: new Date(),
        sessionId: context.sessionId,
        source: context.source || 'web'
      };

      // Add to batch for efficient processing
      this.addToBatch(auditEntry);

      // Log to console for debugging (remove in production)
      console.log('[AuditLogger]', {
        action,
        entityType,
        entityId,
        userId: context.userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[AuditLogger] Failed to log audit entry:', error);
      // Don't throw error to avoid breaking business logic
    }
  }

  /**
   * Log BOQ-specific actions
   */
  async logBOQAction(
    context: AuditContext,
    action: AuditAction,
    boqId: string,
    oldValue?: any,
    newValue?: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction(
      context,
      action,
      AuditEntityType.BOQ,
      boqId,
      oldValue,
      newValue,
      {
        ...metadata,
        module: 'procurement',
        subModule: 'boq'
      }
    );
  }

  /**
   * Log RFQ-specific actions
   */
  async logRFQAction(
    context: AuditContext,
    action: AuditAction,
    rfqId: string,
    oldValue?: any,
    newValue?: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction(
      context,
      action,
      AuditEntityType.RFQ,
      rfqId,
      oldValue,
      newValue,
      {
        ...metadata,
        module: 'procurement',
        subModule: 'rfq'
      }
    );
  }

  /**
   * Log Quote-specific actions
   */
  async logQuoteAction(
    context: AuditContext,
    action: AuditAction,
    quoteId: string,
    oldValue?: any,
    newValue?: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction(
      context,
      action,
      AuditEntityType.QUOTE,
      quoteId,
      oldValue,
      newValue,
      {
        ...metadata,
        module: 'procurement',
        subModule: 'quote'
      }
    );
  }

  /**
   * Log Stock-specific actions
   */
  async logStockAction(
    context: AuditContext,
    action: AuditAction,
    entityType: AuditEntityType.STOCK_POSITION | AuditEntityType.STOCK_MOVEMENT | AuditEntityType.CABLE_DRUM,
    entityId: string,
    oldValue?: any,
    newValue?: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction(
      context,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      {
        ...metadata,
        module: 'procurement',
        subModule: 'stock'
      }
    );
  }

  /**
   * Log bulk operations
   */
  async logBulkOperation(
    context: AuditContext,
    action: AuditAction,
    entityType: AuditEntityType | string,
    entityIds: string[],
    metadata?: Record<string, any>
  ): Promise<void> {
    const bulkMetadata = {
      ...metadata,
      bulkOperation: true,
      entityCount: entityIds.length,
      entityIds: entityIds.slice(0, 10) // Log first 10 IDs to avoid too much data
    };

    await this.logAction(
      context,
      action,
      entityType,
      'bulk_operation',
      null,
      null,
      bulkMetadata
    );
  }

  /**
   * Log security-related events
   */
  async logSecurityEvent(
    context: AuditContext,
    event: 'access_denied' | 'invalid_token' | 'permission_escalation' | 'suspicious_activity',
    entityType: AuditEntityType | string,
    entityId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction(
      context,
      `security_${event}`,
      entityType,
      entityId,
      null,
      null,
      {
        ...metadata,
        securityEvent: true,
        severity: 'high'
      }
    );
  }

  /**
   * Get audit trail for an entity
   */
  async getAuditTrail(
    entityType: AuditEntityType | string,
    entityId: string,
    options: {
      limit?: number;
      offset?: number;
      actions?: string[];
      dateFrom?: Date;
      dateTo?: Date;
    } = {}
  ): Promise<any[]> {
    try {
      const { limit = 50, offset = 0 } = options;

      // Build query conditions
      const conditions: any[] = [
        db.select().from(auditLog)
          .where(db.and(
            db.eq(auditLog.entityType, entityType),
            db.eq(auditLog.entityId, entityId)
          ))
      ];

      // Add date filters if provided
      if (options.dateFrom) {
        conditions.push(db.gte(auditLog.timestamp, options.dateFrom));
      }
      if (options.dateTo) {
        conditions.push(db.lte(auditLog.timestamp, options.dateTo));
      }

      // Add action filters if provided
      if (options.actions && options.actions.length > 0) {
        conditions.push(db.inArray(auditLog.action, options.actions));
      }

      // Execute query
      const results = await db
        .select()
        .from(auditLog)
        .where(db.and(...conditions))
        .orderBy(db.desc(auditLog.timestamp))
        .limit(limit)
        .offset(offset);

      return results;
    } catch (error) {
      console.error('[AuditLogger] Failed to get audit trail:', error);
      throw error;
    }
  }

  /**
   * Get audit summary for reporting
   */
  async getAuditSummary(
    projectId?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsByUser: Record<string, number>;
    recentActions: any[];
  }> {
    try {
      // This would typically use aggregate functions
      // For now, providing a basic implementation
      const conditions: any[] = [];
      
      if (dateFrom) {
        conditions.push(db.gte(auditLog.timestamp, dateFrom));
      }
      if (dateTo) {
        conditions.push(db.lte(auditLog.timestamp, dateTo));
      }

      const results = await db
        .select()
        .from(auditLog)
        .where(conditions.length > 0 ? db.and(...conditions) : undefined)
        .orderBy(db.desc(auditLog.timestamp))
        .limit(1000); // Limit for performance

      // Process results
      const actionsByType: Record<string, number> = {};
      const actionsByUser: Record<string, number> = {};

      for (const record of results) {
        // Count by action type
        actionsByType[record.action] = (actionsByType[record.action] || 0) + 1;
        
        // Count by user
        const userKey = record.userName || record.userId;
        actionsByUser[userKey] = (actionsByUser[userKey] || 0) + 1;
      }

      return {
        totalActions: results.length,
        actionsByType,
        actionsByUser,
        recentActions: results.slice(0, 20) // Last 20 actions
      };
    } catch (error) {
      console.error('[AuditLogger] Failed to get audit summary:', error);
      throw error;
    }
  }

  /**
   * Flush pending logs immediately
   */
  async flush(): Promise<void> {
    if (this.pendingLogs.length > 0) {
      await this.processBatch();
    }
  }

  // ==============================================
  // PRIVATE HELPER METHODS
  // ==============================================

  /**
   * Add audit entry to batch for efficient processing
   */
  private addToBatch(auditEntry: NewAuditLog): void {
    this.pendingLogs.push(auditEntry);

    // Process batch if it's full
    if (this.pendingLogs.length >= this.BATCH_SIZE) {
      this.processBatch();
      return;
    }

    // Set timeout to process batch
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, this.BATCH_TIMEOUT);
  }

  /**
   * Process batch of audit logs
   */
  private async processBatch(): Promise<void> {
    if (this.pendingLogs.length === 0) {
      return;
    }

    const logsToProcess = [...this.pendingLogs];
    this.pendingLogs = [];

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    try {
      await db.insert(auditLog).values(logsToProcess);
      console.log(`[AuditLogger] Processed batch of ${logsToProcess.length} audit logs`);
    } catch (error) {
      console.error('[AuditLogger] Failed to process audit log batch:', error);
      
      // Re-add failed logs to queue for retry
      this.pendingLogs.unshift(...logsToProcess);
    }
  }

  /**
   * Generate human-readable changes summary
   */
  private generateChangesSummary(
    action: string,
    entityType: string,
    oldValue?: any,
    newValue?: any
  ): string {
    switch (action) {
      case AuditAction.CREATE:
        return `Created new ${entityType}`;
      
      case AuditAction.UPDATE:
        if (oldValue && newValue) {
          const changes = this.getChangedFields(oldValue, newValue);
          return changes.length > 0 
            ? `Updated ${entityType}: ${changes.join(', ')}`
            : `Updated ${entityType}`;
        }
        return `Updated ${entityType}`;
      
      case AuditAction.DELETE:
        return `Deleted ${entityType}`;
      
      case AuditAction.APPROVE:
        return `Approved ${entityType}`;
      
      case AuditAction.REJECT:
        return `Rejected ${entityType}`;
      
      case AuditAction.ISSUE:
        return `Issued ${entityType}`;
      
      case AuditAction.AWARD:
        return `Awarded ${entityType}`;
      
      default:
        return `Performed ${action} on ${entityType}`;
    }
  }

  /**
   * Get list of changed fields between old and new values
   */
  private getChangedFields(oldValue: any, newValue: any): string[] {
    const changes: string[] = [];

    if (!oldValue || !newValue) {
      return changes;
    }

    // Compare fields
    const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
    
    for (const key of allKeys) {
      if (key === 'updatedAt' || key === 'createdAt') {
        continue; // Skip timestamp fields
      }

      const oldVal = oldValue[key];
      const newVal = newValue[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push(key);
      }
    }

    return changes;
  }

  /**
   * Sanitize values to remove sensitive information
   */
  private sanitizeValue(value: any): any {
    if (!value) {
      return value;
    }

    // Clone the object to avoid modifying the original
    const sanitized = JSON.parse(JSON.stringify(value));

    // Remove sensitive fields
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'credential',
      'accessToken', 'refreshToken', 'magicLinkToken'
    ];

    const sanitizeObject = (obj: any) => {
      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            obj[key] = '[REDACTED]';
          } else if (typeof obj[key] === 'object') {
            sanitizeObject(obj[key]);
          }
        }
      }
    };

    sanitizeObject(sanitized);
    return sanitized;
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();

// Graceful shutdown handler to flush pending logs
process.on('SIGTERM', async () => {
  console.log('Flushing audit logs before shutdown...');
  await auditLogger.flush();
});

process.on('SIGINT', async () => {
  console.log('Flushing audit logs before shutdown...');
  await auditLogger.flush();
});

export default auditLogger;