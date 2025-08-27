/**
 * Lodash Replacement Utilities
 * High-performance, tree-shakeable replacements for common lodash functions
 * Eliminates security vulnerabilities and reduces bundle size
 */

/**
 * Debounce function with performance optimization
 * Replaces lodash.debounce with zero vulnerabilities
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean; maxWait?: number } = {}
): T & { cancel: () => void; flush: () => ReturnType<T> | undefined } {
  const { leading = false, trailing = true, maxWait } = options;
  
  let timeoutId: NodeJS.Timeout | null = null;
  let maxTimeoutId: NodeJS.Timeout | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  let result: ReturnType<T> | undefined;
  
  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs;
    const thisArg = lastThis;
    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }
  
  function leadingEdge(time: number): ReturnType<T> {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, delay);
    return leading ? invokeFunc(time) : result;
  }
  
  function remainingWait(time: number): number {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = delay - timeSinceLastCall;
    
    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }
  
  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    
    return (
      lastCallTime === null ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }
  
  function timerExpired(): ReturnType<T> | void {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  }
  
  function trailingEdge(time: number): ReturnType<T> {
    timeoutId = null;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }
  
  let lastArgs: Parameters<T> | undefined;
  let lastThis: any;
  
  function cancel(): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (maxTimeoutId !== null) {
      clearTimeout(maxTimeoutId);
      maxTimeoutId = null;
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = undefined;
  }
  
  function flush(): ReturnType<T> | undefined {
    return timeoutId === null ? result : trailingEdge(Date.now());
  }
  
  function debounced(...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;
    
    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, delay);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, delay);
    }
    return result;
  }
  
  debounced.cancel = cancel;
  debounced.flush = flush;
  
  return debounced as T & { cancel: () => void; flush: () => ReturnType<T> | undefined };
}

/**
 * Throttle function with performance optimization
 * Replaces lodash.throttle with zero vulnerabilities
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void; flush: () => ReturnType<T> | undefined } {
  const { leading = true, trailing = true } = options;
  return debounce(func, wait, { leading, trailing, maxWait: wait });
}

/**
 * Deep clone function with performance optimization
 * Replaces lodash.cloneDeep with better performance
 */
export function cloneDeep<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  
  if (value instanceof Date) {
    return new Date(value.getTime()) as unknown as T;
  }
  
  if (value instanceof Array) {
    return value.map(item => cloneDeep(item)) as unknown as T;
  }
  
  if (value instanceof Set) {
    return new Set(Array.from(value, item => cloneDeep(item))) as unknown as T;
  }
  
  if (value instanceof Map) {
    return new Map(Array.from(value, ([k, v]) => [cloneDeep(k), cloneDeep(v)])) as unknown as T;
  }
  
  if (typeof value === 'object' && value.constructor === Object) {
    const cloned = {} as T;
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        (cloned as any)[key] = cloneDeep((value as any)[key]);
      }
    }
    return cloned;
  }
  
  // For other objects, return as-is (functions, etc.)
  return value;
}

/**
 * IsEqual function with performance optimization
 * Replaces lodash.isEqual with better performance
 */
export function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return a === b;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!isEqual(a[key], b[key])) return false;
  }
  
  return true;
}

/**
 * Pick function with performance optimization
 * Replaces lodash.pick with better performance and type safety
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  object: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in object) {
      result[key] = object[key];
    }
  }
  return result;
}

/**
 * Omit function with performance optimization
 * Replaces lodash.omit with better performance and type safety
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  object: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...object } as any;
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Merge function with performance optimization
 * Replaces lodash.merge with better performance
 */
export function merge<T extends Record<string, any>>(...sources: Partial<T>[]): T {
  const result = {} as T;
  
  for (const source of sources) {
    if (source == null) continue;
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const currentValue = result[key];
        
        if (
          sourceValue &&
          currentValue &&
          typeof sourceValue === 'object' &&
          typeof currentValue === 'object' &&
          !Array.isArray(sourceValue) &&
          !Array.isArray(currentValue)
        ) {
          result[key] = merge(currentValue, sourceValue);
        } else {
          result[key] = sourceValue as any;
        }
      }
    }
  }
  
  return result;
}

/**
 * Flatten array function with performance optimization
 * Replaces lodash.flatten with better performance
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  const result: T[] = [];
  for (const item of array) {
    if (Array.isArray(item)) {
      result.push(...item);
    } else {
      result.push(item);
    }
  }
  return result;
}

/**
 * FlattenDeep function with performance optimization
 * Replaces lodash.flattenDeep with better performance
 */
export function flattenDeep(array: any[]): any[] {
  const result: any[] = [];
  const stack = [...array];
  
  while (stack.length) {
    const next = stack.pop();
    if (Array.isArray(next)) {
      stack.push(...next);
    } else {
      result.push(next);
    }
  }
  
  return result.reverse();
}

/**
 * Unique array function with performance optimization
 * Replaces lodash.uniq with better performance
 */
export function uniq<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * UniqueBy function with performance optimization
 * Replaces lodash.uniqBy with better performance
 */
export function uniqBy<T>(array: T[], iteratee: (item: T) => any): T[] {
  const seen = new Set();
  const result: T[] = [];
  
  for (const item of array) {
    const key = iteratee(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  
  return result;
}

/**
 * Chunk array function with performance optimization
 * Replaces lodash.chunk with better performance
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) return [];
  
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * GroupBy function with performance optimization
 * Replaces lodash.groupBy with better performance
 */
export function groupBy<T>(
  array: T[],
  iteratee: (item: T) => string | number
): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  
  for (const item of array) {
    const key = String(iteratee(item));
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }
  
  return result;
}

/**
 * KeyBy function with performance optimization
 * Replaces lodash.keyBy with better performance
 */
export function keyBy<T>(
  array: T[],
  iteratee: (item: T) => string | number
): Record<string, T> {
  const result: Record<string, T> = {};
  
  for (const item of array) {
    const key = String(iteratee(item));
    result[key] = item;
  }
  
  return result;
}

/**
 * Performance monitoring for utility functions
 */
export class LodashReplacementMetrics {
  private static metrics = new Map<string, { calls: number; totalTime: number }>();
  
  static trackPerformance<T extends (...args: any[]) => any>(
    name: string,
    func: T
  ): T {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = func(...args);
      const end = performance.now();
      
      const current = this.metrics.get(name) || { calls: 0, totalTime: 0 };
      this.metrics.set(name, {
        calls: current.calls + 1,
        totalTime: current.totalTime + (end - start)
      });
      
      return result;
    }) as T;
  }
  
  static getMetrics(): Record<string, { calls: number; avgTime: number; totalTime: number }> {
    const result: Record<string, { calls: number; avgTime: number; totalTime: number }> = {};
    
    for (const [name, metrics] of this.metrics) {
      result[name] = {
        calls: metrics.calls,
        totalTime: Math.round(metrics.totalTime * 100) / 100,
        avgTime: Math.round((metrics.totalTime / metrics.calls) * 100) / 100
      };
    }
    
    return result;
  }
  
  static resetMetrics(): void {
    this.metrics.clear();
  }
}

// Export performance-tracked versions
export const trackedDebounce = LodashReplacementMetrics.trackPerformance('debounce', debounce);
export const trackedThrottle = LodashReplacementMetrics.trackPerformance('throttle', throttle);
export const trackedCloneDeep = LodashReplacementMetrics.trackPerformance('cloneDeep', cloneDeep);
export const trackedIsEqual = LodashReplacementMetrics.trackPerformance('isEqual', isEqual);

// Default exports for easy replacement
export default {
  debounce,
  throttle,
  cloneDeep,
  isEqual,
  pick,
  omit,
  merge,
  flatten,
  flattenDeep,
  uniq,
  uniqBy,
  chunk,
  groupBy,
  keyBy,
  // Tracked versions
  trackedDebounce,
  trackedThrottle,
  trackedCloneDeep,
  trackedIsEqual,
  // Metrics
  LodashReplacementMetrics
};
