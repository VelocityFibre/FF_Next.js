/**
 * RFQ Schema - Barrel Export
 * Provides centralized access to all RFQ-related database schemas
 */

// RFQ Request and Management
export {
  rfqs,
  rfqItems,
  supplierInvitations,
  type RFQ,
  type NewRFQ,
  type RFQItem,
  type NewRFQItem,
  type SupplierInvitation,
  type NewSupplierInvitation,
} from './request.schema';

// Quote Management
export {
  quotes,
  quoteItems,
  quoteDocuments,
  type Quote,
  type NewQuote,
  type QuoteItem,
  type NewQuoteItem,
  type QuoteDocument,
  type NewQuoteDocument,
} from './quote.schema';