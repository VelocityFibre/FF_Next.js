/**
 * Procurement Seed Data - Constants and Mock IDs
 * Centralized constants for use across all procurement seed data
 */

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

// Mock Catalog Item IDs
export const MOCK_CATALOG_IDS = {
  CABLE_SM_12F: 'cat_cable_sm_12f_001',
  SPLICE_TRAY_12: 'cat_splice_tray_12_002',
  CLOSURE_INLINE: 'cat_closure_inline_003',
  PATCH_PANEL_24: 'cat_patch_panel_24_004'
} as const;

// Time constants for consistent seed data
export const TIME_CONSTANTS = {
  NOW: new Date(),
  YESTERDAY: new Date(Date.now() - 24 * 60 * 60 * 1000),
  LAST_WEEK: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  LAST_MONTH: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  NEXT_WEEK: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  NEXT_MONTH: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
} as const;

// Status constants
export const PROCUREMENT_STATUS = {
  PENDING: 'pending',
  RFQ_CREATED: 'rfq_created', 
  QUOTED: 'quoted',
  AWARDED: 'awarded',
  ORDERED: 'ordered'
} as const;

export const STOCK_STATUS = {
  NORMAL: 'normal',
  LOW: 'low', 
  CRITICAL: 'critical',
  EXCESS: 'excess',
  OBSOLETE: 'obsolete'
} as const;

export const INVITATION_STATUS = {
  SENT: 'sent',
  VIEWED: 'viewed',
  RESPONDED: 'responded', 
  DECLINED: 'declined',
  EXPIRED: 'expired'
} as const;

// Common specifications templates
export const CABLE_SPECS = {
  SINGLE_MODE_12F: {
    coreCount: 12,
    cableType: 'Single Mode',
    jacketType: 'LSZH',
    bendRadius: '20x cable diameter',
    standard: 'ITU-T G.652.D'
  },
  SINGLE_MODE_24F: {
    coreCount: 24,
    cableType: 'Single Mode', 
    jacketType: 'LSZH',
    bendRadius: '20x cable diameter',
    standard: 'ITU-T G.652.D'
  }
} as const;

export const HARDWARE_SPECS = {
  SPLICE_TRAY_12: {
    capacity: 12,
    material: 'ABS Plastic',
    dimensions: '220x110x15mm'
  },
  CLOSURE_INLINE: {
    capacity: 48,
    mounting: 'Underground/Aerial',
    protection: 'IP68'
  }
} as const;

// Warehouse and location constants
export const WAREHOUSE_LOCATIONS = {
  CAPE_TOWN: 'WH-001-CAPE-TOWN',
  JOHANNESBURG: 'WH-002-JOHANNESBURG', 
  DURBAN: 'WH-003-DURBAN'
} as const;

export const BIN_LOCATIONS = {
  CABLES_SECTION: 'B-01',
  HARDWARE_SECTION: 'B-02', 
  EQUIPMENT_SECTION: 'B-03',
  TESTING_SECTION: 'B-04',
  SPARES_SECTION: 'B-05'
} as const;