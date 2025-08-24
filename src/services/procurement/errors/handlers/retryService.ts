/**
 * Retry Service
 * Handle operation retries with exponential backoff
 */

import { ProcurementError } from '../base.errors';
import { RetryConfig, IRetryService } from './types';

export class ProcurementRetryService implements IRetryService {
  private defaultConfig: Required<RetryConfig> = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true
  };

  /**
   * Retry operation with exponential backoff for retryable errors
   */
  async retryOnError<T>(
    operation: () => Promise<T>,
    config?: RetryConfig
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let lastError: unknown;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry on final attempt or non-retryable errors
        if (attempt === finalConfig.maxRetries || !this.isRetryableError(error)) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, finalConfig);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Check if an error is retryable based on its properties
   */
  isRetryableError(error: unknown): boolean {
    if (error instanceof ProcurementError) {
      const retryableCodes = [
        'EXTERNAL_SERVICE_ERROR',
        'API_RATE_LIMIT',
        'SYNC_ERROR',
        'INTERNAL_ERROR',
        'NETWORK_ERROR',
        'TIMEOUT_ERROR'
      ];
      return retryableCodes.includes(error.code);
    }

    if (error instanceof Error) {
      // Network errors are generally retryable
      const retryablePatterns = [
        'ECONNREFUSED',
        'ECONNRESET',
        'ETIMEDOUT',
        'timeout',
        'network',
        'socket',
        'ENOTFOUND',
        'ECONNABORTED'
      ];

      return retryablePatterns.some(pattern => 
        error.message.toLowerCase().includes(pattern.toLowerCase())
      );
    }

    return false;
  }

  /**
   * Retry with custom condition
   */
  async retryOnCondition<T>(
    operation: () => Promise<T>,
    shouldRetry: (error: unknown, attempt: number) => boolean,
    config?: RetryConfig
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let lastError: unknown;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry on final attempt or if condition is not met
        if (attempt === finalConfig.maxRetries || !shouldRetry(error, attempt)) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, finalConfig);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Retry with circuit breaker pattern
   */
  async retryWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    circuitBreakerKey: string,
    config?: RetryConfig
  ): Promise<T> {
    // Simple in-memory circuit breaker state
    const circuitState = this.getCircuitState(circuitBreakerKey);
    
    // If circuit is open, fail fast
    if (circuitState.state === 'open') {
      if (Date.now() - circuitState.lastFailureTime < circuitState.timeout) {
        throw new Error(`Circuit breaker is open for ${circuitBreakerKey}`);
      } else {
        // Move to half-open state
        circuitState.state = 'half-open';
      }
    }

    try {
      const result = await this.retryOnError(operation, config);
      
      // Success - reset circuit breaker
      circuitState.failureCount = 0;
      circuitState.state = 'closed';
      
      return result;
    } catch (error) {
      // Failure - update circuit breaker
      circuitState.failureCount++;
      circuitState.lastFailureTime = Date.now();
      
      // Open circuit if failure threshold exceeded
      if (circuitState.failureCount >= circuitState.threshold) {
        circuitState.state = 'open';
      }
      
      throw error;
    }
  }

  /**
   * Bulk retry operations with concurrency control
   */
  async retryBulkOperations<T>(
    operations: Array<() => Promise<T>>,
    config?: RetryConfig & { concurrency?: number }
  ): Promise<Array<{ success: boolean; result?: T; error?: unknown }>> {
    const concurrency = config?.concurrency || 3;
    const results: Array<{ success: boolean; result?: T; error?: unknown }> = [];
    
    // Process operations in chunks based on concurrency
    for (let i = 0; i < operations.length; i += concurrency) {
      const chunk = operations.slice(i, i + concurrency);
      
      const chunkPromises = chunk.map(async (operation, index) => {
        try {
          const result = await this.retryOnError(operation, config);
          return { success: true, result };
        } catch (error) {
          return { success: false, error };
        }
      });
      
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }
    
    return results;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number, config: Required<RetryConfig>): number {
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
    let delay = Math.min(exponentialDelay, config.maxDelay);
    
    if (config.jitter) {
      // Add jitter to prevent thundering herd
      const jitterRange = delay * 0.1; // ±10% jitter
      delay += (Math.random() - 0.5) * 2 * jitterRange;
    }
    
    return Math.max(0, Math.round(delay));
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Simple in-memory circuit breaker state management
   */
  private circuitStates = new Map<string, {
    state: 'closed' | 'open' | 'half-open';
    failureCount: number;
    lastFailureTime: number;
    threshold: number;
    timeout: number;
  }>();

  private getCircuitState(key: string) {
    if (!this.circuitStates.has(key)) {
      this.circuitStates.set(key, {
        state: 'closed',
        failureCount: 0,
        lastFailureTime: 0,
        threshold: 5, // Open circuit after 5 failures
        timeout: 60000 // Keep circuit open for 1 minute
      });
    }
    return this.circuitStates.get(key)!;
  }

  /**
   * Reset circuit breaker state
   */
  resetCircuitBreaker(key: string): void {
    if (this.circuitStates.has(key)) {
      const state = this.circuitStates.get(key)!;
      state.state = 'closed';
      state.failureCount = 0;
      state.lastFailureTime = 0;
    }
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(key: string): {
    state: string;
    failureCount: number;
    isHealthy: boolean;
  } {
    const state = this.getCircuitState(key);
    return {
      state: state.state,
      failureCount: state.failureCount,
      isHealthy: state.state === 'closed' && state.failureCount < state.threshold / 2
    };
  }
}