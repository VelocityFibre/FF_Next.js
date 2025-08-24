/**
 * BOQ (Bill of Quantities) Database Schema
 * Tables for BOQ management, items, and exception handling
 */

import { pgTable, text, varchar, integer, decimal, timestamp, json, uuid, index, unique } from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

// BOQ (Bill of Quantities) Management
export const boqs = pgTable('boqs', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(), // Firebase project ID
  
  // BOQ Details
  version: varchar('version', { length: 50 }).notNull(),
  title: text('title'),
  description: text('description'),
  
  // Status and Workflow
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, mapping_review, approved, archived
  mappingStatus: varchar('mapping_status', { length: 20 }).default('pending'), // pending, in_progress, completed, failed
  mappingConfidence: decimal('mapping_confidence', { precision: 5, scale: 2 }), // 0-100
  
  // Upload Information
  uploadedBy: varchar('uploaded_by', { length: 255 }).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  fileName: text('file_name'),
  fileUrl: text('file_url'),
  fileSize: integer('file_size'), // bytes
  
  // Approval Workflow
  approvedBy: varchar('approved_by', { length: 255 }),
  approvedAt: timestamp('approved_at'),
  rejectedBy: varchar('rejected_by', { length: 255 }),
  rejectedAt: timestamp('rejected_at'),
  rejectionReason: text('rejection_reason'),
  
  // Metadata
  itemCount: integer('item_count').default(0),
  mappedItems: integer('mapped_items').default(0),
  unmappedItems: integer('unmapped_items').default(0),
  exceptionsCount: integer('exceptions_count').default(0),
  
  // Totals
  totalEstimatedValue: decimal('total_estimated_value', { precision: 15, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('ZAR'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectIdIdx: index('boq_project_id_idx').on(table.projectId),
    statusIdx: index('boq_status_idx').on(table.status),
    uploadedByIdx: index('boq_uploaded_by_idx').on(table.uploadedBy),
    versionUnique: unique('boq_project_version_unique').on(table.projectId, table.version),
  }
});

// BOQ Items
export const boqItems = pgTable('boq_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  boqId: uuid('boq_id').notNull().references(() => boqs.id, { onDelete: 'cascade' }),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Line Item Details
  lineNumber: integer('line_number').notNull(),
  itemCode: varchar('item_code', { length: 100 }),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }),
  subcategory: varchar('subcategory', { length: 100 }),
  
  // Quantities and Units
  quantity: decimal('quantity', { precision: 15, scale: 4 }).notNull(),
  uom: varchar('uom', { length: 20 }).notNull(), // Unit of measure
  unitPrice: decimal('unit_price', { precision: 15, scale: 2 }),
  totalPrice: decimal('total_price', { precision: 15, scale: 2 }),
  
  // Project Structure
  phase: varchar('phase', { length: 100 }),
  task: varchar('task', { length: 100 }),
  site: varchar('site', { length: 100 }),
  location: varchar('location', { length: 100 }),
  
  // Catalog Mapping
  catalogItemId: varchar('catalog_item_id', { length: 255 }),
  catalogItemCode: varchar('catalog_item_code', { length: 100 }),
  catalogItemName: text('catalog_item_name'),
  mappingConfidence: decimal('mapping_confidence', { precision: 5, scale: 2 }), // 0-100
  mappingStatus: varchar('mapping_status', { length: 20 }).default('pending'), // pending, mapped, manual, exception
  
  // Technical Specifications
  specifications: json('specifications'), // Flexible JSON for technical specs
  technicalNotes: text('technical_notes'),
  alternativeItems: json('alternative_items'), // Array of alternative catalog items
  
  // Procurement Status
  procurementStatus: varchar('procurement_status', { length: 20 }).default('pending'), // pending, rfq_created, quoted, awarded, ordered
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    boqIdIdx: index('boq_item_boq_id_idx').on(table.boqId),
    projectIdIdx: index('boq_item_project_id_idx').on(table.projectId),
    itemCodeIdx: index('boq_item_code_idx').on(table.itemCode),
    categoryIdx: index('boq_item_category_idx').on(table.category),
    mappingStatusIdx: index('boq_item_mapping_status_idx').on(table.mappingStatus),
    procurementStatusIdx: index('boq_item_procurement_status_idx').on(table.procurementStatus),
  }
});

// BOQ Exceptions - Items that couldn't be automatically mapped
export const boqExceptions = pgTable('boq_exceptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  boqId: uuid('boq_id').notNull().references(() => boqs.id, { onDelete: 'cascade' }),
  boqItemId: uuid('boq_item_id').notNull().references(() => boqItems.id, { onDelete: 'cascade' }),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Exception Details
  exceptionType: varchar('exception_type', { length: 50 }).notNull(), // no_match, multiple_matches, data_issue, manual_review
  severity: varchar('severity', { length: 10 }).notNull().default('medium'), // low, medium, high, critical
  
  // Issue Description
  issueDescription: text('issue_description').notNull(),
  suggestedAction: text('suggested_action'),
  systemSuggestions: json('system_suggestions'), // Array of suggested catalog items
  
  // Resolution
  status: varchar('status', { length: 20 }).notNull().default('open'), // open, in_review, resolved, ignored
  resolvedBy: varchar('resolved_by', { length: 255 }),
  resolvedAt: timestamp('resolved_at'),
  resolutionNotes: text('resolution_notes'),
  resolutionAction: varchar('resolution_action', { length: 50 }), // manual_mapping, catalog_update, item_split, item_ignore
  
  // Assignment
  assignedTo: varchar('assigned_to', { length: 255 }),
  assignedAt: timestamp('assigned_at'),
  priority: varchar('priority', { length: 10 }).notNull().default('medium'), // low, medium, high, urgent
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    boqIdIdx: index('boq_exception_boq_id_idx').on(table.boqId),
    boqItemIdIdx: index('boq_exception_boq_item_id_idx').on(table.boqItemId),
    statusIdx: index('boq_exception_status_idx').on(table.status),
    severityIdx: index('boq_exception_severity_idx').on(table.severity),
    assignedToIdx: index('boq_exception_assigned_to_idx').on(table.assignedTo),
  }
});

// Type exports for backward compatibility with existing code
export type BOQ = InferSelectModel<typeof boqs>;
export type NewBOQ = InferInsertModel<typeof boqs>;
export type BOQItem = InferSelectModel<typeof boqItems>;
export type NewBOQItem = InferInsertModel<typeof boqItems>;
export type BOQException = InferSelectModel<typeof boqExceptions>;
export type NewBOQException = InferInsertModel<typeof boqExceptions>;