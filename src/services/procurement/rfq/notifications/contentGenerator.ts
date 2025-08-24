/**
 * RFQ Notification Content Generator - Backward Compatibility Layer
 * @deprecated Use ./generators/index.ts for improved modular content generation
 * 
 * This file provides backward compatibility for existing imports.
 * New code should use the modular generator system in ./generators/
 */

// Re-export everything from the new modular structure
export * from './generators';

// Main export for backward compatibility
export { RFQContentGenerator } from './generators';