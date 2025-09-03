# Scorecard Module Migration Guide

The `scorecardGenerator.ts` file (383 lines) has been split into modular components for better maintainability and single responsibility principle.

## New Structure

```
scorecard/
├── index.ts                    # Main exports and legacy compatibility
├── types.ts                    # Type definitions and constants
├── scorecardService.ts         # Main service class (244 lines)
├── scoreCalculator.ts          # Score calculation logic (179 lines)
├── benchmarkCalculator.ts      # Benchmarking and trends (244 lines)
├── recommendationGenerator.ts  # Improvement recommendations (297 lines)
├── utils.ts                    # Common utilities (199 lines)
└── MIGRATION.md               # This guide
```

## Module Responsibilities

### 1. `ScorecardService` (Main Service)
- **Purpose**: Orchestrates scorecard generation
- **Key Methods**:
  - `generateSupplierScorecard()`
  - `generateMultipleScorecards()`
  - `generateEnhancedScorecard()`
  - `getScorecardSummary()`

### 2. `ScoreCalculator`
- **Purpose**: Handles all score calculation logic
- **Key Methods**:
  - `calculateOverallScore()`
  - `extractRatings()`
  - `extractPerformance()`
  - `extractCompliance()`
  - `validateSupplierData()`

### 3. `BenchmarkCalculator`
- **Purpose**: Manages benchmarking and trend analysis
- **Key Methods**:
  - `calculateTrends()`
  - `calculateBenchmarks()`
  - `calculateCategoryBenchmarks()`
  - `calculateRegionalBenchmarks()`

### 4. `RecommendationGenerator`
- **Purpose**: Generates improvement recommendations
- **Key Methods**:
  - `generateRecommendations()`
  - `generatePriorityRecommendations()`
  - `generateIndustryRecommendations()`
  - `generateImprovementPlan()`

### 5. `SupplierUtils`
- **Purpose**: Common utility functions
- **Key Methods**:
  - `getSupplierRating()`
  - `calculatePercentile()`
  - `getSupplierDisplayName()`
  - `calculateDataCompleteness()`

## Migration Path

### Option 1: Use New Modular Interface (Recommended)

```typescript
// New way - using ScorecardService
import { ScorecardService } from './scorecard';

// Generate with configuration
const result = await ScorecardService.generateSupplierScorecard(supplierId, {
  includeDetailedRatings: true,
  includeTrendAnalysis: true,
  includeBenchmarks: true,
  includeRecommendations: true
});

// Access scorecard and metadata
const { scorecard, warnings, dataQuality } = result;
```

### Option 2: Legacy Compatibility (No Changes Required)

```typescript
// Old way - still works via compatibility layer
import { ScorecardGenerator } from './scorecard';

// Existing code continues to work
const scorecard = await ScorecardGenerator.generateSupplierScorecard(supplierId);
```

### Option 3: Use Individual Modules

```typescript
// Direct module usage for specific needs
import { ScoreCalculator, BenchmarkCalculator } from './scorecard';

// Calculate only what you need
const score = ScoreCalculator.calculateOverallScore(supplier);
const benchmarks = await BenchmarkCalculator.calculateBenchmarks(supplier);
```

## Benefits of Modular Structure

1. **Single Responsibility**: Each module has a clear, focused purpose
2. **Testability**: Easier to unit test individual components
3. **Maintainability**: Smaller files (all under 300 lines)
4. **Reusability**: Components can be used independently
5. **Type Safety**: Enhanced type definitions and validation
6. **Performance**: Load only what you need
7. **Extensibility**: Easy to add new features

## Enhanced Features

The new modular system includes several enhancements:

### 1. Configuration Options
```typescript
interface ScorecardConfig {
  includeDetailedRatings?: boolean;
  includeTrendAnalysis?: boolean;
  includeBenchmarks?: boolean;
  includeRecommendations?: boolean;
  historicalDataMonths?: number;
}
```

### 2. Data Quality Metrics
```typescript
interface ScorecardGenerationResult {
  scorecard: SupplierScorecard;
  warnings: string[];
  dataQuality: {
    completeness: number;
    reliability: number;
  };
}
```

### 3. Priority Recommendations
```typescript
interface PriorityRecommendation {
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  category: 'compliance' | 'performance' | 'communication' | 'business';
  impact: string;
  timeline: string;
}
```

### 4. Enhanced Benchmarking
- Regional benchmarks (city, province, country)
- Category-specific benchmarks
- Historical trend analysis
- Peer comparison rankings

## Breaking Changes

**None!** The legacy `ScorecardGenerator` class is maintained through a compatibility layer in `index.ts`.

## Migration Timeline

1. **Immediate**: All existing code continues to work
2. **Short term**: Gradually migrate to new `ScorecardService` API
3. **Long term**: Consider deprecating legacy interface

## Testing

Each module can be tested independently:

```typescript
// Test individual components
import { ScoreCalculator } from '../scoreCalculator';

describe('ScoreCalculator', () => {
  it('should calculate overall score correctly', () => {
    const supplier = mockSupplier();
    const score = ScoreCalculator.calculateOverallScore(supplier);
    expect(score).toBe(expectedScore);
  });
});
```

## Support

For questions or issues with the migration:
1. Check the type definitions in `types.ts`
2. Review individual module documentation
3. Use the legacy compatibility layer if needed
4. Refer to the enhanced features for new capabilities