/**
 * Project Query Types
 * Types for filtering, sorting, and querying projects
 */

import { ProjectStatus, ProjectPriority } from './enums';

export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  clientId?: string;
  projectManagerId?: string;
  region?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  searchTerm?: string;
}

export interface ProjectSortOptions {
  field: 'name' | 'startDate' | 'endDate' | 'progress' | 'priority' | 'status';
  direction: 'asc' | 'desc';
}

export interface ProjectListQuery {
  filters?: ProjectFilters;
  sort?: ProjectSortOptions;
  page: number;
  limit: number;
}