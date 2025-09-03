/**
 * Contractor Onboarding Service - Legacy Compatibility Layer
 * This file maintains backward compatibility for existing imports
 * New code should import from './onboarding' directly
 */

// Re-export everything from the modular structure
export * from './onboarding';

// Default export for backward compatibility
export { contractorOnboardingService } from './onboarding';