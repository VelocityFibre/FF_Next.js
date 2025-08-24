/**
 * Project Enums
 * Enumeration types for project management
 */

export enum SOWDocumentType {
  POLES = 'poles',
  DROPS = 'drops',
  CABLE = 'cable',
  TRENCH = 'trench',
  OTHER = 'other',
  // Additional document types
  PROPOSAL = 'proposal',
  CONTRACT = 'contract',
  SOW = 'sow',
  TECHNICAL_SPEC = 'technical_spec',
  BUDGET = 'budget',
  SCHEDULE = 'schedule',
  REPORT = 'report',
  FIBRE = 'fibre',
  GENERAL = 'general',
  SITE_SURVEY = 'site_survey',
  TECHNICAL_SPECS = 'technical_specs',
  EQUIPMENT = 'equipment'
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_REVIEW = 'needs_review'
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}