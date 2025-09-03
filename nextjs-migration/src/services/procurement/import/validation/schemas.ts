/**
 * Validation Schemas
 * Zod schemas for BOQ item validation
 */

import { z } from 'zod';
import { VALIDATION_CONSTANTS } from '../importTypes';

/**
 * Zod validation schema for BOQ items
 */
export const BOQItemValidationSchema = z.object({
  lineNumber: z.number().positive('Line number must be positive'),
  itemCode: z.string().max(VALIDATION_CONSTANTS.MAX_ITEM_CODE_LENGTH, 'Item code too long').optional(),
  description: z.string()
    .min(1, 'Description is required')
    .max(VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH, 'Description too long'),
  category: z.string().max(VALIDATION_CONSTANTS.MAX_CATEGORY_LENGTH, 'Category too long').optional(),
  quantity: z.number()
    .min(VALIDATION_CONSTANTS.MIN_QUANTITY, 'Quantity must be positive')
    .max(VALIDATION_CONSTANTS.MAX_QUANTITY, 'Quantity too large'),
  uom: z.string()
    .min(1, 'Unit of measure is required')
    .max(VALIDATION_CONSTANTS.MAX_UOM_LENGTH, 'Unit of measure too long'),
  unitPrice: z.number()
    .min(VALIDATION_CONSTANTS.MIN_PRICE, 'Unit price cannot be negative')
    .max(VALIDATION_CONSTANTS.MAX_PRICE, 'Unit price too large')
    .optional(),
  totalPrice: z.number()
    .min(VALIDATION_CONSTANTS.MIN_PRICE, 'Total price cannot be negative')
    .max(VALIDATION_CONSTANTS.MAX_PRICE, 'Total price too large')
    .optional(),
  phase: z.string().optional(),
  task: z.string().optional(),
  site: z.string().optional()
});

/**
 * Partial BOQ item schema for import validation
 */
export const PartialBOQItemSchema = BOQItemValidationSchema.partial();

/**
 * Schema for basic import data structure
 */
export const ImportDataSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().positive('File size must be positive'),
  version: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  rows: z.array(PartialBOQItemSchema),
  metadata: z.record(z.any()).optional()
});

/**
 * Schema for import validation result
 */
export const ValidationResultSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  errors: z.array(z.object({
    type: z.enum(['validation', 'data', 'system']),
    row: z.number(),
    column: z.string().optional(),
    message: z.string(),
    details: z.any().optional()
  })),
  warnings: z.array(z.object({
    type: z.enum(['validation', 'data', 'system']),
    row: z.number(),
    column: z.string().optional(),
    message: z.string(),
    suggestion: z.string().optional(),
    details: z.any().optional()
  }))
});

/**
 * Validation constants for easy import
 */
export { VALIDATION_CONSTANTS } from '../importTypes';

/**
 * Type definitions derived from schemas
 */
export type BOQItemValidation = z.infer<typeof BOQItemValidationSchema>;
export type PartialBOQItem = z.infer<typeof PartialBOQItemSchema>;
export type ImportData = z.infer<typeof ImportDataSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
