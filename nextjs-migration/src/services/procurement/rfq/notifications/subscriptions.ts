/**
 * RFQ Subscriptions - Legacy Compatibility Layer
 * @deprecated Use modular components from './subscription' instead
 * This file maintains backward compatibility for existing imports
 * New code should import from './subscription' directly
 */

// Re-export everything from the modular structure
export { 
  RFQSubscriptionManager as RFQSubscriptions,
  RFQFilterEngine,
  RFQSubscriberCrud
} from './subscription';

export type { 
  SubscriptionFilter, 
  SubscriptionOptions, 
  SubscriptionCallback 
} from './subscription';