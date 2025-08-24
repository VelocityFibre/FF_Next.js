/**
 * BOQ Import Service - Legacy Compatibility Layer
 * 
 * This file now imports from modular BOQ import system for better maintainability.
 * New code should import directly from ./import/ directory.
 */

// Re-export all types and classes for backward compatibility
export * from './import';
