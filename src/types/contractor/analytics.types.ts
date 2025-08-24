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
  ragDistribution: {
    green: number;
    amber: number;
    red: number;
  };
  
  // Performance Metrics
  averagePerformanceScore: number;
  averageSafetyScore: number;
  averageQualityScore: number;
  averageTimelinessScore: number;
  
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