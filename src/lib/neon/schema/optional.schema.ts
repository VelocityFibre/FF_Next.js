/**
 * Optional Database Schema - Additional FibreFlow Tables
 * These tables provide extended functionality for the application
 */

import {
  pgTable,
  text,
  varchar,
  timestamp,
  uuid,
  boolean,
  integer,
  decimal,
  jsonb,
  date,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { projects } from './core.schema';
import { staff, users } from './core.schema';

// ==================== DROPS ====================
export const drops = pgTable('drops', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  dropNumber: varchar('drop_number', { length: 50 }).notNull().unique(),
  projectId: uuid('project_id').references(() => projects.id),
  dropType: varchar('drop_type', { length: 50 }).default('aerial'), // aerial, underground, hybrid
  status: varchar('status', { length: 20 }).default('planned'), // planned, surveyed, designed, approved, construction, completed
  customerCount: integer('customer_count').default(0),
  totalLength: decimal('total_length', { precision: 10, scale: 2 }), // in meters
  
  // Location data
  startLatitude: decimal('start_latitude', { precision: 10, scale: 8 }),
  startLongitude: decimal('start_longitude', { precision: 11, scale: 8 }),
  endLatitude: decimal('end_latitude', { precision: 10, scale: 8 }),
  endLongitude: decimal('end_longitude', { precision: 11, scale: 8 }),
  
  // Technical specifications
  cableType: varchar('cable_type', { length: 100 }),
  fiberCount: integer('fiber_count'),
  splicePoints: jsonb('splice_points').default('[]'),
  equipmentRequired: jsonb('equipment_required').default('[]'),
  
  // Planning and execution
  surveyDate: date('survey_date'),
  designDate: date('design_date'),
  approvalDate: date('approval_date'),
  constructionStartDate: date('construction_start_date'),
  completionDate: date('completion_date'),
  
  // Assignment and tracking
  assignedSurveyor: uuid('assigned_surveyor').references(() => staff.id),
  assignedDesigner: uuid('assigned_designer').references(() => staff.id),
  assignedConstructor: uuid('assigned_constructor').references(() => staff.id),
  
  // Cost and budget
  estimatedCost: decimal('estimated_cost', { precision: 15, scale: 2 }),
  actualCost: decimal('actual_cost', { precision: 15, scale: 2 }),
  
  // Documentation
  documents: jsonb('documents').default('[]'),
  surveyNotes: text('survey_notes'),
  designNotes: text('design_notes'),
  constructionNotes: text('construction_notes'),
  
  // Quality and compliance
  qualityCheckPassed: boolean('quality_check_passed'),
  complianceVerified: boolean('compliance_verified'),
  handoverDate: date('handover_date'),
  
  metadata: jsonb('metadata').default('{}'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  dropNumberIdx: index('drops_number_idx').on(table.dropNumber),
  projectIdx: index('drops_project_idx').on(table.projectId),
  statusIdx: index('drops_status_idx').on(table.status),
  surveyorIdx: index('drops_surveyor_idx').on(table.assignedSurveyor),
}));

// ==================== FIBER STRINGING ====================
export const fiberStringing = pgTable('fiber_stringing', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  stringingId: varchar('stringing_id', { length: 50 }).notNull().unique(),
  projectId: uuid('project_id').references(() => projects.id),
  dropId: uuid('drop_id').references(() => drops.id),
  
  // Stringing details
  sectionName: varchar('section_name', { length: 255 }),
  cableType: varchar('cable_type', { length: 100 }).notNull(),
  fiberCount: integer('fiber_count').notNull(),
  length: decimal('length', { precision: 10, scale: 2 }).notNull(), // in meters
  
  // Installation details
  installationType: varchar('installation_type', { length: 50 }).default('aerial'), // aerial, underground, indoor
  startPoint: varchar('start_point', { length: 255 }),
  endPoint: varchar('end_point', { length: 255 }),
  route: jsonb('route').default('[]'), // GPS coordinates of the path
  
  // Status tracking
  status: varchar('status', { length: 20 }).default('planned'), // planned, in_progress, completed, tested, accepted
  scheduledDate: date('scheduled_date'),
  startDate: date('start_date'),
  completionDate: date('completion_date'),
  testingDate: date('testing_date'),
  acceptanceDate: date('acceptance_date'),
  
  // Team assignment
  stringingTeam: uuid('stringing_team').references(() => staff.id),
  testingTeam: uuid('testing_team').references(() => staff.id),
  supervisor: uuid('supervisor').references(() => staff.id),
  
  // Technical data
  tensionReading: decimal('tension_reading', { precision: 8, scale: 2 }),
  sagMeasurement: decimal('sag_measurement', { precision: 8, scale: 2 }),
  testResults: jsonb('test_results').default('{}'),
  attenuationLoss: decimal('attenuation_loss', { precision: 6, scale: 3 }),
  
  // Quality control
  preInstallationCheck: boolean('pre_installation_check').default(false),
  postInstallationCheck: boolean('post_installation_check').default(false),
  qualityScore: integer('quality_score'), // 1-100
  
  // Documentation
  workPhotos: jsonb('work_photos').default('[]'),
  testDocuments: jsonb('test_documents').default('[]'),
  notes: text('notes'),
  issues: jsonb('issues').default('[]'),
  
  metadata: jsonb('metadata').default('{}'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  stringingIdIdx: index('fiber_stringing_id_idx').on(table.stringingId),
  projectIdx: index('fiber_stringing_project_idx').on(table.projectId),
  dropIdx: index('fiber_stringing_drop_idx').on(table.dropId),
  statusIdx: index('fiber_stringing_status_idx').on(table.status),
  teamIdx: index('fiber_stringing_team_idx').on(table.stringingTeam),
}));

// ==================== HOME INSTALLATIONS ====================
export const homeInstallations = pgTable('home_installations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  installationId: varchar('installation_id', { length: 50 }).notNull().unique(),
  projectId: uuid('project_id').references(() => projects.id),
  dropId: uuid('drop_id').references(() => drops.id),
  
  // Customer information
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 20 }),
  customerEmail: varchar('customer_email', { length: 255 }),
  serviceAddress: text('service_address').notNull(),
  
  // Location data
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  
  // Service details
  serviceType: varchar('service_type', { length: 50 }).default('residential'), // residential, business, enterprise
  packageType: varchar('package_type', { length: 100 }),
  bandwidthSpeed: varchar('bandwidth_speed', { length: 50 }),
  staticIpRequired: boolean('static_ip_required').default(false),
  
  // Installation scheduling
  scheduledDate: date('scheduled_date'),
  timeSlot: varchar('time_slot', { length: 50 }),
  estimatedDuration: integer('estimated_duration'), // in hours
  
  // Status tracking
  status: varchar('status', { length: 20 }).default('scheduled'), // scheduled, confirmed, in_progress, completed, cancelled, rescheduled
  confirmationDate: timestamp('confirmation_date'),
  startTime: timestamp('start_time'),
  completionTime: timestamp('completion_time'),
  
  // Team assignment
  installationTechnician: uuid('installation_technician').references(() => staff.id),
  backupTechnician: uuid('backup_technician').references(() => staff.id),
  teamLead: uuid('team_lead').references(() => staff.id),
  
  // Equipment and materials
  equipmentUsed: jsonb('equipment_used').default('[]'),
  materialsUsed: jsonb('materials_used').default('[]'),
  serialNumbers: jsonb('serial_numbers').default('{}'),
  
  // Technical installation data
  fiberConnectionPoint: varchar('fiber_connection_point', { length: 255 }),
  internalCabling: jsonb('internal_cabling').default('{}'),
  routerPlacement: varchar('router_placement', { length: 255 }),
  signalStrength: decimal('signal_strength', { precision: 5, scale: 2 }),
  speedTestResults: jsonb('speed_test_results').default('{}'),
  
  // Quality control
  preInstallationSurvey: boolean('pre_installation_survey').default(false),
  customerWalkthrough: boolean('customer_walkthrough').default(false),
  qualityChecklist: jsonb('quality_checklist').default('{}'),
  customerSatisfactionScore: integer('customer_satisfaction_score'), // 1-10
  
  // Financial
  installationCost: decimal('installation_cost', { precision: 10, scale: 2 }),
  customerPayment: decimal('customer_payment', { precision: 10, scale: 2 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  
  // Documentation
  installationPhotos: jsonb('installation_photos').default('[]'),
  customerSignature: text('customer_signature'),
  workOrderNumber: varchar('work_order_number', { length: 50 }),
  notes: text('notes'),
  issues: jsonb('issues').default('[]'),
  followUpRequired: boolean('follow_up_required').default(false),
  
  metadata: jsonb('metadata').default('{}'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  installationIdIdx: index('home_installations_id_idx').on(table.installationId),
  projectIdx: index('home_installations_project_idx').on(table.projectId),
  dropIdx: index('home_installations_drop_idx').on(table.dropId),
  statusIdx: index('home_installations_status_idx').on(table.status),
  technicianIdx: index('home_installations_technician_idx').on(table.installationTechnician),
  scheduledDateIdx: index('home_installations_scheduled_date_idx').on(table.scheduledDate),
}));

// ==================== ACTION ITEMS ====================
export const actionItems = pgTable('action_items', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  actionId: varchar('action_id', { length: 50 }).notNull().unique(),
  
  // Reference data
  projectId: uuid('project_id').references(() => projects.id),
  relatedTable: varchar('related_table', { length: 50 }), // drops, fiber_stringing, home_installations, etc.
  relatedId: uuid('related_id'),
  
  // Action details
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).default('general'), // safety, quality, technical, administrative, customer
  priority: varchar('priority', { length: 20 }).default('medium'), // low, medium, high, urgent
  actionType: varchar('action_type', { length: 50 }), // follow_up, correction, inspection, documentation
  
  // Assignment and responsibility
  assignedTo: uuid('assigned_to').references(() => staff.id),
  assignedBy: uuid('assigned_by').references(() => users.id),
  departmentResponsible: varchar('department_responsible', { length: 100 }),
  
  // Timeline
  dueDate: date('due_date'),
  scheduledDate: date('scheduled_date'),
  estimatedHours: decimal('estimated_hours', { precision: 6, scale: 2 }),
  
  // Status tracking
  status: varchar('status', { length: 20 }).default('open'), // open, in_progress, completed, cancelled, on_hold
  startDate: date('start_date'),
  completionDate: date('completion_date'),
  actualHours: decimal('actual_hours', { precision: 6, scale: 2 }),
  
  // Resolution
  resolution: text('resolution'),
  resolutionDate: date('resolution_date'),
  verifiedBy: uuid('verified_by').references(() => users.id),
  verificationDate: date('verification_date'),
  
  // Documentation
  attachments: jsonb('attachments').default('[]'),
  photos: jsonb('photos').default('[]'),
  relatedActions: jsonb('related_actions').default('[]'), // IDs of related action items
  
  // Quality and compliance
  safetyRelated: boolean('safety_related').default(false),
  complianceRelated: boolean('compliance_related').default(false),
  customerImpact: varchar('customer_impact', { length: 20 }), // none, low, medium, high
  
  // Notifications and follow-up
  notificationsSent: jsonb('notifications_sent').default('[]'),
  reminderScheduled: boolean('reminder_scheduled').default(false),
  escalationLevel: integer('escalation_level').default(0),
  
  metadata: jsonb('metadata').default('{}'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  actionIdIdx: index('action_items_id_idx').on(table.actionId),
  projectIdx: index('action_items_project_idx').on(table.projectId),
  assignedToIdx: index('action_items_assigned_to_idx').on(table.assignedTo),
  statusIdx: index('action_items_status_idx').on(table.status),
  priorityIdx: index('action_items_priority_idx').on(table.priority),
  dueDateIdx: index('action_items_due_date_idx').on(table.dueDate),
  relatedTableIdx: index('action_items_related_table_idx').on(table.relatedTable, table.relatedId),
}));

// ==================== DAILY PROGRESS ====================
export const dailyProgress = pgTable('daily_progress', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  
  // Reference data
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  workDate: date('work_date').notNull(),
  
  // Team and shift information
  shiftType: varchar('shift_type', { length: 20 }).default('day'), // day, evening, night
  teamLead: uuid('team_lead').references(() => staff.id),
  teamMembers: jsonb('team_members').default('[]'), // Array of staff IDs
  contractorId: uuid('contractor_id'), // Reference to contractor if external team
  
  // Work performed
  workType: varchar('work_type', { length: 50 }), // surveying, construction, installation, testing, maintenance
  activitiesCompleted: jsonb('activities_completed').default('[]'),
  locationsWorked: jsonb('locations_worked').default('[]'),
  
  // Progress metrics
  dropsCompleted: integer('drops_completed').default(0),
  fiberStringingCompleted: decimal('fiber_stringing_completed', { precision: 10, scale: 2 }).default('0'), // meters
  homeInstallationsCompleted: integer('home_installations_completed').default(0),
  polesInstalled: integer('poles_installed').default(0),
  
  // Time tracking
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  totalHours: decimal('total_hours', { precision: 6, scale: 2 }),
  overtimeHours: decimal('overtime_hours', { precision: 6, scale: 2 }).default('0'),
  breakTime: decimal('break_time', { precision: 4, scale: 2 }).default('0'),
  
  // Materials and equipment used
  materialsUsed: jsonb('materials_used').default('[]'),
  equipmentUsed: jsonb('equipment_used').default('[]'),
  vehiclesUsed: jsonb('vehicles_used').default('[]'),
  
  // Quality and safety
  safetyIncidents: jsonb('safety_incidents').default('[]'),
  qualityIssues: jsonb('quality_issues').default('[]'),
  safetyCheckCompleted: boolean('safety_check_completed').default(false),
  ppeCompliance: boolean('ppe_compliance').default(true),
  
  // Weather and conditions
  weatherConditions: varchar('weather_conditions', { length: 100 }),
  temperature: decimal('temperature', { precision: 4, scale: 1 }),
  workStoppages: jsonb('work_stoppages').default('[]'),
  
  // Customer interactions
  customerContacts: jsonb('customer_contacts').default('[]'),
  customerComplaints: jsonb('customer_complaints').default('[]'),
  customerFeedback: jsonb('customer_feedback').default('[]'),
  
  // Documentation
  workPhotos: jsonb('work_photos').default('[]'),
  progressNotes: text('progress_notes'),
  challengesFaced: text('challenges_faced'),
  nextDayPlanning: text('next_day_planning'),
  
  // Productivity metrics
  productivityScore: decimal('productivity_score', { precision: 5, scale: 2 }),
  efficiencyRating: integer('efficiency_rating'), // 1-10
  goalAchievementPercentage: integer('goal_achievement_percentage'), // 0-100
  
  metadata: jsonb('metadata').default('{}'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  projectDateIdx: index('daily_progress_project_date_idx').on(table.projectId, table.workDate),
  workDateIdx: index('daily_progress_work_date_idx').on(table.workDate),
  teamLeadIdx: index('daily_progress_team_lead_idx').on(table.teamLead),
  workTypeIdx: index('daily_progress_work_type_idx').on(table.workType),
}));

// ==================== REPORTS ====================
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar('report_id', { length: 50 }).notNull().unique(),
  
  // Report metadata
  reportName: varchar('report_name', { length: 255 }).notNull(),
  reportType: varchar('report_type', { length: 50 }).notNull(), // daily, weekly, monthly, project_summary, compliance, financial
  category: varchar('category', { length: 50 }), // progress, quality, safety, financial, customer
  
  // Scope and filters
  projectId: uuid('project_id').references(() => projects.id),
  dateFrom: date('date_from'),
  dateTo: date('date_to'),
  reportScope: jsonb('report_scope').default('{}'), // What data to include
  filters: jsonb('filters').default('{}'), // Applied filters
  
  // Generation details
  generatedBy: uuid('generated_by').references(() => users.id).notNull(),
  generationDate: timestamp('generation_date').defaultNow(),
  status: varchar('status', { length: 20 }).default('generating'), // generating, completed, failed, expired
  
  // Report content
  reportData: jsonb('report_data').default('{}'), // Main report data
  summaryMetrics: jsonb('summary_metrics').default('{}'), // Key metrics summary
  chartData: jsonb('chart_data').default('{}'), // Data for charts and graphs
  tables: jsonb('tables').default('[]'), // Tabular data
  
  // File information
  reportFormat: varchar('report_format', { length: 20 }).default('json'), // json, pdf, excel, csv
  fileSize: integer('file_size'), // in bytes
  filePath: text('file_path'), // Path to generated file
  downloadUrl: text('download_url'), // URL for downloading
  
  // Sharing and access
  isPublic: boolean('is_public').default(false),
  sharedWith: jsonb('shared_with').default('[]'), // User IDs with access
  accessLevel: varchar('access_level', { length: 20 }).default('private'), // private, team, company, public
  
  // Scheduling and automation
  isScheduled: boolean('is_scheduled').default(false),
  scheduleFrequency: varchar('schedule_frequency', { length: 20 }), // daily, weekly, monthly
  nextGenerationDate: timestamp('next_generation_date'),
  emailRecipients: jsonb('email_recipients').default('[]'),
  
  // Versioning
  version: integer('version').default(1),
  parentReportId: uuid('parent_report_id'), // For versioned reports
  
  // Performance metrics
  generationTimeSeconds: decimal('generation_time_seconds', { precision: 8, scale: 3 }),
  queryCount: integer('query_count'),
  dataPointsCount: integer('data_points_count'),
  
  // Retention and cleanup
  expiryDate: timestamp('expiry_date'),
  isArchived: boolean('is_archived').default(false),
  archiveDate: timestamp('archive_date'),
  
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  reportIdIdx: index('reports_id_idx').on(table.reportId),
  projectIdx: index('reports_project_idx').on(table.projectId),
  typeIdx: index('reports_type_idx').on(table.reportType),
  generatedByIdx: index('reports_generated_by_idx').on(table.generatedBy),
  statusIdx: index('reports_status_idx').on(table.status),
  generationDateIdx: index('reports_generation_date_idx').on(table.generationDate),
  expiryDateIdx: index('reports_expiry_date_idx').on(table.expiryDate),
}));

// ==================== ONE MAP ====================
export const oneMap = pgTable('one_map', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  
  // Geographic data
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
  address: text('address'),
  postalCode: varchar('postal_code', { length: 20 }),
  
  // Map layer and feature data
  layerType: varchar('layer_type', { length: 50 }).notNull(), // poles, cables, drops, installations, boundaries
  featureType: varchar('feature_type', { length: 50 }), // specific type within layer
  featureId: uuid('feature_id'), // Reference to actual feature (pole_id, drop_id, etc.)
  
  // Project association
  projectId: uuid('project_id').references(() => projects.id),
  
  // Display properties
  markerType: varchar('marker_type', { length: 50 }),
  markerColor: varchar('marker_color', { length: 20 }),
  markerIcon: varchar('marker_icon', { length: 50 }),
  markerSize: varchar('marker_size', { length: 20 }).default('medium'),
  
  // Status and visibility
  status: varchar('status', { length: 20 }).default('active'), // active, inactive, planned, completed
  isVisible: boolean('is_visible').default(true),
  displayOrder: integer('display_order').default(0),
  
  // Geometric data
  geometryType: varchar('geometry_type', { length: 20 }), // point, line, polygon
  coordinates: jsonb('coordinates'), // GeoJSON coordinates
  boundingBox: jsonb('bounding_box'), // For quick spatial queries
  
  // Properties and attributes
  properties: jsonb('properties').default('{}'), // Feature-specific properties
  styleProperties: jsonb('style_properties').default('{}'), // Rendering style
  
  // Popup and interaction data
  popupTitle: varchar('popup_title', { length: 255 }),
  popupContent: text('popup_content'),
  clickAction: varchar('click_action', { length: 50 }), // none, popup, navigate, custom
  
  // Clustering and grouping
  clusterGroup: varchar('cluster_group', { length: 50 }),
  allowClustering: boolean('allow_clustering').default(true),
  clusterRadius: integer('cluster_radius').default(50),
  
  // Temporal data
  validFrom: timestamp('valid_from'),
  validTo: timestamp('valid_to'),
  
  // Data quality
  dataSource: varchar('data_source', { length: 100 }), // survey, gps, manual, import
  accuracy: decimal('accuracy', { precision: 8, scale: 2 }), // GPS accuracy in meters
  verificationStatus: varchar('verification_status', { length: 20 }).default('unverified'),
  verificationDate: date('verification_date'),
  
  metadata: jsonb('metadata').default('{}'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  coordinatesIdx: index('one_map_coordinates_idx').on(table.latitude, table.longitude),
  projectIdx: index('one_map_project_idx').on(table.projectId),
  layerTypeIdx: index('one_map_layer_type_idx').on(table.layerType),
  featureIdx: index('one_map_feature_idx').on(table.featureType, table.featureId),
  statusIdx: index('one_map_status_idx').on(table.status),
  visibilityIdx: index('one_map_visibility_idx').on(table.isVisible),
}));

// ==================== NOKIA EQUIPMENT ====================
export const nokiaEquipment = pgTable('nokia_equipment', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  equipmentId: varchar('equipment_id', { length: 50 }).notNull().unique(),
  
  // Equipment identification
  serialNumber: varchar('serial_number', { length: 100 }).notNull().unique(),
  modelNumber: varchar('model_number', { length: 100 }).notNull(),
  equipmentType: varchar('equipment_type', { length: 50 }).notNull(), // OLT, ONU, ONT, Switch, Router, etc.
  category: varchar('category', { length: 50 }), // network, customer_premises, test, spare
  
  // Nokia specific data
  softwareVersion: varchar('software_version', { length: 50 }),
  firmwareVersion: varchar('firmware_version', { length: 50 }),
  hardwareRevision: varchar('hardware_revision', { length: 50 }),
  partNumber: varchar('part_number', { length: 100 }),
  
  // Asset management
  assetTag: varchar('asset_tag', { length: 50 }),
  purchaseOrder: varchar('purchase_order', { length: 50 }),
  vendor: varchar('vendor', { length: 100 }).default('Nokia'),
  purchaseDate: date('purchase_date'),
  purchaseCost: decimal('purchase_cost', { precision: 12, scale: 2 }),
  warrantyExpiry: date('warranty_expiry'),
  
  // Location and assignment
  projectId: uuid('project_id').references(() => projects.id),
  currentLocation: text('current_location'),
  installationAddress: text('installation_address'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  
  // Installation data
  installationDate: date('installation_date'),
  installedBy: uuid('installed_by').references(() => staff.id),
  installationType: varchar('installation_type', { length: 50 }), // new, replacement, upgrade, relocation
  
  // Status and operational data
  status: varchar('status', { length: 20 }).default('inventory'), // inventory, deployed, active, inactive, maintenance, defective, retired
  operationalStatus: varchar('operational_status', { length: 20 }), // online, offline, degraded, testing
  lastStatusUpdate: timestamp('last_status_update'),
  
  // Network configuration
  ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6
  macAddress: varchar('mac_address', { length: 17 }),
  vlanConfiguration: jsonb('vlan_configuration').default('{}'),
  networkPorts: jsonb('network_ports').default('[]'),
  
  // Performance and monitoring
  uptime: decimal('uptime', { precision: 10, scale: 2 }), // in hours
  lastMaintenanceDate: date('last_maintenance_date'),
  nextMaintenanceDate: date('next_maintenance_date'),
  performanceMetrics: jsonb('performance_metrics').default('{}'),
  
  // Technical specifications
  specifications: jsonb('specifications').default('{}'), // Technical specs
  portCount: integer('port_count'),
  powerConsumption: decimal('power_consumption', { precision: 8, scale: 2 }), // watts
  operatingTemperature: jsonb('operating_temperature').default('{}'), // min/max temps
  
  // Connectivity and relationships
  connectedEquipment: jsonb('connected_equipment').default('[]'), // IDs of connected equipment
  parentEquipment: uuid('parent_equipment'), // For hierarchical relationships
  childEquipment: jsonb('child_equipment').default('[]'),
  
  // Documentation and compliance
  configurationFiles: jsonb('configuration_files').default('[]'),
  manuals: jsonb('manuals').default('[]'),
  certificates: jsonb('certificates').default('[]'),
  complianceStandards: jsonb('compliance_standards').default('[]'),
  
  // Maintenance history
  maintenanceHistory: jsonb('maintenance_history').default('[]'),
  incidentHistory: jsonb('incident_history').default('[]'),
  replacementHistory: jsonb('replacement_history').default('[]'),
  
  // Financial tracking
  depreciationSchedule: jsonb('depreciation_schedule').default('{}'),
  currentValue: decimal('current_value', { precision: 12, scale: 2 }),
  insuranceValue: decimal('insurance_value', { precision: 12, scale: 2 }),
  
  // Return and disposal
  returnDate: date('return_date'),
  disposalDate: date('disposal_date'),
  disposalMethod: varchar('disposal_method', { length: 50 }),
  recyclingInfo: jsonb('recycling_info').default('{}'),
  
  metadata: jsonb('metadata').default('{}'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  equipmentIdIdx: index('nokia_equipment_id_idx').on(table.equipmentId),
  serialNumberIdx: index('nokia_equipment_serial_idx').on(table.serialNumber),
  modelNumberIdx: index('nokia_equipment_model_idx').on(table.modelNumber),
  equipmentTypeIdx: index('nokia_equipment_type_idx').on(table.equipmentType),
  projectIdx: index('nokia_equipment_project_idx').on(table.projectId),
  statusIdx: index('nokia_equipment_status_idx').on(table.status),
  locationIdx: index('nokia_equipment_location_idx').on(table.latitude, table.longitude),
}));

// Export all optional tables
export const optionalTables = {
  drops,
  fiberStringing,
  homeInstallations,
  actionItems,
  dailyProgress,
  reports,
  oneMap,
  nokiaEquipment,
};