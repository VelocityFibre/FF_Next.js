/**
 * Shared Types and Enums for Neon Database Schema
 * Common elements used across multiple domain schemas
 */

import { pgTable, serial, text, varchar, integer, decimal, timestamp, boolean, json, uuid, index, unique } from 'drizzle-orm/pg-core';

// Re-export drizzle types for convenience
export {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  decimal,
  timestamp,
  boolean,
  json,
  uuid,
  index,
  unique
};

// Common field definitions
export const commonFields = {
  id: serial('id').primaryKey(),
  uuid: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
  createdBy: varchar('created_by', { length: 255 }),
  updatedBy: varchar('updated_by', { length: 255 }),
};

// Common currency field
export const currencyField = varchar('currency', { length: 3 }).default('ZAR');

// Common status values
export const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

// Document verification status
export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

// Common RAG ratings
export const RAG_RATING = {
  RED: 'red',
  AMBER: 'amber',
  GREEN: 'green',
} as const;

// Assignment types
export const ASSIGNMENT_TYPE = {
  PRIMARY: 'primary',
  SUBCONTRACTOR: 'subcontractor',
  CONSULTANT: 'consultant',
  SPECIALIST: 'specialist',
} as const;

// Export type helpers
export type Status = typeof STATUS[keyof typeof STATUS];
export type VerificationStatus = typeof VERIFICATION_STATUS[keyof typeof VERIFICATION_STATUS];
export type RAGRating = typeof RAG_RATING[keyof typeof RAG_RATING];
export type AssignmentType = typeof ASSIGNMENT_TYPE[keyof typeof ASSIGNMENT_TYPE];