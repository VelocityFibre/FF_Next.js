/**
 * Stock Analytics Types - Dashboard and reporting definitions
 */

import { CurrencyType } from './enums.types';

// Money type matching the spec
export interface Money {
  amount: number;
  currency: CurrencyType;
}

// Project scope type matching the spec
export interface ProjectScope {
  projectId: string;
  siteIds?: string[];
  phaseIds?: string[];
}

// Stock statistics for dashboard
export interface StockStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  criticalStockItems: number;
  excessStockItems: number;
  obsoleteItems: number;
  totalMovements: number;
  pendingMovements: number;
  completedMovements: number;
  averageMovementsPerDay: number;
  topMovingItems: Array<{
    itemCode: string;
    itemName: string;
    movementCount: number;
    totalQuantity: number;
  }>;
}

// Stock alert interface
export interface StockAlert {
  id: string;
  projectId: string;
  alertType: 'LOW_STOCK' | 'CRITICAL_STOCK' | 'EXCESS_STOCK' | 'EXPIRED' | 'NO_MOVEMENT';
  itemCode: string;
  itemName: string;
  currentQuantity?: number;
  thresholdQuantity?: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

// Drum analytics specific types
export interface DrumAnalytics {
  totalDrums: number;
  availableDrums: number;
  inUseDrums: number;
  completedDrums: number;
  returnedDrums: number;
  totalCableLength: number;
  usedCableLength: number;
  averageUtilization: number;
  drumsByType: Array<{
    cableType: string;
    count: number;
    totalLength: number;
    usedLength: number;
    utilization: number;
  }>;
}

// Stock valuation types
export interface StockValuation {
  totalValue: Money;
  valueByCategory: Array<{
    category: string;
    value: Money;
    percentage: number;
  }>;
  valueByProject: Array<{
    projectId: string;
    projectName: string;
    value: Money;
    percentage: number;
  }>;
  slowMovingValue: Money;
  deadStockValue: Money;
}