/**
 * Email Validator
 * Email validation and utility functions
 */

import { Timestamp } from 'firebase/firestore';
import { RFQ } from '@/types/procurement.types';
import type { EmailValidationResult } from './email-types';

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

export class RFQEmailValidator {
  /**
   * Validate email addresses
   */
  static validateEmailAddresses(emails: string[]): { valid: string[]; invalid: string[] } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid: string[] = [];
    const invalid: string[] = [];

    emails.forEach(email => {
      if (emailRegex.test(email.trim())) {
        valid.push(email.trim());
      } else {
        invalid.push(email);
      }
    });

    return { valid, invalid };
  }

  /**
   * Validate email content and settings
   */
  static validateEmailContent(
    content: string, 
    subject: string, 
    recipients: string[]
  ): EmailValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate recipients
    if (recipients.length === 0) {
      errors.push('No recipients specified');
    } else {
      const { invalid } = this.validateEmailAddresses(recipients);
      if (invalid.length > 0) {
        errors.push(`Invalid email addresses: ${invalid.join(', ')}`);
      }
    }

    // Validate subject
    if (!subject.trim()) {
      errors.push('Subject is required');
    } else if (subject.length > 200) {
      warnings.push('Subject is very long (over 200 characters)');
    }

    // Validate content
    if (!content.trim()) {
      errors.push('Email content is required');
    } else {
      // Check for common issues
      if (content.length < 50) {
        warnings.push('Email content is very short');
      }
      
      if (!content.includes('{{') && content.includes('${')) {
        warnings.push('Template variables detected but may not be processed correctly');
      }
      
      if (content.toLowerCase().includes('unsubscribe') && !content.includes('http')) {
        warnings.push('Unsubscribe mention found but no unsubscribe link detected');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
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

  /**
   * Sanitize email content
   */
  static sanitizeContent(content: string): string {
    // Remove potentially dangerous content
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Check if email content contains required RFQ information
   */
  static validateRFQContent(content: string, rfq: RFQ): EmailValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required RFQ information
    const requiredFields = [
      { field: 'rfqNumber', value: rfq.rfqNumber, name: 'RFQ Number' },
      { field: 'title', value: rfq.title, name: 'RFQ Title' }
    ];

    requiredFields.forEach(({ value, name }) => {
      if (value && !content.includes(value)) {
        warnings.push(`${name} (${value}) not found in email content`);
      }
    });

    // Check for deadline information
    if (rfq.responseDeadline && !content.toLowerCase().includes('deadline')) {
      warnings.push('Response deadline information may be missing from content');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate email size
   */
  static validateEmailSize(content: string, attachments?: Array<{ content: string | Buffer }>): EmailValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Calculate content size
    const contentSize = new Blob([content]).size;
    const maxContentSize = 10 * 1024 * 1024; // 10MB

    if (contentSize > maxContentSize) {
      errors.push(`Email content too large: ${(contentSize / 1024 / 1024).toFixed(2)}MB (max 10MB)`);
    }

    // Calculate attachment sizes
    if (attachments) {
      let totalAttachmentSize = 0;
      attachments.forEach(attachment => {
        const size = typeof attachment.content === 'string' 
          ? new Blob([attachment.content]).size
          : attachment.content.length;
        totalAttachmentSize += size;
      });

      const maxAttachmentSize = 25 * 1024 * 1024; // 25MB
      if (totalAttachmentSize > maxAttachmentSize) {
        errors.push(`Attachments too large: ${(totalAttachmentSize / 1024 / 1024).toFixed(2)}MB (max 25MB)`);
      }

      if (totalAttachmentSize > 10 * 1024 * 1024) {
        warnings.push('Large attachments may cause delivery issues');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}