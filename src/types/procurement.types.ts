// Procurement Management Types for FibreFlow
// Industry-standard BOQ, RFQ, and Purchase Order management

import { Timestamp } from 'firebase/firestore';

// ============= Stock/Inventory Types =============

export interface StockItem {
  id?: string;
  code: string; // Unique item code
  name: string;
  description?: string;
  category: MaterialCategory;
  unit: UnitOfMeasure;
  
  // Stock levels
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  
  // Financial
  unitCost: number;
  currency: Currency;
  lastPurchasePrice?: number;
  averageCost?: number;
  
  // Supplier information
  preferredSupplierId?: string;
  alternativeSupplierIds?: string[];
  leadTimeDays: number;
  
  // Warehouse
  location?: string;
  binNumber?: string;
  
  // Status
  status: StockStatus;
  isActive: boolean;
  
  // Tracking
  lastStockTakeDate?: Timestamp;
  lastPurchaseDate?: Timestamp;
  expiryDate?: Timestamp;
  
  // Metadata
  specifications?: string;
  tags: string[];
  notes?: string;
  
  // Audit
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy: string;
}

export interface StockMovement {
  id?: string;
  stockItemId: string;
  movementType: StockMovementType;
  quantity: number;
  
  // References
  referenceType: 'purchase_order' | 'project_allocation' | 'adjustment' | 'return' | 'transfer';
  referenceId?: string;
  projectId?: string;
  fromLocation?: string;
  toLocation?: string;
  
  // Details
  reason?: string;
  performedBy: string;
  performedByName: string;
  approvedBy?: string;
  
  // Stock levels snapshot
  previousStock: number;
  newStock: number;
  
  // Timestamps
  movementDate: Timestamp;
  createdAt: Timestamp;
}

// ============= BOQ (Bill of Quantities) Types =============

export interface BOQ {
  id?: string;
  boqNumber: string; // Unique BOQ reference
  title: string;
  description?: string;
  
  // References
  projectId?: string;
  projectName?: string;
  clientId?: string;
  clientName?: string;
  
  // Items
  items: BOQItem[];
  sections: BOQSection[];
  
  // Financial Summary
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountPercentage?: number;
  discountAmount?: number;
  totalAmount: number;
  currency: Currency;
  
  // Status
  status: BOQStatus;
  version: number;
  isTemplate: boolean;
  templateName?: string;
  
  // Validity
  validFrom: Timestamp;
  validUntil: Timestamp;
  
  // Approval
  preparedBy: string;
  preparedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  approvalDate?: Timestamp;
  
  // Notes
  termsAndConditions?: string;
  notes?: string;
  internalNotes?: string;
  
  // Audit
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy: string;
}

export interface BOQSection {
  id: string;
  name: string;
  description?: string;
  orderIndex: number;
  subtotal: number;
}

export interface BOQItem {
  id: string;
  sectionId?: string;
  stockItemId?: string;
  
  // Item details
  itemCode: string;
  description: string;
  unit: UnitOfMeasure;
  quantity: number;
  
  // Pricing
  unitPrice: number;
  markupPercentage?: number;
  discountPercentage?: number;
  totalPrice: number;
  
  // Specifications
  specifications?: string;
  brand?: string;
  model?: string;
  
  // Status
  isOptional: boolean;
  isAlternative: boolean;
  alternativeToId?: string;
  
  // Order
  orderIndex: number;
  notes?: string;
}

// ============= RFQ (Request for Quote) Types =============

export interface RFQ {
  id?: string;
  rfqNumber: string; // Unique RFQ reference
  title: string;
  description?: string;
  
  // Source
  boqId?: string;
  projectId?: string;
  projectName?: string;
  
  // Items
  items: RFQItem[];
  
  // Suppliers
  supplierIds: string[];
  invitedSuppliers: RFQSupplierInvite[];
  
  // Timeline
  issueDate: Timestamp;
  deadline: Timestamp;
  deliveryDate?: Timestamp;
  
  // Requirements
  deliveryAddress: string;
  deliveryTerms: DeliveryTerms;
  paymentTerms: PaymentTerms;
  
  // Status
  status: RFQStatus;
  responses: RFQResponse[];
  
  // Selection
  selectedResponseId?: string;
  selectionReason?: string;
  
  // Documents
  attachments?: Attachment[];
  
  // Contact
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  
  // Notes
  termsAndConditions?: string;
  specialInstructions?: string;
  evaluationCriteria?: string;
  
  // Audit
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy: string;
}

export interface RFQItem {
  id: string;
  stockItemId?: string;
  itemCode: string;
  description: string;
  specifications?: string;
  unit: UnitOfMeasure;
  quantity: number;
  requiredBy?: Timestamp;
  notes?: string;
}

export interface RFQSupplierInvite {
  supplierId: string;
  supplierName: string;
  invitedAt: Timestamp;
  invitedBy: string;
  status: 'pending' | 'viewed' | 'responded' | 'declined';
  viewedAt?: Timestamp;
  respondedAt?: Timestamp;
}

export interface RFQResponse {
  id?: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  
  // Response details
  responseDate: Timestamp;
  referenceNumber?: string;
  
  // Pricing
  items: RFQResponseItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost?: number;
  totalAmount: number;
  currency: Currency;
  
  // Terms
  paymentTerms: string;
  deliveryTerms: string;
  deliveryLeadTime: number; // in days
  validityPeriod: number; // in days
  
  // Additional info
  notes?: string;
  attachments?: Attachment[];
  
  // Evaluation
  isSelected: boolean;
  evaluationScore?: number;
  evaluationNotes?: string;
  
  // Status
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  
  // Audit
  submittedAt: Timestamp;
  submittedBy: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
}

export interface RFQResponseItem {
  rfqItemId: string;
  unitPrice: number;
  totalPrice: number;
  availability: 'in_stock' | 'partial' | 'out_of_stock' | 'lead_time';
  leadTimeDays?: number;
  alternativeOffered?: string;
  notes?: string;
}

// ============= Purchase Order Types =============

export interface PurchaseOrder {
  id?: string;
  poNumber: string; // Unique PO reference
  
  // References
  rfqId?: string;
  rfqResponseId?: string;
  projectId?: string;
  projectName?: string;
  
  // Supplier
  supplierId: string;
  supplierName: string;
  supplierAddress?: string;
  supplierContact?: string;
  
  // Items
  items: PurchaseOrderItem[];
  
  // Financial
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  shippingCost?: number;
  otherCharges?: number;
  totalAmount: number;
  currency: Currency;
  
  // Delivery
  deliveryAddress: string;
  deliveryDate: Timestamp;
  deliveryTerms: DeliveryTerms;
  
  // Payment
  paymentTerms: PaymentTerms;
  paymentDueDate?: Timestamp;
  
  // Status
  status: PurchaseOrderStatus;
  approvalStatus: ApprovalStatus;
  
  // Receiving
  receivedItems?: ReceivedItem[];
  partialDeliveries: boolean;
  fullyReceived: boolean;
  
  // Documents
  attachments?: Attachment[];
  
  // Approval workflow
  requestedBy: string;
  requestedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  approvalDate?: Timestamp;
  approvalNotes?: string;
  
  // Notes
  termsAndConditions?: string;
  specialInstructions?: string;
  internalNotes?: string;
  
  // Audit
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy: string;
}

export interface PurchaseOrderItem {
  id: string;
  stockItemId?: string;
  itemCode: string;
  description: string;
  unit: UnitOfMeasure;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  
  // Receiving
  receivedQuantity?: number;
  remainingQuantity?: number;
  
  // Status
  status: 'pending' | 'partial' | 'received' | 'cancelled';
  notes?: string;
}

export interface ReceivedItem {
  poItemId: string;
  receivedQuantity: number;
  receivedDate: Timestamp;
  receivedBy: string;
  receivedByName: string;
  condition: 'good' | 'damaged' | 'rejected';
  notes?: string;
  grnNumber?: string; // Goods Received Note
}

// ============= Common Types & Enums =============

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Timestamp;
  uploadedBy: string;
}

export enum MaterialCategory {
  FIBER_CABLE = 'fiber_cable',
  POLES = 'poles',
  CONNECTORS = 'connectors',
  SPLICING = 'splicing',
  TOOLS = 'tools',
  SAFETY = 'safety',
  CONSUMABLES = 'consumables',
  EQUIPMENT = 'equipment',
  OTHER = 'other'
}

export enum UnitOfMeasure {
  EACH = 'each',
  METER = 'meter',
  KILOMETER = 'kilometer',
  KILOGRAM = 'kilogram',
  LITER = 'liter',
  BOX = 'box',
  PACK = 'pack',
  ROLL = 'roll',
  SET = 'set',
  HOUR = 'hour',
  DAY = 'day'
}

export enum Currency {
  ZAR = 'ZAR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
  ON_ORDER = 'on_order'
}

export enum StockMovementType {
  PURCHASE = 'purchase',
  ALLOCATION = 'allocation',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  DAMAGE = 'damage',
  LOSS = 'loss'
}

export enum BOQStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REVISED = 'revised',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum RFQStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  RESPONSES_PENDING = 'responses_pending',
  RESPONSES_RECEIVED = 'responses_received',
  EVALUATION = 'evaluation',
  AWARDED = 'awarded',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT = 'sent',
  ACKNOWLEDGED = 'acknowledged',
  PARTIAL_DELIVERY = 'partial_delivery',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ON_HOLD = 'on_hold'
}

export enum DeliveryTerms {
  EXW = 'EXW', // Ex Works
  FCA = 'FCA', // Free Carrier
  CPT = 'CPT', // Carriage Paid To
  CIP = 'CIP', // Carriage and Insurance Paid To
  DAP = 'DAP', // Delivered at Place
  DPU = 'DPU', // Delivered at Place Unloaded
  DDP = 'DDP', // Delivered Duty Paid
  FOB = 'FOB', // Free on Board
  CIF = 'CIF'  // Cost, Insurance and Freight
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
  INSTALLMENTS = 'installments'
}

// ============= Form Types =============

export interface BOQFormData {
  title: string;
  description?: string;
  projectId?: string;
  clientId?: string;
  items: BOQItem[];
  sections: BOQSection[];
  taxRate: number;
  discountPercentage?: number;
  validFrom: string;
  validUntil: string;
  termsAndConditions?: string;
  notes?: string;
}

export interface RFQFormData {
  title: string;
  description?: string;
  boqId?: string;
  projectId?: string;
  items: RFQItem[];
  supplierIds: string[];
  deadline: string;
  deliveryDate?: string;
  deliveryAddress: string;
  deliveryTerms: DeliveryTerms;
  paymentTerms: PaymentTerms;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  termsAndConditions?: string;
  specialInstructions?: string;
}

export interface PurchaseOrderFormData {
  rfqId?: string;
  rfqResponseId?: string;
  projectId?: string;
  supplierId: string;
  items: PurchaseOrderItem[];
  taxRate: number;
  shippingCost?: number;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTerms: DeliveryTerms;
  paymentTerms: PaymentTerms;
  termsAndConditions?: string;
  specialInstructions?: string;
  internalNotes?: string;
}