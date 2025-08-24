/**
 * Client Import Service - Legacy Compatibility Layer
 * @deprecated Use modular components from './import' instead
 * This file maintains backward compatibility for existing imports
 * New code should import from './import' directly
 */

// Re-export everything from the modular structure
export { clientImportService } from './import';
export type {
  ClientImportRow,
  ClientImportResult,
  ClientImportError
} from '@/types/client.types';