import pino from 'pino';
import type { Logger } from 'pino';

// Sensitive field patterns to redact
const REDACTED_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'authorization',
  'cookie',
  'sessionId',
  'session_id',
  'creditCard',
  'credit_card',
  'ssn',
  'socialSecurity',
  'social_security',
  'bankAccount',
  'bank_account',
  'privateKey',
  'private_key',
  'clientSecret',
  'client_secret',
  'refreshToken',
  'refresh_token',
  'accessToken',
  'access_token',
  'idToken',
  'id_token'
];

// Get log level from environment variable
const getLogLevel = (): string => {
  const level = process.env.LOG_LEVEL?.toLowerCase() || 'info';
  const validLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];
  return validLevels.includes(level) ? level : 'info';
};

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Configure pino options
const pinoConfig: pino.LoggerOptions = {
  level: getLogLevel(),
  
  // Use pino-pretty in development for better readability
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: false,
        messageFormat: '{msg}',
        errorLikeObjectKeys: ['err', 'error'],
        customColors: 'error:red,warn:yellow,info:green,debug:blue',
        levelFirst: false,
        sync: true // Synchronous mode to avoid thread issues in development
      }
    }
  }),
  
  // Production configuration
  ...(isProduction && {
    formatters: {
      level: (label) => {
        return { level: label };
      }
    }
  }),
  
  // Redaction configuration
  redact: {
    paths: REDACTED_FIELDS.flatMap(field => [
      field,
      `*.${field}`,
      `*.*.${field}`,
      `req.headers.${field}`,
      `res.headers.${field}`,
      `error.${field}`,
      `err.${field}`
    ]),
    censor: '[REDACTED]'
  },
  
  // Base configuration
  base: {
    env: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version
  },
  
  // Serializers for common objects
  serializers: {
    req: (req: any) => ({
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      params: req.params,
      headers: {
        ...req.headers,
        authorization: req.headers?.authorization ? '[REDACTED]' : undefined,
        cookie: req.headers?.cookie ? '[REDACTED]' : undefined
      },
      remoteAddress: req.connection?.remoteAddress,
      remotePort: req.connection?.remotePort
    }),
    
    res: (res: any) => ({
      statusCode: res.statusCode,
      headers: {
        ...res.getHeaders?.(),
        'set-cookie': res.getHeaders?.()['set-cookie'] ? '[REDACTED]' : undefined
      }
    }),
    
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err
  },
  
  // Timestamp configuration
  timestamp: pino.stdTimeFunctions.isoTime,
  
  // Message key
  messageKey: 'msg',
  
  // Error key
  errorKey: 'error'
};

// Create the base logger
const baseLogger = pino(pinoConfig);

// Create child loggers for different modules
export const createLogger = (module: string): Logger => {
  return baseLogger.child({ module });
};

// Export different logger instances for different parts of the application
export const logger = baseLogger;
export const apiLogger = createLogger('api');
export const dbLogger = createLogger('database');
export const authLogger = createLogger('auth');
export const sowLogger = createLogger('sow');
export const scriptLogger = createLogger('script');
export const migrationLogger = createLogger('migration');
export const analyticsLogger = createLogger('analytics');
export const procurementLogger = createLogger('procurement');
export const fieldOpsLogger = createLogger('field-ops');

// Helper function to log API requests
export const logApiRequest = (req: any, res: any, responseTime: number, error?: any) => {
  const logData = {
    req,
    res,
    responseTime,
    ...(error && { error })
  };
  
  if (error) {
    apiLogger.error(logData, `${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`);
  } else if (res.statusCode >= 400) {
    apiLogger.warn(logData, `${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`);
  } else {
    apiLogger.info(logData, `${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`);
  }
};

// Helper function to safely log objects
export const safeLog = (level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any) => {
  try {
    // Remove circular references
    const safeData = data ? JSON.parse(JSON.stringify(data)) : undefined;
    logger[level](safeData, message);
  } catch (err) {
    logger.error({ originalMessage: message, error: err }, 'Failed to log message');
  }
};

// Export log levels for configuration
export const LOG_LEVELS = {
  FATAL: 'fatal',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace',
  SILENT: 'silent'
} as const;

export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

// Utility to check if a log level is enabled
export const isLogLevelEnabled = (level: LogLevel): boolean => {
  return logger.isLevelEnabled(level);
};

export default logger;