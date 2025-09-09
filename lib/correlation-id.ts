import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { apiLogger } from './logger';

// Header name for correlation ID
export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const REQUEST_ID_HEADER = 'x-request-id';

// AsyncLocalStorage to maintain correlation ID across async operations
import { AsyncLocalStorage } from 'async_hooks';

const correlationStore = new AsyncLocalStorage<{ correlationId: string; requestId: string }>();

/**
 * Generate a new correlation ID
 */
export function generateCorrelationId(): string {
  return `corr_${randomUUID()}`;
}

/**
 * Generate a new request ID
 */
export function generateRequestId(): string {
  return `req_${randomUUID()}`;
}

/**
 * Get the current correlation ID from async context
 */
export function getCorrelationId(): string | undefined {
  return correlationStore.getStore()?.correlationId;
}

/**
 * Get the current request ID from async context
 */
export function getRequestId(): string | undefined {
  return correlationStore.getStore()?.requestId;
}

/**
 * Run a function with correlation context
 */
export function withCorrelation<T>(
  correlationId: string,
  requestId: string,
  fn: () => T
): T {
  return correlationStore.run({ correlationId, requestId }, fn);
}

/**
 * Middleware to add correlation ID to requests
 */
export function correlationMiddleware(handler: (...args: any[]) => any) {
  return async (req: NextRequest, context?: any) => {
    // Get or generate correlation ID
    const correlationId = 
      req.headers.get(CORRELATION_ID_HEADER) || 
      generateCorrelationId();
    
    // Generate request ID for this specific request
    const requestId = generateRequestId();
    
    // Run the handler with correlation context
    return withCorrelation(correlationId, requestId, async () => {
      // Log request with correlation ID
      apiLogger.info({
        correlationId,
        requestId,
        method: req.method,
        url: req.url,
        headers: {
          'user-agent': req.headers.get('user-agent'),
          'content-type': req.headers.get('content-type')
        }
      }, 'Request received');
      
      try {
        // Execute the handler
        const response = await handler(req, context);
        
        // Add correlation ID to response headers
        if (response.headers) {
          response.headers.set(CORRELATION_ID_HEADER, correlationId);
          response.headers.set(REQUEST_ID_HEADER, requestId);
        }
        
        // Log response with correlation ID
        apiLogger.info({
          correlationId,
          requestId,
          method: req.method,
          url: req.url,
          status: response.status
        }, 'Request completed');
        
        return response;
      } catch (error: any) {
        // Log error with correlation ID
        apiLogger.error({
          correlationId,
          requestId,
          method: req.method,
          url: req.url,
          error: error.message,
          stack: error.stack
        }, 'Request failed');
        
        throw error;
      }
    });
  };
}

/**
 * Create a child logger with correlation context
 */
export function createCorrelatedLogger(module: string) {
  const correlationId = getCorrelationId();
  const requestId = getRequestId();
  
  if (correlationId || requestId) {
    return apiLogger.child({
      module,
      correlationId,
      requestId
    });
  }
  
  return apiLogger.child({ module });
}

/**
 * Express middleware for correlation ID
 */
export function expressCorrelationMiddleware() {
  return (req: any, res: any, next: any) => {
    // Get or generate correlation ID
    const correlationId = 
      req.headers[CORRELATION_ID_HEADER] || 
      req.headers['x-amzn-trace-id'] || // AWS trace ID
      generateCorrelationId();
    
    // Generate request ID
    const requestId = generateRequestId();
    
    // Add to request object
    req.correlationId = correlationId;
    req.requestId = requestId;
    
    // Add to response headers
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    res.setHeader(REQUEST_ID_HEADER, requestId);
    
    // Run with correlation context
    withCorrelation(correlationId, requestId, () => {
      next();
    });
  };
}