/**
 * Base supplier types and interfaces
 */

export interface Supplier {
  id: string;
  code: string;
  name: string;
  tradingName?: string;
  registrationNumber?: string;
  taxNumber?: string;
  status: SupplierStatus;
  businessType: BusinessType;
  categories: ProductCategory[];
  rating: number;
  primaryContact: ContactInfo;
  alternativeContacts?: AlternativeContact[];
  addresses: {
    physical: Address;
    postal?: Address;
    billing?: Address;
  };
  bankingInfo?: BankingInfo;
  complianceStatus?: ComplianceStatus;
  documents?: SupplierDocument[];
  certifications?: Certification[];
  website?: string;
  email: string;
  phone: string;
  fax?: string;
  notes?: string;
  tags?: string[];
  employeeSize?: EmployeeSize;
  annualRevenue?: RevenueRange;
  establishedDate?: Date | string;
  preferredPaymentTerms?: PaymentTerms;
  currency?: Currency;
  creditLimit?: number;
  leadTime?: number; // in days
  minimumOrderValue?: number;
  blacklisted?: boolean;
  blacklistReason?: string;
  performance?: SupplierPerformance;
  contracts?: SupplierContract[];
  priceListIds?: string[];
  sla?: ServiceLevelAgreement;
  integrations?: {
    apiEnabled?: boolean;
    ediEnabled?: boolean;
    portalUrl?: string;
  };
  metadata?: {
    source?: string;
    importedDate?: Date | string;
    lastVerified?: Date | string;
    verifiedBy?: string;
  };
  createdBy: string;
  createdAt: Date | string;
  updatedBy?: string;
  updatedAt?: Date | string;
  isActive: boolean;
  isPreferred?: boolean;
  isVerified?: boolean;
  attachments?: Attachment[];
}

export interface ContactInfo {
  name: string;
  title?: string;
  email: string;
  phone: string;
  mobile?: string;
  department?: string;
  isPrimary?: boolean;
}

export interface AlternativeContact {
  type: 'sales' | 'accounts' | 'technical' | 'emergency';
  contact: ContactInfo;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BankingInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  swiftCode?: string;
  iban?: string;
}

export interface ComplianceStatus {
  taxCompliant: boolean;
  beeCompliant?: boolean;
  beeLevel?: number;
  isoCompliant?: boolean;
  isoCertifications?: string[];
  lastAuditDate?: Date | string;
  nextAuditDate?: Date | string;
}

export interface SupplierDocument {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  expiryDate?: Date | string;
  uploadedDate: Date | string;
  uploadedBy: string;
}

export interface Certification {
  name: string;
  issuingBody: string;
  certificateNumber: string;
  issueDate: Date | string;
  expiryDate?: Date | string;
  documentUrl?: string;
}

export interface ServiceLevelAgreement {
  responseTime: number; // in hours
  resolutionTime: number; // in hours
  uptime?: number; // percentage
  penalties?: string;
  escalationProcess?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date | string;
  uploadedBy: string;
  category?: string;
  description?: string;
}

// Enums
export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted',
  ARCHIVED = 'archived'
}

export enum BusinessType {
  MANUFACTURER = 'manufacturer',
  DISTRIBUTOR = 'distributor',
  WHOLESALER = 'wholesaler',
  RETAILER = 'retailer',
  SERVICE_PROVIDER = 'service_provider',
  CONTRACTOR = 'contractor',
  CONSULTANT = 'consultant',
  OTHER = 'other'
}

export enum PaymentTerms {
  CASH = 'cash',
  NET_7 = 'net_7',
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_45 = 'net_45',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
  COD = 'cod',
  PREPAID = 'prepaid',
  CUSTOM = 'custom'
}

export enum Currency {
  ZAR = 'ZAR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  OTHER = 'OTHER'
}

export enum DocumentType {
  TAX_CLEARANCE = 'tax_clearance',
  BEE_CERTIFICATE = 'bee_certificate',
  COMPANY_REGISTRATION = 'company_registration',
  BANK_CONFIRMATION = 'bank_confirmation',
  INSURANCE = 'insurance',
  CONTRACT = 'contract',
  NDA = 'nda',
  QUALITY_CERT = 'quality_cert',
  PRICE_LIST = 'price_list',
  CATALOG = 'catalog',
  OTHER = 'other'
}

export enum EmployeeSize {
  MICRO = '1-10',
  SMALL = '11-50',
  MEDIUM = '51-250',
  LARGE = '251-1000',
  ENTERPRISE = '1000+'
}

export enum RevenueRange {
  UNDER_1M = 'under_1m',
  ONE_TO_5M = '1m_5m',
  FIVE_TO_10M = '5m_10m',
  TEN_TO_50M = '10m_50m',
  FIFTY_TO_100M = '50m_100m',
  OVER_100M = 'over_100m'
}