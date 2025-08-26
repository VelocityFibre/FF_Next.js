/**
 * Rate Card Management Types
 * Types for contractor rate card system including service templates,
 * rate cards, rate items, and historical tracking
 */

// 🟢 WORKING: Base Types
export interface ServiceTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'deliverable' | 'service';
  parentId?: string;
  level: number; // 0 = deliverable, 1 = service
  code?: string;
  unit?: string;
  baseRate?: number;
  currency: string;
  isActive: boolean;
  orderIndex: number;
  kpiMetrics?: KPIMetric[];
  specifications?: Record<string, any>;
  qualityStandards?: QualityStandard[];
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  
  // Computed fields
  children?: ServiceTemplate[];
  parent?: ServiceTemplate;
}

export interface KPIMetric {
  id: string;
  name: string;
  type: 'quantity' | 'quality' | 'time' | 'cost';
  unit: string;
  target?: number;
  weight?: number; // For scoring
}

export interface QualityStandard {
  id: string;
  name: string;
  description: string;
  requirement: string;
  testMethod?: string;
  acceptanceCriteria: string;
}

// 🟢 WORKING: Rate Card Types
export interface ContractorRateCard {
  id: string;
  contractorId: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  effectiveDate: string;
  expiryDate?: string;
  isDefault: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  totalServices: number;
  totalValue?: number;
  currency: string;
  notes?: string;
  metadata?: Record<string, any>;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  
  // Related data
  contractor?: {
    id: string;
    companyName: string;
    email: string;
  };
  rateItems?: ContractorRateItem[];
}

export interface ContractorRateItem {
  id: string;
  rateCardId: string;
  contractorId: string;
  serviceTemplateId: string;
  serviceCode?: string;
  serviceName: string;
  category?: 'deliverable' | 'service';
  unit: string;
  rate: number;
  minimumQuantity?: number;
  maximumQuantity?: number;
  overheadPercentage?: number;
  profitMargin?: number;
  discountTiers?: DiscountTier[];
  specialConditions?: string;
  isNegotiable: boolean;
  competitorRates?: CompetitorRate[];
  lastReviewedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Related data
  serviceTemplate?: ServiceTemplate;
  rateCard?: ContractorRateCard;
}

export interface DiscountTier {
  minQuantity: number;
  maxQuantity?: number;
  discountPercentage: number;
  description?: string;
}

export interface CompetitorRate {
  competitorName: string;
  rate: number;
  currency: string;
  source?: string;
  dateRecorded: string;
  notes?: string;
}

// 🟢 WORKING: Rate History Types
export interface ContractorRateHistory {
  id: string;
  rateItemId: string;
  contractorId: string;
  serviceTemplateId: string;
  changeType: 'created' | 'updated' | 'deleted';
  oldRate?: number;
  newRate?: number;
  changeReason?: string;
  changeDescription?: string;
  approvedBy?: string;
  changedBy: string;
  changedAt: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  metadata?: Record<string, any>;
  
  // Related data
  rateItem?: ContractorRateItem;
  serviceTemplate?: ServiceTemplate;
  changedByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

// 🟢 WORKING: Form Types
export interface ServiceTemplateFormData {
  name: string;
  description?: string;
  category: 'deliverable' | 'service';
  parentId?: string;
  code?: string;
  unit?: string;
  baseRate?: number;
  specifications?: Record<string, any>;
  qualityStandards?: Omit<QualityStandard, 'id'>[];
  kpiMetrics?: Omit<KPIMetric, 'id'>[];
}

export interface ContractorRateCardFormData {
  name: string;
  description?: string;
  effectiveDate: string;
  expiryDate?: string;
  notes?: string;
  rateItems?: ContractorRateItemFormData[];
}

export interface ContractorRateItemFormData {
  serviceTemplateId: string;
  rate: number;
  minimumQuantity?: number;
  maximumQuantity?: number;
  overheadPercentage?: number;
  profitMargin?: number;
  discountTiers?: DiscountTier[];
  specialConditions?: string;
  isNegotiable: boolean;
  notes?: string;
}

// 🟢 WORKING: API Types
export interface ServiceTemplateSearchParams {
  search?: string;
  category?: 'deliverable' | 'service';
  parentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'code' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface RateCardSearchParams {
  contractorId?: string;
  status?: 'draft' | 'active' | 'archived';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  effectiveDateFrom?: string;
  effectiveDateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'effectiveDate' | 'totalValue' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface RateComparisonParams {
  serviceTemplateIds: string[];
  contractorIds: string[];
  effectiveDate?: string;
  includeInactive?: boolean;
}

// 🟢 WORKING: Analysis Types
export interface RateCardComparison {
  serviceTemplate: ServiceTemplate;
  rates: ContractorRateComparison[];
  statistics: {
    averageRate: number;
    medianRate: number;
    minRate: number;
    maxRate: number;
    standardDeviation: number;
    competitorsCount: number;
  };
}

export interface ContractorRateComparison {
  contractorId: string;
  contractorName: string;
  rateCardId: string;
  rateCardName: string;
  rate: number;
  currency: string;
  unit: string;
  effectiveDate: string;
  isNegotiable: boolean;
  overheadPercentage?: number;
  profitMargin?: number;
  competitiveRanking: number; // 1 = most competitive
  variance: number; // Percentage difference from average
}

export interface RateCardAnalytics {
  contractorId: string;
  contractorName: string;
  totalRateCards: number;
  activeRateCards: number;
  draftRateCards: number;
  archivedRateCards: number;
  totalServices: number;
  averageRate: number;
  competitiveScore: number; // 0-100
  lastUpdated: string;
  trends: RateCardTrend[];
}

export interface RateCardTrend {
  period: string;
  averageRate: number;
  serviceCount: number;
  changePercentage: number;
}

// 🟢 WORKING: Export Types
export interface RateCardExportOptions {
  format: 'xlsx' | 'csv' | 'pdf';
  includeHistory: boolean;
  includeComparison: boolean;
  effectiveDateFilter?: {
    from?: string;
    to?: string;
  };
  contractorIds?: string[];
  serviceTemplateIds?: string[];
}

export interface BulkRateUpdateOptions {
  rateCardId: string;
  updateType: 'percentage' | 'fixed' | 'replace';
  value: number;
  effectiveDate: string;
  reason: string;
  applyToServices?: string[]; // Service template IDs
  excludeServices?: string[]; // Service template IDs
}

// 🟢 WORKING: UI State Types
export interface RateCardListState {
  items: ContractorRateCard[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: RateCardSearchParams;
  selectedItems: string[];
}

export interface ServiceTemplateListState {
  items: ServiceTemplate[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: ServiceTemplateSearchParams;
  hierarchyView: boolean;
  expandedNodes: string[];
}

export interface RateCardFormState {
  data: ContractorRateCardFormData;
  loading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;
  isValid: boolean;
}

// 🟢 WORKING: Component Props Types
export interface RateCardManagementProps {
  contractorId: string;
  onRateCardSelect?: (rateCard: ContractorRateCard) => void;
  onRateCardCreate?: (rateCard: ContractorRateCard) => void;
  onRateCardUpdate?: (rateCard: ContractorRateCard) => void;
  onRateCardDelete?: (rateCardId: string) => void;
}

export interface ServiceTemplatesTabProps {
  onServiceTemplateCreate?: (template: ServiceTemplate) => void;
  onServiceTemplateUpdate?: (template: ServiceTemplate) => void;
  onServiceTemplateDelete?: (templateId: string) => void;
}

export interface RateItemsGridProps {
  rateCard: ContractorRateCard;
  serviceTemplates: ServiceTemplate[];
  onRateItemAdd?: (item: ContractorRateItem) => void;
  onRateItemUpdate?: (item: ContractorRateItem) => void;
  onRateItemDelete?: (itemId: string) => void;
  editable?: boolean;
}

export interface RateComparisonProps {
  serviceTemplateIds: string[];
  contractorIds: string[];
  effectiveDate?: string;
  onComparisonComplete?: (comparison: RateCardComparison[]) => void;
}

// 🟢 WORKING: Validation Types
export interface RateCardValidationResult {
  isValid: boolean;
  errors: RateCardValidationError[];
  warnings: RateCardValidationWarning[];
}

export interface RateCardValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface RateCardValidationWarning extends RateCardValidationError {
  suggestion?: string;
}

// 🟢 WORKING: Permission Types
export interface RateCardPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
  canCompare: boolean;
  canManageTemplates: boolean;
}

// 🟢 WORKING: Audit Types
export interface RateCardAuditLog {
  id: string;
  entityType: 'rate_card' | 'rate_item' | 'service_template';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject';
  userId: string;
  userName: string;
  timestamp: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
}