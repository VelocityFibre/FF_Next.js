/**
 * RAG Scoring Types and Interfaces
 * Type definitions for Risk Assessment and Grading system
 */

import { RAGScoreDetails } from '@/types/contractor.types';

// Re-export from contractor.types.ts for compatibility
export type RAGScore = RAGScoreDetails;

// Performance breakdown interface
export interface RAGPerformanceBreakdown {
  completionRate: number;
  qualityScore: number;
  timelinessScore: number;
  clientSatisfaction: number;
  projectComplexity: number;
}

// Financial breakdown interface
export interface RAGFinancialBreakdown {
  paymentHistory: number;
  financialStability: number;
  creditRating: number;
  insuranceCoverage: number;
  bondingCapacity: number;
}

// Reliability breakdown interface
export interface RAGReliabilityBreakdown {
  projectHistory: number;
  teamStability: number;
  certificationStatus: number;
  complianceRecord: number;
  communicationRating: number;
}

// Capabilities breakdown interface
export interface RAGCapabilitiesBreakdown {
  technicalSkills: number;
  equipmentRating: number;
  teamExperience: number;
  certificationLevel: number;
  specializationDepth: number;
}

// Combined score interface
export interface RAGScoreComponents {
  performance: number;
  financial: number;
  reliability: number;
  capabilities: number;
}

// Score calculation result with breakdown
export interface RAGScoreResult<T> {
  score: number;
  breakdown: T;
}

// Contractor assignment data interface
export interface ContractorAssignment {
  id: string;
  contractorId: string;
  status: string;
  qualityScore?: number;
  timelinessScore?: number;
  performanceRating?: number;
  contractValue: number;
}

// Contractor team data interface
export interface ContractorTeam {
  id: string;
  contractorId: string;
  teamType: string;
  skillLevel: 'junior' | 'intermediate' | 'senior' | 'expert';
}

// Contractor data interface
export interface ContractorData {
  id: string;
  companyName: string;
  yearsInBusiness?: number;
  totalProjects?: number;
  paymentHistory?: number;
  creditRating?: number;
  insuranceVerified?: boolean;
  bondingCapacity?: boolean;
}

// RAG weights configuration
export interface RAGWeights {
  overall: {
    performance: number;
    financial: number;
    reliability: number;
    capabilities: number;
  };
  performance: {
    completionRate: number;
    qualityScore: number;
    timelinessScore: number;
    clientSatisfaction: number;
    projectComplexity: number;
  };
  financial: {
    paymentHistory: number;
    financialStability: number;
    creditRating: number;
    insuranceCoverage: number;
    bondingCapacity: number;
  };
  reliability: {
    projectHistory: number;
    teamStability: number;
    certificationStatus: number;
    complianceRecord: number;
    communicationRating: number;
  };
  capabilities: {
    technicalSkills: number;
    equipmentRating: number;
    teamExperience: number;
    certificationLevel: number;
    specializationDepth: number;
  };
}

// Default RAG weights
export const DEFAULT_RAG_WEIGHTS: RAGWeights = {
  overall: {
    performance: 0.30,
    financial: 0.25,
    reliability: 0.25,
    capabilities: 0.20
  },
  performance: {
    completionRate: 0.25,
    qualityScore: 0.25,
    timelinessScore: 0.25,
    clientSatisfaction: 0.15,
    projectComplexity: 0.10
  },
  financial: {
    paymentHistory: 0.30,
    financialStability: 0.25,
    creditRating: 0.20,
    insuranceCoverage: 0.15,
    bondingCapacity: 0.10
  },
  reliability: {
    projectHistory: 0.25,
    teamStability: 0.20,
    certificationStatus: 0.20,
    complianceRecord: 0.20,
    communicationRating: 0.15
  },
  capabilities: {
    technicalSkills: 0.25,
    equipmentRating: 0.20,
    teamExperience: 0.25,
    certificationLevel: 0.15,
    specializationDepth: 0.15
  }
};

// Risk level type
export type RiskLevel = 'low' | 'medium' | 'high';

// Ranked contractor interface
export interface RankedContractor {
  contractorId: string;
  companyName: string;
  ragScore: RAGScore;
}

// Skill level mapping
export const SKILL_LEVEL_SCORES = {
  junior: 60,
  intermediate: 75,
  senior: 90,
  expert: 100
} as const;