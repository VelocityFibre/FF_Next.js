/**
 * Common Validation Schemas
 * Shared validation utilities used across all procurement modules
 */

import { z } from 'zod';

// UUID validation schema
export const UUIDSchema = z.string().uuid('Invalid UUID format');

// Project ID validation (Firebase document ID)
export const ProjectIdSchema = z.string().min(1, 'Project ID is required');

// Currency validation
export const CurrencySchema = z.string().default('ZAR');

// Date validation that accepts strings or Date objects
export const DateSchema = z.union([
  z.string().datetime('Invalid date format'),
  z.date()
]).transform((val) => typeof val === 'string' ? new Date(val) : val);

// Optional date schema
export const OptionalDateSchema = DateSchema.optional();

// Positive number validation
export const PositiveNumberSchema = z.number().positive('Must be a positive number');

// Non-negative number validation  
export const NonNegativeNumberSchema = z.number().nonnegative('Must be non-negative');

// Percentage validation (0-100)
export const PercentageSchema = z.number().min(0).max(100, 'Must be between 0 and 100');