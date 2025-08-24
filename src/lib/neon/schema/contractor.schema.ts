/**
 * Neon Database Schema - Contractor Management Domain
 * Contractors, Teams, Members, Assignments, and Documents
 */

import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json, uuid, index } from 'drizzle-orm/pg-core';

// ============================================
// CONTRACTOR MANAGEMENT TABLES
// ============================================

// Contractors (Core Entity)
export const contractors = pgTable('contractors', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyName: text('company_name').notNull(),
  registrationNumber: varchar('registration_number', { length: 50 }).notNull().unique(),
  
  // Contact Information
  contactPerson: text('contact_person').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  alternatePhone: varchar('alternate_phone', { length: 20 }),
  
  // Address
  physicalAddress: text('physical_address'),
  postalAddress: text('postal_address'),
  city: varchar('city', { length: 100 }),
  province: varchar('province', { length: 100 }),
  postalCode: varchar('postal_code', { length: 10 }),
  
  // Business Details
  businessType: varchar('business_type', { length: 50 }), // pty_ltd, cc, sole_proprietor
  industryCategory: varchar('industry_category', { length: 100 }),
  yearsInBusiness: integer('years_in_business'),
  employeeCount: integer('employee_count'),
  
  // Financial Information
  annualTurnover: decimal('annual_turnover', { precision: 15, scale: 2 }),
  creditRating: varchar('credit_rating', { length: 10 }),
  paymentTerms: varchar('payment_terms', { length: 50 }),
  bankName: varchar('bank_name', { length: 100 }),
  accountNumber: varchar('account_number', { length: 50 }),
  branchCode: varchar('branch_code', { length: 10 }),
  
  // Status & Compliance
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, approved, suspended, blacklisted
  isActive: boolean('is_active').default(true),
  complianceStatus: varchar('compliance_status', { length: 20 }).default('pending'),
  
  // RAG Scoring
  ragOverall: varchar('rag_overall', { length: 10 }).default('amber'), // red, amber, green
  ragFinancial: varchar('rag_financial', { length: 10 }).default('amber'),
  ragCompliance: varchar('rag_compliance', { length: 10 }).default('amber'),
  ragPerformance: varchar('rag_performance', { length: 10 }).default('amber'),
  ragSafety: varchar('rag_safety', { length: 10 }).default('amber'),
  
  // Performance Metrics
  performanceScore: decimal('performance_score', { precision: 5, scale: 2 }),
  safetyScore: decimal('safety_score', { precision: 5, scale: 2 }),
  qualityScore: decimal('quality_score', { precision: 5, scale: 2 }),
  timelinessScore: decimal('timeliness_score', { precision: 5, scale: 2 }),
  
  // Project Statistics
  totalProjects: integer('total_projects').default(0),
  completedProjects: integer('completed_projects').default(0),
  activeProjects: integer('active_projects').default(0),
  cancelledProjects: integer('cancelled_projects').default(0),
  
  // Onboarding
  onboardingProgress: integer('onboarding_progress').default(0), // 0-100
  onboardingCompletedAt: timestamp('onboarding_completed_at'),
  documentsExpiring: integer('documents_expiring').default(0),
  
  // Metadata
  notes: text('notes'),
  tags: json('tags'), // Array of tags
  lastActivity: timestamp('last_activity'),
  nextReviewDate: timestamp('next_review_date'),
  
  // Audit
  createdBy: varchar('created_by', { length: 255 }),
  updatedBy: varchar('updated_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    regNumberIdx: index('contractor_reg_number_idx').on(table.registrationNumber),
    statusIdx: index('contractor_status_idx').on(table.status),
    ragOverallIdx: index('contractor_rag_idx').on(table.ragOverall),
    emailIdx: index('contractor_email_idx').on(table.email),
  }
});

// Contractor Teams
export const contractorTeams = pgTable('contractor_teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  contractorId: uuid('contractor_id').notNull().references(() => contractors.id, { onDelete: 'cascade' }),
  
  // Team Details
  teamName: text('team_name').notNull(),
  teamType: varchar('team_type', { length: 50 }), // installation, maintenance, survey
  specialization: varchar('specialization', { length: 100 }),
  
  // Capacity
  maxCapacity: integer('max_capacity').notNull(),
  currentCapacity: integer('current_capacity').default(0),
  availableCapacity: integer('available_capacity').default(0),
  
  // Performance
  efficiency: decimal('efficiency', { precision: 5, scale: 2 }),
  qualityRating: decimal('quality_rating', { precision: 5, scale: 2 }),
  safetyRecord: decimal('safety_record', { precision: 5, scale: 2 }),
  
  // Status
  isActive: boolean('is_active').default(true),
  availability: varchar('availability', { length: 20 }).default('available'), // available, busy, unavailable
  
  // Location
  baseLocation: text('base_location'),
  operatingRadius: integer('operating_radius'), // km
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    contractorTeamIdx: index('contractor_team_idx').on(table.contractorId),
    teamTypeIdx: index('team_type_idx').on(table.teamType),
  }
});

// Team Members
export const teamMembers = pgTable('team_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').notNull().references(() => contractorTeams.id, { onDelete: 'cascade' }),
  contractorId: uuid('contractor_id').notNull().references(() => contractors.id, { onDelete: 'cascade' }),
  
  // Personal Details
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  idNumber: varchar('id_number', { length: 20 }).unique(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  
  // Professional Details
  role: varchar('role', { length: 50 }).notNull(),
  skillLevel: varchar('skill_level', { length: 20 }), // junior, intermediate, senior, expert
  certifications: json('certifications'), // Array of certifications
  specialSkills: json('special_skills'), // Array of skills
  
  // Employment
  employmentType: varchar('employment_type', { length: 20 }), // permanent, contract, temporary
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  dailyRate: decimal('daily_rate', { precision: 10, scale: 2 }),
  
  // Status
  isActive: boolean('is_active').default(true),
  isTeamLead: boolean('is_team_lead').default(false),
  
  // Performance
  performanceRating: decimal('performance_rating', { precision: 5, scale: 2 }),
  safetyScore: decimal('safety_score', { precision: 5, scale: 2 }),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    teamMemberIdx: index('team_member_idx').on(table.teamId),
    contractorMemberIdx: index('contractor_member_idx').on(table.contractorId),
    idNumberIdx: index('member_id_number_idx').on(table.idNumber),
  }
});

// Project Assignments
export const projectAssignments = pgTable('project_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(), // Firebase project ID
  contractorId: uuid('contractor_id').notNull().references(() => contractors.id),
  teamId: uuid('team_id').references(() => contractorTeams.id),
  
  // Assignment Details
  assignmentType: varchar('assignment_type', { length: 50 }), // primary, subcontractor, consultant
  scope: text('scope').notNull(),
  responsibilities: json('responsibilities'), // Array of responsibilities
  
  // Timeline
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  actualStartDate: timestamp('actual_start_date'),
  actualEndDate: timestamp('actual_end_date'),
  
  // Financial
  contractValue: decimal('contract_value', { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 15, scale: 2 }).default('0'),
  outstandingAmount: decimal('outstanding_amount', { precision: 15, scale: 2 }),
  
  // Status
  status: varchar('status', { length: 20 }).notNull().default('assigned'), // assigned, active, completed, cancelled
  progressPercentage: integer('progress_percentage').default(0),
  
  // Performance
  performanceRating: decimal('performance_rating', { precision: 5, scale: 2 }),
  qualityScore: decimal('quality_score', { precision: 5, scale: 2 }),
  timelinessScore: decimal('timeliness_score', { precision: 5, scale: 2 }),
  
  // Notes
  assignmentNotes: text('assignment_notes'),
  completionNotes: text('completion_notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectContractorIdx: index('project_contractor_idx').on(table.projectId, table.contractorId),
    contractorAssignmentIdx: index('contractor_assignment_idx').on(table.contractorId),
    statusIdx: index('assignment_status_idx').on(table.status),
  }
});

// Contractor Documents
export const contractorDocuments = pgTable('contractor_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  contractorId: uuid('contractor_id').notNull().references(() => contractors.id, { onDelete: 'cascade' }),
  
  // Document Details
  documentType: varchar('document_type', { length: 50 }).notNull(), // tax_clearance, insurance, certifications
  documentName: text('document_name').notNull(),
  documentNumber: varchar('document_number', { length: 100 }),
  
  // File Information
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'), // bytes
  mimeType: varchar('mime_type', { length: 100 }),
  
  // Validity
  issueDate: timestamp('issue_date'),
  expiryDate: timestamp('expiry_date'),
  isExpired: boolean('is_expired').default(false),
  daysUntilExpiry: integer('days_until_expiry'),
  
  // Status
  verificationStatus: varchar('verification_status', { length: 20 }).default('pending'), // pending, verified, rejected
  verifiedBy: varchar('verified_by', { length: 255 }),
  verifiedAt: timestamp('verified_at'),
  
  // Notes
  notes: text('notes'),
  rejectionReason: text('rejection_reason'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    contractorDocIdx: index('contractor_doc_idx').on(table.contractorId),
    docTypeIdx: index('doc_type_idx').on(table.documentType),
    docExpiryIdx: index('contractor_doc_expiry_idx').on(table.expiryDate),
  }
});

// Contractor Type Exports
export type Contractor = typeof contractors.$inferSelect;
export type NewContractor = typeof contractors.$inferInsert;

export type ContractorTeam = typeof contractorTeams.$inferSelect;
export type NewContractorTeam = typeof contractorTeams.$inferInsert;

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;

export type ProjectAssignment = typeof projectAssignments.$inferSelect;
export type NewProjectAssignment = typeof projectAssignments.$inferInsert;

export type ContractorDocument = typeof contractorDocuments.$inferSelect;
export type NewContractorDocument = typeof contractorDocuments.$inferInsert;