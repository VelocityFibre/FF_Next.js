/**
 * RAG Scoring Types - Risk assessment and scoring definitions
 */

export interface RAGScoreDetails {
  overall: number;
  risk: 'low' | 'medium' | 'high';
  performance: number;
  financial: number;
  reliability: number;
  capabilities: number;
  breakdown: {
    performance: RAGPerformanceBreakdown;
    financial: RAGFinancialBreakdown;
    reliability: RAGReliabilityBreakdown;
    capabilities: RAGCapabilitiesBreakdown;
  };
  lastUpdated: Date;
  recommendations: string[];
}

export interface RAGPerformanceBreakdown {
  completionRate: number;
  qualityScore: number;
  timelinessScore: number;
  clientSatisfaction: number;
  projectComplexity: number;
}

export interface RAGFinancialBreakdown {
  paymentHistory: number;
  financialStability: number;
  creditRating: number;
  insuranceCoverage: number;
  bondingCapacity: number;
}

export interface RAGReliabilityBreakdown {
  projectHistory: number;
  teamStability: number;
  certificationStatus: number;
  complianceRecord: number;
  communicationRating: number;
}

export interface RAGCapabilitiesBreakdown {
  technicalSkills: number;
  equipmentRating: number;
  teamExperience: number;
  certificationLevel: number;
  specializationDepth: number;
}

export interface ContractorRAGRanking {
  contractorId: string;
  companyName: string;
  ragScore: RAGScoreDetails;
}