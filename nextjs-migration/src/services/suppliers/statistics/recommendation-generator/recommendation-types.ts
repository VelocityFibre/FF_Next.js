/**
 * Recommendation Types
 * Type definitions for supplier recommendation generation
 */

export interface RecommendationItem {
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'compliance' | 'performance' | 'communication' | 'business' | 'industry';
  impact: string;
  timeline: string;
  estimatedCost?: 'low' | 'medium' | 'high';
  difficulty?: 'low' | 'medium' | 'high';
}

export interface ImprovementPlan {
  immediate: string[];
  shortTerm: string[];
  mediumTerm: string[];
  longTerm: string[];
}

export interface RecommendationAnalysis {
  totalRecommendations: number;
  priorityBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  estimatedImpact: 'high' | 'medium' | 'low';
  implementationComplexity: 'high' | 'medium' | 'low';
}

export interface ComplianceInfo {
  score: number;
  status: string;
  lastCheck: Date;
}

export const RECOMMENDATION_THRESHOLDS = {
  CRITICAL_SCORE: 60,
  IMPROVEMENT_SCORE: 80,
  MIN_RATING: 3.5,
  MIN_COMPLIANCE: 80,
  MIN_DELIVERY: 90,
  MIN_QUALITY: 85,
  PREFERRED_SCORE: 85
};

export const TIMELINE_CATEGORIES = {
  IMMEDIATE: 'Immediate (1-7 days)',
  SHORT_TERM: 'Short term (1-8 weeks)',
  MEDIUM_TERM: 'Medium term (2-12 weeks)',
  LONG_TERM: 'Long term (3-6 months)'
};

export const INDUSTRY_CATEGORIES = {
  TECHNOLOGY: ['technology', 'software', 'IT', 'digital'],
  CONSTRUCTION: ['construction', 'building', 'infrastructure', 'civil'],
  MANUFACTURING: ['manufacturing', 'production', 'industrial', 'factory'],
  PROFESSIONAL: ['consulting', 'professional', 'advisory', 'services'],
  LOGISTICS: ['logistics', 'shipping', 'transportation', 'supply chain'],
  HEALTHCARE: ['healthcare', 'medical', 'pharmaceutical', 'biotech']
};