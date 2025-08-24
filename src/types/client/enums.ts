/**
 * Client Management Enums
 * All enumeration types for client classification and status
 */

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PROSPECT = 'prospect',
  FORMER = 'former',
  CHURNED = 'churned',
}

export enum ClientType {
  CORPORATE = 'corporate',
  INDIVIDUAL = 'individual',
  GOVERNMENT = 'government',
  NON_PROFIT = 'non_profit'
}

export enum ClientCategory {
  ENTERPRISE = 'enterprise',
  SME = 'sme',
  RESIDENTIAL = 'residential',
  GOVERNMENT = 'government',
  NON_PROFIT = 'non_profit',
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
}

export enum ClientPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  VIP = 'vip',
}

export enum PaymentTerms {
  IMMEDIATE = 'immediate',
  NET_7 = 'net_7',
  NET_14 = 'net_14',
  NET_30 = 'net_30',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
  PREPAID = 'prepaid',
  ON_DELIVERY = 'on_delivery',
}

export enum CreditRating {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  UNRATED = 'unrated',
}

export enum ContactMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  IN_PERSON = 'in_person',
  VIDEO_CALL = 'video_call',
}

export enum ServiceType {
  FTTH = 'ftth',
  FTTB = 'fttb',
  FTTC = 'fttc',
  BACKBONE = 'backbone',
  ENTERPRISE = 'enterprise',
  WIRELESS = 'wireless',
  MAINTENANCE = 'maintenance',
  CONSULTING = 'consulting',
}

export enum ContactPurpose {
  INITIAL_CONTACT = 'initial_contact',
  FOLLOW_UP = 'follow_up',
  PROJECT_DISCUSSION = 'project_discussion',
  PROPOSAL = 'proposal',
  CONTRACT_NEGOTIATION = 'contract_negotiation',
  SUPPORT = 'support',
  COMPLAINT = 'complaint',
  PAYMENT = 'payment',
  GENERAL = 'general',
}

export enum ContactOutcome {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  NO_RESPONSE = 'no_response',
  MEETING_SCHEDULED = 'meeting_scheduled',
  PROPOSAL_REQUESTED = 'proposal_requested',
  CONTRACT_SIGNED = 'contract_signed',
  ISSUE_RESOLVED = 'issue_resolved',
}