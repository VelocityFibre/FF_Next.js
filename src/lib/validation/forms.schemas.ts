/**
 * Form Validation Schemas
 * Specialized validation schemas for UI forms and user inputs
 */

import { z } from 'zod';
import { ProjectIdSchema, CurrencySchema } from './common.schemas';

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