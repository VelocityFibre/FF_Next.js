/**
 * Stock Management Validation Schemas
 * Comprehensive validation for inventory, movements, and cable drum tracking
 */

import { z } from 'zod';
import { 
  UUIDSchema, 
  ProjectIdSchema, 
  DateSchema, 
  OptionalDateSchema, 
  PositiveNumberSchema, 
  NonNegativeNumberSchema 
} from './common.schemas';

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