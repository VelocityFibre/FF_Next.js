/**
 * BOQ API Extensions - Legacy Compatibility Layer
 * @deprecated Use './api/extensions' module instead for better modularity
 */

import { BOQApiExtensions as ModularService, procurementApiService as ModularApiService } from './api/extensions';

/**
 * @deprecated Use BOQApiExtensions from './api/extensions' instead
 * Legacy wrapper for backward compatibility
 */
export class BOQApiExtensions extends ModularService {
  // All methods are inherited from the modular service
}

// Legacy API service export
export const procurementApiService = ModularApiService;