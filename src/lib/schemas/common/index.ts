/**
 * Common Zod schemas used across the application
 * These schemas define shared structures like pagination, API responses, and error handling
 */

import { z } from 'zod';

// ============================================================================
// Pagination Schemas
// ============================================================================

export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

// ============================================================================
// API Response Schemas
// ============================================================================

export const ApiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
  });

export const ApiPaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(dataSchema),
    meta: PaginationMetaSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
  });

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    stack: z.string().optional(),
  }),
  timestamp: z.string().datetime().optional(),
});

// ============================================================================
// Common Field Schemas
// ============================================================================

export const IdSchema = z.string().uuid();

export const EmailSchema = z.string().email();

export const PhoneSchema = z.string().regex(
  /^\+?[1-9]\d{1,14}$/,
  'Invalid phone number format'
);

export const DateRangeSchema = z.object({
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
});

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const AddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1).default('South Africa'),
});

export const MoneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().length(3).default('ZAR'),
});

// ============================================================================
// Query Filter Schemas
// ============================================================================

export const SearchParamsSchema = z.object({
  search: z.string().optional(),
  filters: z.record(z.string(), z.any()).optional(),
  dateRange: DateRangeSchema.optional(),
});

export const BulkOperationSchema = z.object({
  ids: z.array(IdSchema).min(1),
  operation: z.enum(['delete', 'archive', 'restore', 'update']),
  data: z.any().optional(),
});

// ============================================================================
// Status and Enum Schemas
// ============================================================================

export const StatusSchema = z.enum([
  'active',
  'inactive',
  'pending',
  'completed',
  'cancelled',
  'draft',
  'archived',
]);

export const PrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const UserRoleSchema = z.enum([
  'admin',
  'manager',
  'supervisor',
  'technician',
  'viewer',
]);

// ============================================================================
// File Upload Schemas
// ============================================================================

export const FileUploadSchema = z.object({
  filename: z.string(),
  mimetype: z.string(),
  size: z.number().positive(),
  url: z.string().url().optional(),
  path: z.string().optional(),
});

// ============================================================================
// Audit/Metadata Schemas
// ============================================================================

export const AuditFieldsSchema = z.object({
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  version: z.number().int().nonnegative().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
};
export type ApiPaginatedResponse<T> = {
  success: true;
  data: T[];
  meta: PaginationMeta;
  message?: string;
  timestamp?: string;
};
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type Money = z.infer<typeof MoneySchema>;
export type Status = z.infer<typeof StatusSchema>;
export type Priority = z.infer<typeof PrioritySchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type AuditFields = z.infer<typeof AuditFieldsSchema>;