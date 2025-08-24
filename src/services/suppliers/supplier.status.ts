/**
 * Supplier Status Management - Legacy Compatibility Layer
 * @deprecated Use './status' module instead for better modularity
 */

import { SupplierStatusService as ModularService } from './status';

/**
 * @deprecated Use SupplierStatusService from './status' instead
 * Legacy wrapper for backward compatibility
 */
export class SupplierStatusService extends ModularService {
  // All methods are inherited from the modular service
}