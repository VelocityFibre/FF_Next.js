/**
 * BOQ Exception Operations Service
 * CRUD operations for BOQ exceptions
 */

import type { BOQException, ProcurementContext, BOQExceptionCreateData } from './types';
import { mockExceptions } from './mockData';

export class BOQExceptionOperations {
  /**
   * Get BOQ exceptions
   */
  static async getBOQExceptions(context: ProcurementContext, boqId: string): Promise<BOQException[]> {
    return mockExceptions.filter(exc => exc.boqId === boqId && exc.projectId === context.projectId);
  }

  /**
   * Update BOQ exception
   */
  static async updateBOQException(context: ProcurementContext, exceptionId: string, updates: Partial<BOQException>): Promise<BOQException> {
    const excIndex = mockExceptions.findIndex(exc => exc.id === exceptionId && exc.projectId === context.projectId);
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
  static async createBOQException(context: ProcurementContext, exceptionData: BOQExceptionCreateData): Promise<BOQException> {
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
   * Get exception by ID
   */
  static async getBOQException(context: ProcurementContext, exceptionId: string): Promise<BOQException> {
    const exception = mockExceptions.find(exc => 
      exc.id === exceptionId && exc.projectId === context.projectId
    );
    
    if (!exception) {
      throw new Error('BOQ exception not found');
    }
    
    return exception;
  }

  /**
   * Delete BOQ exception
   */
  static async deleteException(context: ProcurementContext, exceptionId: string): Promise<void> {
    const excIndex = mockExceptions.findIndex(exc => 
      exc.id === exceptionId && exc.projectId === context.projectId
    );
    
    if (excIndex === -1) {
      throw new Error('BOQ exception not found');
    }

    mockExceptions.splice(excIndex, 1);
  }
}