// Client Management Types for FibreFlow
// Based on Angular Firebase implementation

import { Timestamp } from 'firebase/firestore';

export interface Client {
  id?: string;
  name: string; // Organization name
  contactPerson: string;
  email: string;
  phone: string;
  
  // Address Information
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  billingAddress?: AddressFormData;
  
  // Business Information
  registrationNumber?: string;
  vatNumber?: string;
  industry: string;
  website?: string;
  
  // Contact Details
  alternativeEmail?: string;
  alternativePhone?: string;
  faxNumber?: string;
  
  // Financial Information
  creditLimit: number;
  currentBalance: number;
  paymentTerms: PaymentTerms;
  creditRating: CreditRating;
  
  // Status and Categories
  status: ClientStatus;
  category: ClientCategory;
  priority: ClientPriority;
  
  // Project Metrics (auto-calculated)
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalProjectValue: number;
  averageProjectValue: number;
  
  // Relationship Management
  accountManagerId?: string;
  accountManagerName?: string;
  salesRepresentativeId?: string;
  salesRepresentativeName?: string;
  
  // Communication Preferences
  preferredContactMethod: ContactMethod;
  
  // Additional fields from ClientFormData
  taxExempt?: boolean;
  requiresPO?: boolean;
  autoApproveOrders?: boolean;
  allowBackorders?: boolean;
  communicationLanguage: string;
  timezone: string;
  
  // Notes and History
  notes?: string;
  tags: string[];
  lastContactDate?: Timestamp;
  nextFollowUpDate?: Timestamp;
  
  // Service Preferences
  serviceTypes: ServiceType[];
  preferredContractors?: string[];
  specialRequirements?: string;
  
  // Audit Fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy: string;
}

// Enums

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

// Form Types

// Address structure for forms
export interface AddressFormData {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  sameAsPhysical?: boolean; // For billing address
}

export interface ClientFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: AddressFormData; // Address as object
  // Individual address fields for backward compatibility
  street?: string;
  city?: string;
  state?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  billingAddress?: AddressFormData; // Added missing billing address
  registrationNumber?: string;
  vatNumber?: string;
  industry: string;
  website?: string;
  alternativeEmail?: string;
  alternativePhone?: string;
  creditLimit: number;
  paymentTerms: PaymentTerms;
  creditRating: CreditRating;
  status: ClientStatus;
  category: ClientCategory;
  priority: ClientPriority;
  accountManagerId?: string;
  salesRepresentativeId?: string;
  preferredContactMethod: ContactMethod;
  communicationLanguage: string;
  timezone: string;
  notes?: string;
  tags: string[];
  serviceTypes: ServiceType[];
  specialRequirements?: string;
  taxExempt?: boolean;
  requiresPO?: boolean;
  autoApproveOrders?: boolean;
  allowBackorders?: boolean;
}

// Filter Types

export interface ClientFilter {
  status?: ClientStatus[];
  category?: ClientCategory[];
  priority?: ClientPriority[];
  serviceTypes?: ServiceType[];
  accountManagerId?: string;
  salesRepresentativeId?: string;
  city?: string;
  province?: string;
  industry?: string;
  creditRating?: CreditRating[];
  searchTerm?: string;
}

// Summary Types

export interface ClientSummary {
  totalClients: number;
  activeClients: number;
  prospectClients: number;
  inactiveClients: number;
  totalProjectValue: number;
  averageProjectValue: number;
  topClientsByValue: Client[];
  clientsByCategory: { [key: string]: number };
  clientsByStatus: { [key: string]: number };
  clientsByPriority: { [key: string]: number };
  monthlyGrowth: number;
  conversionRate: number;
}

// Contact History

export interface ContactHistory {
  id?: string;
  clientId: string;
  contactDate: Timestamp;
  contactMethod: ContactMethod;
  contactedBy: string;
  contactedByName: string;
  purpose: ContactPurpose;
  summary: string;
  outcome: ContactOutcome;
  nextAction?: string;
  nextActionDate?: Timestamp;
  attachments?: string[];
  createdAt: Timestamp;
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

// Dropdown Data Types for UI

export interface ClientDropdownOption {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: ClientStatus;
  category: ClientCategory;
}

export interface ClientMetrics {
  clientId: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalProjectValue: number;
  averageProjectValue: number;
  lastProjectDate?: Timestamp;
  averageProjectDuration: number;
  onTimeCompletionRate: number;
}

// Import Types for CSV/Excel

export interface ClientImportRow {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  registrationNumber?: string;
  vatNumber?: string;
  industry?: string;
  website?: string;
  alternativeEmail?: string;
  alternativePhone?: string;
  creditLimit?: string | number;
  paymentTerms?: string;
  creditRating?: string;
  status?: string;
  category?: string;
  priority?: string;
  preferredContactMethod?: string;
  communicationLanguage?: string;
  timezone?: string;
  notes?: string;
  tags?: string;
  serviceTypes?: string;
}

export interface ClientImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: ClientImportError[];
  clients: Client[];
}

export interface ClientImportError {
  row: number;
  field: string;
  message: string;
  value?: any;
}