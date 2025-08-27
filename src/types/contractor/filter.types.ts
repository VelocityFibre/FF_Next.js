/**
 * Contractor Filter Types - Query and filter definitions
 */

import { ContractorStatus, RAGScore } from './base.types';
import { AssignmentStatus } from './assignment.types';

export interface ContractorFilter {
  // Search and filtering
  search?: string;
  searchTerm?: string;
  includeInactive?: boolean;
  status?: ContractorStatus | ContractorStatus[];
  complianceStatus?: string | string[];
  ragOverall?: RAGScore | RAGScore[];
  businessType?: string | string[];
  province?: string | string[];
  city?: string[];
  industryCategory?: string[];
  hasActiveProjects?: boolean;
  documentsExpiring?: boolean;
  tags?: string[];
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  limit?: number;
  offset?: number;
}

export interface TeamFilter {
  contractorId?: string;
  teamType?: string[];
  availability?: string[];
  isActive?: boolean;
  hasCapacity?: boolean;
}

export interface AssignmentFilter {
  contractorId?: string;
  projectId?: string;
  status?: AssignmentStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}