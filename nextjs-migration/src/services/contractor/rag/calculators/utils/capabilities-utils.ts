/**
 * Utility functions specific to capabilities calculations
 */

import { CAPABILITIES_CONFIG } from '../config/capabilities-config';
import { clampScore } from './scoring-utils';

/**
 * Calculate equipment age bonus
 */
export const calculateEquipmentAgeBonus = (age: number): number => {
  const ageBonuses = CAPABILITIES_CONFIG.EQUIPMENT_SCORES.AGE_BONUSES;
  
  for (let i = 0; i < ageBonuses.length - 1; i++) {
    const item = ageBonuses[i];
    if ('threshold' in item && 'bonus' in item && age <= item.threshold) {
      return item.bonus;
    }
  }
  
  const lastItem = ageBonuses[ageBonuses.length - 1];
  return 'penalty' in lastItem ? -lastItem.penalty : 0;
};

/**
 * Calculate maintenance bonus based on days since last service
 */
export const calculateMaintenanceBonus = (lastMaintenance: string): number => {
  const daysSinceService = Math.floor(
    (new Date().getTime() - new Date(lastMaintenance).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const bonuses = CAPABILITIES_CONFIG.EQUIPMENT_SCORES.MAINTENANCE_BONUSES;
  
  for (const item of bonuses) {
    if (daysSinceService <= item.days) {
      return 'bonus' in item ? item.bonus : 0;
    } else if ('penalty' in item && daysSinceService > item.days) {
      return -item.penalty;
    }
  }
  
  return 0;
};

/**
 * Calculate condition bonus for equipment
 */
export const calculateConditionBonus = (condition: string): number => {
  return CAPABILITIES_CONFIG.EQUIPMENT_SCORES.CONDITION_BONUSES[
    condition?.toLowerCase() as keyof typeof CAPABILITIES_CONFIG.EQUIPMENT_SCORES.CONDITION_BONUSES
  ] || 0;
};

/**
 * Calculate single equipment item score
 */
export const calculateEquipmentItemScore = (item: {
  age: number;
  condition: string;
  lastMaintenance?: string;
}): number => {
  let itemScore = CAPABILITIES_CONFIG.EQUIPMENT_SCORES.BASE_SCORE;
  
  // Apply age scoring
  itemScore += calculateEquipmentAgeBonus(item.age);
  
  // Apply condition scoring
  itemScore += calculateConditionBonus(item.condition);
  
  // Apply maintenance scoring
  if (item.lastMaintenance) {
    itemScore += calculateMaintenanceBonus(item.lastMaintenance);
  }
  
  return clampScore(itemScore);
};

/**
 * Calculate specialization count bonus
 */
export const calculateSpecializationCountBonus = (specializationCount: number): number => {
  const config = CAPABILITIES_CONFIG.SPECIALIZATION;
  
  if (specializationCount >= 3 && specializationCount <= 5) {
    return config.SWEET_SPOT_BONUS;
  } else if (specializationCount >= 2) {
    return config.GOOD_BONUS;
  } else if (specializationCount === 1) {
    return config.FOCUS_BONUS;
  }
  
  return config.NO_SPEC_PENALTY;
};

/**
 * Apply growth indicators to scalability score
 */
export const applyGrowthIndicators = (
  score: number,
  recentGrowth?: {
    staffIncrease?: number;
    revenueGrowth?: number;
  }
): number => {
  if (!recentGrowth) return score;
  
  let bonusScore = score;
  
  if (recentGrowth.staffIncrease && recentGrowth.staffIncrease > 0) {
    bonusScore += 10;
  }
  if (recentGrowth.revenueGrowth && recentGrowth.revenueGrowth > 0.1) {
    bonusScore += 5;
  }
  
  return bonusScore;
};