/**
 * BOQ Validation Utilities
 * Helper functions for validating BOQ data
 */

import { BOQ, BOQItem } from '@/types/procurement/boq.types';
import { ValidationResult } from './types';

/**
 * Validate BOQ item data
 */
export function validateBOQItem(item: Partial<BOQItem>): ValidationResult {
  const errors: string[] = [];

  if (!item.description || item.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (!item.quantity || item.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (!item.uom || item.uom.trim().length === 0) {
    errors.push('Unit of measure is required');
  }

  if (item.unitPrice !== undefined && item.unitPrice < 0) {
    errors.push('Unit price cannot be negative');
  }

  if (item.lineNumber !== undefined && item.lineNumber <= 0) {
    errors.push('Line number must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate BOQ data before save
 */
export function validateBOQData(boq: Partial<BOQ>): ValidationResult {
  const errors: string[] = [];

  if (!boq.version || boq.version.trim().length === 0) {
    errors.push('Version is required');
  }

  if (!boq.projectId || boq.projectId.trim().length === 0) {
    errors.push('Project ID is required');
  }

  if (boq.itemCount !== undefined && boq.itemCount < 0) {
    errors.push('Item count cannot be negative');
  }

  if (boq.totalEstimatedValue !== undefined && boq.totalEstimatedValue < 0) {
    errors.push('Total estimated value cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}