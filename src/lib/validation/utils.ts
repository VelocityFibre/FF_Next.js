/**
 * Validation Utilities
 * Helper functions and utilities for schema validation
 */

import { z } from 'zod';

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