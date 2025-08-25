/**
 * BOQ API Extensions - Exception Management
 * Operations for BOQ exceptions
 */

import { BOQException, ProcurementContext, CreateBOQExceptionData } from './types';
import { mockExceptions } from './mockData';

export class ExceptionManager {
  /**
   * Get BOQ exceptions
   */
  static async getBOQExceptions(context: ProcurementContext, boqId: string): Promise<BOQException[]> {
    return mockExceptions.filter(exc => exc.boqId === boqId && exc.projectId === context.projectId);
  }

  /**
   * Get BOQ exception by ID
   */
  static async getBOQException(context: ProcurementContext, exceptionId: string): Promise<BOQException> {
    const exception = mockExceptions.find(
      exc => exc.id === exceptionId && exc.projectId === context.projectId
    );
    
    if (!exception) {
      throw new Error('BOQ exception not found');
    }
    
    return exception;
  }

  /**
   * Update BOQ exception
   */
  static async updateBOQException(
    context: ProcurementContext, 
    exceptionId: string, 
    updates: Partial<BOQException>
  ): Promise<BOQException> {
    const excIndex = mockExceptions.findIndex(
      exc => exc.id === exceptionId && exc.projectId === context.projectId
    );
    
    if (excIndex === -1) {
      throw new Error('BOQ exception not found');
    }

    mockExceptions[excIndex] = {
      ...mockExceptions[excIndex],
      ...updates,
      updatedAt: new Date()
    };

    return mockExceptions[excIndex];
  }

  /**
   * Create BOQ exception
   */
  static async createBOQException(
    context: ProcurementContext, 
    exceptionData: CreateBOQExceptionData
  ): Promise<BOQException> {
    const newException: BOQException = {
      id: `exc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      boqId: exceptionData.boqId,
      boqItemId: exceptionData.boqItemId || `item-${Date.now()}`,
      projectId: context.projectId,
      exceptionType: (exceptionData.exceptionType as 'no_match' | 'multiple_matches' | 'data_issue' | 'manual_review') || 'no_match',
      severity: (exceptionData.severity as 'low' | 'medium' | 'high' | 'critical') || 'medium',
      issueDescription: exceptionData.issueDescription,
      suggestedAction: exceptionData.suggestedAction,
      systemSuggestions: exceptionData.suggestions || [],
      status: (exceptionData.status as 'open' | 'in_review' | 'resolved' | 'ignored') || 'open',
      priority: (exceptionData.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockExceptions.push(newException);
    return newException;
  }

  /**
   * Delete BOQ exception
   */
  static async deleteBOQException(context: ProcurementContext, exceptionId: string): Promise<void> {
    const excIndex = mockExceptions.findIndex(
      exc => exc.id === exceptionId && exc.projectId === context.projectId
    );
    
    if (excIndex === -1) {
      throw new Error('BOQ exception not found');
    }

    mockExceptions.splice(excIndex, 1);
  }

  /**
   * Get exceptions by status
   */
  static async getExceptionsByStatus(
    context: ProcurementContext,
    boqId: string,
    status: string
  ): Promise<BOQException[]> {
    return mockExceptions.filter(exc =>
      exc.boqId === boqId &&
      exc.projectId === context.projectId &&
      exc.status === status
    );
  }

  /**
   * Get exceptions by severity
   */
  static async getExceptionsBySeverity(
    context: ProcurementContext,
    boqId: string,
    severity: string
  ): Promise<BOQException[]> {
    return mockExceptions.filter(exc =>
      exc.boqId === boqId &&
      exc.projectId === context.projectId &&
      exc.severity === severity
    );
  }

  /**
   * Get exceptions by priority
   */
  static async getExceptionsByPriority(
    context: ProcurementContext,
    boqId: string,
    priority: string
  ): Promise<BOQException[]> {
    return mockExceptions.filter(exc =>
      exc.boqId === boqId &&
      exc.projectId === context.projectId &&
      exc.priority === priority
    );
  }

  /**
   * Bulk update exceptions
   */
  static async bulkUpdateExceptions(
    context: ProcurementContext,
    updates: Array<{ id: string; updates: Partial<BOQException> }>
  ): Promise<BOQException[]> {
    const updatedExceptions: BOQException[] = [];

    for (const { id, updates: excUpdates } of updates) {
      try {
        const updatedException = await this.updateBOQException(context, id, excUpdates);
        updatedExceptions.push(updatedException);
      } catch (error) {
        console.warn(`Failed to update exception ${id}:`, error);
      }
    }

    return updatedExceptions;
  }

  /**
   * Mark exception as resolved
   */
  static async resolveException(
    context: ProcurementContext,
    exceptionId: string,
    resolution: string
  ): Promise<BOQException> {
    return this.updateBOQException(context, exceptionId, {
      status: 'resolved',
      suggestedAction: resolution,
      updatedAt: new Date()
    });
  }

  /**
   * Get exception statistics
   */
  static async getExceptionStats(context: ProcurementContext, boqId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const exceptions = await this.getBOQExceptions(context, boqId);
    
    const stats = {
      total: exceptions.length,
      byStatus: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byPriority: {} as Record<string, number>
    };

    exceptions.forEach(exc => {
      stats.byStatus[exc.status] = (stats.byStatus[exc.status] || 0) + 1;
      stats.bySeverity[exc.severity] = (stats.bySeverity[exc.severity] || 0) + 1;
      stats.byPriority[exc.priority] = (stats.byPriority[exc.priority] || 0) + 1;
    });

    return stats;
  }
}