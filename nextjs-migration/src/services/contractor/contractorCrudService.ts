/**
 * Contractor CRUD Service - Legacy Compatibility Layer
 * This file maintains backward compatibility for existing imports
 * New code should import from './crud' directly
 */

// Re-export everything from the modular structure
export * from './crud';

// Default export for backward compatibility
export { contractorCrudCore as contractorCrudService } from './crud';