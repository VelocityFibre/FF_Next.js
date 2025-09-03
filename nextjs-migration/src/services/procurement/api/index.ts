/**
 * Procurement API Module
 * Central exports for the procurement API service
 */

import { ProcurementApiService } from './ProcurementApiService';

// Export all types
export * from './types';

// Export operation classes if needed for direct access
export { BOQOperations } from './boqOperations';
export { RFQOperations } from './rfqOperations';
export { StockOperations } from './stockOperations';

// Export main service class
export { ProcurementApiService };

// Export singleton instance
export const procurementApiService = new ProcurementApiService();
export default procurementApiService;