/**
 * BOQ API Service - Legacy Compatibility Layer
 * This file maintains backward compatibility for existing imports
 * New code should import from './boq' directly
 */

// Re-export everything from the modular structure
export * from './boq';

// Default export for backward compatibility
export { boqApiService as default } from './boq';