/**
 * Excel Parser - Legacy Compatibility Layer
 * This file maintains backward compatibility for existing imports
 * New code should import from './excel' directly
 */

// Re-export everything from the modular structure
export * from './excel';

// Default export for backward compatibility
export { ExcelParser as default } from './excel';