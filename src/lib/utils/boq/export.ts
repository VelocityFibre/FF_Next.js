/**
 * BOQ Export Utilities
 * Helper functions for exporting BOQ data
 */

import { BOQ, BOQItem } from '@/types/procurement/boq.types';

/**
 * Export BOQ data to CSV format
 */
export function exportBOQToCSV(boq: BOQ, items: BOQItem[]): string {
  const headers = [
    'Line Number',
    'Item Code',
    'Description',
    'Category',
    'Subcategory',
    'Quantity',
    'UOM',
    'Unit Price',
    'Total Price',
    'Phase',
    'Task',
    'Site',
    'Mapping Status',
    'Procurement Status',
    'Catalog Item Code',
    'Catalog Item Name',
    'Mapping Confidence'
  ];

  const rows = items.map(item => [
    item.lineNumber,
    item.itemCode || '',
    `"${item.description}"`,
    item.category || '',
    item.subcategory || '',
    item.quantity,
    item.uom,
    item.unitPrice || '',
    item.totalPrice || '',
    item.phase || '',
    item.task || '',
    item.site || '',
    item.mappingStatus,
    item.procurementStatus,
    item.catalogItemCode || '',
    item.catalogItemName || '',
    item.mappingConfidence || ''
  ]);

  const csvContent = [
    `"BOQ Export: ${boq.version} - ${boq.title || boq.fileName}"`,
    `"Generated: ${new Date().toLocaleString()}"`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}