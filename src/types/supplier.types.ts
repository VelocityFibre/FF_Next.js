import { Timestamp } from 'firebase/firestore';

// ============= Supplier Core Types =============

export interface Supplier {
  id?: string;
  companyName: string;
  registrationNo: string;
  taxNo: string;
  vatNo?: string;
  
  // Contact Information
  contact: ContactInfo;
  alternativeContacts?: AlternativeContact[];
  
  // Business Details
  businessType: BusinessType;
  industry: string;
  yearEstablished?: number;
  employeeCount?: EmployeeSize;
  annualRevenue?: RevenueRange;
  
  // Products & Services
  categories: ProductCategory[];
  services: string[];
  brands?: string[];
  
  // Compliance & Documents
  compliance: ComplianceStatus;
  documents: SupplierDocument[];
  certifications?: Certification[];
  
  // Financial
  bankDetails?: BankingInfo;
  paymentTerms: PaymentTerms;
  creditLimit?: number;
  currency: Currency;
  
  // Performance
  rating: SupplierRating;
  performanceScore: number; // 0-100
  reliabilityScore: number; // 0-100
  
  // Status
  status: SupplierStatus;
  isPreferred: boolean;
  blacklistReason?: string;
  
  // Relationships
  contractIds?: string[];
  activeRFQs?: number;
  completedOrders?: number;
  
  // Metadata
  tags: string[];
  notes?: string;
  internalNotes?: string;
  
  // Audit
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy: string;
  lastReviewDate?: Timestamp;
  nextReviewDate?: Timestamp;
}

// ============= Product & Catalog Types =============

export interface Product {
  id?: string;
  supplierId: string;
  
  // Product Details
  name: string;
  code: string; // SKU
  barcode?: string;
  category: ProductCategory;
  subcategory?: string;
  brand?: string;
  model?: string;
  
  // Description
  description: string;
  specifications?: ProductSpecification[];
  features?: string[];
  
  // Pricing
  unitPrice: number;
  currency: Currency;
  unit: UnitOfMeasure;
  minOrderQuantity?: number;
  bulkPricing?: BulkPricing[];
  
  // Availability
  availability: ProductAvailability;
  stockLevel?: number;
  leadTimeDays: number;
  
  // Physical Attributes
  weight?: number;
  dimensions?: Dimensions;
  color?: string;
  material?: string;
  
  // Images & Documents
  images?: string[];
  dataSheet?: string;
  
  // Status
  isActive: boolean;
  isDiscontinued: boolean;
  replacementProductId?: string;
  
  // Metadata
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PriceList {
  id?: string;
  supplierId: string;
  name: string;
  description?: string;
  
  // Validity
  effectiveFrom: Timestamp;
  effectiveTo?: Timestamp;
  isActive: boolean;
  
  // Items
  items: PriceListItem[];
  
  // Discounts
  volumeDiscounts?: VolumeDiscount[];
  categoryDiscounts?: CategoryDiscount[];
  
  // Terms
  paymentTerms?: string;
  deliveryTerms?: string;
  
  // Metadata
  version: number;
  approvedBy?: string;
  approvedDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PriceListItem {
  productId: string;
  productCode: string;
  productName: string;
  unitPrice: number;
  unit: UnitOfMeasure;
  minQuantity?: number;
  maxQuantity?: number;
  leadTimeDays?: number;
  notes?: string;
}

// ============= Performance & Rating Types =============

export interface SupplierRating {
  overall: number; // 1-5 stars
  quality: number;
  delivery: number;
  pricing: number;
  communication: number;
  flexibility: number;
  totalReviews: number;
  lastReviewDate?: Timestamp;
}

export interface SupplierReview {
  id?: string;
  supplierId: string;
  orderId?: string;
  projectId?: string;
  
  // Ratings
  overallRating: number;
  qualityRating: number;
  deliveryRating: number;
  pricingRating: number;
  communicationRating: number;
  
  // Review Content
  title?: string;
  comment?: string;
  wouldRecommend: boolean;
  
  // Issues
  hadIssues: boolean;
  issueTypes?: IssueType[];
  issueResolved?: boolean;
  
  // Metadata
  reviewedBy: string;
  reviewedByName: string;
  reviewDate: Timestamp;
}

export interface SupplierPerformance {
  supplierId: string;
  period: PerformancePeriod;
  
  // Delivery Metrics
  onTimeDeliveryRate: number;
  averageLeadTime: number;
  deliveryIssues: number;
  
  // Quality Metrics
  qualityAcceptanceRate: number;
  defectRate: number;
  returnRate: number;
  
  // Financial Metrics
  totalSpend: number;
  averageOrderValue: number;
  paymentCompliance: number;
  
  // Responsiveness
  averageResponseTime: number; // hours
  quoteTurnaroundTime: number; // hours
  issueResolutionTime: number; // hours
  
  // Volume
  totalOrders: number;
  totalItems: number;
  
  // Calculated Scores
  performanceScore: number; // 0-100
  reliabilityScore: number; // 0-100
  
  // Period
  startDate: Timestamp;
  endDate: Timestamp;
  calculatedAt: Timestamp;
}

// ============= Contract & Agreement Types =============

export interface SupplierContract {
  id?: string;
  supplierId: string;
  contractNo: string;
  
  // Contract Details
  type: ContractType;
  title: string;
  description?: string;
  
  // Duration
  startDate: Timestamp;
  endDate: Timestamp;
  autoRenew: boolean;
  renewalNoticeDays?: number;
  
  // Financial
  value?: number;
  currency: Currency;
  paymentTerms: string;
  
  // Terms
  deliveryTerms?: string;
  warrantyTerms?: string;
  penaltyClause?: string;
  
  // SLA
  sla?: ServiceLevelAgreement;
  
  // Documents
  documentUrl?: string;
  attachments?: Attachment[];
  
  // Status
  status: ContractStatus;
  signedBy?: string;
  signedDate?: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// ============= Supporting Types & Enums =============

export interface ContactInfo {
  primaryContact: string;
  position: string;
  email: string;
  phone: string;
  mobile?: string;
  address: Address;
  website?: string;
}

export interface AlternativeContact {
  name: string;
  position: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface Address {
  street: string;
  city: string;
  province: string;
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
  bbbeeLevel?: number;
  bbbeeExpiry?: Timestamp;
  insuranceValid: boolean;
  insuranceExpiry?: Timestamp;
  licenseValid: boolean;
  licenseExpiry?: Timestamp;
}

export interface SupplierDocument {
  id: string;
  type: DocumentType;
  name: string;
  fileUrl: string;
  expiryDate?: Timestamp;
  uploadedAt: Timestamp;
  uploadedBy: string;
}

export interface Certification {
  name: string;
  issuingBody: string;
  certificateNo: string;
  issueDate: Timestamp;
  expiryDate?: Timestamp;
  documentUrl?: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

export interface BulkPricing {
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  discountPercentage?: number;
}

export interface VolumeDiscount {
  minValue: number;
  maxValue?: number;
  discountPercentage: number;
}

export interface CategoryDiscount {
  category: ProductCategory;
  discountPercentage: number;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'mm' | 'cm' | 'm';
}

export interface ServiceLevelAgreement {
  responseTime: number; // hours
  resolutionTime: number; // hours
  availability: number; // percentage
  penalties?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Timestamp;
  uploadedBy: string;
}

// ============= Enums =============

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted'
}

export enum BusinessType {
  MANUFACTURER = 'manufacturer',
  DISTRIBUTOR = 'distributor',
  WHOLESALER = 'wholesaler',
  RETAILER = 'retailer',
  SERVICE_PROVIDER = 'service_provider',
  CONTRACTOR = 'contractor'
}

export enum ProductCategory {
  FIBER_CABLE = 'fiber_cable',
  NETWORK_EQUIPMENT = 'network_equipment',
  POLES_INFRASTRUCTURE = 'poles_infrastructure',
  CONNECTORS = 'connectors',
  SPLICING_EQUIPMENT = 'splicing_equipment',
  TESTING_TOOLS = 'testing_tools',
  SAFETY_EQUIPMENT = 'safety_equipment',
  CONSUMABLES = 'consumables',
  SOFTWARE = 'software',
  SERVICES = 'services',
  OTHER = 'other'
}

export enum ProductAvailability {
  IN_STOCK = 'in_stock',
  LIMITED_STOCK = 'limited_stock',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
  SPECIAL_ORDER = 'special_order',
  PRE_ORDER = 'pre_order'
}

export enum UnitOfMeasure {
  EACH = 'each',
  METER = 'meter',
  KILOMETER = 'kilometer',
  KILOGRAM = 'kilogram',
  TON = 'ton',
  LITER = 'liter',
  BOX = 'box',
  PACK = 'pack',
  ROLL = 'roll',
  SET = 'set',
  HOUR = 'hour',
  DAY = 'day',
  MONTH = 'month'
}

export enum Currency {
  ZAR = 'ZAR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

export enum PaymentTerms {
  COD = 'cod', // Cash on delivery
  NET_7 = 'net_7',
  NET_14 = 'net_14',
  NET_30 = 'net_30',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
  PREPAID = 'prepaid',
  INSTALLMENTS = 'installments'
}

export enum DocumentType {
  TAX_CERTIFICATE = 'tax_certificate',
  BBBEE_CERTIFICATE = 'bbbee_certificate',
  COMPANY_REGISTRATION = 'company_registration',
  INSURANCE = 'insurance',
  BANK_DETAILS = 'bank_details',
  PRODUCT_CATALOG = 'product_catalog',
  PRICE_LIST = 'price_list',
  CONTRACT = 'contract',
  OTHER = 'other'
}

export enum ContractType {
  MASTER_AGREEMENT = 'master_agreement',
  PURCHASE_AGREEMENT = 'purchase_agreement',
  SERVICE_AGREEMENT = 'service_agreement',
  NDA = 'nda',
  SLA = 'sla'
}

export enum ContractStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed'
}

export enum IssueType {
  LATE_DELIVERY = 'late_delivery',
  QUALITY_ISSUE = 'quality_issue',
  WRONG_ITEM = 'wrong_item',
  DAMAGED_GOODS = 'damaged_goods',
  INCOMPLETE_ORDER = 'incomplete_order',
  PRICING_ERROR = 'pricing_error',
  COMMUNICATION = 'communication',
  OTHER = 'other'
}

export enum PerformancePeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum EmployeeSize {
  MICRO = '1-10',
  SMALL = '11-50',
  MEDIUM = '51-200',
  LARGE = '201-1000',
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

// ============= Form Types =============

export interface SupplierFormData {
  companyName: string;
  registrationNo: string;
  taxNo: string;
  vatNo?: string;
  contact: ContactInfo;
  businessType: BusinessType;
  industry: string;
  categories: ProductCategory[];
  services: string[];
  paymentTerms: PaymentTerms;
  currency: Currency;
  tags: string[];
  notes?: string;
}

export interface ProductFormData {
  supplierId: string;
  name: string;
  code: string;
  category: ProductCategory;
  description: string;
  unitPrice: number;
  currency: Currency;
  unit: UnitOfMeasure;
  availability: ProductAvailability;
  leadTimeDays: number;
  minOrderQuantity?: number;
}