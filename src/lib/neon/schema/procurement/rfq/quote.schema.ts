/**
 * RFQ Quote Schema - Quote Submission and Management Tables
 */

import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json, uuid, index } from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { rfqs, rfqItems, supplierInvitations } from './request.schema';

// Quotes
export const quotes = pgTable('quotes', {
  id: uuid('id').defaultRandom().primaryKey(),
  rfqId: uuid('rfq_id').notNull().references(() => rfqs.id, { onDelete: 'cascade' }),
  supplierId: varchar('supplier_id', { length: 255 }).notNull(),
  supplierInvitationId: uuid('supplier_invitation_id').references(() => supplierInvitations.id),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Quote Details
  quoteNumber: varchar('quote_number', { length: 100 }),
  quoteReference: varchar('quote_reference', { length: 100 }),
  
  // Status and Dates
  status: varchar('status', { length: 20 }).default('draft'), // draft, submitted, under_review, accepted, rejected, expired
  submissionDate: timestamp('submission_date').defaultNow(),
  validUntil: timestamp('valid_until').notNull(),
  
  // Financial Summary
  totalValue: decimal('total_value', { precision: 15, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }),
  discountAmount: decimal('discount_amount', { precision: 15, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('ZAR'),
  
  // Terms
  leadTime: integer('lead_time'), // days
  paymentTerms: text('payment_terms'),
  deliveryTerms: text('delivery_terms'),
  warrantyTerms: text('warranty_terms'),
  validityPeriod: integer('validity_period'), // days
  
  // Additional Information
  notes: text('notes'),
  terms: text('terms'),
  conditions: text('conditions'),
  
  // Evaluation
  evaluationScore: decimal('evaluation_score', { precision: 5, scale: 2 }), // 0-100
  technicalScore: decimal('technical_score', { precision: 5, scale: 2 }), // 0-100
  commercialScore: decimal('commercial_score', { precision: 5, scale: 2 }), // 0-100
  evaluationNotes: text('evaluation_notes'),
  isWinner: boolean('is_winner').default(false),
  
  // Award Information
  awardedAt: timestamp('awarded_at'),
  rejectedAt: timestamp('rejected_at'),
  rejectionReason: text('rejection_reason'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    rfqIdIdx: index('quote_rfq_id_idx').on(table.rfqId),
    supplierIdIdx: index('quote_supplier_id_idx').on(table.supplierId),
    statusIdx: index('quote_status_idx').on(table.status),
    submissionDateIdx: index('quote_submission_date_idx').on(table.submissionDate),
    isWinnerIdx: index('quote_is_winner_idx').on(table.isWinner),
  }
});

// Quote Items
export const quoteItems = pgTable('quote_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  quoteId: uuid('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  rfqItemId: uuid('rfq_item_id').notNull().references(() => rfqItems.id, { onDelete: 'cascade' }),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Item Reference
  lineNumber: integer('line_number').notNull(),
  itemCode: varchar('item_code', { length: 100 }),
  description: text('description').notNull(),
  
  // Quantities and Pricing
  quotedQuantity: decimal('quoted_quantity', { precision: 15, scale: 4 }),
  unitPrice: decimal('unit_price', { precision: 15, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 15, scale: 2 }).notNull(),
  discountPercentage: decimal('discount_percentage', { precision: 5, scale: 2 }), // 0-100
  discountAmount: decimal('discount_amount', { precision: 15, scale: 2 }),
  
  // Alternative Offerings
  alternateOffered: boolean('alternate_offered').default(false),
  alternateDescription: text('alternate_description'),
  alternatePartNumber: varchar('alternate_part_number', { length: 100 }),
  alternateUnitPrice: decimal('alternate_unit_price', { precision: 15, scale: 2 }),
  
  // Delivery and Terms
  leadTime: integer('lead_time'), // days
  minimumOrderQuantity: decimal('minimum_order_quantity', { precision: 15, scale: 4 }),
  packagingUnit: varchar('packaging_unit', { length: 50 }),
  
  // Technical Information
  manufacturerName: varchar('manufacturer_name', { length: 255 }),
  partNumber: varchar('part_number', { length: 100 }),
  modelNumber: varchar('model_number', { length: 100 }),
  technicalNotes: text('technical_notes'),
  complianceCertificates: json('compliance_certificates'), // Array of certificate info
  
  // Evaluation
  technicalCompliance: boolean('technical_compliance').default(true),
  commercialScore: decimal('commercial_score', { precision: 5, scale: 2 }), // 0-100
  technicalScore: decimal('technical_score', { precision: 5, scale: 2 }), // 0-100
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    quoteIdIdx: index('quote_item_quote_id_idx').on(table.quoteId),
    rfqItemIdIdx: index('quote_item_rfq_item_id_idx').on(table.rfqItemId),
    lineNumberIdx: index('quote_item_line_number_idx').on(table.lineNumber),
  }
});

// Quote Documents
export const quoteDocuments = pgTable('quote_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  quoteId: uuid('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Document Details
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(), // bytes
  fileType: varchar('file_type', { length: 100 }).notNull(),
  documentType: varchar('document_type', { length: 50 }).notNull(), // quote, technical_spec, certificate, terms
  
  // Storage
  fileUrl: text('file_url').notNull(),
  filePath: text('file_path'),
  storageProvider: varchar('storage_provider', { length: 50 }).default('firebase'), // firebase, s3, local
  
  // Metadata
  uploadedBy: varchar('uploaded_by', { length: 255 }).notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    quoteIdIdx: index('quote_document_quote_id_idx').on(table.quoteId),
    documentTypeIdx: index('quote_document_type_idx').on(table.documentType),
  }
});

// Type exports
export type Quote = InferSelectModel<typeof quotes>;
export type NewQuote = InferInsertModel<typeof quotes>;
export type QuoteItem = InferSelectModel<typeof quoteItems>;
export type NewQuoteItem = InferInsertModel<typeof quoteItems>;
export type QuoteDocument = InferSelectModel<typeof quoteDocuments>;
export type NewQuoteDocument = InferInsertModel<typeof quoteDocuments>;