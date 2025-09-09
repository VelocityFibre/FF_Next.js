import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { dbLogger } from './logger';

/**
 * Wraps Neon SQL queries with automatic logging and performance tracking
 */
export function createLoggedSql(databaseUrl: string): NeonQueryFunction<false, false> {
  const baseSql = neon(databaseUrl);
  
  return new Proxy(baseSql, {
    apply: async (target, thisArg, argumentsList) => {
      const startTime = Date.now();
      const [strings, ...values] = argumentsList;
      
      // Reconstruct query for logging (safely, without actual values)
      const query = strings.join('$?');
      const queryPreview = query.length > 200 ? query.substring(0, 200) + '...' : query;
      
      try {
        // Execute the query
        const result = await target.apply(thisArg, argumentsList);
        const duration = Date.now() - startTime;
        
        // Log query details
        const logData = {
          query: queryPreview,
          paramCount: values.length,
          rowCount: Array.isArray(result) ? result.length : 1,
          duration: `${duration}ms`,
          slow: duration > 1000
        };
        
        // Log based on performance
        if (duration > 1000) {
          dbLogger.warn(logData, `Slow query detected: ${duration}ms`);
        } else if (process.env.LOG_LEVEL === 'debug') {
          dbLogger.debug(logData, 'Database query executed');
        }
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        // Log query error
        dbLogger.error({
          query: queryPreview,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: `${duration}ms`,
          paramCount: values.length
        }, 'Database query failed');
        
        throw error;
      }
    }
  }) as NeonQueryFunction<false, false>;
}

/**
 * Track specific business operations with detailed logging
 */
export function logBusinessOperation(
  operation: string,
  data: Record<string, any>,
  result?: any
) {
  dbLogger.info({
    operation,
    ...data,
    ...(result && { result })
  }, `Business operation: ${operation}`);
}

/**
 * Log successful create operations
 */
export function logCreate(entity: string, id: string | number, data?: any) {
  dbLogger.info({
    operation: 'CREATE',
    entity,
    id,
    ...(data && { details: data })
  }, `Created ${entity} with ID: ${id}`);
}

/**
 * Log successful update operations
 */
export function logUpdate(entity: string, id: string | number, changes?: any) {
  dbLogger.info({
    operation: 'UPDATE',
    entity,
    id,
    ...(changes && { changes })
  }, `Updated ${entity} with ID: ${id}`);
}

/**
 * Log successful delete operations
 */
export function logDelete(entity: string, id: string | number) {
  dbLogger.info({
    operation: 'DELETE',
    entity,
    id
  }, `Deleted ${entity} with ID: ${id}`);
}

/**
 * Log authentication events
 */
export function logAuth(event: 'login' | 'logout' | 'signup' | 'failed', userId?: string, details?: any) {
  const logger = event === 'failed' ? dbLogger.warn : dbLogger.info;
  
  logger({
    event: `auth.${event}`,
    userId,
    ...(details && { details })
  }, `Authentication event: ${event}`);
}