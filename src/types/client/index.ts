/**
 * Client Types Barrel Export
 * Centralized exports for all client-related types
 */

// Core types and interfaces
export * from './core.types';

// Enumerations
export * from './enums';

// Form and filter types
export * from './forms.types';

// Summary and analytics types
export * from './summary.types';

// Contact history types
export * from './contact.types';

// Import/export types
export * from './import.types';

// Re-export core Client interface as default
export type { Client as default } from './core.types';