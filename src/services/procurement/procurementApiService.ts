/**
 * Procurement API Service - Legacy Compatibility Layer
 * This file maintains backward compatibility for existing imports
 * New code should import from './api' directly
 */

// Re-export everything from the modular structure
export * from './api';

// Default export for backward compatibility
export { procurementApiService as default } from './api';