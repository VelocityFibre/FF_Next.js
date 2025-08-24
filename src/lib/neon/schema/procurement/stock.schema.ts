/**
 * Stock Management Database Schema
 * Tables for stock positions, movements, and cable drum tracking
 */

import { pgTable, text, varchar, decimal, timestamp, boolean, json, uuid, index, unique } from 'drizzle-orm/pg-core';

// Stock Positions - Master inventory records
export const stockPositions = pgTable('stock_positions', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Item Details
  itemCode: varchar('item_code', { length: 100 }).notNull(),
  itemName: text('item_name').notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  uom: varchar('uom', { length: 20 }).notNull(),
  
  // Stock Quantities
  onHandQuantity: decimal('on_hand_quantity', { precision: 15, scale: 4 }).default('0'),
  reservedQuantity: decimal('reserved_quantity', { precision: 15, scale: 4 }).default('0'),
  availableQuantity: decimal('available_quantity', { precision: 15, scale: 4 }).default('0'),
  inTransitQuantity: decimal('in_transit_quantity', { precision: 15, scale: 4 }).default('0'),
  
  // Valuation
  averageUnitCost: decimal('average_unit_cost', { precision: 15, scale: 2 }),
  totalValue: decimal('total_value', { precision: 15, scale: 2 }),
  
  // Location
  warehouseLocation: varchar('warehouse_location', { length: 100 }),
  binLocation: varchar('bin_location', { length: 50 }),
  
  // Reorder Information
  reorderLevel: decimal('reorder_level', { precision: 15, scale: 4 }),
  maxStockLevel: decimal('max_stock_level', { precision: 15, scale: 4 }),
  economicOrderQuantity: decimal('economic_order_quantity', { precision: 15, scale: 4 }),
  
  // Tracking
  lastMovementDate: timestamp('last_movement_date'),
  lastCountDate: timestamp('last_count_date'),
  nextCountDue: timestamp('next_count_due'),
  
  // Status
  isActive: boolean('is_active').default(true),
  stockStatus: varchar('stock_status', { length: 20 }).default('normal'), // normal, low, critical, excess, obsolete
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectStockIdx: index('stock_position_project_idx').on(table.projectId),
    itemCodeIdx: index('stock_position_item_code_idx').on(table.projectId, table.itemCode),
    categoryIdx: index('stock_position_category_idx').on(table.category),
    stockStatusIdx: index('stock_position_status_idx').on(table.stockStatus),
    projectItemUnique: unique('stock_position_project_item_unique').on(table.projectId, table.itemCode),
  }
});

// Stock Movements - All inventory transactions
export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Movement Details
  movementType: varchar('movement_type', { length: 20 }).notNull(), // ASN, GRN, ISSUE, RETURN, TRANSFER, ADJUSTMENT
  referenceNumber: varchar('reference_number', { length: 100 }).notNull(),
  referenceType: varchar('reference_type', { length: 50 }), // PO, WO, etc.
  referenceId: varchar('reference_id', { length: 255 }),
  
  // Locations
  fromLocation: varchar('from_location', { length: 100 }),
  toLocation: varchar('to_location', { length: 100 }),
  fromProjectId: varchar('from_project_id', { length: 255 }),
  toProjectId: varchar('to_project_id', { length: 255 }),
  
  // Status and Dates
  status: varchar('status', { length: 20 }).default('pending'), // pending, confirmed, completed, cancelled
  movementDate: timestamp('movement_date').notNull(),
  confirmedAt: timestamp('confirmed_at'),
  
  // Personnel
  requestedBy: varchar('requested_by', { length: 255 }),
  authorizedBy: varchar('authorized_by', { length: 255 }),
  processedBy: varchar('processed_by', { length: 255 }),
  
  // Notes
  notes: text('notes'),
  reason: text('reason'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectMovementIdx: index('stock_movement_project_idx').on(table.projectId),
    movementTypeIdx: index('stock_movement_type_idx').on(table.movementType),
    referenceIdx: index('stock_movement_reference_idx').on(table.referenceNumber),
    statusIdx: index('stock_movement_status_idx').on(table.status),
    dateIdx: index('stock_movement_date_idx').on(table.movementDate),
  }
});

// Stock Movement Items - Line items for each movement
export const stockMovementItems = pgTable('stock_movement_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  stockMovementId: uuid('stock_movement_id').notNull().references(() => stockMovements.id, { onDelete: 'cascade' }),
  stockPositionId: uuid('stock_position_id').references(() => stockPositions.id),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Item Details
  itemCode: varchar('item_code', { length: 100 }).notNull(),
  description: text('description'),
  
  // Quantities
  plannedQuantity: decimal('planned_quantity', { precision: 15, scale: 4 }).notNull(),
  actualQuantity: decimal('actual_quantity', { precision: 15, scale: 4 }),
  uom: varchar('uom', { length: 20 }).notNull(),
  
  // Costing
  unitCost: decimal('unit_cost', { precision: 15, scale: 2 }),
  totalCost: decimal('total_cost', { precision: 15, scale: 2 }),
  
  // Tracking
  lotNumbers: json('lot_numbers'), // Array of lot numbers
  serialNumbers: json('serial_numbers'), // Array of serial numbers
  expiryDate: timestamp('expiry_date'),
  
  // Quality Control
  qualityCheckRequired: boolean('quality_check_required').default(false),
  qualityCheckStatus: varchar('quality_check_status', { length: 20 }), // pending, passed, failed, waived
  qualityCheckNotes: text('quality_check_notes'),
  
  // Item Status
  itemStatus: varchar('item_status', { length: 20 }).default('pending'), // pending, confirmed, completed, damaged, rejected
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    movementIdIdx: index('stock_movement_item_movement_id_idx').on(table.stockMovementId),
    itemCodeIdx: index('stock_movement_item_code_idx').on(table.itemCode),
    statusIdx: index('stock_movement_item_status_idx').on(table.itemStatus),
  }
});

// Cable Drums - Specialized tracking for cable inventory
export const cableDrums = pgTable('cable_drums', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  stockPositionId: uuid('stock_position_id').references(() => stockPositions.id),
  
  // Drum Identification
  drumNumber: varchar('drum_number', { length: 100 }).notNull(),
  serialNumber: varchar('serial_number', { length: 100 }),
  supplierDrumId: varchar('supplier_drum_id', { length: 100 }),
  
  // Cable Details
  cableType: varchar('cable_type', { length: 100 }).notNull(),
  cableSpecification: text('cable_specification'),
  manufacturerName: varchar('manufacturer_name', { length: 255 }),
  partNumber: varchar('part_number', { length: 100 }),
  
  // Measurements (in meters)
  originalLength: decimal('original_length', { precision: 15, scale: 4 }).notNull(),
  currentLength: decimal('current_length', { precision: 15, scale: 4 }).notNull(),
  usedLength: decimal('used_length', { precision: 15, scale: 4 }).default('0'),
  
  // Physical Properties
  drumWeight: decimal('drum_weight', { precision: 10, scale: 2 }), // kg
  cableWeight: decimal('cable_weight', { precision: 10, scale: 2 }), // kg
  drumDiameter: decimal('drum_diameter', { precision: 8, scale: 2 }), // mm
  
  // Status
  currentLocation: varchar('current_location', { length: 100 }),
  drumCondition: varchar('drum_condition', { length: 20 }).default('good'), // good, damaged, returnable
  installationStatus: varchar('installation_status', { length: 20 }).default('available'), // available, in_use, completed, returned
  
  // Tracking
  lastMeterReading: decimal('last_meter_reading', { precision: 15, scale: 4 }),
  lastReadingDate: timestamp('last_reading_date'),
  lastUsedDate: timestamp('last_used_date'),
  
  // Quality
  testCertificate: text('test_certificate'),
  installationNotes: text('installation_notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectDrumIdx: index('cable_drum_project_idx').on(table.projectId),
    drumNumberIdx: index('cable_drum_number_idx').on(table.drumNumber),
    cableTypeIdx: index('cable_drum_type_idx').on(table.cableType),
    statusIdx: index('cable_drum_status_idx').on(table.installationStatus),
    locationIdx: index('cable_drum_location_idx').on(table.currentLocation),
  }
});

// Drum Usage History - Track cable installation progress
export const drumUsageHistory = pgTable('drum_usage_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  drumId: uuid('drum_id').notNull().references(() => cableDrums.id, { onDelete: 'cascade' }),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Usage Details
  usageDate: timestamp('usage_date').notNull(),
  previousReading: decimal('previous_reading', { precision: 15, scale: 4 }).notNull(),
  currentReading: decimal('current_reading', { precision: 15, scale: 4 }).notNull(),
  usedLength: decimal('used_length', { precision: 15, scale: 4 }).notNull(),
  
  // Installation Details
  poleNumber: varchar('pole_number', { length: 50 }),
  sectionId: varchar('section_id', { length: 100 }),
  workOrderId: varchar('work_order_id', { length: 100 }),
  technicianId: varchar('technician_id', { length: 255 }),
  installationType: varchar('installation_type', { length: 20 }), // overhead, underground, building
  
  // Location Coordinates
  startCoordinates: json('start_coordinates'), // { lat, lng }
  endCoordinates: json('end_coordinates'), // { lat, lng }
  
  // Notes
  installationNotes: text('installation_notes'),
  qualityNotes: text('quality_notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    drumIdIdx: index('drum_usage_drum_id_idx').on(table.drumId),
    projectIdIdx: index('drum_usage_project_id_idx').on(table.projectId),
    usageDateIdx: index('drum_usage_date_idx').on(table.usageDate),
    technicianIdx: index('drum_usage_technician_idx').on(table.technicianId),
  }
});