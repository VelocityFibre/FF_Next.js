/**
 * Stock Calculations Utility
 * Business logic calculations for stock management operations
 */

import type { StockPosition, CableDrum } from '@/types/procurement/stock';

export interface StockValueBreakdown {
  totalValue: number;
  breakdown: Array<{
    category: string;
    value: number;
    percentage: number;
    itemCount: number;
  }>;
}

export interface StockABC {
  classA: StockPosition[]; // High value items (80% of total value)
  classB: StockPosition[]; // Medium value items (15% of total value)
  classC: StockPosition[]; // Low value items (5% of total value)
  summary: {
    totalValue: number;
    classAValue: number;
    classBValue: number;
    classCValue: number;
    classAPercentage: number;
    classBPercentage: number;
    classCPercentage: number;
  };
}

export interface ReorderAnalysis {
  itemsToReorder: StockPosition[];
  criticalItems: StockPosition[];
  excessItems: StockPosition[];
  summary: {
    totalItemsNeedingReorder: number;
    totalReorderValue: number;
    averageLeadTime: number;
    criticalItemCount: number;
  };
}

export interface CableDrumUtilization {
  totalDrums: number;
  totalOriginalLength: number;
  totalUsedLength: number;
  totalRemainingLength: number;
  utilizationPercentage: number;
  drumsByStatus: {
    available: number;
    inUse: number;
    completed: number;
    returned: number;
  };
  averageUsagePerDrum: number;
  projectedCompletionDrums: number;
}

export interface TurnoverAnalysis {
  fastMovingItems: Array<{
    itemCode: string;
    itemName: string;
    turnoverRatio: number;
    averageStock: number;
    totalIssues: number;
  }>;
  slowMovingItems: Array<{
    itemCode: string;
    itemName: string;
    turnoverRatio: number;
    daysWithoutMovement: number;
    currentValue: number;
  }>;
  summary: {
    averageTurnoverRatio: number;
    totalFastMovingValue: number;
    totalSlowMovingValue: number;
  };
}

export class StockCalculations {
  /**
   * Calculate total stock value with category breakdown
   */
  static calculateTotalStockValue(positions: StockPosition[]): StockValueBreakdown {
    const totalValue = positions.reduce((sum, pos) => sum + (pos.totalValue || 0), 0);
    
    // Group by category
    const categoryMap = new Map<string, { value: number, itemCount: number }>();
    
    positions.forEach(pos => {
      const category = pos.category || 'Uncategorized';
      const value = pos.totalValue || 0;
      const existing = categoryMap.get(category) || { value: 0, itemCount: 0 };
      categoryMap.set(category, {
        value: existing.value + value,
        itemCount: existing.itemCount + 1,
      });
    });

    const breakdown = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        value: data.value,
        percentage: totalValue > 0 ? Math.round((data.value / totalValue) * 100) : 0,
        itemCount: data.itemCount,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      totalValue,
      breakdown,
    };
  }

  /**
   * Perform ABC analysis on stock positions
   * Class A: 80% of total value (typically 20% of items)
   * Class B: 15% of total value (typically 30% of items)  
   * Class C: 5% of total value (typically 50% of items)
   */
  static performABCAnalysis(positions: StockPosition[]): StockABC {
    // Filter out items without value and sort by value descending
    const validPositions = positions
      .filter(pos => pos.totalValue && pos.totalValue > 0)
      .sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));

    if (validPositions.length === 0) {
      return {
        classA: [],
        classB: [],
        classC: [],
        summary: {
          totalValue: 0,
          classAValue: 0,
          classBValue: 0,
          classCValue: 0,
          classAPercentage: 0,
          classBPercentage: 0,
          classCPercentage: 0,
        },
      };
    }

    const totalValue = validPositions.reduce((sum, pos) => sum + (pos.totalValue || 0), 0);
    let cumulativeValue = 0;
    
    const classA: StockPosition[] = [];
    const classB: StockPosition[] = [];
    const classC: StockPosition[] = [];

    // Classify items based on cumulative percentage
    validPositions.forEach(position => {
      const itemValue = position.totalValue || 0;
      cumulativeValue += itemValue;
      const cumulativePercentage = (cumulativeValue / totalValue) * 100;

      if (cumulativePercentage <= 80) {
        classA.push(position);
      } else if (cumulativePercentage <= 95) {
        classB.push(position);
      } else {
        classC.push(position);
      }
    });

    const classAValue = classA.reduce((sum, pos) => sum + (pos.totalValue || 0), 0);
    const classBValue = classB.reduce((sum, pos) => sum + (pos.totalValue || 0), 0);
    const classCValue = classC.reduce((sum, pos) => sum + (pos.totalValue || 0), 0);

    return {
      classA,
      classB,
      classC,
      summary: {
        totalValue,
        classAValue,
        classBValue,
        classCValue,
        classAPercentage: Math.round((classAValue / totalValue) * 100),
        classBPercentage: Math.round((classBValue / totalValue) * 100),
        classCPercentage: Math.round((classCValue / totalValue) * 100),
      },
    };
  }

  /**
   * Analyze reorder requirements and stock levels
   */
  static analyzeReorderRequirements(positions: StockPosition[]): ReorderAnalysis {
    const itemsToReorder = positions.filter(pos => {
      const availableQuantity = pos.availableQuantity || 0;
      const reorderLevel = pos.reorderLevel || 0;
      return reorderLevel > 0 && availableQuantity <= reorderLevel;
    });

    const criticalItems = positions.filter(pos => pos.stockStatus === 'critical');
    const excessItems = positions.filter(pos => pos.stockStatus === 'excess');

    const totalReorderValue = itemsToReorder.reduce((sum, pos) => {
      const shortfall = (pos.reorderLevel || 0) - (pos.availableQuantity || 0);
      const unitCost = pos.averageUnitCost || 0;
      return sum + (shortfall * unitCost);
    }, 0);

    // Calculate average lead time (would need historical data in real implementation)
    const averageLeadTime = 7; // Default 7 days - should be calculated from historical data

    return {
      itemsToReorder,
      criticalItems,
      excessItems,
      summary: {
        totalItemsNeedingReorder: itemsToReorder.length,
        totalReorderValue,
        averageLeadTime,
        criticalItemCount: criticalItems.length,
      },
    };
  }

  /**
   * Calculate cable drum utilization statistics
   */
  static calculateDrumUtilization(drums: CableDrum[]): CableDrumUtilization {
    if (drums.length === 0) {
      return {
        totalDrums: 0,
        totalOriginalLength: 0,
        totalUsedLength: 0,
        totalRemainingLength: 0,
        utilizationPercentage: 0,
        drumsByStatus: { available: 0, inUse: 0, completed: 0, returned: 0 },
        averageUsagePerDrum: 0,
        projectedCompletionDrums: 0,
      };
    }

    const totalOriginalLength = drums.reduce((sum, drum) => sum + drum.originalLength, 0);
    const totalUsedLength = drums.reduce((sum, drum) => sum + drum.usedLength, 0);
    const totalRemainingLength = drums.reduce((sum, drum) => sum + drum.currentLength, 0);
    
    const utilizationPercentage = totalOriginalLength > 0 
      ? Math.round((totalUsedLength / totalOriginalLength) * 100)
      : 0;

    // Group by installation status
    const drumsByStatus = drums.reduce((acc, drum) => {
      const status = drum.installationStatus || 'available';
      acc[status as keyof typeof acc] = (acc[status as keyof typeof acc] || 0) + 1;
      return acc;
    }, {
      available: 0,
      inUse: 0,
      completed: 0,
      returned: 0,
    });

    const averageUsagePerDrum = drums.length > 0 ? totalUsedLength / drums.length : 0;
    
    // Estimate drums needed to complete project based on usage patterns
    const inUseDrums = drums.filter(d => d.installationStatus === 'in_use');
    const avgUsageRate = inUseDrums.length > 0 
      ? inUseDrums.reduce((sum, d) => sum + (d.usedLength / d.originalLength), 0) / inUseDrums.length
      : 0.5; // Default 50% usage
    
    const availableDrums = drums.filter(d => d.installationStatus === 'available');
    const projectedCompletionDrums = Math.ceil(availableDrums.length * avgUsageRate);

    return {
      totalDrums: drums.length,
      totalOriginalLength,
      totalUsedLength,
      totalRemainingLength,
      utilizationPercentage,
      drumsByStatus,
      averageUsagePerDrum,
      projectedCompletionDrums,
    };
  }

  /**
   * Calculate Economic Order Quantity (EOQ)
   */
  static calculateEOQ(
    annualDemand: number,
    orderingCost: number,
    holdingCost: number
  ): {
    economicOrderQuantity: number;
    totalAnnualCost: number;
    optimalOrderFrequency: number;
    reorderPoint: number;
  } {
    if (annualDemand <= 0 || orderingCost <= 0 || holdingCost <= 0) {
      return {
        economicOrderQuantity: 0,
        totalAnnualCost: 0,
        optimalOrderFrequency: 0,
        reorderPoint: 0,
      };
    }

    const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
    const totalAnnualCost = Math.sqrt(2 * annualDemand * orderingCost * holdingCost);
    const optimalOrderFrequency = annualDemand / eoq;
    
    // Assume 7-day lead time for reorder point calculation
    const dailyDemand = annualDemand / 365;
    const leadTimeDays = 7;
    const reorderPoint = dailyDemand * leadTimeDays;

    return {
      economicOrderQuantity: Math.round(eoq),
      totalAnnualCost: Math.round(totalAnnualCost),
      optimalOrderFrequency: Math.round(optimalOrderFrequency),
      reorderPoint: Math.round(reorderPoint),
    };
  }

  /**
   * Calculate safety stock level
   */
  static calculateSafetyStock(
    averageDemand: number,
    maxDemand: number,
    averageLeadTime: number,
    maxLeadTime: number
  ): number {
    // Safety stock = (Max daily demand × Max lead time) - (Average daily demand × Average lead time)
    const safetyStock = (maxDemand * maxLeadTime) - (averageDemand * averageLeadTime);
    return Math.max(0, Math.round(safetyStock));
  }

  /**
   * Calculate stock turnover ratio
   */
  static calculateStockTurnover(
    costOfGoodsSold: number,
    averageInventoryValue: number
  ): {
    turnoverRatio: number;
    daysSalesInventory: number;
    turnoverCategory: 'fast' | 'medium' | 'slow';
  } {
    if (averageInventoryValue <= 0) {
      return {
        turnoverRatio: 0,
        daysSalesInventory: 0,
        turnoverCategory: 'slow',
      };
    }

    const turnoverRatio = costOfGoodsSold / averageInventoryValue;
    const daysSalesInventory = 365 / turnoverRatio;
    
    let turnoverCategory: 'fast' | 'medium' | 'slow' = 'slow';
    if (turnoverRatio >= 12) {
      turnoverCategory = 'fast';
    } else if (turnoverRatio >= 6) {
      turnoverCategory = 'medium';
    }

    return {
      turnoverRatio: Math.round(turnoverRatio * 100) / 100,
      daysSalesInventory: Math.round(daysSalesInventory),
      turnoverCategory,
    };
  }

  /**
   * Calculate stock aging analysis
   */
  static calculateStockAging(
    positions: StockPosition[],
    currentDate: Date = new Date()
  ): {
    aging0to30: StockPosition[];
    aging31to60: StockPosition[];
    aging61to90: StockPosition[];
    aging90Plus: StockPosition[];
    summary: {
      total0to30Value: number;
      total31to60Value: number;
      total61to90Value: number;
      total90PlusValue: number;
      percentageOld: number;
    };
  } {
    const aging0to30: StockPosition[] = [];
    const aging31to60: StockPosition[] = [];
    const aging61to90: StockPosition[] = [];
    const aging90Plus: StockPosition[] = [];

    positions.forEach(position => {
      if (position.lastMovementDate) {
        const daysSinceMovement = Math.floor(
          (currentDate.getTime() - position.lastMovementDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceMovement <= 30) {
          aging0to30.push(position);
        } else if (daysSinceMovement <= 60) {
          aging31to60.push(position);
        } else if (daysSinceMovement <= 90) {
          aging61to90.push(position);
        } else {
          aging90Plus.push(position);
        }
      } else {
        // No movement date - assume old
        aging90Plus.push(position);
      }
    });

    const total0to30Value = aging0to30.reduce((sum, pos) => sum + (pos.totalValue || 0), 0);
    const total31to60Value = aging31to60.reduce((sum, pos) => sum + (pos.totalValue || 0), 0);
    const total61to90Value = aging61to90.reduce((sum, pos) => sum + (pos.totalValue || 0), 0);
    const total90PlusValue = aging90Plus.reduce((sum, pos) => sum + (pos.totalValue || 0), 0);
    
    const totalValue = total0to30Value + total31to60Value + total61to90Value + total90PlusValue;
    const percentageOld = totalValue > 0 ? Math.round(((total61to90Value + total90PlusValue) / totalValue) * 100) : 0;

    return {
      aging0to30,
      aging31to60,
      aging61to90,
      aging90Plus,
      summary: {
        total0to30Value,
        total31to60Value,
        total61to90Value,
        total90PlusValue,
        percentageOld,
      },
    };
  }

  /**
   * Calculate fill rate (percentage of demand satisfied from stock)
   */
  static calculateFillRate(
    totalDemand: number,
    satisfiedDemand: number
  ): {
    fillRate: number;
    fillRateCategory: 'excellent' | 'good' | 'fair' | 'poor';
  } {
    if (totalDemand <= 0) {
      return {
        fillRate: 0,
        fillRateCategory: 'poor',
      };
    }

    const fillRate = Math.round((satisfiedDemand / totalDemand) * 100);
    
    let fillRateCategory: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
    if (fillRate >= 98) {
      fillRateCategory = 'excellent';
    } else if (fillRate >= 95) {
      fillRateCategory = 'good';
    } else if (fillRate >= 90) {
      fillRateCategory = 'fair';
    }

    return {
      fillRate,
      fillRateCategory,
    };
  }

  /**
   * Calculate carrying cost percentage
   */
  static calculateCarryingCost(
    averageInventoryValue: number,
    totalCarryingCosts: number
  ): number {
    if (averageInventoryValue <= 0) return 0;
    return Math.round((totalCarryingCosts / averageInventoryValue) * 100 * 100) / 100;
  }

  /**
   * Calculate stock-to-sales ratio
   */
  static calculateStockToSalesRatio(
    averageInventoryValue: number,
    monthlySales: number
  ): {
    ratio: number;
    monthsOfInventory: number;
    category: 'low' | 'optimal' | 'high';
  } {
    if (monthlySales <= 0) {
      return {
        ratio: 0,
        monthsOfInventory: 0,
        category: 'high',
      };
    }

    const ratio = averageInventoryValue / monthlySales;
    const monthsOfInventory = ratio;
    
    let category: 'low' | 'optimal' | 'high' = 'optimal';
    if (ratio < 0.5) {
      category = 'low';
    } else if (ratio > 2) {
      category = 'high';
    }

    return {
      ratio: Math.round(ratio * 100) / 100,
      monthsOfInventory: Math.round(monthsOfInventory * 100) / 100,
      category,
    };
  }
}

// Export singleton instance for convenience
export const stockCalculations = StockCalculations;
export default StockCalculations;