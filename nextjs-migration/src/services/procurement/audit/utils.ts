/**
 * Audit Logger Utility Functions
 * Helper functions for audit log processing
 */

import { AuditAction } from './types';

/**
 * Generate human-readable changes summary
 */
export function generateChangesSummary(
  action: string,
  entityType: string,
  oldValue?: any,
  newValue?: any
): string {
  switch (action) {
    case AuditAction.CREATE:
      return `Created new ${entityType}`;
    
    case AuditAction.UPDATE:
      if (oldValue && newValue) {
        const changes = getChangedFields(oldValue, newValue);
        return changes.length > 0 
          ? `Updated ${entityType}: ${changes.join(', ')}`
          : `Updated ${entityType}`;
      }
      return `Updated ${entityType}`;
    
    case AuditAction.DELETE:
      return `Deleted ${entityType}`;
    
    case AuditAction.APPROVE:
      return `Approved ${entityType}`;
    
    case AuditAction.REJECT:
      return `Rejected ${entityType}`;
    
    case AuditAction.ISSUE:
      return `Issued ${entityType}`;
    
    case AuditAction.AWARD:
      return `Awarded ${entityType}`;
    
    default:
      return `Performed ${action} on ${entityType}`;
  }
}

/**
 * Get list of changed fields between old and new values
 */
export function getChangedFields(oldValue: any, newValue: any): string[] {
  const changes: string[] = [];

  if (!oldValue || !newValue) {
    return changes;
  }

  // Compare fields
  const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
  
  for (const key of allKeys) {
    if (key === 'updatedAt' || key === 'createdAt') {
      continue; // Skip timestamp fields
    }

    const oldVal = oldValue[key];
    const newVal = newValue[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push(key);
    }
  }

  return changes;
}

/**
 * Sanitize values to remove sensitive information
 */
export function sanitizeValue(value: any): any {
  if (!value) {
    return value;
  }

  // Clone the object to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(value));

  // Remove sensitive fields
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'credential',
    'accessToken', 'refreshToken', 'magicLinkToken'
  ];

  const sanitizeObject = (obj: any) => {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key]);
        }
      }
    }
  };

  sanitizeObject(sanitized);
  return sanitized;
}