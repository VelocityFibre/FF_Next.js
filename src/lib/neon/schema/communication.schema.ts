/**
 * Communication and Notification Database Schema
 * Tables for notifications, activities, and communication logs
 */

import {
  pgTable,
  text,
  varchar,
  timestamp,
  uuid,
  boolean,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users, projects, staff } from './core.schema';

// ==================== NOTIFICATIONS ====================
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  
  // Notification details
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // info, warning, error, success, reminder
  category: varchar('category', { length: 50 }), // task, project, system, deadline, achievement
  priority: varchar('priority', { length: 20 }).default('medium'), // low, medium, high, urgent
  
  // User targeting
  userId: uuid('user_id').references(() => users.id),
  isGlobal: boolean('is_global').default(false), // broadcast to all users
  targetRoles: jsonb('target_roles').default('[]'), // specific roles to target
  targetDepartments: jsonb('target_departments').default('[]'), // specific departments
  
  // Status tracking
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  isArchived: boolean('is_archived').default(false),
  archivedAt: timestamp('archived_at'),
  
  // Action and routing
  actionType: varchar('action_type', { length: 50 }), // navigate, external_link, modal, none
  actionUrl: text('action_url'), // URL to navigate to or link
  actionData: jsonb('action_data').default('{}'), // Additional action parameters
  
  // References
  relatedTable: varchar('related_table', { length: 50 }), // projects, tasks, staff, etc.
  relatedId: uuid('related_id'), // ID of related entity
  projectId: uuid('project_id').references(() => projects.id), // Associated project if applicable
  
  // Scheduling
  scheduledFor: timestamp('scheduled_for'), // For scheduled notifications
  expiresAt: timestamp('expires_at'), // Auto-archive date
  
  // Metadata
  metadata: jsonb('metadata').default('{}'),
  templateId: varchar('template_id', { length: 50 }), // Reference to notification template
  
  // Audit
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: index('notifications_user_idx').on(table.userId),
  typeIdx: index('notifications_type_idx').on(table.type),
  isReadIdx: index('notifications_read_idx').on(table.isRead),
  priorityIdx: index('notifications_priority_idx').on(table.priority),
  scheduledIdx: index('notifications_scheduled_idx').on(table.scheduledFor),
  projectIdx: index('notifications_project_idx').on(table.projectId),
  createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
}));

// ==================== NOTIFICATION TEMPLATES ====================
export const notificationTemplates = pgTable('notification_templates', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar('template_id', { length: 50 }).notNull().unique(),
  
  // Template details
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  priority: varchar('priority', { length: 20 }).default('medium'),
  
  // Template content
  titleTemplate: text('title_template').notNull(),
  messageTemplate: text('message_template').notNull(),
  actionType: varchar('action_type', { length: 50 }),
  actionUrlTemplate: text('action_url_template'),
  
  // Configuration
  isActive: boolean('is_active').default(true),
  canUserDisable: boolean('can_user_disable').default(true),
  autoArchiveHours: integer('auto_archive_hours'), // Hours until auto-archive
  
  // Targeting defaults
  defaultTargetRoles: jsonb('default_target_roles').default('[]'),
  defaultTargetDepartments: jsonb('default_target_departments').default('[]'),
  
  // Variables and placeholders
  variables: jsonb('variables').default('[]'), // Available template variables
  requiredVariables: jsonb('required_variables').default('[]'),
  
  // Metadata
  metadata: jsonb('metadata').default('{}'),
  
  // Audit
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  templateIdIdx: index('notification_templates_id_idx').on(table.templateId),
  categoryIdx: index('notification_templates_category_idx').on(table.category),
  isActiveIdx: index('notification_templates_active_idx').on(table.isActive),
}));

// ==================== ACTIVITIES ====================
export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  
  // Activity details
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  activityType: varchar('activity_type', { length: 50 }).notNull(), // user_action, system_event, milestone, achievement
  action: varchar('action', { length: 100 }).notNull(), // created, updated, deleted, completed, assigned, etc.
  
  // Actor information
  actorType: varchar('actor_type', { length: 20 }).notNull(), // user, system, api
  actorId: uuid('actor_id'), // User ID if user action
  actorName: varchar('actor_name', { length: 255 }), // Display name
  
  // Target information
  targetType: varchar('target_type', { length: 50 }), // project, task, user, document, etc.
  targetId: uuid('target_id'), // ID of the target entity
  targetName: varchar('target_name', { length: 255 }), // Display name of target
  
  // Context
  projectId: uuid('project_id').references(() => projects.id),
  teamId: uuid('team_id'), // Associated team if applicable
  workspaceId: uuid('workspace_id'), // Associated workspace
  
  // Change tracking
  changesBefore: jsonb('changes_before'), // State before change
  changesAfter: jsonb('changes_after'), // State after change
  changedFields: jsonb('changed_fields').default('[]'), // List of changed field names
  
  // Impact and visibility
  impactLevel: varchar('impact_level', { length: 20 }).default('low'), // low, medium, high
  isPublic: boolean('is_public').default(true), // Show in activity feeds
  isImportant: boolean('is_important').default(false), // Highlight in feeds
  
  // Technical details
  ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6
  userAgent: text('user_agent'),
  sessionId: varchar('session_id', { length: 255 }),
  requestId: varchar('request_id', { length: 255 }),
  
  // Metadata
  metadata: jsonb('metadata').default('{}'),
  tags: jsonb('tags').default('[]'),
  
  // Audit
  occurredAt: timestamp('occurred_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  actorIdx: index('activities_actor_idx').on(table.actorType, table.actorId),
  targetIdx: index('activities_target_idx').on(table.targetType, table.targetId),
  projectIdx: index('activities_project_idx').on(table.projectId),
  activityTypeIdx: index('activities_type_idx').on(table.activityType),
  actionIdx: index('activities_action_idx').on(table.action),
  occurredAtIdx: index('activities_occurred_at_idx').on(table.occurredAt),
  isPublicIdx: index('activities_public_idx').on(table.isPublic),
  isImportantIdx: index('activities_important_idx').on(table.isImportant),
}));

// ==================== COMMUNICATION LOGS ====================
export const communicationLogs = pgTable('communication_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  
  // Communication details
  type: varchar('type', { length: 20 }).notNull(), // email, sms, in_app, push, webhook
  direction: varchar('direction', { length: 20 }).notNull(), // inbound, outbound
  status: varchar('status', { length: 20 }).default('pending'), // pending, sent, delivered, failed, bounced
  
  // Sender information
  fromType: varchar('from_type', { length: 20 }), // user, system, external
  fromId: uuid('from_id'), // User ID if internal
  fromName: varchar('from_name', { length: 255 }),
  fromAddress: varchar('from_address', { length: 255 }), // email or phone number
  
  // Recipient information
  toType: varchar('to_type', { length: 20 }), // user, external, group
  toId: uuid('to_id'), // User ID if internal
  toName: varchar('to_name', { length: 255 }),
  toAddress: varchar('to_address', { length: 255 }), // email or phone number
  
  // Message content
  subject: varchar('subject', { length: 500 }),
  message: text('message').notNull(),
  messageFormat: varchar('message_format', { length: 20 }).default('text'), // text, html, markdown
  
  // Context and references
  projectId: uuid('project_id').references(() => projects.id),
  relatedTable: varchar('related_table', { length: 50 }),
  relatedId: uuid('related_id'),
  threadId: uuid('thread_id'), // For grouping related messages
  parentMessageId: uuid('parent_message_id'), // For replies
  
  // Delivery tracking
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),
  failedAt: timestamp('failed_at'),
  errorMessage: text('error_message'),
  attemptCount: integer('attempt_count').default(0),
  
  // Provider details
  provider: varchar('provider', { length: 50 }), // SendGrid, Twilio, Firebase, etc.
  externalId: varchar('external_id', { length: 255 }), // Provider's message ID
  providerId: varchar('provider_id', { length: 255 }), // Provider's tracking ID
  
  // Attachments and media
  attachments: jsonb('attachments').default('[]'),
  mediaUrls: jsonb('media_urls').default('[]'),
  
  // Priority and urgency
  priority: varchar('priority', { length: 20 }).default('normal'), // low, normal, high, urgent
  isUrgent: boolean('is_urgent').default(false),
  requiresAck: boolean('requires_ack').default(false), // Requires acknowledgment
  acknowledgedAt: timestamp('acknowledged_at'),
  acknowledgedBy: uuid('acknowledged_by'),
  
  // Automation and templates
  templateId: varchar('template_id', { length: 50 }),
  isAutomated: boolean('is_automated').default(false),
  triggerEvent: varchar('trigger_event', { length: 100 }),
  
  // Metadata
  metadata: jsonb('metadata').default('{}'),
  tags: jsonb('tags').default('[]'),
  
  // Audit
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  typeIdx: index('comm_logs_type_idx').on(table.type),
  statusIdx: index('comm_logs_status_idx').on(table.status),
  fromIdx: index('comm_logs_from_idx').on(table.fromType, table.fromId),
  toIdx: index('comm_logs_to_idx').on(table.toType, table.toId),
  projectIdx: index('comm_logs_project_idx').on(table.projectId),
  threadIdx: index('comm_logs_thread_idx').on(table.threadId),
  sentAtIdx: index('comm_logs_sent_at_idx').on(table.sentAt),
  createdAtIdx: index('comm_logs_created_at_idx').on(table.createdAt),
  priorityIdx: index('comm_logs_priority_idx').on(table.priority),
}));

// ==================== IN-APP MESSAGES ====================
export const inAppMessages = pgTable('in_app_messages', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  
  // Message details
  subject: varchar('subject', { length: 500 }),
  content: text('content').notNull(),
  messageType: varchar('message_type', { length: 50 }).default('direct'), // direct, broadcast, announcement
  priority: varchar('priority', { length: 20 }).default('normal'),
  
  // Participants
  fromUserId: uuid('from_user_id').references(() => users.id),
  toUserId: uuid('to_user_id').references(() => users.id),
  threadId: uuid('thread_id'), // For grouping conversation
  parentMessageId: uuid('parent_message_id'), // For replies
  
  // Status tracking
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  isArchived: boolean('is_archived').default(false),
  archivedAt: timestamp('archived_at'),
  
  // Context
  projectId: uuid('project_id').references(() => projects.id),
  relatedTable: varchar('related_table', { length: 50 }),
  relatedId: uuid('related_id'),
  
  // Attachments
  attachments: jsonb('attachments').default('[]'),
  
  // Metadata
  metadata: jsonb('metadata').default('{}'),
  
  // Audit
  sentAt: timestamp('sent_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  fromUserIdx: index('in_app_messages_from_idx').on(table.fromUserId),
  toUserIdx: index('in_app_messages_to_idx').on(table.toUserId),
  threadIdx: index('in_app_messages_thread_idx').on(table.threadId),
  isReadIdx: index('in_app_messages_read_idx').on(table.isRead),
  sentAtIdx: index('in_app_messages_sent_at_idx').on(table.sentAt),
  projectIdx: index('in_app_messages_project_idx').on(table.projectId),
}));

// Export all communication tables
export const communicationTables = {
  notifications,
  notificationTemplates,
  activities,
  communicationLogs,
  inAppMessages,
};