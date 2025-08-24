/**
 * BOQ API Extensions - Legacy Compatibility Layer
 * 
 * @deprecated This file has been split into specialized modules for better maintainability.
 * 
 * New modular structure:
 * - types.ts: Type definitions and interfaces
 * - mockData.ts: Mock data for development and testing
 * - boqOperations.ts: Core CRUD operations for BOQs
 * - itemOperations.ts: CRUD operations for BOQ items
 * - exceptionOperations.ts: CRUD operations for BOQ exceptions
 * - apiService.ts: Main service orchestrator
 * 
 * For new code, import from the modular structure:
 * ```typescript
 * import { BOQApiExtensions, procurementApiService } from '@/services/procurement/boqApi';
 * // or
 * import { BOQOperations, BOQItemOperations } from '@/services/procurement/boqApi';
 * ```
 * 
 * This legacy layer maintains backward compatibility while the codebase transitions.
 */

import { 
  BOQApiExtensions as ModularBOQApiExtensions,
  procurementApiService as modularProcurementApiService 
} from './boqApi';

/**
 * @deprecated Use the new modular BOQApiExtensions from '@/services/procurement/boqApi' instead
 * 
 * Legacy API extensions class that delegates to the new modular architecture
 */
export class BOQApiExtensions extends ModularBOQApiExtensions {}

/**
 * @deprecated Use the new modular procurementApiService from '@/services/procurement/boqApi' instead
 * 
 * Legacy service instance that delegates to the new modular architecture
 */
export const procurementApiService = modularProcurementApiService;

export default BOQApiExtensions;