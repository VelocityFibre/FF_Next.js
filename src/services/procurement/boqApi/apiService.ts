/**
 * BOQ API Service
 * Main service orchestrator for BOQ API operations
 */

import { BOQOperations } from './boqOperations';
import { BOQItemOperations } from './itemOperations';
import { BOQExceptionOperations } from './exceptionOperations';

/**
 * Extended BOQ API service with additional methods for component integration
 */
export class BOQApiExtensions {
  // BOQ Operations
  static getBOQWithItems = BOQOperations.getBOQWithItems;
  static getBOQsByProject = BOQOperations.getBOQsByProject;
  static getBOQ = BOQOperations.getBOQ;
  static updateBOQ = BOQOperations.updateBOQ;
  static deleteBOQ = BOQOperations.deleteBOQ;
  static createBOQ = BOQOperations.createBOQ;

  // Item Operations
  static getBOQItem = BOQItemOperations.getBOQItem;
  static updateBOQItem = BOQItemOperations.updateBOQItem;
  static createBOQItem = BOQItemOperations.createBOQItem;
  static getBOQItems = BOQItemOperations.getBOQItems;
  static deleteBOQItem = BOQItemOperations.deleteBOQItem;

  // Exception Operations
  static getBOQExceptions = BOQExceptionOperations.getBOQExceptions;
  static updateBOQException = BOQExceptionOperations.updateBOQException;
  static createBOQException = BOQExceptionOperations.createBOQException;
  static getBOQException = BOQExceptionOperations.getBOQException;
  static deleteException = BOQExceptionOperations.deleteException;
}

// Extend the main procurement API service
export const procurementApiService = {
  getBOQWithItems: BOQApiExtensions.getBOQWithItems,
  getBOQsByProject: BOQApiExtensions.getBOQsByProject,
  getBOQ: BOQApiExtensions.getBOQ,
  updateBOQ: BOQApiExtensions.updateBOQ,
  deleteBOQ: BOQApiExtensions.deleteBOQ,
  getBOQItem: BOQApiExtensions.getBOQItem,
  updateBOQItem: BOQApiExtensions.updateBOQItem,
  getBOQExceptions: BOQApiExtensions.getBOQExceptions,
  updateBOQException: BOQApiExtensions.updateBOQException,
  createBOQ: BOQApiExtensions.createBOQ,
  createBOQItem: BOQApiExtensions.createBOQItem,
  createBOQException: BOQApiExtensions.createBOQException,
  getBOQItems: BOQApiExtensions.getBOQItems,
  deleteBOQItem: BOQApiExtensions.deleteBOQItem,
  getBOQException: BOQApiExtensions.getBOQException,
  deleteException: BOQApiExtensions.deleteException
  // TODO: Add these methods when implemented:
  // getMappingSuggestions, applyMapping, bulkApplyMappings
};