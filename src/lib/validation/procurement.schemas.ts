/**
 * Procurement Module Validation Schemas - Legacy Compatibility Layer
 * This file now imports from modular schema files for better maintainability
 * 
 * IMPORTANT: This is a legacy compatibility layer. New code should import directly
 * from the specific schema files in this directory:
 * - ./common.schemas.ts - Common validation utilities
 * - ./boq.schemas.ts - BOQ validation schemas
 * - ./rfq.schemas.ts - RFQ validation schemas  
 * - ./stock.schemas.ts - Stock management schemas
 * - ./forms.schemas.ts - Form validation schemas
 * - ./utils.ts - Validation utilities
 */

// Re-export all schemas for backward compatibility
export * from './common.schemas';
export * from './boq.schemas';
export * from './rfq.schemas';
export * from './stock.schemas';
export * from './forms.schemas';
export * from './utils';

