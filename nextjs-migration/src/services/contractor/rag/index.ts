/**
 * RAG Scoring Service - Index
 * Centralizes all RAG scoring exports
 */

// Core service
export { RAGCore, ragCore } from './ragCore';

// Score calculators
export {
  PerformanceCalculator,
  FinancialCalculator,
  ReliabilityCalculator,
  CapabilitiesCalculator,
  OverallCalculator
} from './scoreCalculators';

// Assessment helpers
export {
  assessTechnicalSkills,
  assessSpecializationDepth,
  getTeamExperienceDistribution,
  calculateSkillDiversity,
  assessTeamCompositionBalance,
  calculateTeamScalingPotential,
  assessSpecializationCoverage,
  calculateTeamReadiness,
  generateTeamRecommendations
} from './assessmentHelpers';

// Types and interfaces
export type {
  RAGScore,
  RAGPerformanceBreakdown,
  RAGFinancialBreakdown,
  RAGReliabilityBreakdown,
  RAGCapabilitiesBreakdown,
  RAGScoreComponents,
  RAGScoreResult,
  ContractorAssignment,
  ContractorTeam,
  ContractorData,
  RAGWeights,
  RiskLevel,
  RankedContractor
} from './types';

export {
  DEFAULT_RAG_WEIGHTS,
  SKILL_LEVEL_SCORES
} from './types';

// Main service instance for backward compatibility
export { ragScoringService } from './ragScoringService';

// Default export for backward compatibility
export { ragScoringService as default } from './ragScoringService';