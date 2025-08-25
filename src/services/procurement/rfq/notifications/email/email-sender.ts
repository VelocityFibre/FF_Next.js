/**
 * Email Sender
 * Core email sending functionality for RFQ notifications
 */

import { Timestamp } from 'firebase/firestore';
import { RFQ } from '@/types/procurement.types';
import { RFQEmailTemplates } from './email-templates';
import type { 
  EmailContent, 
  EmailNotificationOptions, 
  BulkNotification 
} from './email-types';

/**
 * Utility to convert Timestamp or Date to Date object
 */
function toDate(timestampOrDate: Date | Timestamp | any): Date {
  if (!timestampOrDate) {
    return new Date();
  }
  
  // If it's already a Date, return it
  if (timestampOrDate instanceof Date) {
    return timestampOrDate;
  }
  
  // If it's a Firestore Timestamp, convert it
  if (timestampOrDate && typeof timestampOrDate.toDate === 'function') {
    return timestampOrDate.toDate();
  }
  
  // If it's a timestamp number, convert it
  if (typeof timestampOrDate === 'number') {
    return new Date(timestampOrDate);
  }
  
  // Fallback: try to parse as date
  return new Date(timestampOrDate);
}

/**
 * RFQ Email Sender
 * Handles the actual email sending operations
 */
export class RFQEmailSender {
  private static readonly DEFAULT_FROM = 'noreply@fibreflow.com';
  private static readonly BASE_URL = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://app.fibreflow.com';

  /**
   * Send email notification to suppliers
   * TODO: Implement with actual email service (SendGrid, AWS SES, etc.)
   */
  static async sendSupplierNotification(
    supplierEmails: string[],
    event: 'rfq_issued' | 'deadline_extended' | 'cancelled',
    rfq: RFQ,
    additionalData?: any,
    options?: Partial<EmailNotificationOptions>
  ): Promise<void> {
    try {
      const emailContent = this.generateEmailContent(event, rfq, additionalData);
      
      const emailOptions: EmailNotificationOptions = {
        to: supplierEmails,
        from: options?.from || this.DEFAULT_FROM,
        ...(options?.replyTo && { replyTo: options.replyTo }),
        ...(options?.attachments && { attachments: options.attachments }),
        ...options
      };
      
      // Mock implementation - replace with actual email service

      // Example with SendGrid or similar:
      // await emailService.send({
      //   to: emailOptions.to,
      //   from: emailOptions.from,
      //   subject: emailContent.subject,
      //   html: emailContent.content,
      //   replyTo: emailOptions.replyTo,
      //   attachments: emailOptions.attachments
      // });

      // Example with AWS SES:
      // const sesClient = new SESClient({ region: 'us-east-1' });
      // await sesClient.send(new SendEmailCommand({
      //   Source: emailOptions.from,
      //   Destination: { ToAddresses: emailOptions.to },
      //   Message: {
      //     Subject: { Data: emailContent.subject },
      //     Body: { Html: { Data: emailContent.content } }
      //   }
      // }));
      
    } catch (error) {
      console.error('Error sending supplier notification:', error);
      throw new Error(`Failed to send email notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send bulk notifications to multiple supplier groups
   */
  static async sendBulkNotifications(
    notifications: BulkNotification[],
    options?: Partial<EmailNotificationOptions>
  ): Promise<Array<{ success: boolean; error?: string; suppliers: string[] }>> {
    const results = [];

    for (const notification of notifications) {
      try {
        await this.sendSupplierNotification(
          notification.suppliers,
          notification.event,
          notification.rfq,
          notification.additionalData,
          options
        );
        results.push({ success: true, suppliers: notification.suppliers });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          suppliers: notification.suppliers
        });
      }
    }

    return results;
  }

  /**
   * Generate email content for different RFQ events
   */
  private static generateEmailContent(
    event: 'rfq_issued' | 'deadline_extended' | 'cancelled',
    rfq: RFQ,
    additionalData?: any
  ): EmailContent {
    const rfqUrl = `${this.BASE_URL}/procurement/rfq/${rfq.id}`;

    switch (event) {
      case 'rfq_issued':
        return {
          subject: `New RFQ: ${rfq.title} - ${rfq.rfqNumber}`,
          content: RFQEmailTemplates.generateIssuedEmailTemplate(rfq, rfqUrl)
        };

      case 'deadline_extended': {
        const newDeadline = additionalData?.newDeadline || toDate(rfq.responseDeadline);
        return {
          subject: `RFQ Deadline Extended: ${rfq.title} - ${rfq.rfqNumber}`,
          content: RFQEmailTemplates.generateDeadlineExtendedTemplate(rfq, rfqUrl, newDeadline, additionalData?.reason)
        };
      }

      case 'cancelled':
        return {
          subject: `RFQ Cancelled: ${rfq.title} - ${rfq.rfqNumber}`,
          content: RFQEmailTemplates.generateCancelledTemplate(rfq, additionalData?.reason)
        };

      default:
        return {
          subject: `RFQ Update: ${rfq.title}`,
          content: RFQEmailTemplates.generateGenericTemplate(
            rfq,
            'RFQ Update',
            `<p>There has been an update to RFQ: ${rfq.title}</p>`
          )
        };
    }
  }

  /**
   * Generate RFQ attachment from data
   */
  static generateRFQAttachment(rfq: RFQ): {
    filename: string;
    content: string;
    contentType: string;
  } {
    const rfqData = {
      rfqNumber: rfq.rfqNumber,
      title: rfq.title,
      description: rfq.description,
      responseDeadline: toDate(rfq.responseDeadline).toISOString(),
      items: [], // Items are stored separately in RFQItem table
      terms: rfq.paymentTerms || rfq.deliveryTerms,
      contact: rfq.createdBy // Contact info not directly on RFQ
    };

    return {
      filename: `RFQ-${rfq.rfqNumber}.json`,
      content: JSON.stringify(rfqData, null, 2),
      contentType: 'application/json'
    };
  }
}