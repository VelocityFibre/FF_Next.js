// Common type definitions used across the application

export type ID = string | number;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface AsyncData<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export type RecordObject = Record<string, unknown>;

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterParams {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'in';
  value: unknown;
}

export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: FilterParams[];
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface BaseEntity {
  id: ID;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};