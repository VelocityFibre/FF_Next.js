/**
 * BOQ Item Operations Service
 * CRUD operations for BOQ items
 */

import type { BOQItem, ProcurementContext, BOQItemCreateData } from './types';
import { mockBOQItems } from './mockData';

export class BOQItemOperations {
  /**
   * Get BOQ item by ID
   */
  static async getBOQItem(context: ProcurementContext, itemId: string): Promise<BOQItem> {
    const item = mockBOQItems.find(item => item.id === itemId && item.projectId === context.projectId);
    if (!item) {
      throw new Error('BOQ item not found');
    }
    return item;
  }

  /**
   * Update BOQ item
   */
  static async updateBOQItem(context: ProcurementContext, itemId: string, updates: Partial<BOQItem>): Promise<BOQItem> {
    const itemIndex = mockBOQItems.findIndex(item => item.id === itemId && item.projectId === context.projectId);
    if (itemIndex === -1) {
      throw new Error('BOQ item not found');
    }

    mockBOQItems[itemIndex] = {
      ...mockBOQItems[itemIndex],
      ...updates,
      updatedAt: new Date()
    };

    return mockBOQItems[itemIndex];
  }

  /**
   * Create BOQ item
   */
  static async createBOQItem(context: ProcurementContext, itemData: BOQItemCreateData): Promise<BOQItem> {
    const newItem: BOQItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      boqId: itemData.boqId,
      projectId: context.projectId,
      lineNumber: itemData.lineNumber,
      description: itemData.description,
      quantity: itemData.quantity,
      uom: itemData.uom,
      mappingStatus: (itemData.mappingStatus as 'pending' | 'mapped' | 'manual' | 'exception') || 'pending',
      procurementStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add optional properties only if they exist
    if (itemData.itemCode) newItem.itemCode = itemData.itemCode;
    if (itemData.category) newItem.category = itemData.category;
    if (itemData.subcategory) newItem.subcategory = itemData.subcategory;
    if (itemData.unitPrice) newItem.unitPrice = itemData.unitPrice;
    if (itemData.totalPrice) newItem.totalPrice = itemData.totalPrice;
    if (itemData.phase) newItem.phase = itemData.phase;
    if (itemData.task) newItem.task = itemData.task;
    if (itemData.site) newItem.site = itemData.site;
    if (itemData.catalogItemId) newItem.catalogItemId = itemData.catalogItemId;
    if (itemData.catalogItemCode) newItem.catalogItemCode = itemData.catalogItemCode;
    if (itemData.catalogItemName) newItem.catalogItemName = itemData.catalogItemName;
    if (itemData.mappingConfidence !== undefined) newItem.mappingConfidence = itemData.mappingConfidence;

    mockBOQItems.push(newItem);
    return newItem;
  }

  /**
   * Get all BOQ items for a BOQ
   */
  static async getBOQItems(context: ProcurementContext, boqId: string): Promise<BOQItem[]> {
    return mockBOQItems.filter(item => 
      item.boqId === boqId && item.projectId === context.projectId
    );
  }

  /**
   * Delete BOQ item
   */
  static async deleteBOQItem(context: ProcurementContext, itemId: string): Promise<void> {
    const itemIndex = mockBOQItems.findIndex(item => 
      item.id === itemId && item.projectId === context.projectId
    );
    
    if (itemIndex === -1) {
      throw new Error('BOQ item not found');
    }

    mockBOQItems.splice(itemIndex, 1);
  }
}