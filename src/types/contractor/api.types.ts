/**
 * Contractor API Types - API response and error types
 */

import { Contractor } from './base.types';
import { ContractorTeam } from './team.types';
import { ProjectAssignment } from './assignment.types';
import { ContractorDocument } from './document.types';
import { ContractorPerformance } from './analytics.types';

export interface ContractorListResponse {
  contractors: Contractor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContractorDetailResponse {
  contractor: Contractor;
  teams: ContractorTeam[];
  assignments: ProjectAssignment[];
  documents: ContractorDocument[];
  performance: ContractorPerformance;
}

export interface ContractorError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface ContractorValidationError extends ContractorError {
  field: string;
  value: any;
  constraint: string;
}