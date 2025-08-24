/**
 * Audit Logger - Legacy Compatibility Layer
 * This file maintains backward compatibility for existing imports
 * New code should import from './audit' directly
 */

// Re-export everything from the modular structure
export * from './audit';

// Default export for backward compatibility
export { auditLogger as default } from './audit';