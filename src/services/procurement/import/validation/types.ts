/**
 * Import Validation Types
 * Shared types and schemas for import validation
 */

import { z } from 'zod';
import { ImportError, ImportWarning, VALIDATION_CONSTANTS } from '../importTypes';

// Zod validation schema for BOQ items
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

export interface ValidationContext {
  tolerancePercent: number;
  maxQuantityWarningThreshold: number;
  minDescriptionLength: number;
  maxCategoryUOMs: number;
}

export interface ConsistencyCheckResult {
  errors: ImportError[];
  warnings: ImportWarning[];
  duplicateCounts: {
    lineNumbers: number;
    itemCodes: number;
  };
  categoryMetrics: {
    [category: string]: {
      uomCount: number;
      uoms: string[];
    };
  };
}
