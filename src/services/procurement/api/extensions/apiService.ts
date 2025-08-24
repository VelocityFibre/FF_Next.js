/**
 * BOQ API Extensions - Service Integration
 * Main service class that combines all operations
 */

import { BOQCrud } from './boqCrud';
import { ItemManager } from './itemManager';
import { ExceptionManager } from './exceptionManager';

/**
 * Extended BOQ API service with additional methods for component integration
 */
export class BOQApiExtensions {
  // BOQ Operations
  static getBOQWithItems = BOQCrud.getBOQWithItems;
  static getBOQsByProject = BOQCrud.getBOQsByProject;
  static getBOQ = BOQCrud.getBOQ;
  static updateBOQ = BOQCrud.updateBOQ;
  static deleteBOQ = BOQCrud.deleteBOQ;
  static createBOQ = BOQCrud.createBOQ;
  static getBOQsPaginated = BOQCrud.getBOQsPaginated;

  // Item Operations
  static getBOQItem = ItemManager.getBOQItem;
  static getBOQItems = ItemManager.getBOQItems;
  static updateBOQItem = ItemManager.updateBOQItem;
  static createBOQItem = ItemManager.createBOQItem;
  static deleteBOQItem = ItemManager.deleteBOQItem;
  static bulkUpdateBOQItems = ItemManager.bulkUpdateBOQItems;
  static getBOQItemsByStatus = ItemManager.getBOQItemsByStatus;
  static getBOQItemsByMappingStatus = ItemManager.getBOQItemsByMappingStatus;
  static searchBOQItems = ItemManager.searchBOQItems;

  // Exception Operations
  static getBOQExceptions = ExceptionManager.getBOQExceptions;
  static getBOQException = ExceptionManager.getBOQException;
  static updateBOQException = ExceptionManager.updateBOQException;
  static createBOQException = ExceptionManager.createBOQException;
  static deleteBOQException = ExceptionManager.deleteBOQException;
  static getExceptionsByStatus = ExceptionManager.getExceptionsByStatus;
  static getExceptionsBySeverity = ExceptionManager.getExceptionsBySeverity;
  static getExceptionsByPriority = ExceptionManager.getExceptionsByPriority;
  static bulkUpdateExceptions = ExceptionManager.bulkUpdateExceptions;
  static resolveException = ExceptionManager.resolveException;
  static getExceptionStats = ExceptionManager.getExceptionStats;
}