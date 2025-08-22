/**
 * Contractor Service - Main export file
 * Aggregates all contractor-related services following modular pattern
 */

import { contractorCrudService } from './contractor/contractorCrudService';
import { contractorTeamService } from './contractor/contractorTeamService';
import { contractorDocumentService } from './contractor/contractorDocumentService';
import { ragScoringService } from './contractor/ragScoringService';

export const contractorService = {
  // Core CRUD operations
  ...contractorCrudService,
  
  // Team management
  teams: contractorTeamService,
  
  // Document management
  documents: contractorDocumentService,
  
  // RAG scoring system
  rag: ragScoringService,
};

// Export individual services for direct access if needed
export {
  contractorCrudService,
  contractorTeamService,
  contractorDocumentService,
  ragScoringService,
};

// Re-export types for convenience
export type {
  Contractor,
  ContractorFormData,
  ContractorFilter,
  ContractorAnalytics,
  ContractorTeam,
  TeamMember,
  TeamFormData,
  MemberFormData,
  TeamFilter,
  ContractorDocument,
  DocumentType,
  ContractorDashboardData,
  ContractorPerformance,
  UrgentAction,
  Deadline
} from '@/types/contractor.types';