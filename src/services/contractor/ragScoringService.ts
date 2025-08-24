/**
 * RAG Scoring Service - Legacy Compatibility Layer
 * This file maintains backward compatibility for existing imports
 * New code should import from './rag' directly
 */

// Re-export everything from the modular structure
export * from './rag';

// Default export for backward compatibility
export { ragScoringService } from './rag';