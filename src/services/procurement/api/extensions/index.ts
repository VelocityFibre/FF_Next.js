/**
 * BOQ API Extensions - Module Exports
 * Modular BOQ API extensions system
 */

// Main service class
export { BOQApiExtensions } from './apiService';

// Core components
export { BOQCrud } from './boqCrud';
export { ItemManager } from './itemManager';
export { ExceptionManager } from './exceptionManager';

// Mock data
export { mockBOQs, mockBOQItems, mockExceptions } from './mockData';

// Types
export type {
  CreateBOQData,
  CreateBOQItemData,
  CreateBOQExceptionData,
  BOQ,
  BOQItem,
  BOQException,
  BOQWithItems,
  ProcurementContext
} from './types';

// Service extension for backward compatibility
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
  createBOQException: BOQApiExtensions.createBOQException
  // TODO: Add these methods when implemented:
  // getBOQItems, deleteBOQItem, deleteException, getMappingSuggestions, applyMapping, bulkApplyMappings
};