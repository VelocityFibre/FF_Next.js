/**
 * SOW (Statement of Work) domain schemas
 * Defines validation schemas for SOW-related API operations including poles, drops, and fiber
 */

import { z } from 'zod';
import {
  IdSchema,
  CoordinatesSchema,
  AuditFieldsSchema,
  PaginationParamsSchema,
  FileUploadSchema,
} from '../common';

// ============================================================================
// SOW Status Schemas
// ============================================================================

export const SOWStatusSchema = z.enum([
  'draft',
  'pending_review',
  'approved',
  'in_progress',
  'completed',
  'rejected',
]);

export const PoleStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'failed',
  'on_hold',
  'verified',
]);

export const DropStatusSchema = z.enum([
  'pending',
  'scheduled',
  'in_progress',
  'completed',
  'failed',
  'cancelled',
]);

export const FiberStatusSchema = z.enum([
  'pending',
  'stringing',
  'strung',
  'spliced',
  'tested',
  'live',
]);

// ============================================================================
// Pole Schemas
// ============================================================================

export const PoleSchema = z.object({
  id: IdSchema,
  projectId: IdSchema,
  poleNumber: z.string().min(1).max(50),
  poleType: z.enum(['wooden', 'concrete', 'steel', 'composite']),
  height: z.number().positive(), // in meters
  coordinates: CoordinatesSchema,
  
  status: PoleStatusSchema,
  installationDate: z.string().datetime().or(z.date()).optional(),
  verificationDate: z.string().datetime().or(z.date()).optional(),
  
  // Technical Details
  owner: z.string().optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'critical']).optional(),
  accessibility: z.enum(['easy', 'moderate', 'difficult', 'restricted']).optional(),
  
  // Attachments
  hasDrops: z.boolean().default(false),
  dropCount: z.number().min(0).default(0),
  hasFiber: z.boolean().default(false),
  fiberCount: z.number().min(0).default(0),
  
  // Photos
  photos: z.array(z.object({
    id: IdSchema,
    url: z.string().url(),
    caption: z.string().optional(),
    takenAt: z.string().datetime(),
    type: z.enum(['overview', 'closeup', 'damage', 'completion']),
  })).optional(),
  
  // Quality Check
  qualityCheck: z.object({
    passed: z.boolean(),
    checkedBy: IdSchema,
    checkedAt: z.string().datetime(),
    issues: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }).optional(),
  
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
}).merge(AuditFieldsSchema);

// ============================================================================
// Drop Schemas
// ============================================================================

export const DropSchema = z.object({
  id: IdSchema,
  projectId: IdSchema,
  poleId: IdSchema.optional(),
  dropNumber: z.string().min(1).max(50),
  
  // Location
  address: z.string(),
  coordinates: CoordinatesSchema,
  
  status: DropStatusSchema,
  scheduledDate: z.string().datetime().or(z.date()).optional(),
  completionDate: z.string().datetime().or(z.date()).optional(),
  
  // Customer Information
  customerName: z.string(),
  customerContact: z.string().optional(),
  customerPhone: z.string().optional(),
  
  // Technical Details
  cableType: z.enum(['fiber', 'copper', 'coax', 'hybrid']).optional(),
  cableLength: z.number().positive().optional(), // in meters
  connectorType: z.string().optional(),
  spliceCount: z.number().min(0).default(0),
  
  // Installation Details
  installationType: z.enum(['aerial', 'underground', 'building', 'hybrid']),
  technicianId: IdSchema.optional(),
  teamId: IdSchema.optional(),
  
  // Testing
  testResults: z.object({
    signalStrength: z.number().optional(),
    attenuation: z.number().optional(),
    passed: z.boolean(),
    testedBy: IdSchema,
    testedAt: z.string().datetime(),
  }).optional(),
  
  // Photos
  photos: z.array(z.object({
    id: IdSchema,
    url: z.string().url(),
    caption: z.string().optional(),
    takenAt: z.string().datetime(),
    type: z.enum(['before', 'during', 'after', 'testing']),
  })).optional(),
  
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
}).merge(AuditFieldsSchema);

// ============================================================================
// Fiber/Cable Schemas
// ============================================================================

export const FiberSegmentSchema = z.object({
  id: IdSchema,
  projectId: IdSchema,
  segmentNumber: z.string().min(1).max(50),
  
  // Endpoints
  startPoleId: IdSchema,
  endPoleId: IdSchema,
  
  status: FiberStatusSchema,
  
  // Cable Details
  cableType: z.string(),
  coreCount: z.number().positive(),
  length: z.number().positive(), // in meters
  manufacturer: z.string().optional(),
  
  // Installation
  installationDate: z.string().datetime().or(z.date()).optional(),
  installedBy: IdSchema.optional(),
  
  // Testing
  testResults: z.object({
    otdrTest: z.object({
      loss: z.number(),
      reflectance: z.number(),
      passed: z.boolean(),
    }).optional(),
    continuityTest: z.object({
      passed: z.boolean(),
      faults: z.array(z.string()).optional(),
    }).optional(),
    testedBy: IdSchema,
    testedAt: z.string().datetime(),
  }).optional(),
  
  // Splicing
  splices: z.array(z.object({
    id: IdSchema,
    location: CoordinatesSchema,
    type: z.enum(['fusion', 'mechanical', 'connector']),
    loss: z.number().optional(),
    date: z.string().datetime(),
    technicianId: IdSchema,
  })).optional(),
  
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
}).merge(AuditFieldsSchema);

// ============================================================================
// SOW Import Schemas
// ============================================================================

export const SOWImportSchema = z.object({
  projectId: IdSchema,
  file: FileUploadSchema,
  mappings: z.object({
    poles: z.record(z.string(), z.string()).optional(),
    drops: z.record(z.string(), z.string()).optional(),
    fiber: z.record(z.string(), z.string()).optional(),
  }).optional(),
  options: z.object({
    skipDuplicates: z.boolean().default(false),
    updateExisting: z.boolean().default(false),
    validateCoordinates: z.boolean().default(true),
    autoAssignNumbers: z.boolean().default(false),
  }),
});

export const SOWImportStatusSchema = z.object({
  importId: IdSchema,
  projectId: IdSchema,
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  stats: z.object({
    totalRecords: z.number(),
    processedRecords: z.number(),
    successfulRecords: z.number(),
    failedRecords: z.number(),
    skippedRecords: z.number(),
  }),
  errors: z.array(z.object({
    line: z.number(),
    field: z.string(),
    message: z.string(),
  })).optional(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});

// ============================================================================
// SOW Query Schemas
// ============================================================================

export const PoleQuerySchema = PaginationParamsSchema.extend({
  projectId: IdSchema.optional(),
  status: z.union([PoleStatusSchema, z.array(PoleStatusSchema)]).optional(),
  poleType: z.union([z.string(), z.array(z.string())]).optional(),
  hasDrops: z.boolean().optional(),
  hasFiber: z.boolean().optional(),
  condition: z.union([z.string(), z.array(z.string())]).optional(),
  search: z.string().optional(),
});

export const DropQuerySchema = PaginationParamsSchema.extend({
  projectId: IdSchema.optional(),
  poleId: IdSchema.optional(),
  status: z.union([DropStatusSchema, z.array(DropStatusSchema)]).optional(),
  technicianId: IdSchema.optional(),
  scheduledDateFrom: z.string().datetime().optional(),
  scheduledDateTo: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const FiberQuerySchema = PaginationParamsSchema.extend({
  projectId: IdSchema.optional(),
  status: z.union([FiberStatusSchema, z.array(FiberStatusSchema)]).optional(),
  startPoleId: IdSchema.optional(),
  endPoleId: IdSchema.optional(),
  minCoreCount: z.number().optional(),
  maxCoreCount: z.number().optional(),
  search: z.string().optional(),
});

// ============================================================================
// SOW Summary Schema
// ============================================================================

export const SOWSummarySchema = z.object({
  projectId: IdSchema,
  poles: z.object({
    total: z.number(),
    byStatus: z.record(PoleStatusSchema, z.number()),
    byType: z.record(z.string(), z.number()),
    withDrops: z.number(),
    withFiber: z.number(),
  }),
  drops: z.object({
    total: z.number(),
    byStatus: z.record(DropStatusSchema, z.number()),
    scheduled: z.number(),
    completed: z.number(),
    completionRate: z.number(), // percentage
  }),
  fiber: z.object({
    total: z.number(),
    totalLength: z.number(), // in meters
    byStatus: z.record(FiberStatusSchema, z.number()),
    totalCores: z.number(),
    totalSplices: z.number(),
  }),
  progress: z.object({
    overall: z.number(), // percentage
    poles: z.number(),
    drops: z.number(),
    fiber: z.number(),
  }),
});

// ============================================================================
// Type Exports
// ============================================================================

export type Pole = z.infer<typeof PoleSchema>;
export type Drop = z.infer<typeof DropSchema>;
export type FiberSegment = z.infer<typeof FiberSegmentSchema>;
export type SOWImport = z.infer<typeof SOWImportSchema>;
export type SOWImportStatus = z.infer<typeof SOWImportStatusSchema>;
export type PoleQuery = z.infer<typeof PoleQuerySchema>;
export type DropQuery = z.infer<typeof DropQuerySchema>;
export type FiberQuery = z.infer<typeof FiberQuerySchema>;
export type SOWSummary = z.infer<typeof SOWSummarySchema>;
export type SOWStatus = z.infer<typeof SOWStatusSchema>;
export type PoleStatus = z.infer<typeof PoleStatusSchema>;
export type DropStatus = z.infer<typeof DropStatusSchema>;
export type FiberStatus = z.infer<typeof FiberStatusSchema>;