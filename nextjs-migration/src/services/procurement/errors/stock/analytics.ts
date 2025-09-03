/**
 * @deprecated This file has been split into modular components for better maintainability.
 * 
 * MIGRATION GUIDE:
 * - Use './analytics/' for all new implementations
 * - ErrorTracker: Basic error data collection and analysis
 * - AnalyticsEngine: Core pattern analysis and insights
 * - TrendAnalyzer: Time-based analysis and forecasting
 * 
 * This compatibility layer will be removed in a future version.
 * Please migrate to the new modular structure.
 */

// Re-export everything from the new modular structure for backward compatibility
export * from './analytics/';

// Legacy imports for backward compatibility
import { StockErrorAnalytics as ModularStockErrorAnalytics } from './analytics/';

/**
 * @deprecated Use the new modular exports instead:
 * - ErrorTracker for basic error analysis
 * - AnalyticsEngine for pattern analysis and insights  
 * - TrendAnalyzer for time-based analysis
 * 
 * This class is maintained for backward compatibility only.
 */
export const StockErrorAnalytics = ModularStockErrorAnalytics;

// Default export for backward compatibility
export default StockErrorAnalytics;