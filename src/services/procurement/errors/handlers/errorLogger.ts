/**
 * Error Logger
 * Handle error logging with severity levels and context
 */

import { ProcurementError } from '../base.errors';
import { getErrorSeverity } from '../error.constants';
import { ErrorLogContext, IErrorLogger } from './types';

export class ProcurementErrorLogger implements IErrorLogger {
  /**
   * Log error with automatic severity detection
   */
  log(error: unknown, context: ErrorLogContext): void {
    const severity = error instanceof ProcurementError 
      ? getErrorSeverity(error.code)
      : 'critical';

    switch (severity) {
      case 'critical':
        this.logCritical(error, context);
        break;
      case 'high':
        this.logHigh(error, context);
        break;
      case 'medium':
        this.logMedium(error, context);
        break;
      case 'low':
      default:
        this.logLow(error, context);
        break;
    }
  }

  /**
   * Log critical severity error
   */
  logCritical(error: unknown, context: ErrorLogContext): void {
    const logData = this.createLogData(error, context, 'critical');
    console.error('[ProcurementError:CRITICAL]', logData);
    
    // Send to monitoring service in production
    this.sendToMonitoringService(error, context, 'critical');
  }

  /**
   * Log high severity error
   */
  logHigh(error: unknown, context: ErrorLogContext): void {
    const logData = this.createLogData(error, context, 'high');
    console.error('[ProcurementError:HIGH]', logData);
    
    // Send to monitoring service in production
    this.sendToMonitoringService(error, context, 'high');
  }

  /**
   * Log medium severity error
   */
  logMedium(error: unknown, context: ErrorLogContext): void {
    const logData = this.createLogData(error, context, 'medium');
    console.warn('[ProcurementError:MEDIUM]', logData);
  }

  /**
   * Log low severity error
   */
  logLow(error: unknown, context: ErrorLogContext): void {
    const logData = this.createLogData(error, context, 'low');
    console.log('[ProcurementError:LOW]', logData);
  }

  /**
   * Create structured log data
   */
  private createLogData(
    error: unknown, 
    context: ErrorLogContext, 
    severity: string
  ): Record<string, any> {
    const sanitizedContext = this.sanitizeErrorContext(context);
    
    return {
      timestamp: new Date().toISOString(),
      severity,
      context: sanitizedContext,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error instanceof ProcurementError ? error.toJSON() : {})
      } : {
        error: String(error)
      }
    };
  }

  /**
   * Sanitize error context to remove sensitive information
   */
  private sanitizeErrorContext(context: ErrorLogContext): Record<string, any> {
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'credentials', 'authorization'];
    const sanitized = { ...context };

    // Remove sensitive information
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key as keyof typeof sanitized] = '[REDACTED]' as any;
      }
    });

    // Handle nested objects
    if (sanitized.additionalInfo) {
      sanitized.additionalInfo = this.sanitizeNestedObject(sanitized.additionalInfo);
    }

    // Limit size to prevent log overflow
    const serialized = JSON.stringify(sanitized, null, 0);
    return JSON.parse(serialized.substring(0, 2000));
  }

  /**
   * Sanitize nested object recursively
   */
  private sanitizeNestedObject(obj: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'credentials', 'authorization'];
    const sanitized = { ...obj };

    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeNestedObject(sanitized[key]);
      }
    });

    return sanitized;
  }

  /**
   * Send error to external monitoring service
   */
  private sendToMonitoringService(
    error: unknown, 
    context: ErrorLogContext, 
    severity: string
  ): void {
    // In production, this would integrate with services like:
    // - Sentry
    // - DataDog
    // - New Relic
    // - Custom logging service
    
    // Example integration:
    // if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    //   Sentry.captureException(error, {
    //     level: severity as any,
    //     contexts: { procurement: context }
    //   });
    // }

    // For now, just ensure we don't break in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('[ProcurementError:MonitoringService]', 'Would send to monitoring service:', {
        severity,
        error: error instanceof Error ? error.message : String(error),
        context
      });
    }
  }

  /**
   * Create performance log entry
   */
  logPerformance(
    operation: string,
    duration: number,
    context: ErrorLogContext
  ): void {
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'performance',
      operation,
      duration,
      context: this.sanitizeErrorContext(context)
    };

    if (duration > 5000) { // Log slow operations (>5s)
      console.warn('[ProcurementPerformance:SLOW]', logData);
    } else if (duration > 1000) { // Log medium operations (>1s)
      console.log('[ProcurementPerformance:MEDIUM]', logData);
    }
  }

  /**
   * Create audit log entry
   */
  logAudit(
    action: string,
    resource: string,
    userId: string,
    context: ErrorLogContext
  ): void {
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'audit',
      action,
      resource,
      userId,
      context: this.sanitizeErrorContext(context)
    };

    console.log('[ProcurementAudit]', logData);
  }
}