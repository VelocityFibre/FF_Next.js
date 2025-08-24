/**
 * Audit Logger Module
 * Central export for the procurement audit logging system
 */

import { AuditLoggerCore } from './AuditLoggerCore';
import { DomainLoggers } from './domainLoggers';

// Export all types
export * from './types';

// Export utility functions
export * from './utils';

/**
 * Main AuditLogger class combining core and domain-specific functionality
 */
class AuditLogger extends AuditLoggerCore {
  public domains: DomainLoggers;
  
  // Domain-specific methods for backward compatibility
  public logBOQAction: DomainLoggers['logBOQAction'];
  public logRFQAction: DomainLoggers['logRFQAction'];
  public logQuoteAction: DomainLoggers['logQuoteAction'];
  public logStockAction: DomainLoggers['logStockAction'];
  public logBulkOperation: DomainLoggers['logBulkOperation'];
  public logSecurityEvent: DomainLoggers['logSecurityEvent'];

  constructor() {
    super();
    this.domains = new DomainLoggers(this);
    
    // Bind domain-specific methods after domains is initialized
    this.logBOQAction = this.domains.logBOQAction.bind(this.domains);
    this.logRFQAction = this.domains.logRFQAction.bind(this.domains);
    this.logQuoteAction = this.domains.logQuoteAction.bind(this.domains);
    this.logStockAction = this.domains.logStockAction.bind(this.domains);
    this.logBulkOperation = this.domains.logBulkOperation.bind(this.domains);
    this.logSecurityEvent = this.domains.logSecurityEvent.bind(this.domains);
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();

// Graceful shutdown handlers to flush pending logs
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('Flushing audit logs before shutdown...');
    await auditLogger.flush();
  });

  process.on('SIGINT', async () => {
    console.log('Flushing audit logs before shutdown...');
    await auditLogger.flush();
  });
}

export default auditLogger;