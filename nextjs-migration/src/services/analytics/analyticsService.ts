/**
 * Analytics Service - Legacy Compatibility Layer
 * 
 * @deprecated This file has been split into specialized modules for better maintainability.
 * 
 * New modular structure:
 * - types.ts: Type definitions for analytics operations
 * - projectAnalytics.ts: Project performance and trend analysis
 * - kpiAnalytics.ts: Key Performance Indicator metrics and trends
 * - financialAnalytics.ts: Financial reporting and cash flow analysis
 * - staffAnalytics.ts: Staff performance analysis and reporting
 * - clientAnalytics.ts: Client performance metrics and revenue analysis
 * - auditService.ts: Audit logging and compliance tracking
 * - reportingService.ts: Executive reports and summary generation
 * - analyticsService.ts: Main orchestrator service
 * 
 * For new code, import from the modular structure:
 * ```typescript
 * import { analyticsService, projectAnalyticsService, kpiAnalyticsService } from '@/services/analytics';
 * // or
 * import { AnalyticsService, ProjectAnalyticsService } from '@/services/analytics';
 * ```
 * 
 * This legacy layer maintains backward compatibility while the codebase transitions.
 */

import { 
  AnalyticsService as ModularAnalyticsService,
  analyticsService as modularAnalyticsService 
} from './core';

/**
 * @deprecated Use the new modular analytics services from '@/services/analytics' instead
 * 
 * Legacy service class that delegates to the new modular architecture
 */
export class AnalyticsService extends ModularAnalyticsService {}

/**
 * @deprecated Use the new modular analytics services from '@/services/analytics' instead
 * 
 * Legacy service instance that delegates to the new modular architecture
 */
export const analyticsService = modularAnalyticsService;

export default analyticsService;