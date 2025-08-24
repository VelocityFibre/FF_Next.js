/**
 * Contractor Base Types - Core contractor and status definitions
 */

export interface Contractor {
  id: string;
  
  // Company Information
  companyName: string;
  registrationNumber: string;
  businessType: 'pty_ltd' | 'cc' | 'sole_proprietor' | 'partnership';
  industryCategory: string;
  yearsInBusiness?: number;
  employeeCount?: number;
  
  // Contact Information
  contactPerson: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  
  // Address
  physicalAddress?: string;
  postalAddress?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  
  // Financial Information
  annualTurnover?: number;
  creditRating?: string;
  paymentTerms?: string;
  bankName?: string;
  accountNumber?: string;
  branchCode?: string;
  
  // Status & Compliance
  status: ContractorStatus;
  isActive: boolean;
  complianceStatus: 'pending' | 'compliant' | 'non_compliant' | 'under_review';
  
  // RAG Scoring
  ragOverall: RAGScore;
  ragFinancial: RAGScore;
  ragCompliance: RAGScore;
  ragPerformance: RAGScore;
  ragSafety: RAGScore;
  
  // Performance Metrics
  performanceScore?: number;
  safetyScore?: number;
  qualityScore?: number;
  timelinessScore?: number;
  
  // Contractor Specializations
  specializations?: string[];
  
  // Project Statistics
  totalProjects: number;
  completedProjects: number;
  activeProjects: number;
  cancelledProjects: number;
  
  // Additional Project Metrics
  successRate?: number;
  onTimeCompletion?: number;
  averageProjectValue?: number;
  
  // Contractor Certifications
  certifications?: string[];
  
  // Onboarding
  onboardingProgress: number; // 0-100
  onboardingCompletedAt?: Date;
  documentsExpiring: number;
  
  // Metadata
  notes?: string;
  tags?: string[];
  lastActivity?: Date;
  nextReviewDate?: Date;
  
  // Audit
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ContractorStatus = 'pending' | 'approved' | 'suspended' | 'blacklisted' | 'under_review';
export type RAGScore = 'red' | 'amber' | 'green';