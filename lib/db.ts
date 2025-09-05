import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, timestamp, jsonb, integer, boolean, varchar } from 'drizzle-orm/pg-core';
import { eq, desc, and, sql } from 'drizzle-orm';

// Initialize Neon client with connection pooling
const connectionString = process.env.DATABASE_URL!;
const neonClient = neon(connectionString);

// Initialize Drizzle ORM with Neon - fix type issue
export const db = drizzle(neonClient as any);

// Schema definitions - adjust based on your existing schema
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('pending'),
  clientId: integer('client_id'),
  contractorId: integer('contractor_id'),
  sowData: jsonb('sow_data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: text('created_by'), // Clerk user ID
});

export const sowImports = pgTable('sow_imports', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id),
  fileName: text('file_name').notNull(),
  importType: varchar('import_type', { length: 50 }).notNull(), // 'poles', 'drops', 'fibre'
  status: varchar('status', { length: 50 }).default('pending'),
  data: jsonb('data').notNull(),
  processedRecords: integer('processed_records').default(0),
  totalRecords: integer('total_records').default(0),
  errors: jsonb('errors'),
  importedAt: timestamp('imported_at').defaultNow(),
  importedBy: text('imported_by'), // Clerk user ID
});

export const contractors = pgTable('contractors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  company: text('company'),
  active: boolean('active').default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique(),
  company: text('company'),
  active: boolean('active').default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Type exports for TypeScript
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type SOWImport = typeof sowImports.$inferSelect;
export type NewSOWImport = typeof sowImports.$inferInsert;
export type Contractor = typeof contractors.$inferSelect;
export type Client = typeof clients.$inferSelect;

// Helper function for safe database queries with error handling
export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  errorMessage = 'Database query failed'
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await queryFn();
    return { data };
  } catch (error) {
    console.error(errorMessage, error);
    return { error: error instanceof Error ? error.message : errorMessage };
  }
}