/**
 * RFQ Service Module - Main Entry Point
 * Comprehensive RFQ management with operations, lifecycle, and notifications
 */

import { RFQOperations } from './operations';
import { RFQLifecycle } from './lifecycle';
import { RFQNotifications } from './notifications';

// Re-export all modules
export { RFQOperations } from './operations';
export { RFQLifecycle } from './lifecycle';
export { RFQNotifications } from './notifications';

// Main service combining all modules for backward compatibility
export const rfqService = {
  // CRUD Operations
  getAll: RFQOperations.getAll.bind(RFQOperations),
  getById: RFQOperations.getById.bind(RFQOperations),
  create: RFQOperations.create.bind(RFQOperations),
  update: RFQOperations.update.bind(RFQOperations),
  delete: RFQOperations.delete.bind(RFQOperations),
  updateStatus: RFQOperations.updateStatus.bind(RFQOperations),
  getByProjectId: RFQOperations.getByProjectId.bind(RFQOperations),
  getByStatus: RFQOperations.getByStatus.bind(RFQOperations),
  search: RFQOperations.search.bind(RFQOperations),
  batchUpdate: RFQOperations.batchUpdate.bind(RFQOperations),

  // Lifecycle Management
  sendToSuppliers: RFQLifecycle.sendToSuppliers.bind(RFQLifecycle),
  submitResponse: RFQLifecycle.submitResponse.bind(RFQLifecycle),
  getResponses: RFQLifecycle.getResponses.bind(RFQLifecycle),
  selectResponse: RFQLifecycle.selectResponse.bind(RFQLifecycle),
  compareResponses: RFQLifecycle.compareResponses.bind(RFQLifecycle),
  closeRFQ: RFQLifecycle.closeRFQ.bind(RFQLifecycle),
  cancelRFQ: RFQLifecycle.cancelRFQ.bind(RFQLifecycle),
  extendDeadline: RFQLifecycle.extendDeadline.bind(RFQLifecycle),
  isRFQPastDeadline: RFQLifecycle.isRFQPastDeadline.bind(RFQLifecycle),
  getStatusHistory: RFQLifecycle.getStatusHistory.bind(RFQLifecycle),
  validateStatusTransition: RFQLifecycle.validateStatusTransition.bind(RFQLifecycle),

  // Notifications and Subscriptions
  subscribeToRFQ: RFQNotifications.subscribeToRFQ.bind(RFQNotifications),
  subscribeToResponses: RFQNotifications.subscribeToResponses.bind(RFQNotifications),
  subscribeToProjectRFQs: RFQNotifications.subscribeToProjectRFQs.bind(RFQNotifications),
  subscribeToRFQsByStatus: RFQNotifications.subscribeToRFQsByStatus.bind(RFQNotifications),
  subscribeToAllRFQs: RFQNotifications.subscribeToAllRFQs.bind(RFQNotifications),
  subscribeToDeadlineAlerts: RFQNotifications.subscribeToDeadlineAlerts.bind(RFQNotifications),
  sendSupplierNotification: RFQNotifications.sendSupplierNotification.bind(RFQNotifications),
  generateNotificationContent: RFQNotifications.generateNotificationContent.bind(RFQNotifications)
};