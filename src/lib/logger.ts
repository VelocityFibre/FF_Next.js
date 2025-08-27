import { log } from '@/lib/logger';

/**
 * Logger Service
 * Proper logging replacement for console.* statements
 * Zero Tolerance Enforcement: No console.* statements allowed
 */

export interface LogData {
  [key: string]: any;
}

export interface LoggerOptions {
  enableConsole?: boolean;
  enableFile?: boolean;
  level?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Logger class for structured logging
 * Replaces all console.* statements in the application
 */
class Logger {
  private options: LoggerOptions = {
    enableConsole: process.env.NODE_ENV === 'development',
    enableFile: false,
    level: 'info',
  };

  constructor(options?: Partial<LoggerOptions>) {
    this.options = { ...this.options, ...options };
  }

  /**
   * Log debug messages
   * @param message - Log message
   * @param data - Additional data to log
   * @param component - Component name for context
   */
  debug(message: string, data?: LogData, component?: string): void {
    this.log('debug', message, data, component);
  }

  /**
   * Log info messages
   * @param message - Log message
   * @param data - Additional data to log
   * @param component - Component name for context
   */
  info(message: string, data?: LogData, component?: string): void {
    this.log('info', message, data, component);
  }

  /**
   * Log warning messages
   * @param message - Log message
   * @param data - Additional data to log
   * @param component - Component name for context
   */
  warn(message: string, data?: LogData, component?: string): void {
    this.log('warn', message, data, component);
  }

  /**
   * Log error messages
   * @param message - Log message
   * @param data - Additional data to log
   * @param component - Component name for context
   */
  error(message: string, data?: LogData, component?: string): void {
    this.log('error', message, data, component);
  }

  /**
   * Internal logging method
   * @param level - Log level
   * @param message - Log message
   * @param data - Additional data
   * @param component - Component name
   */
  private log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: LogData,
    component?: string
  ): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const prefix = component ? `[${component}]` : '';
    const logMessage = `${timestamp} [${level.toUpperCase()}] ${prefix} ${message}`;

    if (this.options.enableConsole) {
      // Only in development - controlled console output
      if (process.env.NODE_ENV === 'development') {
        switch (level) {
          case 'debug':
            // eslint-disable-next-line no-console
            log.debug(logMessage, { data: data || '' }, 'logger');
            break;
          case 'info':
            // eslint-disable-next-line no-console
            log.info(logMessage, { data: data || '' }, 'logger');
            break;
          case 'warn':
            // eslint-disable-next-line no-console
            log.warn(logMessage, { data: data || '' }, 'logger');
            break;
          case 'error':
            // eslint-disable-next-line no-console
            log.error(logMessage, { data: data || '' }, 'logger');
            break;
        }
      }
    }

    // In production, logs could be sent to external service
    // This prevents all console.* usage in production
  }

  /**
   * Check if we should log at this level
   * @param level - Log level to check
   * @returns Boolean indicating if logging should occur
   */
  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.options.level || 'info');
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }
}

// Export singleton logger instance
export const log = new Logger();

// Export Logger class for custom instances
export { Logger };

// Default export for convenience
export default log;