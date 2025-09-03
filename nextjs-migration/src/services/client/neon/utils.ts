import { Client } from '@/types/client.types';

/**
 * Client Neon Database Utils
 * Helper utilities for database operations
 */

// Helper function to map database row to Client interface
export function mapDbToClient(dbClient: any): Client {
  return {
    id: dbClient.id,
    name: dbClient.name,
    contactPerson: dbClient.contact_person || dbClient.contact_email?.split('@')[0] || '',
    email: dbClient.email || dbClient.contact_email || '',
    phone: dbClient.phone || dbClient.contact_phone || '',
    alternativePhone: dbClient.metadata?.alternate_phone || '',
    website: dbClient.metadata?.website || '',
    industry: dbClient.type || 'Other',
    category: dbClient.metadata?.category || 'STANDARD',
    status: dbClient.status || 'ACTIVE',
    priority: dbClient.metadata?.priority || 'MEDIUM',
    accountManagerId: dbClient.metadata?.account_manager_id || '',
    accountManagerName: '',
    address: dbClient.address || '',
    city: dbClient.city || '',
    province: dbClient.state || '',
    postalCode: dbClient.postal_code || '',
    country: dbClient.country || 'South Africa',
    notes: dbClient.metadata?.notes || '',
    tags: dbClient.metadata?.tags || [],
    lastContactDate: dbClient.metadata?.last_contact_date,
    paymentTerms: dbClient.payment_terms ? `Net ${dbClient.payment_terms}` : 'Net 30',
    createdAt: dbClient.created_at,
    updatedAt: dbClient.updated_at,
    createdBy: dbClient.metadata?.created_by || '',
    lastModifiedBy: dbClient.metadata?.last_modified_by || '',
    // Required fields with defaults
    creditLimit: dbClient.metadata?.credit_limit || 0,
    currentBalance: dbClient.metadata?.current_balance || 0,
    creditRating: dbClient.metadata?.credit_rating || 'UNRATED',
    totalProjects: dbClient.metadata?.total_projects || 0,
    activeProjects: dbClient.metadata?.active_projects || 0,
    completedProjects: dbClient.metadata?.completed_projects || 0,
    totalProjectValue: dbClient.metadata?.total_project_value || 0,
    averageProjectValue: dbClient.metadata?.average_project_value || 0,
    preferredContactMethod: dbClient.metadata?.preferred_contact_method || 'EMAIL',
    communicationLanguage: dbClient.metadata?.communication_language || 'English',
    timezone: dbClient.metadata?.timezone || 'Africa/Johannesburg',
    serviceTypes: dbClient.metadata?.service_types || [],
    registrationNumber: dbClient.metadata?.registration_number || '',
    vatNumber: dbClient.metadata?.vat_number || ''
  } as unknown as Client;
}

// Helper to prepare metadata JSON for database operations
export function prepareClientMetadata(data: any): any {
  return {
    website: data.website,
    category: data.category || 'STANDARD',
    priority: data.priority || 'MEDIUM',
    account_manager_id: data.accountManagerId,
    notes: data.notes,
    tags: data.tags || [],
    contract_value: data.contractValue
  };
}

// Helper to build partial metadata updates
export function buildMetadataUpdate(data: any): any {
  const metadata = {} as any;
  
  if (data.website !== undefined) metadata.website = data.website;
  if (data.category !== undefined) metadata.category = data.category;
  if (data.priority !== undefined) metadata.priority = data.priority;
  if (data.accountManagerId !== undefined) metadata.account_manager_id = data.accountManagerId;
  if (data.notes !== undefined) metadata.notes = data.notes;
  if (data.tags !== undefined) metadata.tags = data.tags;
  if (data.contractValue !== undefined) metadata.contract_value = data.contractValue;
  
  return metadata;
}

// Helper to parse payment terms
export function parsePaymentTerms(paymentTerms: string | undefined): number {
  if (!paymentTerms) return 30;
  return paymentTerms ? parseInt(paymentTerms.replace('Net ', '')) : 30;
}