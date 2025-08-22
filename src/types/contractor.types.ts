/**
 * Contractor Types - Complete type definitions for contractor management
 */

// ============================================
// CORE CONTRACTOR TYPES
// ============================================

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
  
  // Project Statistics
  totalProjects: number;
  completedProjects: number;
  activeProjects: number;
  cancelledProjects: number;
  
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

// ============================================
// CONTRACTOR TEAMS
// ============================================

export interface ContractorTeam {
  id: string;
  contractorId: string;
  
  // Team Details
  teamName: string;
  teamType: 'installation' | 'maintenance' | 'survey' | 'testing' | 'splicing';
  specialization?: string;
  
  // Capacity
  maxCapacity: number;
  currentCapacity: number;
  availableCapacity: number;
  
  // Performance
  efficiency?: number;
  qualityRating?: number;
  safetyRecord?: number;
  
  // Status
  isActive: boolean;
  availability: 'available' | 'busy' | 'unavailable';
  
  // Location
  baseLocation?: string;
  operatingRadius?: number; // km
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  contractorId: string;
  
  // Personal Details
  firstName: string;
  lastName: string;
  idNumber?: string;
  email?: string;
  phone?: string;
  
  // Professional Details
  role: string;
  skillLevel: 'junior' | 'intermediate' | 'senior' | 'expert';
  certifications?: string[];
  specialSkills?: string[];
  
  // Employment
  employmentType: 'permanent' | 'contract' | 'temporary';
  hourlyRate?: number;
  dailyRate?: number;
  
  // Status
  isActive: boolean;
  isTeamLead: boolean;
  
  // Performance
  performanceRating?: number;
  safetyScore?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// PROJECT ASSIGNMENTS
// ============================================

export interface ProjectAssignment {
  id: string;
  projectId: string; // Firebase project ID
  contractorId: string;
  teamId?: string;
  
  // Assignment Details
  assignmentType: 'primary' | 'subcontractor' | 'consultant' | 'specialist';
  scope: string;
  responsibilities?: string[];
  
  // Timeline
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  
  // Financial
  contractValue: number;
  paidAmount: number;
  outstandingAmount?: number;
  
  // Status
  status: AssignmentStatus;
  progressPercentage: number;
  
  // Performance
  performanceRating?: number;
  qualityScore?: number;
  timelinessScore?: number;
  
  // Notes
  assignmentNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export type AssignmentStatus = 'assigned' | 'active' | 'completed' | 'cancelled' | 'on_hold';

// ============================================
// CONTRACTOR DOCUMENTS
// ============================================

export interface ContractorDocument {
  id: string;
  contractorId: string;
  
  // Document Details
  documentType: DocumentType;
  documentName: string;
  documentNumber?: string;
  
  // File Information
  fileName: string;
  fileUrl: string;
  fileSize?: number; // bytes
  mimeType?: string;
  
  // Validity
  issueDate?: Date;
  expiryDate?: Date;
  isExpired: boolean;
  daysUntilExpiry?: number;
  
  // Status
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: Date;
  
  // Notes
  notes?: string;
  rejectionReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentType = 
  | 'tax_clearance'
  | 'insurance'
  | 'company_registration'
  | 'vat_certificate'
  | 'bee_certificate'
  | 'safety_certificate'
  | 'technical_certification'
  | 'bank_statement'
  | 'financial_statement'
  | 'reference_letter'
  | 'id_document'
  | 'other';

// ============================================
// FORM DATA TYPES
// ============================================

export interface ContractorFormData {
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
  
  // Status
  status: ContractorStatus;
  complianceStatus: 'pending' | 'compliant' | 'non_compliant' | 'under_review';
  
  // Metadata
  notes?: string;
  tags?: string[];
}

export interface TeamFormData {
  teamName: string;
  teamType: 'installation' | 'maintenance' | 'survey' | 'testing' | 'splicing';
  specialization?: string;
  maxCapacity: number;
  baseLocation?: string;
  operatingRadius?: number;
}

export interface MemberFormData {
  firstName: string;
  lastName: string;
  idNumber?: string;
  email?: string;
  phone?: string;
  role: string;
  skillLevel: 'junior' | 'intermediate' | 'senior' | 'expert';
  certifications?: string[];
  specialSkills?: string[];
  employmentType: 'permanent' | 'contract' | 'temporary';
  hourlyRate?: number;
  dailyRate?: number;
  isTeamLead: boolean;
}

// ============================================
// FILTER AND QUERY TYPES
// ============================================

export interface ContractorFilter {
  searchTerm?: string;
  status?: ContractorStatus[];
  complianceStatus?: string[];
  ragOverall?: RAGScore[];
  businessType?: string[];
  province?: string[];
  city?: string[];
  industryCategory?: string[];
  hasActiveProjects?: boolean;
  documentsExpiring?: boolean;
  tags?: string[];
}

export interface TeamFilter {
  contractorId?: string;
  teamType?: string[];
  availability?: string[];
  isActive?: boolean;
  hasCapacity?: boolean;
}

export interface AssignmentFilter {
  contractorId?: string;
  projectId?: string;
  status?: AssignmentStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// ============================================
// ANALYTICS AND REPORTING
// ============================================

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

// ============================================
// DASHBOARD DATA
// ============================================

export interface ContractorDashboardData {
  analytics: ContractorAnalytics;
  topPerformers: ContractorPerformance[];
  recentActivity: ContractorActivity[];
  urgentActions: UrgentAction[];
  upcomingDeadlines: Deadline[];
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

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ContractorListResponse {
  contractors: Contractor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContractorDetailResponse {
  contractor: Contractor;
  teams: ContractorTeam[];
  assignments: ProjectAssignment[];
  documents: ContractorDocument[];
  performance: ContractorPerformance;
}

// ============================================
// ERROR TYPES
// ============================================

export interface ContractorError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface ContractorValidationError extends ContractorError {
  field: string;
  value: any;
  constraint: string;
}