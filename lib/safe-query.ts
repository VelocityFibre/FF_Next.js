/**
 * Safe Query Wrapper
 * Wraps database queries with error handling to prevent crashes
 * Returns empty/default data on failure instead of throwing
 */

export interface QueryOptions {
  fallbackData?: any;
  logError?: boolean;
  retryCount?: number;
  timeout?: number;
}

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Wraps a database query with error handling
 * @param queryFn - The database query function to execute
 * @param options - Options for error handling and fallback
 * @returns Query result or fallback data on error
 */
export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  options: QueryOptions & { fallbackData: T }
): Promise<T> {
  const {
    fallbackData,
    logError = true,
    retryCount = 1,
    timeout = 30000 // 30 seconds default timeout
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new DatabaseError(`Database query timed out after ${timeout}ms`));
        }, timeout);
      });

      // Race between the query and timeout
      const result = await Promise.race([queryFn(), timeoutPromise]);
      
      return result;
    } catch (error) {
      lastError = error;
      
      if (logError) {
        console.error(`Database query failed (attempt ${attempt + 1}/${retryCount + 1}):`, error);
      }

      // If this isn't the last retry, wait before retrying
      if (attempt < retryCount) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // All attempts failed, return fallback data
  if (logError) {
    console.warn('All database query attempts failed. Returning fallback data.');
  }

  return fallbackData;
}

/**
 * Wraps a database query that returns an array
 * @param queryFn - The database query function to execute
 * @param options - Options for error handling
 * @returns Query result or empty array on error
 */
export async function safeArrayQuery<T>(
  queryFn: () => Promise<T[]>,
  options?: Omit<QueryOptions, 'fallbackData'>
): Promise<T[]> {
  return safeQuery(queryFn, { ...options, fallbackData: [] });
}

/**
 * Wraps a database query that returns a single object
 * @param queryFn - The database query function to execute
 * @param options - Options for error handling
 * @returns Query result or null on error
 */
export async function safeObjectQuery<T>(
  queryFn: () => Promise<T | null>,
  options?: Omit<QueryOptions, 'fallbackData'>
): Promise<T | null> {
  return safeQuery(queryFn, { ...options, fallbackData: null });
}

/**
 * Wraps a database mutation with error handling
 * @param mutationFn - The database mutation function to execute
 * @param options - Options for error handling
 * @returns Success status and result/error
 */
export async function safeMutation<T>(
  mutationFn: () => Promise<T>,
  options?: QueryOptions
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await safeQuery(mutationFn, {
      ...options,
      fallbackData: undefined,
      logError: options?.logError ?? true,
    });
    
    if (data === undefined) {
      return {
        success: false,
        error: 'Database mutation failed after all retry attempts',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Helper to check if the database is available
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    const response = await fetch('/api/health/db', {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}