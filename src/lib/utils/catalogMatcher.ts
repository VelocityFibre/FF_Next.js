/**
 * Catalog Matcher Utility - Legacy Compatibility Layer
 * 
 * This file now imports from modular catalog matching system for better maintainability.
 * New code should import directly from ./catalog/ directory.
 */

// Re-export all types and classes for backward compatibility
export * from './catalog';

// Legacy exports for compatibility
export { CatalogMatcher, TextProcessor, DEFAULT_MATCH_CONFIG } from './catalog';
