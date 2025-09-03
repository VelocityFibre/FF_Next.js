# Section 5.1: Utilities & Helpers

## Overview

The FibreFlow application includes **94+ utility files** providing helper functions, shared libraries, and common utilities used throughout the codebase. These utilities ensure code reusability, maintain consistency, and simplify complex operations.

### Utility Categories
- **Core Utilities**: String manipulation, date formatting, validation
- **Data Processing**: Excel parsing, CSV handling, data transformation
- **Storage Services**: Local/session storage with encryption
- **Security Utilities**: Input sanitization, validation, encryption
- **Logging System**: Structured logging replacement for console
- **Type Utilities**: TypeScript helpers and type guards

### Directory Structure
```
src/
├── utils/              # General utility functions (11 files)
│   ├── date.ts        # Date formatting and manipulation
│   ├── format.ts      # String and number formatting
│   ├── validation.ts  # Input validation functions
│   └── ...
├── lib/               # Library modules (83 files)
│   ├── neon/         # Database utilities
│   ├── utils/        # Additional utilities
│   ├── cn.ts         # Class name utility
│   └── ...
└── services/         # Service utilities
    ├── core/         # Core services
    └── sync/         # Synchronization utilities
```

## Core Utilities

### Class Name Utility (`src/lib/cn.ts`)

A crucial utility for managing dynamic class names with Tailwind:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS conflict resolution
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage examples:
cn('px-2 py-1', 'px-3'); // => 'py-1 px-3' (later px-3 overrides px-2)
cn('bg-red-500', condition && 'bg-blue-500'); // Conditional classes
cn(['text-sm', { 'font-bold': isActive }]); // Object syntax
```

### Date Utilities (`src/utils/date.ts`)

```typescript
import { format, parseISO, isValid, differenceInDays } from 'date-fns';

/**
 * Format date for display
 */
export function formatDate(date: Date | string, formatStr = 'MMM dd, yyyy'): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    console.warn('Invalid date:', date);
    return '-';
  }
  
  return format(dateObj, formatStr);
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const days = differenceInDays(new Date(), dateObj);
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

/**
 * Calculate business days between dates
 */
export function getBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}
```

### Format Utilities (`src/utils/format.ts`)

```typescript
/**
 * Format currency values
 */
export function formatCurrency(
  amount: number | string,
  currency = 'USD',
  locale = 'en-US'
): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(value)) return '-';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals = 1): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}
```

### Validation Utilities (`src/utils/validation.ts`)

```typescript
/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone number validation
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Project code validation
 */
export function isValidProjectCode(code: string): boolean {
  const codeRegex = /^PROJ-\d{4}-\d{3}$/;
  return codeRegex.test(code);
}

/**
 * Coordinate validation
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
```

## Data Processing Utilities

### Excel Parser (`src/services/excel/parser.ts`)

```typescript
import * as XLSX from 'xlsx';

export class ExcelParser {
  /**
   * Parse Excel file to JSON
   */
  static async parseFile(file: File): Promise<{
    headers: string[];
    rows: any[];
    sheets: string[];
  }> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    
    const headers = data[0] as string[];
    const rows = data.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    return {
      headers,
      rows,
      sheets: workbook.SheetNames,
    };
  }
  
  /**
   * Export data to Excel
   */
  static exportToExcel(
    data: any[],
    filename: string,
    sheetName = 'Sheet1'
  ): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Auto-size columns
    const maxWidth = 50;
    const colWidths = Object.keys(data[0] || {}).map(key => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, maxWidth) };
    });
    worksheet['!cols'] = colWidths;
    
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }
}
```

### CSV Utilities (`src/utils/csv.ts`)

```typescript
import Papa from 'papaparse';

export const csvUtils = {
  /**
   * Parse CSV string or file
   */
  parse<T = any>(input: string | File, options?: Papa.ParseConfig): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const config: Papa.ParseConfig = {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().replace(/\s+/g, '_'),
        ...options,
        complete: (results) => resolve(results.data as T[]),
        error: reject,
      };
      
      if (typeof input === 'string') {
        Papa.parse(input, config);
      } else {
        Papa.parse(input, config);
      }
    });
  },
  
  /**
   * Convert data to CSV and download
   */
  export(data: any[], filename: string): void {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  },
};
```

## Storage Services

### Advanced Storage Core (`src/services/core/storage/`)

```typescript
import CryptoJS from 'crypto-js';
import pako from 'pako';

interface StorageOptions {
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number; // Time to live in milliseconds
  namespace?: string;
}

export class StorageCore {
  private encryptionKey: string;
  
  constructor(encryptionKey = 'default-key') {
    this.encryptionKey = encryptionKey;
  }
  
  /**
   * Set item with advanced options
   */
  async set<T>(
    key: string,
    value: T,
    storage: 'local' | 'session' | 'memory' = 'local',
    options: StorageOptions = {}
  ): Promise<void> {
    let data: any = {
      value,
      timestamp: Date.now(),
      ttl: options.ttl,
    };
    
    let serialized = JSON.stringify(data);
    
    // Compress if needed
    if (options.compress) {
      const compressed = pako.deflate(serialized, { to: 'string' });
      serialized = compressed;
      data.compressed = true;
    }
    
    // Encrypt if needed
    if (options.encrypt) {
      serialized = CryptoJS.AES.encrypt(serialized, this.encryptionKey).toString();
      data.encrypted = true;
    }
    
    const finalKey = options.namespace ? `${options.namespace}:${key}` : key;
    
    switch (storage) {
      case 'local':
        localStorage.setItem(finalKey, serialized);
        break;
      case 'session':
        sessionStorage.setItem(finalKey, serialized);
        break;
      case 'memory':
        this.memoryStorage.set(finalKey, serialized);
        break;
    }
  }
  
  /**
   * Get item with automatic decryption/decompression
   */
  async get<T>(
    key: string,
    storage: 'local' | 'session' | 'memory' = 'local',
    options: StorageOptions = {}
  ): Promise<T | null> {
    const finalKey = options.namespace ? `${options.namespace}:${key}` : key;
    
    let serialized: string | null = null;
    
    switch (storage) {
      case 'local':
        serialized = localStorage.getItem(finalKey);
        break;
      case 'session':
        serialized = sessionStorage.getItem(finalKey);
        break;
      case 'memory':
        serialized = this.memoryStorage.get(finalKey);
        break;
    }
    
    if (!serialized) return null;
    
    try {
      // Decrypt if needed
      if (options.encrypt) {
        const decrypted = CryptoJS.AES.decrypt(serialized, this.encryptionKey);
        serialized = decrypted.toString(CryptoJS.enc.Utf8);
      }
      
      // Decompress if needed
      if (options.compress) {
        serialized = pako.inflate(serialized, { to: 'string' });
      }
      
      const data = JSON.parse(serialized);
      
      // Check TTL
      if (data.ttl && Date.now() - data.timestamp > data.ttl) {
        await this.remove(key, storage, options);
        return null;
      }
      
      return data.value as T;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }
  
  /**
   * Remove item
   */
  async remove(
    key: string,
    storage: 'local' | 'session' | 'memory' = 'local',
    options: StorageOptions = {}
  ): Promise<void> {
    const finalKey = options.namespace ? `${options.namespace}:${key}` : key;
    
    switch (storage) {
      case 'local':
        localStorage.removeItem(finalKey);
        break;
      case 'session':
        sessionStorage.removeItem(finalKey);
        break;
      case 'memory':
        this.memoryStorage.delete(finalKey);
        break;
    }
  }
  
  /**
   * Get storage size
   */
  getSize(storage: 'local' | 'session' = 'local'): number {
    let total = 0;
    const store = storage === 'local' ? localStorage : sessionStorage;
    
    for (let key in store) {
      if (store.hasOwnProperty(key)) {
        total += store[key].length + key.length;
      }
    }
    
    return total;
  }
  
  private memoryStorage = new Map<string, string>();
}

// Singleton instance
export const storageCore = new StorageCore(process.env.VITE_STORAGE_KEY);
```

## Security Utilities

### Input Sanitization (`src/lib/security/sanitize.ts`)

```typescript
import DOMPurify from 'dompurify';

export const SecurityUtils = {
  /**
   * Sanitize HTML content
   */
  sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
    });
  },
  
  /**
   * Sanitize SQL-like input
   */
  sanitizeSqlInput(input: string): string {
    return input
      .replace(/['";\\]/g, '') // Remove quotes and escape characters
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove multi-line comments
      .replace(/\*\//g, '')
      .trim();
  },
  
  /**
   * Sanitize file name
   */
  sanitizeFileName(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .toLowerCase();
  },
  
  /**
   * Validate and sanitize URL
   */
  sanitizeUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null;
      }
      return parsed.toString();
    } catch {
      return null;
    }
  },
  
  /**
   * Generate secure random string
   */
  generateSecureToken(length = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },
};
```

## Logging System

### Logger Service (`src/services/core/logger.ts`)

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;
  
  /**
   * Log debug message
   */
  debug(message: string, data?: any, context?: string): void {
    this.log('debug', message, data, context);
  }
  
  /**
   * Log info message
   */
  info(message: string, data?: any, context?: string): void {
    this.log('info', message, data, context);
  }
  
  /**
   * Log warning
   */
  warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, context);
  }
  
  /**
   * Log error
   */
  error(message: string, error?: Error | any, context?: string): void {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : error;
    
    this.log('error', message, errorData, context);
  }
  
  /**
   * Core logging function
   */
  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
      context,
    };
    
    // Add to buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
    
    // Console output in development
    if (this.isDevelopment) {
      const prefix = `[${entry.timestamp.toISOString()}] [${level.toUpperCase()}]`;
      const contextStr = context ? ` [${context}]` : '';
      const fullMessage = `${prefix}${contextStr} ${message}`;
      
      switch (level) {
        case 'debug':
          console.debug(fullMessage, data);
          break;
        case 'info':
          console.info(fullMessage, data);
          break;
        case 'warn':
          console.warn(fullMessage, data);
          break;
        case 'error':
          console.error(fullMessage, data);
          break;
      }
    }
    
    // Send to remote logging service in production
    if (!this.isDevelopment && level === 'error') {
      this.sendToRemoteLogger(entry);
    }
  }
  
  /**
   * Send logs to remote service
   */
  private async sendToRemoteLogger(entry: LogEntry): Promise<void> {
    try {
      // TODO: Implement remote logging (e.g., Sentry, LogRocket)
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fail silently to avoid recursive errors
    }
  }
  
  /**
   * Get recent logs
   */
  getRecentLogs(count = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }
  
  /**
   * Clear log buffer
   */
  clearLogs(): void {
    this.logBuffer = [];
  }
}

// Singleton instance
export const logger = new Logger();
```

## Type Utilities

### Type Guards (`src/utils/typeGuards.ts`)

```typescript
/**
 * Check if value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Check if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Check if value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Check if value is a valid date
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type-safe object keys
 */
export function objectKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * Type-safe object entries
 */
export function objectEntries<T extends object>(obj: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}
```

### Async Utilities (`src/utils/async.ts`)

```typescript
/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async operation with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay: initialDelay = 1000,
    backoff = 2,
    onRetry,
  } = options;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      onRetry?.(attempt, lastError);
      
      const waitTime = initialDelay * Math.pow(backoff, attempt - 1);
      await delay(waitTime);
    }
  }
  
  throw lastError!;
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

## Array & Object Utilities

### Array Utilities (`src/utils/array.ts`)

```typescript
/**
 * Group array by key
 */
export function groupBy<T, K extends keyof any>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> {
  return array.reduce((result, item) => {
    const key = getKey(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[], key?: keyof T): T[] {
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const val = item[key];
      if (seen.has(val)) {
        return false;
      }
      seen.add(val);
      return true;
    });
  }
  return [...new Set(array)];
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Sort array by multiple fields
 */
export function sortBy<T>(
  array: T[],
  ...keys: Array<keyof T | [keyof T, 'asc' | 'desc']>
): T[] {
  return [...array].sort((a, b) => {
    for (const key of keys) {
      const [field, order] = Array.isArray(key) ? key : [key, 'asc'];
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
}
```

## Performance Utilities

### Memoization (`src/utils/memoize.ts`)

```typescript
/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    maxSize?: number;
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
  } = {}
): T {
  const {
    maxSize = 100,
    ttl,
    keyGenerator = (...args) => JSON.stringify(args),
  } = options;
  
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator(...args);
    
    if (cache.has(key)) {
      const cached = cache.get(key)!;
      
      if (!ttl || Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
      
      cache.delete(key);
    }
    
    const result = fn(...args);
    
    cache.set(key, {
      value: result,
      timestamp: Date.now(),
    });
    
    // Limit cache size
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
}
```

## Next.js Migration Impact

### Server vs Client Utilities

```typescript
// utils/server/db.ts - Server-only utilities
import 'server-only'; // Ensures this only runs on server

export async function getServerSideData() {
  // Direct database access
  return await db.query.projects.findMany();
}

// utils/client/storage.ts - Client-only utilities
'use client';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Client-side storage hook
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  
  const setStoredValue = (value: T) => {
    setValue(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  };
  
  return [value, setStoredValue] as const;
}
```

## Best Practices

### Do's
- ✅ Keep utilities pure and testable
- ✅ Add comprehensive JSDoc comments
- ✅ Handle edge cases and errors
- ✅ Use TypeScript for type safety
- ✅ Memoize expensive computations

### Don'ts
- ❌ Don't add side effects to utilities
- ❌ Don't ignore error handling
- ❌ Don't create overly specific utilities
- ❌ Don't forget about performance
- ❌ Don't mix server and client code

## Summary

The utilities and helpers provide a robust foundation of reusable functions that simplify common tasks throughout the FibreFlow application. With 94+ utility files covering everything from data processing to security, these utilities ensure consistency, reduce code duplication, and improve maintainability across the codebase.