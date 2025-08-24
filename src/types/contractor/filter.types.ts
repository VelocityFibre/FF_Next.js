/**
 * Contractor Filter Types - Query and filter definitions
 */

import { ContractorStatus, RAGScore } from './base.types';
import { AssignmentStatus } from './assignment.types';

export interface ContractorFilter {
  searchTerm?: string;
  status?: ContractorStatus[];
  complianceStatus?: string[];
  ragOverall?: RAGScore[];
  businessType?: string[];
  province?: string[];
  city?: string[];
  industryCategory?: string[];
  hasActiveProjects?: boolean;
  documentsExpiring?: boolean;
  tags?: string[];
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