/**
 * RFQ Schema - Legacy Compatibility Layer
 * @deprecated Use imports from ./rfq/* instead
 * 
 * This file provides backward compatibility for existing imports.
 * New code should import directly from the modular structure:
 * - import { rfqs, quotes } from '@/lib/neon/schema/procurement/rfq'
 * 
 * Original file: 302 lines → Split into request and quote modules
 */

// Re-export everything from the new modular structure
export {
  // RFQ Request Management
  rfqs,
  rfqItems,
  supplierInvitations,
  type RFQ,
  type NewRFQ,
  type RFQItem,
  type NewRFQItem,
  type SupplierInvitation,
  type NewSupplierInvitation,
  
  // Quote Management
  quotes,
  quoteItems,
  quoteDocuments,
  type Quote,
  type NewQuote,
  type QuoteItem,
  type NewQuoteItem,
  type QuoteDocument,
  type NewQuoteDocument,
} from './rfq/index';