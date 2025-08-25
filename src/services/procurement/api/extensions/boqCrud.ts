/**
 * BOQ API Extensions - BOQ CRUD Operations
 * Create, read, update, delete operations for BOQs
 */

import { BOQ, BOQWithItems, ProcurementContext, CreateBOQData } from './types';
import { BOQStatusType, MappingStatusType } from '@/types/procurement/boq.types';
import { mockBOQs, mockBOQItems, mockExceptions } from './mockData';

export class BOQCrud {
  /**
   * Get BOQ with its items and exceptions
   */
  static async getBOQWithItems(_context: ProcurementContext, boqId: string): Promise<BOQWithItems> {
    // In a real implementation, this would make API calls
    const boq = mockBOQs.find(b => b.id === boqId && b.projectId === _context.projectId);
    if (!boq) {
      throw new Error('BOQ not found');
    }

    const items = mockBOQItems.filter(item => item.boqId === boqId);
    const exceptions = mockExceptions.filter(exc => exc.boqId === boqId);

    return {
      ...boq,
      items,
      exceptions
    };
  }

  /**
   * Get all BOQs for a project
   */
  static async getBOQsByProject(_context: ProcurementContext, projectId: string): Promise<BOQ[]> {
    // Filter by project and apply access control
    return mockBOQs.filter(boq => boq.projectId === projectId);
  }

  /**
   * Get BOQ by ID
   */
  static async getBOQ(_context: ProcurementContext, boqId: string): Promise<BOQ> {
    const boq = mockBOQs.find(b => b.id === boqId && b.projectId === _context.projectId);
    if (!boq) {
      throw new Error('BOQ not found');
    }
    return boq;
  }

  /**
   * Update BOQ
   */
  static async updateBOQ(_context: ProcurementContext, boqId: string, updates: Partial<BOQ>): Promise<BOQ> {
    const boqIndex = mockBOQs.findIndex(b => b.id === boqId && b.projectId === _context.projectId);
    if (boqIndex === -1) {
      throw new Error('BOQ not found');
    }

    mockBOQs[boqIndex] = {
      ...mockBOQs[boqIndex],
      ...updates,
      updatedAt: new Date()
    };

    return mockBOQs[boqIndex];
  }

  /**
   * Delete BOQ
   */
  static async deleteBOQ(_context: ProcurementContext, boqId: string): Promise<void> {
    const boqIndex = mockBOQs.findIndex(b => b.id === boqId && b.projectId === _context.projectId);
    if (boqIndex === -1) {
      throw new Error('BOQ not found');
    }

    mockBOQs.splice(boqIndex, 1);
  }

  /**
   * Create BOQ
   */
  static async createBOQ(_context: ProcurementContext, boqData: CreateBOQData): Promise<BOQ> {
    const newBOQ: BOQ = {
      id: `boq-${Date.now()}`,
      name: boqData.title || `BOQ-${Date.now()}`,
      projectId: _context.projectId,
      version: boqData.version,
      title: boqData.title,
      description: boqData.description,
      status: 'draft' as BOQStatusType,
      mappingStatus: 'pending' as MappingStatusType,
      mappingConfidence: boqData.mappingConfidence || 0,
      uploadedBy: _context.userId,
      uploadedAt: new Date(),
      fileName: boqData.fileName,
      fileSize: boqData.fileSize,
      itemCount: boqData.totalItems || 0,
      mappedItems: boqData.mappedItems || 0,
      unmappedItems: (boqData.totalItems || 0) - (boqData.mappedItems || 0),
      exceptionsCount: boqData.exceptionsCount || 0,
      totalEstimatedValue: boqData.totalEstimatedValue,
      currency: boqData.currency || 'ZAR',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockBOQs.push(newBOQ);
    return newBOQ;
  }


  /**
   * Get BOQs with pagination
   */
  static async getBOQsPaginated(
    _context: ProcurementContext,
    projectId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ boqs: BOQ[]; total: number; hasMore: boolean }> {
    const allBOQs = mockBOQs.filter(boq => boq.projectId === projectId);
    const total = allBOQs.length;
    const boqs = allBOQs.slice(offset, offset + limit);
    
    return {
      boqs,
      total,
      hasMore: offset + limit < total
    };
  }
}