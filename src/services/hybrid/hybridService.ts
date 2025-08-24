/**
 * Hybrid Service - Legacy Compatibility Layer
 * @deprecated Use modular components from './firebase', './neon', './coordinator' instead
 * This file maintains backward compatibility for existing imports
 * New code should import from specific modules directly
 */

// Re-export everything from the modular structure
export { 
  HybridProjectService, 
  HybridClientService,
  hybridProjectService,
  hybridClientService,
  FirebaseProjectService,
  FirebaseClientService,
  NeonAnalyticsService,
  HybridCoordinator
} from './index';