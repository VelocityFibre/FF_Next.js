/**
 * Procurement API Types
 * Type definitions for the procurement API service
 */

// API Context type for request processing
export interface ApiContext {
  userId: string;
  userName?: string;
  userRole?: string;
  projectId: string;
  permissions: string[];
  ipAddress?: string;
  userAgent?: string;
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter interfaces
export interface BOQFilters extends PaginationParams {
  status?: string;
  mappingStatus?: string;
  uploadedBy?: string;
}

export interface RFQFilters extends PaginationParams {
  status?: string;
  createdBy?: string;
  responseDeadline?: { from?: string; to?: string };
}

export interface StockFilters extends PaginationParams {
  category?: string;
  stockStatus?: string;
  warehouseLocation?: string;
}

// Import data interface
export interface BOQImportData {
  version: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  rows: Array<{
    lineNumber: number;
    itemCode?: string;
    description: string;
    category?: string;
    subcategory?: string;
    quantity: number;
    uom: string;
    unitPrice?: number;
    totalPrice?: number;
    phase?: string;
    task?: string;
    site?: string;
    location?: string;
    specifications?: string;
    technicalNotes?: string;
  }>;
}

// Health status interface
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  details?: Record<string, unknown>;
}