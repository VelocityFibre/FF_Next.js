/**
 * Contractor Analytics Types - Analytics and reporting definitions
 */

export interface ContractorAnalytics {
  totalContractors: number;
  activeContractors: number;
  approvedContractors: number;
  pendingApproval: number;
  suspended: number;
  blacklisted: number;
  
  // RAG Distribution
  ragDistribution?: {
    green: number;
    amber: number;
    red: number;
  };
  
  // Enhanced RAG Distribution for performance dashboard
  riskDistribution?: {
    low: number;
    medium: number;
    high: number;
  };
  
  // Performance Metrics
  averagePerformanceScore: number;
  averageSafetyScore: number;
  averageQualityScore: number;
  averageTimelinessScore: number;
  
  // Enhanced performance metrics
  averageRAGScore?: number;
  performanceBreakdown?: {
    excellent: number; // 90-100
    good: number;      // 70-89
    fair: number;      // 50-69
    poor: number;      // 0-49
  };
  
  // Score distribution for charts
  scoreDistribution?: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  
  // Performance trends
  performanceTrends?: Array<{
    date: string;
    averageScore: number;
    contractorCount: number;
    improvements: number;
    deteriorations: number;
  }>;
  
  // Trend direction and improvement metrics
  trendsDirection?: 'up' | 'down' | 'stable';
  averageImprovement?: number;
  
  // Peer comparison data
  peerComparison?: {
    above: number;
    below: number;
    at: number;
  };
  
  // Performance segments
  segments?: Array<{
    segmentName: string;
    averageScore: number;
    contractorCount: number;
    improvement: number;
  }>;
  
  // Project Statistics
  totalActiveProjects: number;
  totalCompletedProjects: number;
  averageProjectsPerContractor: number;
  
  // Compliance
  documentsExpiringSoon: number;
  complianceIssues: number;
  pendingDocuments: number;
}

export interface ContractorPerformance {
  contractorId: string;
  companyName: string;
  projectsCompleted: number;
  averageProjectDuration: number; // days
  onTimeCompletionRate: number; // percentage
  averageQualityScore: number;
  averageSafetyScore: number;
  clientSatisfactionScore: number;
  incidentCount: number;
  totalRevenue: number;
  
  // Recent performance trend
  recentPerformanceTrend: 'improving' | 'stable' | 'declining';
  lastProjectCompletion?: Date;
  nextProjectStart?: Date;
}

export interface ContractorActivity {
  id: string;
  type: 'created' | 'updated' | 'approved' | 'suspended' | 'project_assigned' | 'document_uploaded';
  contractorId: string;
  contractorName: string;
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

export interface UrgentAction {
  id: string;
  type: 'document_expiring' | 'compliance_issue' | 'performance_review' | 'contract_renewal';
  contractorId: string;
  contractorName: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: Date;
}

export interface Deadline {
  id: string;
  type: 'document_expiry' | 'contract_end' | 'review_due' | 'certification_renewal';
  contractorId: string;
  contractorName: string;
  description: string;
  date: Date;
  daysRemaining: number;
}