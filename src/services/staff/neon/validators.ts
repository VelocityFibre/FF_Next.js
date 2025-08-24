/**
 * Staff Data Validators
 * Validation and processing functions for staff data
 */

import { StaffFormData } from '@/types/staff.types';

/**
 * Validate required fields for staff creation
 */
export function validateStaffData(data: StaffFormData): void {
  if (!data.employeeId || data.employeeId.trim() === '') {
    throw new Error('Employee ID is required and cannot be empty');
  }
  
  if (!data.name || data.name.trim() === '') {
    throw new Error('Name is required and cannot be empty');
  }
  
  if (!data.email || data.email.trim() === '') {
    throw new Error('Email is required and cannot be empty');
  }
}

/**
 * Process reportsTo field to ensure proper UUID handling
 */
export function processReportsToField(reportsTo: string | undefined | null): string | null {
  // ULTRA-SAFE UUID PROCESSING - Multiple validation layers
  let processedReportsTo: string | null = null;
  
  console.log('UUID Processing steps:');
  
  // Step 1: Check if reportsTo exists and is not undefined/null
  if (reportsTo !== undefined && reportsTo !== null) {
    console.log('   Step 1: reportsTo is not undefined/null');
    
    // Step 2: Convert to string and check if not empty
    const reportsToString = String(reportsTo).trim();
    console.log('   Step 2: Converted to string and trimmed:', `"${reportsToString}"`);
    
    // Step 3: Validate it's a non-empty string
    if (reportsToString !== '' && reportsToString !== 'undefined' && reportsToString !== 'null') {
      console.log('   Step 3: String is valid, using as UUID');
      processedReportsTo = reportsToString;
    } else {
      console.log('   Step 3: String is empty/invalid, setting to null');
      processedReportsTo = null;
    }
  } else {
    console.log('   Step 1: reportsTo is undefined/null, setting to null');
    processedReportsTo = null;
  }
  
  console.log('Final processed reportsTo:', processedReportsTo);
  console.log('Final processed reportsTo type:', typeof processedReportsTo);
  
  // TRIPLE CHECK - Absolutely ensure no empty strings
  if (processedReportsTo === '') {
    console.log('🚨 EMERGENCY: Empty string detected at final check, converting to null');
    processedReportsTo = null;
  }
  
  return processedReportsTo;
}

/**
 * Log debug information for staff data
 */
export function logDebugInfo(operation: string, data: any, reportsTo?: any): void {
  console.log(`🔍 ${operation} METHOD - Full debugging trace:`);
  console.log('1. Raw input data:', JSON.stringify(data, null, 2));
  
  if (reportsTo !== undefined) {
    console.log('2. reportsTo field analysis:');
    console.log('   - Raw value:', reportsTo);
    console.log('   - Type:', typeof reportsTo);
    console.log('   - String representation:', String(reportsTo));
    console.log('   - JSON stringify:', JSON.stringify(reportsTo));
    console.log('   - Is undefined?', reportsTo === undefined);
    console.log('   - Is null?', reportsTo === null);
    console.log('   - Is empty string?', reportsTo === '');
    console.log('   - Trimmed length:', reportsTo ? String(reportsTo).trim().length : 'N/A');
  }
}

/**
 * Log error information
 */
export function logError(operation: string, error: unknown, data: any): void {
  console.error(`❌ ${operation} ERROR - Detailed error info:`, {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : 'No stack trace',
    inputData: data,
    processedData: {
      employeeId: data.employeeId,
      reportsTo: data.reportsTo
    }
  });
}