/**
 * RFQ Request Schema - Request for Quote Core Tables
 */

import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json, uuid, index } from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

// RFQ (Request for Quote) Management
export const rfqs = pgTable('rfqs', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // RFQ Details
  rfqNumber: varchar('rfq_number', { length: 100 }).notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  
  // Status and Timeline
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, issued, responses_received, evaluated, awarded, cancelled
  issueDate: timestamp('issue_date'),
  responseDeadline: timestamp('response_deadline').notNull(),
  extendedDeadline: timestamp('extended_deadline'),
  closedAt: timestamp('closed_at'),
  
  // Created By
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  issuedBy: varchar('issued_by', { length: 255 }),
  
  // Terms and Conditions
  paymentTerms: text('payment_terms'),
  deliveryTerms: text('delivery_terms'),
  validityPeriod: integer('validity_period'), // days
  currency: varchar('currency', { length: 3 }).default('ZAR'),
  
  // Evaluation Criteria
  evaluationCriteria: json('evaluation_criteria'), // Weighted criteria object
  technicalRequirements: text('technical_requirements'),
  
  // Supplier Management
  invitedSuppliers: json('invited_suppliers'), // Array of supplier IDs
  respondedSuppliers: json('responded_suppliers'), // Array of supplier IDs who responded
  
  // Totals and Statistics
  itemCount: integer('item_count').default(0),
  totalBudgetEstimate: decimal('total_budget_estimate', { precision: 15, scale: 2 }),
  lowestQuoteValue: decimal('lowest_quote_value', { precision: 15, scale: 2 }),
  highestQuoteValue: decimal('highest_quote_value', { precision: 15, scale: 2 }),
  averageQuoteValue: decimal('average_quote_value', { precision: 15, scale: 2 }),
  
  // Award Information
  awardedAt: timestamp('awarded_at'),
  awardedTo: varchar('awarded_to', { length: 255 }), // Supplier ID
  awardNotes: text('award_notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectRfqIdx: index('rfq_project_id_idx').on(table.projectId),
    statusIdx: index('rfq_status_idx').on(table.status),
    rfqNumberIdx: index('rfq_number_idx').on(table.rfqNumber),
    deadlineIdx: index('rfq_deadline_idx').on(table.responseDeadline),
  }
});

// RFQ Items
export const rfqItems = pgTable('rfq_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  rfqId: uuid('rfq_id').notNull().references(() => rfqs.id, { onDelete: 'cascade' }),
  boqItemId: uuid('boq_item_id'), // Link to BOQ item if created from BOQ
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Item Details
  lineNumber: integer('line_number').notNull(),
  itemCode: varchar('item_code', { length: 100 }),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }),
  
  // Quantities
  quantity: decimal('quantity', { precision: 15, scale: 4 }).notNull(),
  uom: varchar('uom', { length: 20 }).notNull(),
  budgetPrice: decimal('budget_price', { precision: 15, scale: 2 }),
  
  // Technical Requirements
  specifications: json('specifications'),
  technicalRequirements: text('technical_requirements'),
  acceptableAlternatives: json('acceptable_alternatives'),
  
  // Evaluation
  evaluationWeight: decimal('evaluation_weight', { precision: 5, scale: 2 }).default('1.0'),
  isCriticalItem: boolean('is_critical_item').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    rfqIdIdx: index('rfq_item_rfq_id_idx').on(table.rfqId),
    projectIdIdx: index('rfq_item_project_id_idx').on(table.projectId),
    boqItemIdIdx: index('rfq_item_boq_item_id_idx').on(table.boqItemId),
  }
});

// Supplier Invitations
export const supplierInvitations = pgTable('supplier_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  rfqId: uuid('rfq_id').notNull().references(() => rfqs.id, { onDelete: 'cascade' }),
  supplierId: varchar('supplier_id', { length: 255 }).notNull(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Invitation Details
  supplierName: varchar('supplier_name', { length: 255 }).notNull(),
  supplierEmail: varchar('supplier_email', { length: 255 }).notNull(),
  contactPerson: varchar('contact_person', { length: 255 }),
  
  // Status Tracking
  invitationStatus: varchar('invitation_status', { length: 20 }).default('sent'), // sent, viewed, responded, declined, expired
  invitedAt: timestamp('invited_at').defaultNow(),
  viewedAt: timestamp('viewed_at'),
  respondedAt: timestamp('responded_at'),
  declinedAt: timestamp('declined_at'),
  
  // Authentication
  accessToken: varchar('access_token', { length: 500 }),
  tokenExpiresAt: timestamp('token_expires_at'),
  magicLinkToken: varchar('magic_link_token', { length: 500 }),
  lastLoginAt: timestamp('last_login_at'),
  
  // Communication
  invitationMessage: text('invitation_message'),
  declineReason: text('decline_reason'),
  remindersSent: integer('reminders_sent').default(0),
  lastReminderAt: timestamp('last_reminder_at'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    rfqIdIdx: index('supplier_invitation_rfq_id_idx').on(table.rfqId),
    supplierIdIdx: index('supplier_invitation_supplier_id_idx').on(table.supplierId),
    statusIdx: index('supplier_invitation_status_idx').on(table.invitationStatus),
    accessTokenIdx: index('supplier_invitation_access_token_idx').on(table.accessToken),
  }
});

// Type exports
export type RFQ = InferSelectModel<typeof rfqs>;
export type NewRFQ = InferInsertModel<typeof rfqs>;
export type RFQItem = InferSelectModel<typeof rfqItems>;
export type NewRFQItem = InferInsertModel<typeof rfqItems>;
export type SupplierInvitation = InferSelectModel<typeof supplierInvitations>;
export type NewSupplierInvitation = InferInsertModel<typeof supplierInvitations>;