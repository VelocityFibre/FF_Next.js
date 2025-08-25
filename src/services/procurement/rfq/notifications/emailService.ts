/**
 * RFQ Email Service - Legacy Compatibility Layer
 * @deprecated Use modular components from './email' instead
 * This file maintains backward compatibility for existing imports
 * New code should import from './email' directly
 */

// Re-export everything from the modular structure
export {
  RFQEmailSender as RFQEmailService,
  RFQEmailTemplates,
  RFQEmailValidator
} from './email';

export type {
  EmailContent,
  EmailNotificationOptions,
  BulkNotification,
  EmailValidationResult,
  EmailTemplate,
  EmailProvider,
  EmailEvent
} from './email';