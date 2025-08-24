/**
 * BOQ Service Module
 * Central exports for BOQ-specific operations
 */

import { BOQApiService } from './BOQApiService';

// Export all types
export * from './types';

// Export individual modules if needed
export { performCatalogMatching } from './catalogMatcher';
export { createMappingException, resolveMappingException } from './exceptionHandler';
export { performAutomaticMapping } from './mappingOperations';

// Export main service class
export { BOQApiService };

// Export singleton instance
export const boqApiService = new BOQApiService();
export default boqApiService;