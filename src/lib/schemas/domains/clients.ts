/**
 * Client domain schemas
 * Defines validation schemas for all client-related API operations
 */

import { z } from 'zod';
import {
  IdSchema,
  EmailSchema,
  PhoneSchema,
  AddressSchema,
  AuditFieldsSchema,
  PaginationParamsSchema,
  MoneySchema,
} from '../common';

// ============================================================================
// Client Core Schemas
// ============================================================================

export const ClientTypeSchema = z.enum([
  'individual',
  'company',
  'government',
  'non_profit',
  'partnership',
]);

export const ClientStatusSchema = z.enum([
  'active',
  'inactive',
  'prospect',
  'suspended',
  'archived',
]);

export const ClientTierSchema = z.enum([
  'bronze',
  'silver',
  'gold',
  'platinum',
  'enterprise',
]);

export const IndustrySchema = z.enum([
  'telecommunications',
  'technology',
  'finance',
  'healthcare',
  'education',
  'government',
  'manufacturing',
  'retail',
  'construction',
  'other',
]);

export const ClientSchema = z.object({
  id: IdSchema,
  clientCode: z.string().min(1).max(50),
  
  // Basic Information
  name: z.string().min(1).max(255),
  type: ClientTypeSchema,
  status: ClientStatusSchema,
  tier: ClientTierSchema.optional(),
  
  // Company Details (for non-individual clients)
  companyDetails: z.object({
    legalName: z.string().max(255).optional(),
    registrationNumber: z.string().optional(),
    taxId: z.string().optional(),
    industry: IndustrySchema.optional(),
    employeeCount: z.number().min(0).optional(),
    annualRevenue: MoneySchema.optional(),
    website: z.string().url().optional(),
    foundedDate: z.string().datetime().or(z.date()).optional(),
  }).optional(),
  
  // Contact Information
  primaryContact: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    title: z.string().optional(),
    email: EmailSchema,
    phone: PhoneSchema,
    alternatePhone: PhoneSchema.optional(),
  }),
  
  additionalContacts: z.array(z.object({
    id: IdSchema.optional(),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    title: z.string().optional(),
    email: EmailSchema,
    phone: PhoneSchema,
    role: z.string().optional(),
    isPrimary: z.boolean().default(false),
  })).optional(),
  
  // Addresses
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema.optional(),
  
  // Financial Information
  creditLimit: MoneySchema.optional(),
  paymentTerms: z.enum(['net_7', 'net_15', 'net_30', 'net_45', 'net_60', 'immediate', 'custom']).optional(),
  customPaymentTerms: z.string().optional(),
  currency: z.string().length(3).default('ZAR'),
  taxExempt: z.boolean().default(false),
  taxExemptId: z.string().optional(),
  
  // Relationship Management
  accountManagerId: IdSchema.optional(),
  salesRepId: IdSchema.optional(),
  supportRepId: IdSchema.optional(),
  
  // Dates
  contractStartDate: z.string().datetime().or(z.date()).optional(),
  contractEndDate: z.string().datetime().or(z.date()).optional(),
  lastContactDate: z.string().datetime().or(z.date()).optional(),
  nextReviewDate: z.string().datetime().or(z.date()).optional(),
  
  // Additional Information
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  preferences: z.object({
    communicationChannel: z.enum(['email', 'phone', 'sms', 'whatsapp']).optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
  customFields: z.record(z.any()).optional(),
}).merge(AuditFieldsSchema);

// ============================================================================
// Client Creation/Update Schemas
// ============================================================================

export const CreateClientSchema = ClientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateClientSchema = CreateClientSchema.partial();

// ============================================================================
// Client Query Schemas
// ============================================================================

export const ClientQuerySchema = PaginationParamsSchema.extend({
  search: z.string().optional(),
  type: z.union([ClientTypeSchema, z.array(ClientTypeSchema)]).optional(),
  status: z.union([ClientStatusSchema, z.array(ClientStatusSchema)]).optional(),
  tier: z.union([ClientTierSchema, z.array(ClientTierSchema)]).optional(),
  industry: z.union([IndustrySchema, z.array(IndustrySchema)]).optional(),
  accountManagerId: IdSchema.optional(),
  salesRepId: IdSchema.optional(),
  minCreditLimit: z.number().optional(),
  maxCreditLimit: z.number().optional(),
  contractExpiringDays: z.number().optional(), // Clients with contracts expiring in X days
  tags: z.union([z.string(), z.array(z.string())]).optional(),
});

export const ClientParamsSchema = z.object({
  id: IdSchema,
});

// ============================================================================
// Client Statistics Schemas
// ============================================================================

export const ClientStatsSchema = z.object({
  totalClients: z.number(),
  activeClients: z.number(),
  newClientsThisMonth: z.number(),
  clientsByType: z.record(ClientTypeSchema, z.number()),
  clientsByTier: z.record(ClientTierSchema, z.number()),
  clientsByIndustry: z.record(IndustrySchema, z.number()),
  totalRevenue: MoneySchema,
  averageClientValue: MoneySchema,
  clientRetentionRate: z.number(), // percentage
  expiringContracts: z.array(z.object({
    clientId: IdSchema,
    clientName: z.string(),
    contractEndDate: z.string().datetime(),
    daysUntilExpiry: z.number(),
  })),
  topClients: z.array(z.object({
    clientId: IdSchema,
    clientName: z.string(),
    totalRevenue: MoneySchema,
    projectCount: z.number(),
  })),
});

// ============================================================================
// Client Summary Schema
// ============================================================================

export const ClientSummarySchema = z.object({
  clientId: IdSchema,
  overview: z.object({
    totalProjects: z.number(),
    activeProjects: z.number(),
    completedProjects: z.number(),
    totalRevenue: MoneySchema,
    outstandingBalance: MoneySchema,
    lastPaymentDate: z.string().datetime().optional(),
  }),
  projects: z.array(z.object({
    id: IdSchema,
    name: z.string(),
    status: z.string(),
    progress: z.number(),
    value: MoneySchema,
  })),
  invoices: z.array(z.object({
    id: IdSchema,
    invoiceNumber: z.string(),
    amount: MoneySchema,
    status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
    dueDate: z.string().datetime(),
  })).optional(),
  activities: z.array(z.object({
    id: IdSchema,
    type: z.string(),
    description: z.string(),
    date: z.string().datetime(),
    userId: IdSchema.optional(),
  })).optional(),
});

// ============================================================================
// Client Import/Export Schemas
// ============================================================================

export const ClientImportSchema = z.object({
  clients: z.array(CreateClientSchema),
  options: z.object({
    skipDuplicates: z.boolean().default(false),
    updateExisting: z.boolean().default(false),
    validateEmails: z.boolean().default(true),
    generateClientCodes: z.boolean().default(false),
  }).optional(),
});

export const ClientExportQuerySchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx']).default('json'),
  fields: z.array(z.string()).optional(),
  includeFinancials: z.boolean().default(false),
  includeContacts: z.boolean().default(true),
}).merge(ClientQuerySchema);

// ============================================================================
// Client Communication Schemas
// ============================================================================

export const ClientCommunicationSchema = z.object({
  clientId: IdSchema,
  type: z.enum(['email', 'phone', 'meeting', 'note']),
  subject: z.string(),
  content: z.string(),
  contactId: IdSchema.optional(),
  date: z.string().datetime().or(z.date()),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    size: z.number(),
  })).optional(),
});

export const CreateClientCommunicationSchema = ClientCommunicationSchema.omit({
  date: true,
});

// ============================================================================
// Type Exports
// ============================================================================

export type Client = z.infer<typeof ClientSchema>;
export type CreateClient = z.infer<typeof CreateClientSchema>;
export type UpdateClient = z.infer<typeof UpdateClientSchema>;
export type ClientQuery = z.infer<typeof ClientQuerySchema>;
export type ClientParams = z.infer<typeof ClientParamsSchema>;
export type ClientStats = z.infer<typeof ClientStatsSchema>;
export type ClientSummary = z.infer<typeof ClientSummarySchema>;
export type ClientImport = z.infer<typeof ClientImportSchema>;
export type ClientExportQuery = z.infer<typeof ClientExportQuerySchema>;
export type ClientCommunication = z.infer<typeof ClientCommunicationSchema>;
export type CreateClientCommunication = z.infer<typeof CreateClientCommunicationSchema>;
export type ClientType = z.infer<typeof ClientTypeSchema>;
export type ClientStatus = z.infer<typeof ClientStatusSchema>;
export type ClientTier = z.infer<typeof ClientTierSchema>;
export type Industry = z.infer<typeof IndustrySchema>;