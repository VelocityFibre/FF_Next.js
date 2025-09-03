/**
 * Contractor Service - Main export file
 * Aggregates all contractor-related services following modular pattern
 */

import { contractorCrudService } from './contractor/contractorCrudService';
import { contractorTeamService } from './contractor/contractorTeamService';
import { contractorDocumentService } from './contractor/contractorDocumentService';
import { ragScoringService } from './contractor/ragScoringService';
import { contractorOnboardingService } from './contractor/contractorOnboardingService';
import { contractorComplianceService } from './contractor/contractorComplianceService';

export const contractorService = {
  // Core CRUD operations
  getAll: contractorCrudService.getAll.bind(contractorCrudService),
  getById: contractorCrudService.getById.bind(contractorCrudService),
  create: contractorCrudService.create.bind(contractorCrudService),
  update: contractorCrudService.update.bind(contractorCrudService),
  delete: contractorCrudService.delete.bind(contractorCrudService),
  getAnalytics: contractorCrudService.getAnalytics.bind(contractorCrudService),
  search: contractorCrudService.search.bind(contractorCrudService),
  findByEmailOrRegistration: contractorCrudService.findByEmailOrRegistration.bind(contractorCrudService),
  
  // Team management
  teams: contractorTeamService,
  
  // Document management
  documents: contractorDocumentService,
  
  // RAG scoring system
  rag: ragScoringService,
  
  // Onboarding workflow
  onboarding: contractorOnboardingService,
  
  // Compliance monitoring
  compliance: contractorComplianceService,
};

// Export individual services for direct access if needed
export {
  contractorCrudService,
  contractorTeamService,
  contractorDocumentService,
  ragScoringService,
  contractorOnboardingService,
  contractorComplianceService,
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