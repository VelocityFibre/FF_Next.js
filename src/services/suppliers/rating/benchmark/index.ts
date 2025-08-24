/**
 * Supplier Benchmark System - Unified Interface
 * Provides access to all benchmark and comparison capabilities
 */

// Export all types
export * from './benchmark-types';

// Export benchmark calculator
export * from './benchmark-calculator';

// Export comparison engine
export * from './comparison-engine';

// Export benchmark reports
export * from './benchmark-reports';

// Re-export main service class for backward compatibility
export { SupplierBenchmarkService } from '../SupplierBenchmarkService';