/**
 * SOW Data Processor - Legacy Compatibility Layer
 * @deprecated Use modular components from './sow/processor' instead
 * This file maintains backward compatibility for existing imports
 * New code should import from './sow/processor' directly
 */

// Re-export everything from the modular structure
export { SOWDataProcessor, sowDataProcessor } from './sow/processor';
export type { ValidationResult } from './sow/processor';

// Re-export data types
export type { NeonPoleData, NeonDropData, NeonFibreData } from './neonSOWService';