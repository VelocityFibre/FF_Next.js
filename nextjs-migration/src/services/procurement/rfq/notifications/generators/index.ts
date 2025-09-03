/**
 * RFQ Content Generators - Unified Interface
 * Provides access to all notification generation capabilities
 */

// Export all types
export * from './types';

// Export all generator classes
export { RFQEventNotificationGenerator } from './eventNotifications';
export { ContextualNotificationGenerator } from './contextualNotifications';
export { RFQEmailGenerator } from './emailGenerator';
export { BaseRFQGenerator } from './baseGenerator';

// Re-export for backward compatibility
import { RFQEventNotificationGenerator } from './eventNotifications';
import { ContextualNotificationGenerator } from './contextualNotifications';
import { RFQEmailGenerator } from './emailGenerator';
import { BaseRFQGenerator } from './baseGenerator';

export class RFQContentGenerator extends BaseRFQGenerator {
  /**
   * Generate notification content for RFQ events
   * @deprecated Use RFQEventNotificationGenerator.generateNotificationContent instead
   */
  static generateNotificationContent = RFQEventNotificationGenerator.generateNotificationContent;

  /**
   * Generate email content for RFQ events  
   * @deprecated Use RFQEmailGenerator.generateEmailContent instead
   */
  static generateEmailContent = RFQEmailGenerator.generateEmailContent;

  /**
   * Generate contextual notification based on user role and RFQ state
   * @deprecated Use ContextualNotificationGenerator.generateContextualNotification instead
   */
  static generateContextualNotification = ContextualNotificationGenerator.generateContextualNotification;
}