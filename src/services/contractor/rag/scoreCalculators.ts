/**
 * RAG Score Calculators - Backward Compatibility Layer
 * @deprecated Use './calculators/index.ts' for improved modular calculator system
 * 
 * This file provides backward compatibility for existing imports.
 * New code should use the modular calculator system in ./calculators/
 */

import {
  PerformanceCalculator,
  FinancialCalculator,
  ReliabilityCalculator,
  CapabilitiesCalculator,
  RAGScoreCalculator
} from './calculators';

import {
  RAGPerformanceBreakdown,
  RAGFinancialBreakdown,
  RAGReliabilityBreakdown,
  RAGCapabilitiesBreakdown,
  RAGScoreResult,
  ContractorAssignment,
  ContractorTeam,
  ContractorData
} from './types';

// Re-export the new modular calculators
export {
  PerformanceCalculator,
  FinancialCalculator,
  ReliabilityCalculator,
  CapabilitiesCalculator,
  RAGScoreCalculator
} from './calculators';

/**
 * Legacy calculator functions for backward compatibility
 * @deprecated Use the class-based calculators from './calculators' instead
 */

/**
 * Calculate performance score
 * @deprecated Use PerformanceCalculator.calculateScore instead
 */
export function calculatePerformanceScore(
  assignments: ContractorAssignment[]
): RAGScoreResult<RAGPerformanceBreakdown> {
  return PerformanceCalculator.calculateScore(assignments);
}

/**
 * Calculate financial score
 * @deprecated Use FinancialCalculator.calculateScore instead
 */
export function calculateFinancialScore(
  contractor: ContractorData
): RAGScoreResult<RAGFinancialBreakdown> {
  return FinancialCalculator.calculateScore(contractor);
}

/**
 * Calculate reliability score
 * @deprecated Use ReliabilityCalculator.calculateScore instead
 */
export function calculateReliabilityScore(
  assignments: ContractorAssignment[],
  teams: ContractorTeam[]
): RAGScoreResult<RAGReliabilityBreakdown> {
  return ReliabilityCalculator.calculateScore(assignments, teams);
}

/**
 * Calculate capabilities score
 * @deprecated Use CapabilitiesCalculator.calculateScore instead
 */
export function calculateCapabilitiesScore(
  contractor: ContractorData,
  teams: ContractorTeam[]
): RAGScoreResult<RAGCapabilitiesBreakdown> {
  return CapabilitiesCalculator.calculateScore(contractor, teams);
}

/**
 * Calculate comprehensive RAG score
 * @deprecated Use RAGScoreCalculator.calculateComprehensiveScore instead
 */
export function calculateComprehensiveRAGScore(
  contractor: ContractorData,
  assignments: ContractorAssignment[] = [],
  teams: ContractorTeam[] = []
) {
  return RAGScoreCalculator.calculateComprehensiveScore(contractor, assignments, teams);
}