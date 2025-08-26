/**
 * Performance Dashboard Types - Type definitions for contractor performance analytics
 * Following FibreFlow patterns and TypeScript strict mode
 */

import { RAGScoreDetails } from '@/types/contractor.types';

// 🟢 WORKING: Core performance dashboard data structure
export interface PerformanceDashboardData {
  overview: PerformanceOverview;
  ragDistribution: RAGDistribution;
  trends: PerformanceTrends;
  leaderboards: PerformanceLeaderboards;
  comparativeAnalysis: ComparativeAnalysis;
}

// 🟢 WORKING: Performance overview metrics
export interface PerformanceOverview {
  totalContractors: number;
  averageRAGScore: number;
  performanceDistribution: {
    excellent: number; // 90-100
    good: number;      // 70-89
    fair: number;      // 50-69
    poor: number;      // 0-49
  };
  lastUpdated: Date;
}

// 🟢 WORKING: RAG score distribution for charts
export interface RAGDistribution {
  byRisk: {
    low: number;
    medium: number;
    high: number;
  };
  byScore: {
    range: string;
    count: number;
    percentage: number;
  }[];
}

// 🟢 WORKING: Performance trend data
export interface PerformanceTrends {
  timeRange: string;
  data: PerformanceTrendPoint[];
  averageImprovement: number;
  trendsDirection: 'up' | 'down' | 'stable';
}

export interface PerformanceTrendPoint {
  date: string;
  averageScore: number;
  contractorCount: number;
  improvements: number;
  deteriorations: number;
}

// 🟢 WORKING: Leaderboard data structures
export interface PerformanceLeaderboards {
  topPerformers: ContractorPerformanceMetrics[];
  bottomPerformers: ContractorPerformanceMetrics[];
  mostImproved: ContractorPerformanceMetrics[];
  recentlyDeclined: ContractorPerformanceMetrics[];
}

// 🟢 WORKING: Individual contractor performance metrics
export interface ContractorPerformanceMetrics {
  contractorId: string;
  companyName: string;
  currentRAGScore: RAGScoreDetails;
  previousRAGScore?: RAGScoreDetails;
  scoreTrend: {
    direction: 'up' | 'down' | 'stable';
    change: number;
    percentageChange: number;
  };
  activeProjects: number;
  completedProjects: number;
  performanceCategory: 'excellent' | 'good' | 'fair' | 'poor';
  riskLevel: 'low' | 'medium' | 'high';
}

// 🟢 WORKING: Comparative analysis data
export interface ComparativeAnalysis {
  industryBenchmark?: {
    averageScore: number;
    category: string;
  };
  peerComparison: {
    abovePeers: number;
    belowPeers: number;
    atPeerLevel: number;
  };
  performanceSegments: PerformanceSegment[];
}

export interface PerformanceSegment {
  segmentName: string;
  averageScore: number;
  contractorCount: number;
  improvement: number;
}

// 🟢 WORKING: Chart data structures for Recharts
export interface RAGChartData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface TrendChartData {
  date: string;
  overall: number;
  performance: number;
  financial: number;
  reliability: number;
  capabilities: number;
}

export interface LeaderboardChartData {
  contractor: string;
  score: number;
  change: number;
  category: string;
}

// 🟢 WORKING: Performance filters and options
export interface PerformanceFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  scoreRange: {
    min: number;
    max: number;
  };
  riskLevels: ('low' | 'medium' | 'high')[];
  categories: ('excellent' | 'good' | 'fair' | 'poor')[];
  contractorTypes?: string[];
}

// 🟢 WORKING: Dashboard configuration
export interface PerformanceDashboardConfig {
  refreshInterval: number;
  chartColors: {
    excellent: string;
    good: string;
    fair: string;
    poor: string;
    low: string;
    medium: string;
    high: string;
  };
  displayOptions: {
    showTrends: boolean;
    showComparative: boolean;
    showLeaderboards: boolean;
    leaderboardLimit: number;
  };
}

// 🟢 WORKING: API response types
export interface PerformanceAnalyticsResponse {
  success: boolean;
  data: PerformanceDashboardData;
  metadata: {
    totalRecords: number;
    calculatedAt: Date;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  errors?: string[];
}

// 🟢 WORKING: Component prop types
export interface PerformanceDashboardProps {
  refreshInterval?: number;
  showFilters?: boolean;
  defaultFilters?: Partial<PerformanceFilters>;
  onContractorSelect?: (contractorId: string) => void;
  className?: string;
}

export interface RAGScoreChartProps {
  data: RAGChartData[];
  title: string;
  showLegend?: boolean;
  height?: number;
  onSegmentClick?: (segment: RAGChartData) => void;
}

export interface TrendIndicatorsProps {
  trends: PerformanceTrends;
  showDetails?: boolean;
  className?: string;
}

export interface PerformanceLeaderboardProps {
  topPerformers: ContractorPerformanceMetrics[];
  bottomPerformers: ContractorPerformanceMetrics[];
  limit?: number;
  onContractorClick?: (contractorId: string) => void;
  showTrends?: boolean;
}