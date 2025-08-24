/**
 * Neon Database Schema - Main Export Index
 * Consolidated exports from all domain-specific schema files
 */

// Import all schema domains
export * from './analytics.schema';
export * from './contractor.schema';  
export * from './procurement.schema';
export * from './shared.schema';

// Import table definitions
import {
  // Analytics domain
  projectAnalytics,
  kpiMetrics,
  financialTransactions,
  materialUsage,
  staffPerformance,
  reportCache,
  auditLog,
  clientAnalytics
} from './analytics.schema';

import {
  // Contractor domain
  contractors,
  contractorTeams,
  teamMembers,
  projectAssignments,
  contractorDocuments
} from './contractor.schema';

import {
  // Procurement domain
  boqs,
  boqItems,
  boqExceptions,
  rfqs,
  rfqItems,
  supplierInvitations,
  quotes,
  quoteItems,
  quoteDocuments,
  stockPositions,
  stockMovements,
  stockMovementItems,
  cableDrums,
  drumUsageHistory
} from './procurement.schema';

// Consolidated neonTables object for backward compatibility
export const neonTables = {
  // Analytics tables
  projectAnalytics,
  kpiMetrics,
  financialTransactions,
  materialUsage,
  staffPerformance,
  reportCache,
  auditLog,
  clientAnalytics,
  
  // Contractor tables
  contractors,
  contractorTeams,
  teamMembers,
  projectAssignments,
  contractorDocuments,
  
  // Procurement tables
  boqs,
  boqItems,
  boqExceptions,
  rfqs,
  rfqItems,
  supplierInvitations,
  quotes,
  quoteItems,
  quoteDocuments,
  stockPositions,
  stockMovements,
  stockMovementItems,
  cableDrums,
  drumUsageHistory,
};

// Domain-specific table collections for focused usage
export const analyticsTables = {
  projectAnalytics,
  kpiMetrics,
  financialTransactions,
  materialUsage,
  staffPerformance,
  reportCache,
  auditLog,
  clientAnalytics,
};

export const contractorTables = {
  contractors,
  contractorTeams,
  teamMembers,
  projectAssignments,
  contractorDocuments,
};

export const procurementTables = {
  boqs,
  boqItems,
  boqExceptions,
  rfqs,
  rfqItems,
  supplierInvitations,
  quotes,
  quoteItems,
  quoteDocuments,
  stockPositions,
  stockMovements,
  stockMovementItems,
  cableDrums,
  drumUsageHistory,
};