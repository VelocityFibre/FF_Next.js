/**
 * RFQ (Request for Quote) Validation Schemas
 * Comprehensive validation for RFQ, quotes, and supplier management
 */

import { z } from 'zod';
import { 
  UUIDSchema, 
  ProjectIdSchema, 
  CurrencySchema, 
  DateSchema, 
  OptionalDateSchema, 
  PositiveNumberSchema, 
  NonNegativeNumberSchema, 
  PercentageSchema 
} from './common.schemas';

// RFQ Status enum validation
export const RFQStatusSchema = z.enum(['draft', 'issued', 'responses_received', 'evaluated', 'awarded', 'cancelled']);

// Quote Status validation
export const QuoteStatusSchema = z.enum(['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'expired']);

// Supplier Invitation Status validation
export const SupplierInvitationStatusSchema = z.enum(['sent', 'viewed', 'responded', 'declined', 'expired']);

// Main RFQ schema
export const RFQSchema = z.object({
  id: UUIDSchema,
  projectId: ProjectIdSchema,
  
  // RFQ Details
  rfqNumber: z.string().min(1, 'RFQ number is required').max(100, 'RFQ number too long'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  
  // Status and Timeline
  status: RFQStatusSchema,
  issueDate: OptionalDateSchema,
  responseDeadline: DateSchema,
  extendedDeadline: OptionalDateSchema,
  closedAt: OptionalDateSchema,
  
  // Created By
  createdBy: z.string().min(1, 'Created by is required'),
  issuedBy: z.string().optional(),
  
  // Terms and Conditions
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  validityPeriod: z.number().int().positive('Validity period must be positive').optional(),
  currency: CurrencySchema,
  
  // Evaluation Criteria
  evaluationCriteria: z.record(z.any()).optional(),
  technicalRequirements: z.string().optional(),
  
  // Supplier Management
  invitedSuppliers: z.array(z.string()).optional(),
  respondedSuppliers: z.array(z.string()).optional(),
  
  // Totals and Statistics
  itemCount: z.number().int().nonnegative().default(0),
  totalBudgetEstimate: NonNegativeNumberSchema.optional(),
  lowestQuoteValue: NonNegativeNumberSchema.optional(),
  highestQuoteValue: NonNegativeNumberSchema.optional(),
  averageQuoteValue: NonNegativeNumberSchema.optional(),
  
  // Award Information
  awardedAt: OptionalDateSchema,
  awardedTo: z.string().optional(),
  awardNotes: z.string().optional(),
  
  // Timestamps
  createdAt: DateSchema,
  updatedAt: DateSchema,
});

// Schema for creating new RFQ
export const NewRFQSchema = RFQSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  itemCount: true,
  lowestQuoteValue: true,
  highestQuoteValue: true,
  averageQuoteValue: true
}).extend({
  responseDeadline: z.union([z.string().datetime(), z.date()]).transform((val) => typeof val === 'string' ? new Date(val) : val),
});

// Schema for updating existing RFQ (all fields optional except for tracking fields)
export const UpdateRFQSchema = z.object({
  // RFQ Details
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().optional(),
  
  // Status and Timeline
  status: RFQStatusSchema.optional(),
  responseDeadline: z.union([z.string().datetime(), z.date()]).transform((val) => typeof val === 'string' ? new Date(val) : val).optional(),
  extendedDeadline: z.union([z.string().datetime(), z.date()]).transform((val) => typeof val === 'string' ? new Date(val) : val).optional(),
  
  // Terms and Conditions
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  validityPeriod: z.number().int().positive('Validity period must be positive').optional(),
  currency: CurrencySchema.optional(),
  
  // Evaluation Criteria
  evaluationCriteria: z.record(z.any()).optional(),
  technicalRequirements: z.string().optional(),
  
  // Supplier Management (these are handled by separate endpoints)
  // supplierIds: z.array(z.string()).optional(), 
  
  // Totals and Statistics (calculated fields, not updatable directly)
  totalBudgetEstimate: NonNegativeNumberSchema.optional(),
  
  // Award Information
  awardedTo: z.string().optional(),
  awardNotes: z.string().optional(),
}).strict();

// RFQ Item schema
export const RFQItemSchema = z.object({
  id: UUIDSchema,
  rfqId: UUIDSchema,
  boqItemId: UUIDSchema.optional(),
  projectId: ProjectIdSchema,
  
  // Item Details
  lineNumber: z.number().int().positive(),
  itemCode: z.string().max(100, 'Item code too long').optional(),
  description: z.string().min(1, 'Description is required'),
  category: z.string().max(100, 'Category too long').optional(),
  
  // Quantities
  quantity: PositiveNumberSchema,
  uom: z.string().min(1, 'UOM is required').max(20, 'UOM too long'),
  budgetPrice: NonNegativeNumberSchema.optional(),
  
  // Technical Requirements
  specifications: z.record(z.any()).optional(),
  technicalRequirements: z.string().optional(),
  acceptableAlternatives: z.array(z.any()).optional(),
  
  // Evaluation
  evaluationWeight: z.number().positive().default(1.0),
  isCriticalItem: z.boolean().default(false),
  
  // Timestamps
  createdAt: DateSchema,
  updatedAt: DateSchema,
});

// Supplier Invitation schema
export const SupplierInvitationSchema = z.object({
  id: UUIDSchema,
  rfqId: UUIDSchema,
  supplierId: z.string().min(1, 'Supplier ID is required'),
  projectId: ProjectIdSchema,
  
  // Invitation Details
  supplierName: z.string().min(1, 'Supplier name is required'),
  supplierEmail: z.string().email('Invalid email format'),
  contactPerson: z.string().optional(),
  
  // Status Tracking
  invitationStatus: SupplierInvitationStatusSchema,
  invitedAt: DateSchema,
  viewedAt: OptionalDateSchema,
  respondedAt: OptionalDateSchema,
  declinedAt: OptionalDateSchema,
  
  // Authentication
  accessToken: z.string().optional(),
  tokenExpiresAt: OptionalDateSchema,
  magicLinkToken: z.string().optional(),
  lastLoginAt: OptionalDateSchema,
  
  // Communication
  invitationMessage: z.string().optional(),
  declineReason: z.string().optional(),
  remindersSent: z.number().int().nonnegative().default(0),
  lastReminderAt: OptionalDateSchema,
  
  // Timestamps
  createdAt: DateSchema,
  updatedAt: DateSchema,
});

// Quote schema
export const QuoteSchema = z.object({
  id: UUIDSchema,
  rfqId: UUIDSchema,
  supplierId: z.string().min(1, 'Supplier ID is required'),
  supplierInvitationId: UUIDSchema.optional(),
  projectId: ProjectIdSchema,
  
  // Quote Details
  quoteNumber: z.string().max(100, 'Quote number too long').optional(),
  quoteReference: z.string().max(100, 'Quote reference too long').optional(),
  
  // Status and Dates
  status: QuoteStatusSchema,
  submissionDate: DateSchema,
  validUntil: DateSchema,
  
  // Financial Summary
  totalValue: NonNegativeNumberSchema,
  subtotal: NonNegativeNumberSchema.optional(),
  taxAmount: NonNegativeNumberSchema.optional(),
  discountAmount: NonNegativeNumberSchema.optional(),
  currency: CurrencySchema,
  
  // Terms
  leadTime: z.number().int().nonnegative('Lead time must be non-negative').optional(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  warrantyTerms: z.string().optional(),
  validityPeriod: z.number().int().positive().optional(),
  
  // Additional Information
  notes: z.string().optional(),
  terms: z.string().optional(),
  conditions: z.string().optional(),
  
  // Evaluation
  evaluationScore: PercentageSchema.optional(),
  technicalScore: PercentageSchema.optional(),
  commercialScore: PercentageSchema.optional(),
  evaluationNotes: z.string().optional(),
  isWinner: z.boolean().default(false),
  
  // Award Information
  awardedAt: OptionalDateSchema,
  rejectedAt: OptionalDateSchema,
  rejectionReason: z.string().optional(),
  
  // Timestamps
  createdAt: DateSchema,
  updatedAt: DateSchema,
});

// Quote Item schema
export const QuoteItemSchema = z.object({
  id: UUIDSchema,
  quoteId: UUIDSchema,
  rfqItemId: UUIDSchema,
  projectId: ProjectIdSchema,
  
  // Item Reference
  lineNumber: z.number().int().positive(),
  itemCode: z.string().max(100, 'Item code too long').optional(),
  description: z.string().min(1, 'Description is required'),
  
  // Quantities and Pricing
  quotedQuantity: PositiveNumberSchema.optional(),
  unitPrice: NonNegativeNumberSchema,
  totalPrice: NonNegativeNumberSchema,
  discountPercentage: PercentageSchema.optional(),
  discountAmount: NonNegativeNumberSchema.optional(),
  
  // Alternative Offerings
  alternateOffered: z.boolean().default(false),
  alternateDescription: z.string().optional(),
  alternatePartNumber: z.string().max(100, 'Part number too long').optional(),
  alternateUnitPrice: NonNegativeNumberSchema.optional(),
  
  // Delivery and Terms
  leadTime: z.number().int().nonnegative().optional(),
  minimumOrderQuantity: PositiveNumberSchema.optional(),
  packagingUnit: z.string().max(50, 'Packaging unit too long').optional(),
  
  // Technical Information
  manufacturerName: z.string().optional(),
  partNumber: z.string().max(100, 'Part number too long').optional(),
  modelNumber: z.string().max(100, 'Model number too long').optional(),
  technicalNotes: z.string().optional(),
  complianceCertificates: z.array(z.any()).optional(),
  
  // Evaluation
  technicalCompliance: z.boolean().default(true),
  commercialScore: PercentageSchema.optional(),
  technicalScore: PercentageSchema.optional(),
  
  // Timestamps
  createdAt: DateSchema,
  updatedAt: DateSchema,
});