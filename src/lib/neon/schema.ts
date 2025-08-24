/**
 * Neon Database Schema for FibreFlow Analytics Data
 * 
 * This file now serves as the main entry point for all schema definitions.
 * The actual schema tables have been split into domain-specific files for better maintainability.
 * 
 * Previous file size: 1320+ lines
 * Current file size: <50 lines
 * 
 * Domain organization:
 * - analytics.schema.ts: Analytics, KPI, Financial data, Audit logs
 * - contractor.schema.ts: Contractor management, Teams, Documents
 * - procurement.schema.ts: BOQ, RFQ, Quotes, Stock management, Cable drums
 * - shared.schema.ts: Common/shared types and utilities
 */

// Re-export all schema definitions
export * from './schema/index';

// Backward compatibility - import main tables object
export { neonTables } from './schema/index';

// For legacy compatibility - maintain the original export pattern
export { neonTables as default } from './schema/index';