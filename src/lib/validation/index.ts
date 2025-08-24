/**
 * Validation Schemas Index
 * Centralized exports for all validation schemas
 */

// Common utilities
export * from './common.schemas';
export * from './utils';

// Domain schemas
export * from './boq.schemas';
export * from './rfq.schemas';  
export * from './stock.schemas';
export * from './forms.schemas';

// Import individual schemas for the collection
import { BOQSchema, NewBOQSchema, BOQItemSchema, NewBOQItemSchema, BOQExceptionSchema, BOQImportSchema } from './boq.schemas';
import { RFQSchema, NewRFQSchema, UpdateRFQSchema, RFQItemSchema, SupplierInvitationSchema, QuoteSchema, QuoteItemSchema } from './rfq.schemas';
import { StockPositionSchema, StockMovementSchema, CableDrumSchema, StockMovementFormSchema, DrumTrackingFormSchema } from './stock.schemas';
import { BOQFormSchema, RFQFormSchema } from './forms.schemas';

// Schema collections for easy importing
export const ProcurementSchemas = {
  // BOQ Schemas
  BOQ: BOQSchema,
  NewBOQ: NewBOQSchema,
  BOQItem: BOQItemSchema,
  NewBOQItem: NewBOQItemSchema,
  BOQException: BOQExceptionSchema,
  BOQImport: BOQImportSchema,
  BOQForm: BOQFormSchema,
  
  // RFQ Schemas
  RFQ: RFQSchema,
  NewRFQ: NewRFQSchema,
  UpdateRFQ: UpdateRFQSchema,
  RFQItem: RFQItemSchema,
  SupplierInvitation: SupplierInvitationSchema,
  Quote: QuoteSchema,
  QuoteItem: QuoteItemSchema,
  RFQForm: RFQFormSchema,
  
  // Stock Schemas
  StockPosition: StockPositionSchema,
  StockMovement: StockMovementSchema,
  CableDrum: CableDrumSchema,
  StockMovementForm: StockMovementFormSchema,
  DrumTrackingForm: DrumTrackingFormSchema,
};