/**
 * BOQ (Bill of Quantities) Validation Schemas
 * Comprehensive validation for BOQ management and mapping
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