/**
 * Procurement Schema Index
 * Centralized exports for all procurement domain schemas
 */

// BOQ schemas
export * from './boq.schema';

// RFQ schemas  
export * from './rfq.schema';

// Stock management schemas
export * from './stock.schema';

// Re-export collections for convenience
import { boqs, boqItems, boqExceptions } from './boq.schema';
import { rfqs, rfqItems, supplierInvitations, quotes, quoteItems, quoteDocuments } from './rfq.schema';
import { stockPositions, stockMovements, stockMovementItems, cableDrums, drumUsageHistory } from './stock.schema';

// Domain collections
export const boqSchemas = { boqs, boqItems, boqExceptions };
export const rfqSchemas = { rfqs, rfqItems, supplierInvitations, quotes, quoteItems, quoteDocuments };
export const stockSchemas = { stockPositions, stockMovements, stockMovementItems, cableDrums, drumUsageHistory };

// All procurement schemas combined
export const procurementSchemas = {
  ...boqSchemas,
  ...rfqSchemas,
  ...stockSchemas,
};