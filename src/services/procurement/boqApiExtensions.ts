/**
 * BOQ API Extensions - Client-Side Compatibility Layer
 * 
 * This file provides client-side API access for procurement operations.
 * It wraps the API endpoints to provide a consistent interface for frontend components.
 * 
 * IMPORTANT: This service uses HTTP API calls and should only be used in the browser.
 * Do not import database-connected services in frontend code.
 */

import { 
  ProcurementClientService,
  procurementApiService as clientProcurementApiService 
} from './client/procurementClientService';

/**
 * Client-side BOQ API extensions
 * Provides methods for BOQ operations via API endpoints
 */
export class BOQApiExtensions {
  static getBOQWithItems = ProcurementClientService.getBOQWithItems;
  static getBOQsByProject = ProcurementClientService.getBOQsByProject;
  static getBOQ = ProcurementClientService.getBOQ;
  static updateBOQ = ProcurementClientService.updateBOQ;
  static deleteBOQ = ProcurementClientService.deleteBOQ;
  static createBOQ = ProcurementClientService.createBOQ;
  static getBOQItems = ProcurementClientService.getBOQItems;
  static getBOQItem = ProcurementClientService.getBOQItem;
  static createBOQItem = ProcurementClientService.createBOQItem;
  static updateBOQItem = ProcurementClientService.updateBOQItem;
  static deleteBOQItem = ProcurementClientService.deleteBOQItem;
  static getBOQExceptions = ProcurementClientService.getBOQExceptions;
  static getBOQException = ProcurementClientService.getBOQException;
  static createBOQException = ProcurementClientService.createBOQException;
  static updateBOQException = ProcurementClientService.updateBOQException;
  static deleteException = ProcurementClientService.deleteException;
}

/**
 * Client-side procurement API service
 * Use this for all frontend procurement operations
 */
export const procurementApiService = clientProcurementApiService;

export default BOQApiExtensions;