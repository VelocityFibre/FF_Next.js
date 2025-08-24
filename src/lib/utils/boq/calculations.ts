/**
 * BOQ Calculation Utilities
 * Helper functions for BOQ calculations and statistics
 */

import { BOQ, BOQItem } from '@/types/procurement/boq.types';
import { BOQTotals } from './types';

/**
 * Calculate BOQ mapping progress percentage
 */
export function calculateMappingProgress(boq: BOQ): number {
  if (boq.itemCount === 0) return 0;
  return Math.round((boq.mappedItems / boq.itemCount) * 100);
}

/**
 * Calculate BOQ totals and statistics
 */
export function calculateBOQTotals(items: BOQItem[]): BOQTotals {
  const totals = items.reduce((acc, item) => {
    acc.totalQuantity += item.quantity;
    acc.totalValue += item.totalPrice || 0;
    acc.itemCount += 1;
    
    if (item.mappingStatus === 'mapped') acc.mappedCount += 1;
    if (item.mappingStatus === 'exception') acc.exceptionCount += 1;
    if (item.procurementStatus === 'pending') acc.pendingProcurement += 1;
    
    return acc;
  }, {
    totalQuantity: 0,
    totalValue: 0,
    itemCount: 0,
    mappedCount: 0,
    exceptionCount: 0,
    pendingProcurement: 0
  });

  return {
    ...totals,
    mappingProgress: totals.itemCount > 0 ? (totals.mappedCount / totals.itemCount) * 100 : 0,
    averageItemValue: totals.itemCount > 0 ? totals.totalValue / totals.itemCount : 0
  };
}