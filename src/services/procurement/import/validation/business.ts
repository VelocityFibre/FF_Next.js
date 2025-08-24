/**
 * Business Logic Validation for Import Data
 * Contains business rules and cross-data validation logic
 */

import { ImportError, ImportWarning, ParsedBOQItem } from '../importTypes';

/**
 * Validate data consistency across all BOQ items
 * Checks for duplicates, consistency patterns, and business rules
 */
export function validateDataConsistency(items: ParsedBOQItem[]): {
  errors: ImportError[];
  warnings: ImportWarning[];
} {
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];
  const seenLineNumbers = new Set<number>();
  const itemCodes = new Set<string>();

  // Track UOM usage per category
  const categoryUOMs = new Map<string, Set<string>>();

  items.forEach((item, index) => {
    const rowNumber = index + 1;

    // Check for duplicate line numbers
    if (seenLineNumbers.has(item.lineNumber)) {
      errors.push({
        type: 'validation',
        row: rowNumber,
        column: 'lineNumber',
        message: `Duplicate line number: ${item.lineNumber}`
      });
    } else {
      seenLineNumbers.add(item.lineNumber);
    }

    // Track item code duplicates
    if (item.itemCode) {
      if (itemCodes.has(item.itemCode)) {
        warnings.push({
          type: 'data',
          row: rowNumber,
          column: 'itemCode',
          message: `Duplicate item code: ${item.itemCode}`,
          suggestion: 'Consider using unique item codes'
        });
      } else {
        itemCodes.add(item.itemCode);
      }
    }

    // Track UOM consistency within categories
    if (item.category && item.uom) {
      if (!categoryUOMs.has(item.category)) {
        categoryUOMs.set(item.category, new Set());
      }
      categoryUOMs.get(item.category)!.add(item.uom);
    }
  });

  // Check for UOM inconsistencies within categories
  categoryUOMs.forEach((uoms, category) => {
    if (uoms.size > 3) { // More than 3 different UOMs in same category
      warnings.push({
        type: 'data',
        row: 0,
        message: `Category "${category}" uses ${uoms.size} different units of measure: ${Array.from(uoms).join(', ')}`,
        suggestion: 'Consider standardizing units within categories'
      });
    }
  });

  return { errors, warnings };
}

/**
 * Validate price consistency within a BOQ item
 * Checks if unit price × quantity matches total price
 */
export function validatePriceConsistency(
  item: ParsedBOQItem,
  rowNumber: number,
  tolerance: number = 0.01
): ImportWarning[] {
  const warnings: ImportWarning[] = [];

  if (item.unitPrice && item.totalPrice && item.quantity) {
    const calculatedTotal = item.unitPrice * item.quantity;
    const actualTotal = item.totalPrice;
    const toleranceAmount = calculatedTotal * tolerance;

    if (Math.abs(calculatedTotal - actualTotal) > toleranceAmount) {
      warnings.push({
        type: 'validation',
        row: rowNumber,
        column: 'totalPrice',
        message: `Total price (${actualTotal}) doesn't match unit price × quantity (${calculatedTotal.toFixed(2)})`,
        suggestion: `Consider updating total price to ${calculatedTotal.toFixed(2)}`
      });
    }
  }

  return warnings;
}

/**
 * Validate data quality patterns
 * Checks for common data quality issues
 */
export function validateDataQuality(
  item: ParsedBOQItem,
  rowNumber: number
): ImportWarning[] {
  const warnings: ImportWarning[] = [];

  // Description quality checks
  if (item.description && item.description.length < 5) {
    warnings.push({
      type: 'data',
      row: rowNumber,
      column: 'description',
      message: 'Description seems too short',
      suggestion: 'Consider providing more detailed description'
    });
  }

  // Quantity reasonableness checks
  if (item.quantity && item.quantity > 10000) {
    warnings.push({
      type: 'data',
      row: rowNumber,
      column: 'quantity',
      message: 'Unusually large quantity detected',
      suggestion: 'Please verify this quantity is correct'
    });
  }

  // Price reasonableness checks
  if (item.unitPrice && item.unitPrice > 1000000) {
    warnings.push({
      type: 'data',
      row: rowNumber,
      column: 'unitPrice',
      message: 'Unusually high unit price detected',
      suggestion: 'Please verify this price is correct'
    });
  }

  // Missing item code warning
  if (!item.itemCode) {
    warnings.push({
      type: 'data',
      row: rowNumber,
      column: 'itemCode',
      message: 'Item code is missing',
      suggestion: 'Consider adding item codes for better tracking'
    });
  }

  return warnings;
}

/**
 * Validate business rules specific to procurement
 * Industry-specific validation rules
 */
export function validateProcurementRules(
  item: ParsedBOQItem,
  rowNumber: number
): { errors: ImportError[]; warnings: ImportWarning[] } {
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];

  // Check for zero quantities
  if (item.quantity === 0) {
    warnings.push({
      type: 'data',
      row: rowNumber,
      column: 'quantity',
      message: 'Zero quantity detected',
      suggestion: 'Consider removing items with zero quantity'
    });
  }

  // Check for negative prices
  if (item.unitPrice && item.unitPrice < 0) {
    errors.push({
      type: 'validation',
      row: rowNumber,
      column: 'unitPrice',
      message: 'Negative unit price is not allowed'
    });
  }

  if (item.totalPrice && item.totalPrice < 0) {
    errors.push({
      type: 'validation',
      row: rowNumber,
      column: 'totalPrice',
      message: 'Negative total price is not allowed'
    });
  }

  // Check for missing critical fields in certain categories
  if (item.category && ['Cable', 'Fiber', 'Hardware'].includes(item.category)) {
    if (!item.itemCode) {
      warnings.push({
        type: 'data',
        row: rowNumber,
        column: 'itemCode',
        message: `Item code is recommended for ${item.category} items`,
        suggestion: 'Add item code for better inventory tracking'
      });
    }
  }

  return { errors, warnings };
}

/**
 * Validate cross-item dependencies
 * Check for logical relationships between items
 */
export function validateCrossItemDependencies(
  items: ParsedBOQItem[]
): ImportWarning[] {
  const warnings: ImportWarning[] = [];
  
  // Group items by category for analysis
  const categories = new Map<string, ParsedBOQItem[]>();
  items.forEach(item => {
    if (item.category) {
      if (!categories.has(item.category)) {
        categories.set(item.category, []);
      }
      categories.get(item.category)!.push(item);
    }
  });

  // Check for logical inconsistencies within categories
  categories.forEach((categoryItems, categoryName) => {
    const totalQuantity = categoryItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const avgUnitPrice = categoryItems.reduce((sum, item) => sum + (item.unitPrice || 0), 0) / categoryItems.length;

    // Warn about outliers
    categoryItems.forEach(item => {
      if (item.unitPrice && item.unitPrice > avgUnitPrice * 5) {
        warnings.push({
          type: 'data',
          row: items.indexOf(item) + 1,
          column: 'unitPrice',
          message: `Unit price significantly higher than category average (${avgUnitPrice.toFixed(2)})`,
          suggestion: 'Verify this price is correct for this category'
        });
      }
    });

    // Check for reasonable total quantities
    if (totalQuantity === 0) {
      warnings.push({
        type: 'data',
        row: 0,
        message: `Category "${categoryName}" has zero total quantity`,
        suggestion: 'Verify if this category should have items'
      });
    }
  });

  return warnings;
}