/**
 * Procurement Module Zod Validation Schemas
 * All schemas match the database structure exactly and provide comprehensive validation
 */

import { z } from 'zod';

// ==============================================
// COMMON SCHEMAS & UTILITIES
// ==============================================

// UUID validation schema
const UUIDSchema = z.string().uuid('Invalid UUID format');

// Project ID validation (Firebase document ID)
const ProjectIdSchema = z.string().min(1, 'Project ID is required');

// Currency validation
const CurrencySchema = z.string().default('ZAR');

// Date validation that accepts strings or Date objects
const DateSchema = z.union([
  z.string().datetime('Invalid date format'),
  z.date()
]).transform((val) => typeof val === 'string' ? new Date(val) : val);

// Optional date schema
const OptionalDateSchema = DateSchema.optional();

// Positive number validation
const PositiveNumberSchema = z.number().positive('Must be a positive number');

// Non-negative number validation  
const NonNegativeNumberSchema = z.number().nonnegative('Must be non-negative');

// Percentage validation (0-100)
const PercentageSchema = z.number().min(0).max(100, 'Must be between 0 and 100');

// ==============================================
// BOQ VALIDATION SCHEMAS
// ==============================================

// BOQ Status enum validation
export const BOQStatusSchema = z.enum(['draft', 'mapping_review', 'approved', 'archived']);

// Mapping Status enum validation
export const MappingStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'failed']);

// BOQ Item Mapping Status validation
export const BOQItemMappingStatusSchema = z.enum(['pending', 'mapped', 'manual', 'exception']);

// Procurement Status validation
export const ProcurementStatusSchema = z.enum(['pending', 'rfq_created', 'quoted', 'awarded', 'ordered']);

// Main BOQ schema matching database structure
export const BOQSchema = z.object({
  id: UUIDSchema,
  projectId: ProjectIdSchema,
  
  // BOQ Details
  version: z.string().min(1, 'Version is required').max(50, 'Version too long'),
  title: z.string().max(255, 'Title too long').optional(),
  description: z.string().optional(),
  
  // Status and Workflow
  status: BOQStatusSchema,
  mappingStatus: MappingStatusSchema.optional(),
  mappingConfidence: PercentageSchema.optional(),
  
  // Upload Information
  uploadedBy: z.string().min(1, 'Uploaded by is required'),
  uploadedAt: DateSchema,
  fileName: z.string().optional(),
  fileUrl: z.string().url('Invalid file URL').optional(),
  fileSize: z.number().int().positive('File size must be positive').optional(),
  
  // Approval Workflow
  approvedBy: z.string().optional(),
  approvedAt: OptionalDateSchema,
  rejectedBy: z.string().optional(),
  rejectedAt: OptionalDateSchema,
  rejectionReason: z.string().optional(),
  
  // Metadata
  itemCount: z.number().int().nonnegative('Item count must be non-negative').default(0),
  mappedItems: z.number().int().nonnegative().default(0),
  unmappedItems: z.number().int().nonnegative().default(0),
  exceptionsCount: z.number().int().nonnegative().default(0),
  
  // Totals
  totalEstimatedValue: z.number().nonnegative('Total value must be non-negative').optional(),
  currency: CurrencySchema,
  
  // Timestamps
  createdAt: DateSchema,
  updatedAt: DateSchema,
});

// Schema for creating new BOQ
export const NewBOQSchema = BOQSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  itemCount: true,
  mappedItems: true,
  unmappedItems: true,
  exceptionsCount: true
});

// BOQ Item schema
export const BOQItemSchema = z.object({
  id: UUIDSchema,
  boqId: UUIDSchema,
  projectId: ProjectIdSchema,
  
  // Line Item Details
  lineNumber: z.number().int().positive('Line number must be positive'),
  itemCode: z.string().max(100, 'Item code too long').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  category: z.string().max(100, 'Category too long').optional(),
  subcategory: z.string().max(100, 'Subcategory too long').optional(),
  
  // Quantities and Units
  quantity: z.number().positive('Quantity must be positive'),
  uom: z.string().min(1, 'Unit of measure is required').max(20, 'UOM too long'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative').optional(),
  totalPrice: z.number().nonnegative('Total price must be non-negative').optional(),
  
  // Project Structure
  phase: z.string().max(100, 'Phase too long').optional(),
  task: z.string().max(100, 'Task too long').optional(),
  site: z.string().max(100, 'Site too long').optional(),
  location: z.string().max(100, 'Location too long').optional(),
  
  // Catalog Mapping
  catalogItemId: z.string().optional(),
  catalogItemCode: z.string().max(100, 'Catalog item code too long').optional(),
  catalogItemName: z.string().optional(),
  mappingConfidence: PercentageSchema.optional(),
  mappingStatus: BOQItemMappingStatusSchema,
  
  // Technical Specifications
  specifications: z.record(z.any()).optional(),
  technicalNotes: z.string().optional(),
  alternativeItems: z.array(z.any()).optional(),
  
  // Procurement Status
  procurementStatus: ProcurementStatusSchema,
  
  // Timestamps
  createdAt: DateSchema,
  updatedAt: DateSchema,
});

// Schema for creating new BOQ Item
export const NewBOQItemSchema = BOQItemSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  mappingStatus: true,
  procurementStatus: true
}).extend({
  mappingStatus: BOQItemMappingStatusSchema.default('pending'),
  procurementStatus: ProcurementStatusSchema.default('pending'),
});

// BOQ Exception schema
export const BOQExceptionSchema = z.object({
  id: UUIDSchema,
  boqId: UUIDSchema,
  boqItemId: UUIDSchema,
  projectId: ProjectIdSchema,
  
  // Exception Details
  exceptionType: z.enum(['no_match', 'multiple_matches', 'data_issue', 'manual_review']),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  
  // Issue Description
  issueDescription: z.string().min(1, 'Issue description is required'),
  suggestedAction: z.string().optional(),
  systemSuggestions: z.array(z.any()).optional(),
  
  // Resolution
  status: z.enum(['open', 'in_review', 'resolved', 'ignored']).default('open'),
  resolvedBy: z.string().optional(),
  resolvedAt: OptionalDateSchema,
  resolutionNotes: z.string().optional(),
  resolutionAction: z.enum(['manual_mapping', 'catalog_update', 'item_split', 'item_ignore']).optional(),
  
  // Assignment
  assignedTo: z.string().optional(),
  assignedAt: OptionalDateSchema,
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  
  // Timestamps
  createdAt: DateSchema,
  updatedAt: DateSchema,
});

// BOQ Import validation schema
export const BOQImportSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileSize: PositiveNumberSchema,
  projectId: ProjectIdSchema,
  version: z.string().min(1, 'Version is required'),
  title: z.string().optional(),
  description: z.string().optional(),
  uploadedBy: z.string().min(1, 'Uploaded by is required'),
  rows: z.array(z.object({
    lineNumber: z.number().int().positive(),
    itemCode: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    quantity: PositiveNumberSchema,
    uom: z.string().min(1, 'UOM is required'),
    unitPrice: NonNegativeNumberSchema.optional(),
    totalPrice: NonNegativeNumberSchema.optional(),
    phase: z.string().optional(),
    task: z.string().optional(),
    site: z.string().optional(),
    location: z.string().optional(),
    specifications: z.string().optional(),
    technicalNotes: z.string().optional(),
  })).min(1, 'At least one row is required'),
});

// ==============================================
// RFQ VALIDATION SCHEMAS
// ==============================================

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

// ==============================================
// STOCK VALIDATION SCHEMAS
// ==============================================

// Stock Status validation
export const StockStatusSchema = z.enum(['normal', 'low', 'critical', 'excess', 'obsolete']);

// Movement Type validation
export const MovementTypeSchema = z.enum(['ASN', 'GRN', 'ISSUE', 'RETURN', 'TRANSFER', 'ADJUSTMENT']);

// Movement Status validation
export const MovementStatusSchema = z.enum(['pending', 'confirmed', 'completed', 'cancelled']);

// Item Status validation
export const ItemStatusSchema = z.enum(['pending', 'confirmed', 'completed', 'damaged', 'rejected']);

// Quality Check Status validation
export const QualityCheckStatusSchema = z.enum(['pending', 'passed', 'failed', 'waived']);

// Stock Position schema
export const StockPositionSchema = z.object({
  id: UUIDSchema,
  projectId: ProjectIdSchema,
  
  // Item Details
  itemCode: z.string().min(1, 'Item code is required').max(100, 'Item code too long'),
  itemName: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  category: z.string().max(100, 'Category too long').optional(),
  uom: z.string().min(1, 'UOM is required').max(20, 'UOM too long'),
  
  // Stock Quantities
  onHandQuantity: NonNegativeNumberSchema.default(0),
  reservedQuantity: NonNegativeNumberSchema.default(0),
  availableQuantity: NonNegativeNumberSchema.default(0),
  inTransitQuantity: NonNegativeNumberSchema.default(0),
  
  // Valuation
  averageUnitCost: NonNegativeNumberSchema.optional(),
  totalValue: NonNegativeNumberSchema.optional(),
  
  // Location
  warehouseLocation: z.string().max(100, 'Warehouse location too long').optional(),
  binLocation: z.string().max(50, 'Bin location too long').optional(),
  
  // Reorder Information
  reorderLevel: NonNegativeNumberSchema.optional(),
  maxStockLevel: NonNegativeNumberSchema.optional(),
  economicOrderQuantity: PositiveNumberSchema.optional(),
  
  // Tracking
  lastMovementDate: OptionalDateSchema,
  lastCountDate: OptionalDateSchema,
  nextCountDue: OptionalDateSchema,
  
  // Status
  isActive: z.boolean().default(true),
  stockStatus: StockStatusSchema.default('normal'),
  
  // Timestamps
  createdAt: DateSchema,
  updatedAt: DateSchema,
});

// Stock Movement schema
export const StockMovementSchema = z.object({
  id: UUIDSchema,
  projectId: ProjectIdSchema,
  
  // Movement Details
  movementType: MovementTypeSchema,
  referenceNumber: z.string().min(1, 'Reference number is required').max(100, 'Reference number too long'),
  referenceType: z.string().max(50, 'Reference type too long').optional(),
  referenceId: z.string().optional(),
  
  // Locations
  fromLocation: z.string().max(100, 'From location too long').optional(),
  toLocation: z.string().max(100, 'To location too long').optional(),
  fromProjectId: z.string().optional(),
  toProjectId: z.string().optional(),
  
  // Status and Dates
  status: MovementStatusSchema.default('pending'),
  movementDate: DateSchema,
  confirmedAt: OptionalDateSchema,
  
  // Personnel
  requestedBy: z.string().optional(),
  authorizedBy: z.string().optional(),
  processedBy: z.string().optional(),
  
  // Notes
  notes: z.string().optional(),
  reason: z.string().optional(),
  
  // Timestamps
  createdAt: DateSchema,
  updatedAt: DateSchema,
});

// Cable Drum schema
export const CableDrumSchema = z.object({
  id: UUIDSchema,
  projectId: ProjectIdSchema,
  stockPositionId: UUIDSchema.optional(),
  
  // Drum Identification
  drumNumber: z.string().min(1, 'Drum number is required').max(100, 'Drum number too long'),
  serialNumber: z.string().max(100, 'Serial number too long').optional(),
  supplierDrumId: z.string().max(100, 'Supplier drum ID too long').optional(),
  
  // Cable Details
  cableType: z.string().min(1, 'Cable type is required').max(100, 'Cable type too long'),
  cableSpecification: z.string().optional(),
  manufacturerName: z.string().optional(),
  partNumber: z.string().max(100, 'Part number too long').optional(),
  
  // Measurements (in meters)
  originalLength: PositiveNumberSchema,
  currentLength: NonNegativeNumberSchema,
  usedLength: NonNegativeNumberSchema.default(0),
  
  // Physical Properties
  drumWeight: PositiveNumberSchema.optional(), // kg
  cableWeight: PositiveNumberSchema.optional(), // kg
  drumDiameter: PositiveNumberSchema.optional(), // mm
  
  // Status
  currentLocation: z.string().max(100, 'Location too long').optional(),
  drumCondition: z.enum(['good', 'damaged', 'returnable']).default('good'),
  installationStatus: z.enum(['available', 'in_use', 'completed', 'returned']).default('available'),
  
  // Tracking
  lastMeterReading: NonNegativeNumberSchema.optional(),
  lastReadingDate: OptionalDateSchema,
  lastUsedDate: OptionalDateSchema,
  
  // Quality
  testCertificate: z.string().optional(),
  installationNotes: z.string().optional(),
  
  // Timestamps
  createdAt: DateSchema,
  updatedAt: DateSchema,
});

// ==============================================
// FORM VALIDATION SCHEMAS
// ==============================================

// BOQ Form validation
export const BOQFormSchema = z.object({
  version: z.string().min(1, 'Version is required').max(50, 'Version too long'),
  title: z.string().max(255, 'Title too long').optional(),
  description: z.string().optional(),
  projectId: ProjectIdSchema,
  currency: CurrencySchema.optional(),
});

// RFQ Form validation
export const RFQFormSchema = z.object({
  rfqNumber: z.string().max(100, 'RFQ number too long').optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  projectId: ProjectIdSchema,
  responseDeadline: z.union([z.string().datetime(), z.date()]).transform((val) => typeof val === 'string' ? new Date(val) : val),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  validityPeriod: z.number().int().positive().optional(),
  currency: CurrencySchema.optional(),
  technicalRequirements: z.string().optional(),
  supplierIds: z.array(z.string().min(1, 'Supplier ID is required')).min(1, 'At least one supplier must be selected'),
});

// Stock Movement Form validation
export const StockMovementFormSchema = z.object({
  movementType: MovementTypeSchema,
  referenceNumber: z.string().min(1, 'Reference number is required'),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  fromProjectId: z.string().optional(),
  toProjectId: z.string().optional(),
  movementDate: z.union([z.string().datetime(), z.date()]).transform((val) => typeof val === 'string' ? new Date(val) : val),
  notes: z.string().optional(),
  reason: z.string().optional(),
  items: z.array(z.object({
    itemCode: z.string().min(1, 'Item code is required'),
    plannedQuantity: PositiveNumberSchema,
    unitCost: NonNegativeNumberSchema.optional(),
    lotNumbers: z.array(z.string()).optional(),
    serialNumbers: z.array(z.string()).optional(),
    qualityCheckRequired: z.boolean().optional(),
  })).min(1, 'At least one item is required'),
});

// Drum Tracking Form validation
export const DrumTrackingFormSchema = z.object({
  drumNumber: z.string().min(1, 'Drum number is required'),
  cableType: z.string().min(1, 'Cable type is required'),
  originalLength: PositiveNumberSchema,
  currentLocation: z.string().min(1, 'Current location is required'),
  previousReading: NonNegativeNumberSchema,
  currentReading: NonNegativeNumberSchema,
  poleNumber: z.string().optional(),
  sectionId: z.string().optional(),
  workOrderId: z.string().optional(),
  technicianId: z.string().optional(),
  installationType: z.enum(['overhead', 'underground', 'building']).optional(),
  installationNotes: z.string().optional(),
  qualityNotes: z.string().optional(),
  startCoordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional(),
  endCoordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional(),
}).refine((data) => data.currentReading >= data.previousReading, {
  message: 'Current reading must be greater than or equal to previous reading',
  path: ['currentReading'],
});

// ==============================================
// VALIDATION UTILITIES & EXPORTS
// ==============================================

// Validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    issues: Array<{
      path: (string | number)[];
      message: string;
      code: string;
    }>;
    message: string;
  };
}

// Generic validation function
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }
  
  return {
    success: false,
    error: {
      issues: result.error.issues.map(issue => ({
        path: issue.path,
        message: issue.message,
        code: issue.code,
      })),
      message: result.error.issues[0]?.message || 'Validation failed',
    },
  };
}

// Schema export object for easy importing
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
  
  // Enum Schemas
  BOQStatus: BOQStatusSchema,
  MappingStatus: MappingStatusSchema,
  RFQStatus: RFQStatusSchema,
  QuoteStatus: QuoteStatusSchema,
  StockStatus: StockStatusSchema,
  MovementType: MovementTypeSchema,
  MovementStatus: MovementStatusSchema,
} as const;

export default ProcurementSchemas;