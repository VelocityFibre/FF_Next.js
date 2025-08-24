/**
 * Financial Score Calculator
 * Calculates RAG financial scores based on financial health indicators
 */

import {
  RAGFinancialBreakdown,
  RAGScoreResult,
  ContractorData
} from '../types';

export class FinancialCalculator {
  /**
   * Calculate financial score based on financial health indicators
   */
  static calculateScore(contractor: ContractorData): RAGScoreResult<RAGFinancialBreakdown> {
    const financialData = contractor.financialData;
    
    if (!financialData) {
      // No financial data available - neutral score
      const breakdown: RAGFinancialBreakdown = {
        creditScore: 70,
        cashFlow: 70,
        debtRatio: 70,
        profitability: 70,
        liquidityRatio: 70
      };
      
      return { score: 70, breakdown };
    }

    // Calculate individual financial metrics
    const creditScore = this.calculateCreditScore(financialData);
    const cashFlow = this.calculateCashFlowScore(financialData);
    const debtRatio = this.calculateDebtRatioScore(financialData);
    const profitability = this.calculateProfitabilityScore(financialData);
    const liquidityRatio = this.calculateLiquidityScore(financialData);

    const breakdown: RAGFinancialBreakdown = {
      creditScore,
      cashFlow,
      debtRatio,
      profitability,
      liquidityRatio
    };

    // Calculate weighted average
    const score = this.calculateWeightedScore(breakdown);

    return { score: Math.round(score), breakdown };
  }

  /**
   * Calculate credit score component
   */
  private static calculateCreditScore(financialData: any): number {
    const creditScore = financialData.creditScore || financialData.creditRating;
    
    if (!creditScore) return 70;

    // Convert various credit score formats to 100-point scale
    if (typeof creditScore === 'string') {
      switch (creditScore.toLowerCase()) {
        case 'aaa': case 'excellent': return 95;
        case 'aa': case 'very good': return 85;
        case 'a': case 'good': return 75;
        case 'bbb': case 'fair': return 65;
        case 'bb': case 'poor': return 45;
        case 'b': case 'very poor': return 25;
        default: return 70;
      }
    }

    // Numeric credit score (assume 0-850 scale like FICO)
    if (typeof creditScore === 'number') {
      if (creditScore >= 750) return 95;
      if (creditScore >= 700) return 85;
      if (creditScore >= 650) return 75;
      if (creditScore >= 600) return 65;
      if (creditScore >= 550) return 45;
      return 25;
    }

    return 70;
  }

  /**
   * Calculate cash flow score
   */
  private static calculateCashFlowScore(financialData: any): number {
    const operatingCashFlow = financialData.operatingCashFlow || financialData.cashFlow;
    const revenue = financialData.annualRevenue || financialData.revenue;
    
    if (!operatingCashFlow || !revenue) return 70;

    const cashFlowRatio = (operatingCashFlow / revenue) * 100;

    if (cashFlowRatio >= 15) return 95;
    if (cashFlowRatio >= 10) return 85;
    if (cashFlowRatio >= 5) return 75;
    if (cashFlowRatio >= 0) return 65;
    if (cashFlowRatio >= -5) return 45;
    return 25;
  }

  /**
   * Calculate debt-to-equity ratio score
   */
  private static calculateDebtRatioScore(financialData: any): number {
    const totalDebt = financialData.totalDebt || financialData.liabilities;
    const totalEquity = financialData.totalEquity || financialData.equity;
    
    if (!totalDebt || !totalEquity || totalEquity <= 0) return 70;

    const debtToEquityRatio = totalDebt / totalEquity;

    // Lower debt-to-equity is better
    if (debtToEquityRatio <= 0.3) return 95;
    if (debtToEquityRatio <= 0.5) return 85;
    if (debtToEquityRatio <= 1.0) return 75;
    if (debtToEquityRatio <= 1.5) return 65;
    if (debtToEquityRatio <= 2.0) return 45;
    return 25;
  }

  /**
   * Calculate profitability score
   */
  private static calculateProfitabilityScore(financialData: any): number {
    const netIncome = financialData.netIncome || financialData.profit;
    const revenue = financialData.annualRevenue || financialData.revenue;
    
    if (!netIncome || !revenue || revenue <= 0) return 70;

    const profitMargin = (netIncome / revenue) * 100;

    if (profitMargin >= 15) return 95;
    if (profitMargin >= 10) return 85;
    if (profitMargin >= 5) return 75;
    if (profitMargin >= 2) return 65;
    if (profitMargin >= 0) return 45;
    return 25;
  }

  /**
   * Calculate liquidity ratio score
   */
  private static calculateLiquidityScore(financialData: any): number {
    const currentAssets = financialData.currentAssets;
    const currentLiabilities = financialData.currentLiabilities;
    
    if (!currentAssets || !currentLiabilities || currentLiabilities <= 0) return 70;

    const currentRatio = currentAssets / currentLiabilities;

    // Current ratio between 1.5-3.0 is generally considered healthy
    if (currentRatio >= 2.0 && currentRatio <= 3.0) return 95;
    if (currentRatio >= 1.5 && currentRatio < 2.0) return 85;
    if (currentRatio >= 1.2 && currentRatio < 1.5) return 75;
    if (currentRatio >= 1.0 && currentRatio < 1.2) return 65;
    if (currentRatio >= 0.8 && currentRatio < 1.0) return 45;
    return 25;
  }

  /**
   * Calculate weighted financial score
   */
  private static calculateWeightedScore(breakdown: RAGFinancialBreakdown): number {
    return (
      breakdown.creditScore * 0.25 +
      breakdown.cashFlow * 0.25 +
      breakdown.debtRatio * 0.20 +
      breakdown.profitability * 0.20 +
      breakdown.liquidityRatio * 0.10
    );
  }

  /**
   * Get financial health status
   */
  static getFinancialHealthStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (score >= 85) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 65) return 'fair';
    if (score >= 45) return 'poor';
    return 'critical';
  }

  /**
   * Get financial recommendations
   */
  static getFinancialRecommendations(breakdown: RAGFinancialBreakdown): string[] {
    const recommendations: string[] = [];

    if (breakdown.creditScore < 70) {
      recommendations.push('Improve credit score through timely payments and debt reduction');
    }

    if (breakdown.cashFlow < 70) {
      recommendations.push('Focus on improving cash flow management and collection processes');
    }

    if (breakdown.debtRatio < 70) {
      recommendations.push('Reduce debt-to-equity ratio through debt repayment or equity increase');
    }

    if (breakdown.profitability < 70) {
      recommendations.push('Improve profit margins through cost optimization or pricing adjustments');
    }

    if (breakdown.liquidityRatio < 70) {
      recommendations.push('Increase current ratio by building cash reserves or reducing short-term liabilities');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain current financial performance levels');
    }

    return recommendations;
  }
}