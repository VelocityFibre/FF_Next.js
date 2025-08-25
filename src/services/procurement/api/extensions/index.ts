/**
 * BOQ API Extensions - Module Exports
 * Modular BOQ API extensions system
 */

// Core components
export { BOQCrud } from './boqCrud';
export { ItemManager } from './itemManager';
export { ExceptionManager } from './exceptionManager';

// Main service class
export { BOQApiExtensions } from './apiService';

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

// Import the class for use in service extension
import { BOQApiExtensions } from './apiService';

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
