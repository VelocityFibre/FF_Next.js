/**
 * Procurement Module Seed Data
 * Provides test data for development and testing of procurement functionality
 */

import { 
  BOQ, 
  BOQItem, 
  BOQException,
  RFQ, 
  RFQItem, 
  SupplierInvitation,
  Quote, 
  QuoteItem,
  StockPosition,
  StockMovement,
  StockMovementItem,
  CableDrum,
  DrumUsageHistory
} from '../neon/schema';

// =============================================
// MOCK DATA CONSTANTS
// =============================================

// Mock Project IDs (would come from Firebase)
export const MOCK_PROJECT_IDS = {
  FIBRE_NETWORK_A: 'proj_fibre_network_alpha_001',
  FIBRE_NETWORK_B: 'proj_fibre_network_beta_002',
  MAINTENANCE_PROJECT: 'proj_maintenance_gamma_003'
} as const;

// Mock User IDs
export const MOCK_USER_IDS = {
  PROJECT_MANAGER: 'user_pm_john_smith',
  PROCUREMENT_MANAGER: 'user_proc_jane_doe',
  TECHNICIAN: 'user_tech_mike_jones',
  WAREHOUSE_MANAGER: 'user_wh_sarah_wilson'
} as const;

// Mock Supplier IDs
export const MOCK_SUPPLIER_IDS = {
  CABLE_SUPPLIER_A: 'supplier_cables_inc_001',
  CABLE_SUPPLIER_B: 'supplier_fibre_pro_002',
  HARDWARE_SUPPLIER: 'supplier_network_parts_003',
  EQUIPMENT_SUPPLIER: 'supplier_telecom_equip_004'
} as const;

// Current timestamp for seed data
const NOW = new Date();
const YESTERDAY = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
const LAST_WEEK = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000);
const NEXT_WEEK = new Date(NOW.getTime() + 7 * 24 * 60 * 60 * 1000);

// =============================================
// BOQ SEED DATA
// =============================================

export const SEED_BOQS: Omit<BOQ, 'id'>[] = [
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    version: 'v1.0',
    title: 'Fibre Network Phase 1 BOQ',
    description: 'Bill of quantities for the first phase of fibre network deployment',
    status: 'approved',
    mappingStatus: 'completed',
    mappingConfidence: 95.5,
    uploadedBy: MOCK_USER_IDS.PROJECT_MANAGER,
    uploadedAt: LAST_WEEK,
    fileName: 'Fibre_Network_Phase1_BOQ.xlsx',
    fileUrl: 'https://storage.example.com/boqs/fibre_network_phase1.xlsx',
    fileSize: 524288,
    approvedBy: MOCK_USER_IDS.PROCUREMENT_MANAGER,
    approvedAt: YESTERDAY,
    itemCount: 25,
    mappedItems: 24,
    unmappedItems: 1,
    exceptionsCount: 1,
    totalEstimatedValue: 2850000.00,
    currency: 'ZAR',
    createdAt: LAST_WEEK,
    updatedAt: YESTERDAY,
  },
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_B,
    version: 'v2.1',
    title: 'Fibre Network Phase 2 BOQ - Revised',
    description: 'Revised bill of quantities for phase 2 after client feedback',
    status: 'mapping_review',
    mappingStatus: 'in_progress',
    mappingConfidence: 78.2,
    uploadedBy: MOCK_USER_IDS.PROJECT_MANAGER,
    uploadedAt: NOW,
    fileName: 'Fibre_Network_Phase2_BOQ_v2.1.xlsx',
    fileUrl: 'https://storage.example.com/boqs/fibre_network_phase2_v2.xlsx',
    fileSize: 768432,
    itemCount: 42,
    mappedItems: 28,
    unmappedItems: 14,
    exceptionsCount: 3,
    totalEstimatedValue: 4200000.00,
    currency: 'ZAR',
    createdAt: NOW,
    updatedAt: NOW,
  }
];

export const SEED_BOQ_ITEMS: Omit<BOQItem, 'id' | 'boqId'>[] = [
  // Items for BOQ 1
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    lineNumber: 1,
    itemCode: 'CABLE-SM-12F',
    description: 'Single Mode Fibre Optic Cable - 12 Core',
    category: 'Cables',
    subcategory: 'Fibre Optic',
    quantity: 5000,
    uom: 'meter',
    unitPrice: 45.50,
    totalPrice: 227500.00,
    phase: 'Phase 1',
    task: 'Cable Installation',
    site: 'Main Route',
    location: 'Underground',
    catalogItemId: 'cat_cable_sm_12f_001',
    catalogItemCode: 'SM12F-STD',
    catalogItemName: 'Standard Single Mode 12 Core Cable',
    mappingConfidence: 98.5,
    mappingStatus: 'mapped',
    specifications: {
      coreCount: 12,
      cableType: 'Single Mode',
      jacketType: 'LSZH',
      bendRadius: '20x cable diameter'
    },
    technicalNotes: 'ITU-T G.652.D compliant',
    procurementStatus: 'rfq_created',
    createdAt: LAST_WEEK,
    updatedAt: YESTERDAY,
  },
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    lineNumber: 2,
    itemCode: 'SPLICE-TRAY',
    description: 'Fibre Splice Tray - 12 Core Capacity',
    category: 'Hardware',
    subcategory: 'Splice Components',
    quantity: 120,
    uom: 'piece',
    unitPrice: 125.00,
    totalPrice: 15000.00,
    phase: 'Phase 1',
    task: 'Splicing',
    site: 'All Sites',
    location: 'Cabinets',
    catalogItemId: 'cat_splice_tray_12c_001',
    catalogItemCode: 'ST12C-STD',
    catalogItemName: 'Standard 12 Core Splice Tray',
    mappingConfidence: 95.0,
    mappingStatus: 'mapped',
    specifications: {
      capacity: 12,
      material: 'ABS Plastic',
      dimensions: '220x110x15mm'
    },
    procurementStatus: 'pending',
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
  },
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    lineNumber: 3,
    description: 'Custom Network Termination Box - Special Configuration',
    category: 'Hardware',
    subcategory: 'Termination',
    quantity: 50,
    uom: 'piece',
    unitPrice: 350.00,
    totalPrice: 17500.00,
    phase: 'Phase 1',
    task: 'Termination',
    site: 'Customer Premises',
    mappingConfidence: 45.0,
    mappingStatus: 'exception',
    specifications: {
      ports: 4,
      type: 'SC/APC',
      mounting: 'Wall Mount',
      protection: 'IP65'
    },
    technicalNotes: 'Custom configuration - requires vendor specification',
    procurementStatus: 'pending',
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
  }
];

export const SEED_BOQ_EXCEPTIONS: Omit<BOQException, 'id' | 'boqId' | 'boqItemId'>[] = [
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    exceptionType: 'no_match',
    severity: 'medium',
    issueDescription: 'Custom Network Termination Box with special configuration not found in catalog',
    suggestedAction: 'Review with procurement team for custom sourcing or find alternative',
    systemSuggestions: [
      {
        catalogItemId: 'cat_term_box_4p_001',
        catalogItemName: 'Standard 4 Port Termination Box',
        confidence: 65.0,
        notes: 'Standard option - may need modification'
      },
      {
        catalogItemId: 'cat_term_box_custom_001',
        catalogItemName: 'Custom Termination Box - Made to Order',
        confidence: 85.0,
        notes: 'Custom solution - longer lead time'
      }
    ],
    status: 'open',
    priority: 'medium',
    assignedTo: MOCK_USER_IDS.PROCUREMENT_MANAGER,
    assignedAt: YESTERDAY,
    createdAt: YESTERDAY,
    updatedAt: YESTERDAY,
  }
];

// =============================================
// RFQ SEED DATA
// =============================================

export const SEED_RFQS: Omit<RFQ, 'id'>[] = [
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    rfqNumber: 'RFQ-FNA-001',
    title: 'Fibre Optic Cables and Hardware - Phase 1',
    description: 'Request for quotation for fibre optic cables and associated hardware for Phase 1 deployment',
    status: 'responses_received',
    issueDate: LAST_WEEK,
    responseDeadline: YESTERDAY,
    createdBy: MOCK_USER_IDS.PROCUREMENT_MANAGER,
    issuedBy: MOCK_USER_IDS.PROCUREMENT_MANAGER,
    paymentTerms: '30 days net',
    deliveryTerms: 'Ex Works - Supplier Facility',
    validityPeriod: 30,
    currency: 'ZAR',
    evaluationCriteria: {
      price: 40,
      quality: 30,
      delivery: 20,
      service: 10
    },
    technicalRequirements: 'All items must meet ITU-T standards and be certified for South African conditions',
    invitedSuppliers: [MOCK_SUPPLIER_IDS.CABLE_SUPPLIER_A, MOCK_SUPPLIER_IDS.CABLE_SUPPLIER_B],
    respondedSuppliers: [MOCK_SUPPLIER_IDS.CABLE_SUPPLIER_A, MOCK_SUPPLIER_IDS.CABLE_SUPPLIER_B],
    itemCount: 2,
    totalBudgetEstimate: 242500.00,
    lowestQuoteValue: 235000.00,
    highestQuoteValue: 255000.00,
    averageQuoteValue: 245000.00,
    createdAt: LAST_WEEK,
    updatedAt: YESTERDAY,
  }
];

export const SEED_RFQ_ITEMS: Omit<RFQItem, 'id' | 'rfqId'>[] = [
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    lineNumber: 1,
    itemCode: 'CABLE-SM-12F',
    description: 'Single Mode Fibre Optic Cable - 12 Core',
    category: 'Cables',
    quantity: 5000,
    uom: 'meter',
    budgetPrice: 45.50,
    specifications: {
      coreCount: 12,
      cableType: 'Single Mode',
      jacketType: 'LSZH',
      bendRadius: '20x cable diameter',
      standard: 'ITU-T G.652.D'
    },
    technicalRequirements: 'Must be ITU-T G.652.D compliant with LSZH jacket',
    evaluationWeight: 1.5,
    isCriticalItem: true,
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
  },
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    lineNumber: 2,
    itemCode: 'SPLICE-TRAY',
    description: 'Fibre Splice Tray - 12 Core Capacity',
    category: 'Hardware',
    quantity: 120,
    uom: 'piece',
    budgetPrice: 125.00,
    specifications: {
      capacity: 12,
      material: 'ABS Plastic',
      dimensions: '220x110x15mm'
    },
    evaluationWeight: 1.0,
    isCriticalItem: false,
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
  }
];

export const SEED_SUPPLIER_INVITATIONS: Omit<SupplierInvitation, 'id' | 'rfqId'>[] = [
  {
    supplierId: MOCK_SUPPLIER_IDS.CABLE_SUPPLIER_A,
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    supplierName: 'Cables Inc.',
    supplierEmail: 'procurement@cables-inc.co.za',
    contactPerson: 'John van der Merwe',
    invitationStatus: 'responded',
    invitedAt: LAST_WEEK,
    viewedAt: new Date(LAST_WEEK.getTime() + 2 * 60 * 60 * 1000), // 2 hours after invitation
    respondedAt: new Date(LAST_WEEK.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days after invitation
    accessToken: 'supplier_token_cables_inc_001',
    tokenExpiresAt: NEXT_WEEK,
    invitationMessage: 'We invite you to submit a quote for our fibre optic cable requirements.',
    remindersSent: 1,
    lastReminderAt: new Date(LAST_WEEK.getTime() + 4 * 24 * 60 * 60 * 1000),
    createdAt: LAST_WEEK,
    updatedAt: new Date(LAST_WEEK.getTime() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    supplierId: MOCK_SUPPLIER_IDS.CABLE_SUPPLIER_B,
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    supplierName: 'Fibre Pro Solutions',
    supplierEmail: 'quotes@fibrepro.co.za',
    contactPerson: 'Sarah Botha',
    invitationStatus: 'responded',
    invitedAt: LAST_WEEK,
    viewedAt: new Date(LAST_WEEK.getTime() + 4 * 60 * 60 * 1000),
    respondedAt: new Date(LAST_WEEK.getTime() + 2 * 24 * 60 * 60 * 1000),
    accessToken: 'supplier_token_fibre_pro_002',
    tokenExpiresAt: NEXT_WEEK,
    invitationMessage: 'We invite you to submit a quote for our fibre optic cable requirements.',
    remindersSent: 0,
    createdAt: LAST_WEEK,
    updatedAt: new Date(LAST_WEEK.getTime() + 2 * 24 * 60 * 60 * 1000),
  }
];

export const SEED_QUOTES: Omit<Quote, 'id' | 'rfqId' | 'supplierInvitationId'>[] = [
  {
    supplierId: MOCK_SUPPLIER_IDS.CABLE_SUPPLIER_A,
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    quoteNumber: 'Q-CI-2024-001',
    quoteReference: 'Cables Inc Quote #2024-001',
    status: 'submitted',
    submissionDate: new Date(LAST_WEEK.getTime() + 3 * 24 * 60 * 60 * 1000),
    validUntil: new Date(NEXT_WEEK.getTime() + 30 * 24 * 60 * 60 * 1000),
    totalValue: 255000.00,
    subtotal: 231818.18,
    taxAmount: 23181.82,
    currency: 'ZAR',
    leadTime: 21,
    paymentTerms: '30 days net',
    deliveryTerms: 'Delivered to site',
    warrantyTerms: '12 months manufacturer warranty',
    validityPeriod: 45,
    notes: 'Bulk discount applied for quantities over 5000m',
    terms: 'Standard terms and conditions apply',
    evaluationScore: 82.5,
    technicalScore: 85.0,
    commercialScore: 80.0,
    isWinner: false,
    createdAt: new Date(LAST_WEEK.getTime() + 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(LAST_WEEK.getTime() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    supplierId: MOCK_SUPPLIER_IDS.CABLE_SUPPLIER_B,
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    quoteNumber: 'FP-Q-001-2024',
    quoteReference: 'Fibre Pro Quote FP-001-2024',
    status: 'accepted',
    submissionDate: new Date(LAST_WEEK.getTime() + 2 * 24 * 60 * 60 * 1000),
    validUntil: new Date(NEXT_WEEK.getTime() + 60 * 24 * 60 * 60 * 1000),
    totalValue: 235000.00,
    subtotal: 213636.36,
    taxAmount: 21363.64,
    currency: 'ZAR',
    leadTime: 14,
    paymentTerms: '30 days net',
    deliveryTerms: 'Ex Works with installation support',
    warrantyTerms: '18 months comprehensive warranty',
    validityPeriod: 60,
    notes: 'Premium cable with extended warranty',
    terms: 'Installation support included at no extra cost',
    evaluationScore: 88.2,
    technicalScore: 90.0,
    commercialScore: 86.4,
    evaluationNotes: 'Best overall value with shorter delivery time',
    isWinner: true,
    awardedAt: YESTERDAY,
    createdAt: new Date(LAST_WEEK.getTime() + 2 * 24 * 60 * 60 * 1000),
    updatedAt: YESTERDAY,
  }
];

export const SEED_QUOTE_ITEMS: Omit<QuoteItem, 'id' | 'quoteId' | 'rfqItemId'>[] = [
  // Items for Cables Inc Quote
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    lineNumber: 1,
    itemCode: 'CABLE-SM-12F',
    description: 'Single Mode Fibre Optic Cable - 12 Core Premium',
    quotedQuantity: 5000,
    unitPrice: 47.00,
    totalPrice: 235000.00,
    alternateOffered: false,
    leadTime: 21,
    minimumOrderQuantity: 1000,
    packagingUnit: '500m drum',
    manufacturerName: 'OptiCore Technologies',
    partNumber: 'OC-SM12F-LSZH-P',
    modelNumber: 'Series-A Premium',
    technicalNotes: 'Premium grade cable with enhanced specifications',
    complianceCertificates: ['ITU-T G.652.D', 'IEC 60793-2-50', 'SABS Approved'],
    technicalCompliance: true,
    commercialScore: 78.0,
    technicalScore: 85.0,
    createdAt: new Date(LAST_WEEK.getTime() + 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(LAST_WEEK.getTime() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    lineNumber: 2,
    itemCode: 'SPLICE-TRAY',
    description: 'Fibre Splice Tray - 12 Core High-Grade',
    quotedQuantity: 120,
    unitPrice: 165.00,
    totalPrice: 19800.00,
    alternateOffered: true,
    alternateDescription: '24 Core capacity tray for future expansion',
    alternatePartNumber: 'ST-24C-HG',
    alternateUnitPrice: 210.00,
    leadTime: 21,
    minimumOrderQuantity: 50,
    packagingUnit: 'Box of 10',
    manufacturerName: 'SpliceTech Solutions',
    partNumber: 'ST-12C-HG',
    modelNumber: 'HighGrade Series',
    technicalNotes: 'High-grade ABS with enhanced UV resistance',
    technicalCompliance: true,
    commercialScore: 82.0,
    technicalScore: 88.0,
    createdAt: new Date(LAST_WEEK.getTime() + 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(LAST_WEEK.getTime() + 3 * 24 * 60 * 60 * 1000),
  },
  // Items for Fibre Pro Quote (Winning quote)
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    lineNumber: 1,
    itemCode: 'CABLE-SM-12F',
    description: 'Single Mode Fibre Optic Cable - 12 Core Professional',
    quotedQuantity: 5000,
    unitPrice: 43.50,
    totalPrice: 217500.00,
    alternateOffered: false,
    leadTime: 14,
    minimumOrderQuantity: 500,
    packagingUnit: '1000m drum',
    manufacturerName: 'FiberCore International',
    partNumber: 'FC-SM12F-LSZH-PRO',
    modelNumber: 'Professional Series',
    technicalNotes: 'Professional grade with superior bend performance',
    complianceCertificates: ['ITU-T G.652.D', 'IEC 60793-2-50', 'SABS 1339', 'Telcordia GR-20'],
    technicalCompliance: true,
    commercialScore: 90.0,
    technicalScore: 92.0,
    createdAt: new Date(LAST_WEEK.getTime() + 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(LAST_WEEK.getTime() + 2 * 24 * 60 * 60 * 1000),
  },
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    lineNumber: 2,
    itemCode: 'SPLICE-TRAY',
    description: 'Fibre Splice Tray - 12 Core Professional Grade',
    quotedQuantity: 120,
    unitPrice: 145.00,
    totalPrice: 17400.00,
    alternateOffered: false,
    leadTime: 14,
    minimumOrderQuantity: 25,
    packagingUnit: 'Individual',
    manufacturerName: 'ProSplice Systems',
    partNumber: 'PS-12C-PRO',
    modelNumber: 'Pro Series',
    technicalNotes: 'Professional grade with tool-free operation',
    technicalCompliance: true,
    commercialScore: 88.0,
    technicalScore: 90.0,
    createdAt: new Date(LAST_WEEK.getTime() + 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(LAST_WEEK.getTime() + 2 * 24 * 60 * 60 * 1000),
  }
];

// =============================================
// STOCK MANAGEMENT SEED DATA
// =============================================

export const SEED_STOCK_POSITIONS: Omit<StockPosition, 'id'>[] = [
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    itemCode: 'CABLE-SM-12F',
    itemName: 'Single Mode Fibre Optic Cable - 12 Core',
    description: 'Professional grade single mode cable',
    category: 'Cables',
    uom: 'meter',
    onHandQuantity: 15000,
    reservedQuantity: 5000,
    availableQuantity: 10000,
    inTransitQuantity: 5000,
    averageUnitCost: 43.50,
    totalValue: 652500.00,
    warehouseLocation: 'WH-001-CAPE-TOWN',
    binLocation: 'A-12-03',
    reorderLevel: 2000,
    maxStockLevel: 25000,
    economicOrderQuantity: 10000,
    lastMovementDate: YESTERDAY,
    lastCountDate: new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000),
    nextCountDue: new Date(NOW.getTime() + 60 * 24 * 60 * 60 * 1000),
    isActive: true,
    stockStatus: 'normal',
    createdAt: LAST_WEEK,
    updatedAt: YESTERDAY,
  },
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    itemCode: 'SPLICE-TRAY',
    itemName: 'Fibre Splice Tray - 12 Core',
    description: 'Professional grade splice tray',
    category: 'Hardware',
    uom: 'piece',
    onHandQuantity: 45,
    reservedQuantity: 120,
    availableQuantity: 0,
    inTransitQuantity: 120,
    averageUnitCost: 145.00,
    totalValue: 6525.00,
    warehouseLocation: 'WH-001-CAPE-TOWN',
    binLocation: 'B-05-12',
    reorderLevel: 50,
    maxStockLevel: 300,
    economicOrderQuantity: 100,
    lastMovementDate: new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000),
    stockStatus: 'critical',
    isActive: true,
    createdAt: LAST_WEEK,
    updatedAt: new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000),
  }
];

export const SEED_STOCK_MOVEMENTS: Omit<StockMovement, 'id'>[] = [
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    movementType: 'GRN',
    referenceNumber: 'GRN-FNA-001',
    referenceType: 'PO',
    referenceId: 'PO-FNA-001-2024',
    toLocation: 'WH-001-CAPE-TOWN',
    status: 'completed',
    movementDate: LAST_WEEK,
    confirmedAt: LAST_WEEK,
    requestedBy: MOCK_USER_IDS.PROCUREMENT_MANAGER,
    authorizedBy: MOCK_USER_IDS.PROJECT_MANAGER,
    processedBy: MOCK_USER_IDS.WAREHOUSE_MANAGER,
    notes: 'Goods receipt for winning RFQ quote - Fibre Pro Solutions',
    reason: 'Stock replenishment from awarded supplier',
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
  },
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    movementType: 'ISSUE',
    referenceNumber: 'ISSUE-FNA-001',
    referenceType: 'WORK_ORDER',
    referenceId: 'WO-FNA-INSTALL-001',
    fromLocation: 'WH-001-CAPE-TOWN',
    toLocation: 'SITE-ALPHA-001',
    status: 'completed',
    movementDate: YESTERDAY,
    confirmedAt: YESTERDAY,
    requestedBy: MOCK_USER_IDS.TECHNICIAN,
    authorizedBy: MOCK_USER_IDS.PROJECT_MANAGER,
    processedBy: MOCK_USER_IDS.WAREHOUSE_MANAGER,
    notes: 'Materials issued for Phase 1 installation - Alpha site',
    reason: 'Installation work order materials',
    createdAt: YESTERDAY,
    updatedAt: YESTERDAY,
  }
];

export const SEED_STOCK_MOVEMENT_ITEMS: Omit<StockMovementItem, 'id' | 'movementId' | 'stockPositionId'>[] = [
  // Items for GRN movement
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    itemCode: 'CABLE-SM-12F',
    itemName: 'Single Mode Fibre Optic Cable - 12 Core',
    description: 'Professional grade single mode cable',
    uom: 'meter',
    plannedQuantity: 20000,
    actualQuantity: 20000,
    receivedQuantity: 20000,
    unitCost: 43.50,
    totalCost: 870000.00,
    lotNumbers: ['LOT-FC-2024-001', 'LOT-FC-2024-002'],
    serialNumbers: [],
    itemStatus: 'completed',
    qualityCheckRequired: true,
    qualityCheckStatus: 'passed',
    qualityNotes: 'All quality checks passed. Cables meet specification.',
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
  },
  // Items for ISSUE movement
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    itemCode: 'CABLE-SM-12F',
    itemName: 'Single Mode Fibre Optic Cable - 12 Core',
    description: 'Professional grade single mode cable',
    uom: 'meter',
    plannedQuantity: 5000,
    actualQuantity: 5000,
    unitCost: 43.50,
    totalCost: 217500.00,
    lotNumbers: ['LOT-FC-2024-001'],
    itemStatus: 'completed',
    qualityCheckRequired: false,
    createdAt: YESTERDAY,
    updatedAt: YESTERDAY,
  }
];

// =============================================
// CABLE DRUM SEED DATA
// =============================================

export const SEED_CABLE_DRUMS: Omit<CableDrum, 'id' | 'stockPositionId'>[] = [
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    drumNumber: 'DRUM-FC-001',
    serialNumber: 'FC2024001',
    supplierDrumId: 'FP-DRUM-A001',
    cableType: 'SM-12F-LSZH',
    cableSpecification: 'ITU-T G.652.D Single Mode 12 Core LSZH',
    manufacturerName: 'FiberCore International',
    partNumber: 'FC-SM12F-LSZH-PRO',
    originalLength: 1000.0,
    currentLength: 1000.0,
    usedLength: 0.0,
    drumWeight: 125.5,
    cableWeight: 89.3,
    drumDiameter: 1200.0,
    currentLocation: 'WH-001-CAPE-TOWN',
    drumCondition: 'good',
    installationStatus: 'available',
    testCertificate: 'TC-FC-2024-001.pdf',
    installationNotes: 'New drum - ready for deployment',
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
  },
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    drumNumber: 'DRUM-FC-002',
    serialNumber: 'FC2024002',
    supplierDrumId: 'FP-DRUM-A002',
    cableType: 'SM-12F-LSZH',
    cableSpecification: 'ITU-T G.652.D Single Mode 12 Core LSZH',
    manufacturerName: 'FiberCore International',
    partNumber: 'FC-SM12F-LSZH-PRO',
    originalLength: 1000.0,
    currentLength: 645.5,
    usedLength: 354.5,
    drumWeight: 125.5,
    cableWeight: 89.3,
    drumDiameter: 1200.0,
    currentLocation: 'SITE-ALPHA-001',
    drumCondition: 'good',
    installationStatus: 'in_use',
    lastMeterReading: 645.5,
    lastReadingDate: YESTERDAY,
    lastUsedDate: YESTERDAY,
    testCertificate: 'TC-FC-2024-002.pdf',
    installationNotes: 'Currently in use at Alpha site - Phase 1 installation',
    createdAt: LAST_WEEK,
    updatedAt: YESTERDAY,
  }
];

export const SEED_DRUM_USAGE_HISTORY: Omit<DrumUsageHistory, 'id' | 'drumId'>[] = [
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    usageDate: new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000),
    poleNumber: 'POLE-ALPHA-001',
    sectionId: 'SECTION-A1',
    workOrderId: 'WO-FNA-INSTALL-001',
    previousReading: 1000.0,
    currentReading: 850.0,
    usedLength: 150.0,
    technicianId: MOCK_USER_IDS.TECHNICIAN,
    technicianName: 'Mike Jones',
    equipmentUsed: 'Cable Puller CT-500, Fusion Splicer FS-80',
    installationType: 'overhead',
    installationNotes: 'Cable pulled from pole to distribution point',
    qualityNotes: 'Good installation - no issues',
    startCoordinates: { lat: -33.9249, lng: 18.4241 },
    endCoordinates: { lat: -33.9250, lng: 18.4245 },
    createdAt: new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    projectId: MOCK_PROJECT_IDS.FIBRE_NETWORK_A,
    usageDate: YESTERDAY,
    poleNumber: 'POLE-ALPHA-002',
    sectionId: 'SECTION-A1',
    workOrderId: 'WO-FNA-INSTALL-001',
    previousReading: 850.0,
    currentReading: 645.5,
    usedLength: 204.5,
    technicianId: MOCK_USER_IDS.TECHNICIAN,
    technicianName: 'Mike Jones',
    equipmentUsed: 'Cable Puller CT-500, Fusion Splicer FS-80',
    installationType: 'overhead',
    installationNotes: 'Final pull to customer termination points',
    qualityNotes: 'Excellent installation - all tests passed',
    startCoordinates: { lat: -33.9250, lng: 18.4245 },
    endCoordinates: { lat: -33.9252, lng: 18.4250 },
    createdAt: YESTERDAY,
  }
];

// =============================================
// SEED DATA EXPORT
// =============================================

export const PROCUREMENT_SEED_DATA = {
  // BOQ Data
  boqs: SEED_BOQS,
  boqItems: SEED_BOQ_ITEMS,
  boqExceptions: SEED_BOQ_EXCEPTIONS,
  
  // RFQ Data
  rfqs: SEED_RFQS,
  rfqItems: SEED_RFQ_ITEMS,
  supplierInvitations: SEED_SUPPLIER_INVITATIONS,
  quotes: SEED_QUOTES,
  quoteItems: SEED_QUOTE_ITEMS,
  
  // Stock Data
  stockPositions: SEED_STOCK_POSITIONS,
  stockMovements: SEED_STOCK_MOVEMENTS,
  stockMovementItems: SEED_STOCK_MOVEMENT_ITEMS,
  cableDrums: SEED_CABLE_DRUMS,
  drumUsageHistory: SEED_DRUM_USAGE_HISTORY,
  
  // Reference Data
  mockProjectIds: MOCK_PROJECT_IDS,
  mockUserIds: MOCK_USER_IDS,
  mockSupplierIds: MOCK_SUPPLIER_IDS,
} as const;

export default PROCUREMENT_SEED_DATA;