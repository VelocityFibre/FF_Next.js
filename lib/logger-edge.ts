// Edge-compatible logger for middleware
// Pino doesn't work in Edge Runtime, so we provide a simple console-based implementation

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },
  child: () => logger,
  isLevelEnabled: () => true
};

export const log = {
  info: (...args: any[]) => logger.info(...args),
  error: (...args: any[]) => logger.error(...args),
  warn: (...args: any[]) => logger.warn(...args),
  debug: (...args: any[]) => logger.debug(...args)
};

export const createLogger = (module: string) => logger;
export const apiLogger = logger;
export const dbLogger = logger;
export const authLogger = logger;
export const sowLogger = logger;
export const scriptLogger = logger;
export const migrationLogger = logger;
export const analyticsLogger = logger;
export const procurementLogger = logger;
export const fieldOpsLogger = logger;

export default logger;