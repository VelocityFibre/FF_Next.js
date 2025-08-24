/**
 * Import Validation Schema Definitions
 * Zod schemas and validation rules for BOQ item validation
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
 * Extended validation schema with additional business rules
 */
export const ExtendedBOQItemSchema = BOQItemValidationSchema.extend({
  // Add custom validations here if needed
}).refine(
  (data) => {
    // Custom business rule validation
    if (data.unitPrice && data.totalPrice && data.quantity) {
      const calculatedTotal = data.unitPrice * data.quantity;
      const tolerance = calculatedTotal * 0.01; // 1% tolerance
      return Math.abs(calculatedTotal - data.totalPrice) <= tolerance;
    }
    return true;
  },
  {
    message: "Total price doesn't match unit price × quantity",
    path: ['totalPrice']
  }
);

/**
 * Schema for validating import file metadata
 */
export const ImportFileSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().positive('File size must be positive'),
  mimeType: z.string().min(1, 'MIME type is required'),
  worksheetName: z.string().optional(),
  headerRow: z.number().positive('Header row must be positive').optional(),
  dataStartRow: z.number().positive('Data start row must be positive').optional(),
  expectedColumns: z.array(z.string()).optional()
});

/**
 * Schema for batch validation settings
 */
export const ValidationSettingsSchema = z.object({
  strictMode: z.boolean().default(false),
  skipEmptyRows: z.boolean().default(true),
  maxErrors: z.number().positive().default(1000),
  warningsAsErrors: z.boolean().default(false),
  customRules: z.array(z.string()).optional(),
  priceValidation: z.boolean().default(true),
  duplicateCheck: z.boolean().default(true),
  consistencyCheck: z.boolean().default(true)
});

/**
 * Type exports for schemas
 */
export type BOQItemValidation = z.infer<typeof BOQItemValidationSchema>;
export type ExtendedBOQItem = z.infer<typeof ExtendedBOQItemSchema>;
export type ImportFileMetadata = z.infer<typeof ImportFileSchema>;
export type ValidationSettings = z.infer<typeof ValidationSettingsSchema>;