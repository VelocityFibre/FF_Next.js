/**
 * Supplier Management Services
 * Modular supplier service architecture with specialized modules
 */

// Core CRUD operations
export { SupplierCrudService } from './supplier.crud';

// Status management
export { SupplierStatusService } from './supplier.status';

// Rating and performance
export { SupplierRatingService } from './supplier.rating';

// Search and filtering
export { SupplierSearchService } from './supplier.search';

// Compliance and documents
export { 
  SupplierComplianceService,
  type SupplierDocument,
  type ComplianceStatus 
} from './supplier.compliance';

// Real-time subscriptions
export { 
  SupplierSubscriptionService,
  SubscriptionManager,
  type SupplierCallback,
  type SuppliersCallback,
  type SupplierErrorCallback,
  type SubscriptionOptions
} from './supplier.subscriptions';

// Statistics and analytics
export { 
  SupplierStatisticsService,
  type SupplierStatistics,
  type CategoryAnalytics,
  type PerformanceTrends
} from './supplier.statistics';

// Legacy compatibility - maintain original interface
export { supplierService } from './supplierService';

// Import all services for default export
import { SupplierCrudService } from './supplier.crud';
import { SupplierStatusService } from './supplier.status';
import { SupplierRatingService } from './supplier.rating';
import { SupplierSearchService } from './supplier.search';
import { SupplierComplianceService } from './supplier.compliance';
import { SupplierSubscriptionService } from './supplier.subscriptions';
import { SupplierStatisticsService } from './supplier.statistics';

// Default export for new modular approach
export default {
  // Core operations
  crud: SupplierCrudService,
  status: SupplierStatusService,
  rating: SupplierRatingService,
  search: SupplierSearchService,
  compliance: SupplierComplianceService,
  subscriptions: SupplierSubscriptionService,
  statistics: SupplierStatisticsService
};