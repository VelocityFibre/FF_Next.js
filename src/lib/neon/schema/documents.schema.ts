/**
 * Document Management Schema - FibreFlow Document System
 * Comprehensive document and file reference management for fiber network projects
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
import { projects, users, clients, staff } from './core.schema';

// ==================== DOCUMENT FOLDERS ====================
export const documentFolders = pgTable('document_folders', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  folderName: varchar('folder_name', { length: 255 }).notNull(),
  folderPath: text('folder_path').notNull().unique(), // Full path like /projects/proj123/sow
  parentFolderId: uuid('parent_folder_id'), // Self-referencing for nested folders
  projectId: uuid('project_id').references(() => projects.id),
  
  // Folder properties
  description: text('description'),
  folderType: varchar('folder_type', { length: 50 }), // sow, invoices, technical, photos, compliance, reports
  isSystemFolder: boolean('is_system_folder').default(false),
  sortOrder: integer('sort_order').default(0),
  
  // Access control
  isPublic: boolean('is_public').default(false),
  accessLevel: varchar('access_level', { length: 20 }).default('project'), // public, company, project, private
  allowedUsers: jsonb('allowed_users').default('[]'), // User IDs with access
  allowedRoles: jsonb('allowed_roles').default('[]'), // Roles with access
  
  // Metadata
  documentCount: integer('document_count').default(0),
  totalSize: integer('total_size').default(0), // Total size in bytes
  lastActivity: timestamp('last_activity'),
  
  metadata: jsonb('metadata').default('{}'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  folderPathIdx: index('document_folders_path_idx').on(table.folderPath),
  parentFolderIdx: index('document_folders_parent_idx').on(table.parentFolderId),
  projectIdx: index('document_folders_project_idx').on(table.projectId),
  folderTypeIdx: index('document_folders_type_idx').on(table.folderType),
  accessLevelIdx: index('document_folders_access_idx').on(table.accessLevel),
}));

// Add self-reference constraint
// documentFolders.parentFolderId.references(() => documentFolders.id);

// ==================== DOCUMENTS ====================
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar('document_id', { length: 50 }).notNull().unique(),
  
  // Basic document information
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  description: text('description'),
  
  // File properties
  fileSize: integer('file_size').notNull(), // Size in bytes
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileExtension: varchar('file_extension', { length: 10 }).notNull(),
  md5Hash: varchar('md5_hash', { length: 32 }).notNull(),
  sha256Hash: varchar('sha256_hash', { length: 64 }),
  
  // Storage information
  storagePath: text('storage_path').notNull(), // Full path to file
  storageProvider: varchar('storage_provider', { length: 50 }).default('local'), // local, s3, azure, gcs
  storageUrl: text('storage_url'), // URL for accessing file
  thumbnailPath: text('thumbnail_path'), // Path to thumbnail if applicable
  
  // Organization
  folderId: uuid('folder_id').references(() => documentFolders.id),
  projectId: uuid('project_id').references(() => projects.id),
  clientId: uuid('client_id').references(() => clients.id),
  
  // Categorization
  documentType: varchar('document_type', { length: 50 }).notNull(), // sow, invoice, technical_report, photo, certificate, etc.
  category: varchar('category', { length: 50 }), // financial, technical, compliance, operational
  subcategory: varchar('subcategory', { length: 50 }),
  tags: jsonb('tags').default('[]'),
  
  // Status and lifecycle
  status: varchar('status', { length: 20 }).default('active'), // active, archived, deleted, quarantined
  isTemplate: boolean('is_template').default(false),
  templateCategory: varchar('template_category', { length: 50 }),
  
  // Version control
  version: integer('version').default(1),
  parentDocumentId: uuid('parent_document_id'), // Reference to original document for versions
  isLatestVersion: boolean('is_latest_version').default(true),
  versionNotes: text('version_notes'),
  
  // Access control and security
  isPublic: boolean('is_public').default(false),
  accessLevel: varchar('access_level', { length: 20 }).default('project'), // public, company, project, private
  allowedUsers: jsonb('allowed_users').default('[]'), // User IDs with access
  allowedRoles: jsonb('allowed_roles').default('[]'), // Roles with access
  isPasswordProtected: boolean('is_password_protected').default(false),
  passwordHash: varchar('password_hash', { length: 255 }),
  
  // Content analysis
  hasText: boolean('has_text').default(false),
  extractedText: text('extracted_text'), // For searchable content
  ocrText: text('ocr_text'), // OCR extracted text for images/PDFs
  pageCount: integer('page_count'),
  wordCount: integer('word_count'),
  
  // Workflow and approval
  requiresApproval: boolean('requires_approval').default(false),
  approvalStatus: varchar('approval_status', { length: 20 }).default('pending'), // pending, approved, rejected
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedDate: timestamp('approved_date'),
  rejectionReason: text('rejection_reason'),
  
  // Retention and expiry
  retentionPeriodDays: integer('retention_period_days'),
  expiryDate: date('expiry_date'),
  autoDeleteDate: date('auto_delete_date'),
  isExpired: boolean('is_expired').default(false),
  
  // Analytics and usage
  downloadCount: integer('download_count').default(0),
  viewCount: integer('view_count').default(0),
  lastDownloaded: timestamp('last_downloaded'),
  lastViewed: timestamp('last_viewed'),
  
  // Quality and compliance
  isCompliant: boolean('is_compliant').default(true),
  complianceNotes: text('compliance_notes'),
  qualityScore: integer('quality_score'), // 1-100
  hasWatermark: boolean('has_watermark').default(false),
  
  // Document-specific fields
  documentDate: date('document_date'), // Date of the actual document (not upload date)
  authorName: varchar('author_name', { length: 255 }),
  companyName: varchar('company_name', { length: 255 }),
  contractNumber: varchar('contract_number', { length: 100 }),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  receiptNumber: varchar('receipt_number', { length: 100 }),
  
  // Financial documents
  amount: decimal('amount', { precision: 15, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }),
  
  // Technical documents
  technicalSpecs: jsonb('technical_specs').default('{}'),
  equipmentIds: jsonb('equipment_ids').default('[]'), // Related equipment
  locationData: jsonb('location_data').default('{}'), // GPS coords, addresses
  
  // Photo/Image metadata
  imageWidth: integer('image_width'),
  imageHeight: integer('image_height'),
  cameraModel: varchar('camera_model', { length: 100 }),
  gpsLatitude: decimal('gps_latitude', { precision: 10, scale: 8 }),
  gpsLongitude: decimal('gps_longitude', { precision: 11, scale: 8 }),
  dateTaken: timestamp('date_taken'),
  
  metadata: jsonb('metadata').default('{}'),
  createdBy: uuid('created_by').references(() => users.id),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  documentIdIdx: index('documents_id_idx').on(table.documentId),
  fileNameIdx: index('documents_file_name_idx').on(table.fileName),
  folderIdx: index('documents_folder_idx').on(table.folderId),
  projectIdx: index('documents_project_idx').on(table.projectId),
  clientIdx: index('documents_client_idx').on(table.clientId),
  documentTypeIdx: index('documents_type_idx').on(table.documentType),
  categoryIdx: index('documents_category_idx').on(table.category),
  statusIdx: index('documents_status_idx').on(table.status),
  versionIdx: index('documents_version_idx').on(table.parentDocumentId, table.version),
  approvalStatusIdx: index('documents_approval_idx').on(table.approvalStatus),
  documentDateIdx: index('documents_date_idx').on(table.documentDate),
  md5HashIdx: index('documents_md5_idx').on(table.md5Hash),
  mimeTypeIdx: index('documents_mime_type_idx').on(table.mimeType),
  tagsIdx: index('documents_tags_idx').on(table.tags),
}));

// Add self-reference constraint for document versions
// documents.parentDocumentId.references(() => documents.id);

// ==================== DOCUMENT ACCESS LOGS ====================
export const documentAccessLogs = pgTable('document_access_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  
  documentId: uuid('document_id').references(() => documents.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  
  // Access details
  accessType: varchar('access_type', { length: 20 }).notNull(), // view, download, edit, delete, share
  accessMethod: varchar('access_method', { length: 20 }), // web, api, mobile, sync
  
  // Session information
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  sessionId: varchar('session_id', { length: 255 }),
  
  // Request details
  requestDuration: integer('request_duration'), // milliseconds
  bytesTransferred: integer('bytes_transferred'),
  wasSuccessful: boolean('was_successful').default(true),
  errorMessage: text('error_message'),
  
  // Context
  refererUrl: text('referer_url'),
  deviceType: varchar('device_type', { length: 20 }), // desktop, mobile, tablet
  browserName: varchar('browser_name', { length: 50 }),
  browserVersion: varchar('browser_version', { length: 20 }),
  
  metadata: jsonb('metadata').default('{}'),
  accessedAt: timestamp('accessed_at').defaultNow(),
}, (table) => ({
  documentIdx: index('document_access_logs_document_idx').on(table.documentId),
  userIdx: index('document_access_logs_user_idx').on(table.userId),
  accessTypeIdx: index('document_access_logs_type_idx').on(table.accessType),
  accessTimeIdx: index('document_access_logs_time_idx').on(table.accessedAt),
  ipAddressIdx: index('document_access_logs_ip_idx').on(table.ipAddress),
}));

// ==================== DOCUMENT SHARES ====================
export const documentShares = pgTable('document_shares', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  shareId: varchar('share_id', { length: 50 }).notNull().unique(),
  
  documentId: uuid('document_id').references(() => documents.id).notNull(),
  sharedBy: uuid('shared_by').references(() => users.id).notNull(),
  
  // Share configuration
  shareType: varchar('share_type', { length: 20 }).notNull(), // link, email, user, role
  shareUrl: text('share_url'),
  accessToken: varchar('access_token', { length: 255 }),
  
  // Recipients (for different share types)
  sharedWithUsers: jsonb('shared_with_users').default('[]'), // User IDs
  sharedWithEmails: jsonb('shared_with_emails').default('[]'), // Email addresses
  sharedWithRoles: jsonb('shared_with_roles').default('[]'), // Role names
  
  // Permissions
  canView: boolean('can_view').default(true),
  canDownload: boolean('can_download').default(true),
  canEdit: boolean('can_edit').default(false),
  canComment: boolean('can_comment').default(false),
  canShare: boolean('can_share').default(false),
  
  // Access control
  requiresPassword: boolean('requires_password').default(false),
  passwordHash: varchar('password_hash', { length: 255 }),
  requiresLogin: boolean('requires_login').default(true),
  
  // Expiry and limits
  expiryDate: timestamp('expiry_date'),
  maxAccesses: integer('max_accesses'),
  accessCount: integer('access_count').default(0),
  
  // Status
  isActive: boolean('is_active').default(true),
  
  // Analytics
  lastAccessed: timestamp('last_accessed'),
  uniqueAccessors: jsonb('unique_accessors').default('[]'), // IPs or user IDs
  
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  shareIdIdx: index('document_shares_id_idx').on(table.shareId),
  documentIdx: index('document_shares_document_idx').on(table.documentId),
  sharedByIdx: index('document_shares_shared_by_idx').on(table.sharedBy),
  shareTypeIdx: index('document_shares_type_idx').on(table.shareType),
  expiryIdx: index('document_shares_expiry_idx').on(table.expiryDate),
  activeIdx: index('document_shares_active_idx').on(table.isActive),
}));

// ==================== DOCUMENT COMMENTS ====================
export const documentComments = pgTable('document_comments', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  
  documentId: uuid('document_id').references(() => documents.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  
  // Comment content
  commentText: text('comment_text').notNull(),
  commentType: varchar('comment_type', { length: 20 }).default('general'), // general, review, approval, question
  
  // Threading and replies
  parentCommentId: uuid('parent_comment_id'), // Self-referencing for replies
  threadId: uuid('thread_id'), // Groups related comments
  
  // Page/location reference (for PDFs, images)
  pageNumber: integer('page_number'),
  xPosition: decimal('x_position', { precision: 8, scale: 4 }),
  yPosition: decimal('y_position', { precision: 8, scale: 4 }),
  
  // Status and resolution
  status: varchar('status', { length: 20 }).default('open'), // open, resolved, dismissed
  resolvedBy: uuid('resolved_by').references(() => users.id),
  resolvedDate: timestamp('resolved_date'),
  resolution: text('resolution'),
  
  // Attachments and references
  attachments: jsonb('attachments').default('[]'),
  mentions: jsonb('mentions').default('[]'), // User IDs mentioned in comment
  
  // Metadata
  isPrivate: boolean('is_private').default(false),
  priority: varchar('priority', { length: 20 }).default('normal'), // low, normal, high, urgent
  
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  documentIdx: index('document_comments_document_idx').on(table.documentId),
  userIdx: index('document_comments_user_idx').on(table.userId),
  parentCommentIdx: index('document_comments_parent_idx').on(table.parentCommentId),
  threadIdx: index('document_comments_thread_idx').on(table.threadId),
  statusIdx: index('document_comments_status_idx').on(table.status),
  createdAtIdx: index('document_comments_created_idx').on(table.createdAt),
}));

// Add self-reference constraint
// documentComments.parentCommentId.references(() => documentComments.id);

// ==================== DOCUMENT WORKFLOWS ====================
export const documentWorkflows = pgTable('document_workflows', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar('workflow_id', { length: 50 }).notNull().unique(),
  
  documentId: uuid('document_id').references(() => documents.id).notNull(),
  
  // Workflow definition
  workflowName: varchar('workflow_name', { length: 255 }).notNull(),
  workflowType: varchar('workflow_type', { length: 50 }).notNull(), // approval, review, signature, validation
  
  // Current state
  currentStep: integer('current_step').default(1),
  totalSteps: integer('total_steps').notNull(),
  status: varchar('status', { length: 20 }).default('pending'), // pending, in_progress, completed, cancelled, rejected
  
  // Step configuration
  steps: jsonb('steps').notNull(), // Array of step definitions
  stepHistory: jsonb('step_history').default('[]'), // History of completed steps
  
  // Assignment and routing
  currentAssignees: jsonb('current_assignees').default('[]'), // Current step assignees
  allParticipants: jsonb('all_participants').default('[]'), // All workflow participants
  
  // Timing
  dueDate: timestamp('due_date'),
  startedDate: timestamp('started_date'),
  completedDate: timestamp('completed_date'),
  
  // Configuration
  isParallel: boolean('is_parallel').default(false), // Parallel vs sequential processing
  requiresAllApprovals: boolean('requires_all_approvals').default(true),
  allowDelegation: boolean('allow_delegation').default(false),
  
  // Notifications
  notificationSettings: jsonb('notification_settings').default('{}'),
  reminderSettings: jsonb('reminder_settings').default('{}'),
  
  // Results and outcome
  finalDecision: varchar('final_decision', { length: 20 }), // approved, rejected, cancelled
  outcomeNotes: text('outcome_notes'),
  completionPercentage: integer('completion_percentage').default(0),
  
  metadata: jsonb('metadata').default('{}'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  workflowIdIdx: index('document_workflows_id_idx').on(table.workflowId),
  documentIdx: index('document_workflows_document_idx').on(table.documentId),
  statusIdx: index('document_workflows_status_idx').on(table.status),
  currentStepIdx: index('document_workflows_step_idx').on(table.currentStep),
  dueDateIdx: index('document_workflows_due_date_idx').on(table.dueDate),
}));

// Export all document management tables
export const documentTables = {
  documentFolders,
  documents,
  documentAccessLogs,
  documentShares,
  documentComments,
  documentWorkflows,
};