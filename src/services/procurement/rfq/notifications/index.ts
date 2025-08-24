/**
 * RFQ Notifications Module Index
 * Centralized exports for RFQ notification services
 */

// Real-time subscriptions
export { RFQSubscriptions } from './subscriptions';
export type { SubscriptionFilter } from './subscriptions';

// Notification content generation
export { RFQNotificationContentGenerator } from './contentGenerator';
export type { 
  NotificationContent,
  NotificationAction,
  NotificationEvent
} from './contentGenerator';

// Email services
export { RFQEmailService } from './emailService';
export type { 
  EmailContent, 
  EmailNotificationOptions 
} from './emailService';

// Deadline alerts
export { RFQDeadlineAlerts } from './deadlineAlerts';
export type { 
  DeadlineAlert, 
  AlertThresholds 
} from './deadlineAlerts';

// Backward compatibility - consolidated notification class
export class RFQNotifications {
  // Re-export subscription methods
  static subscribeToRFQ = RFQSubscriptions.subscribeToRFQ;
  static subscribeToResponses = RFQSubscriptions.subscribeToResponses;
  static subscribeToProjectRFQs = RFQSubscriptions.subscribeToProjectRFQs;
  static subscribeToRFQsByStatus = RFQSubscriptions.subscribeToRFQsByStatus;
  static subscribeToAllRFQs = RFQSubscriptions.subscribeToAllRFQs;
  static subscribeToSupplierRFQs = RFQSubscriptions.subscribeToSupplierRFQs;
  static subscribeToUpcomingDeadlines = RFQSubscriptions.subscribeToUpcomingDeadlines;
  static subscribeToActivityFeed = RFQSubscriptions.subscribeToActivityFeed;
  static batchSubscribeToRFQs = RFQSubscriptions.batchSubscribeToRFQs;
  static subscribeToRFQMetrics = RFQSubscriptions.subscribeToRFQMetrics;
  static createCustomSubscription = RFQSubscriptions.createCustomSubscription;

  // Re-export content generation methods
  static generateNotificationContent = RFQNotificationContentGenerator.generateNotificationContent;

  // Re-export email methods
  static sendSupplierNotification = RFQEmailService.sendSupplierNotification;
  static sendBulkNotifications = RFQEmailService.sendBulkNotifications;
  static validateEmailAddresses = RFQEmailService.validateEmailAddresses;
  static generateRFQAttachment = RFQEmailService.generateRFQAttachment;

  // Re-export deadline alert methods
  static subscribeToDeadlineAlerts = RFQDeadlineAlerts.subscribeToDeadlineAlerts;
  static getDetailedDeadlineAlerts = RFQDeadlineAlerts.getDetailedDeadlineAlerts;
  static subscribeToOverdueRFQs = RFQDeadlineAlerts.subscribeToOverdueRFQs;
  static generateDeadlineSummary = RFQDeadlineAlerts.generateDeadlineSummary;
  static formatDeadline = RFQDeadlineAlerts.formatDeadline;
  static getAlertColor = RFQDeadlineAlerts.getAlertColor;
  static suggestDeadlineExtension = RFQDeadlineAlerts.suggestDeadlineExtension;
}