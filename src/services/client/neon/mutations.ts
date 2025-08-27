import { sql } from '@/lib/neon';
import { ClientFormData } from '@/types/client.types';
import { buildMetadata, extractPaymentTerms } from './mappers';
import { log } from '@/lib/logger';

/**
 * Create a new client
 */
export async function createClient(data: ClientFormData): Promise<string> {
  try {
    // Prepare metadata JSON
    const metadata = {
      website: data.website,
      category: data.category || 'STANDARD',
      priority: data.priority || 'MEDIUM',
      account_manager_id: data.accountManagerId,
      notes: data.notes,
      tags: data.tags || [],
      contract_value: (data as any).contractValue
    };

    const result = await sql`
      INSERT INTO clients (
        name, 
        email, 
        phone, 
        address, 
        city, 
        state, 
        postal_code,
        country, 
        type, 
        status,
        contact_person, 
        contact_email, 
        contact_phone,
        metadata,
        payment_terms,
        created_at, 
        updated_at
      ) VALUES (
        ${data.name},
        ${data.email || null},
        ${data.phone || null},
        ${data.address || null},
        ${data.city || null},
        ${data.province || null},
        ${data.postalCode || null},
        ${data.country || 'South Africa'},
        ${data.industry || 'Other'},
        ${data.status || 'ACTIVE'},
        ${data.contactPerson || null},
        ${data.email || null},
        ${data.phone || null},
        ${JSON.stringify(metadata)},
        ${extractPaymentTerms(data.paymentTerms)},
        NOW(),
        NOW()
      )
      RETURNING id
    `;
    
    return result[0].id;
  } catch (error) {
    log.error('Error creating client:', { data: error }, 'mutations');
    throw error;
  }
}

/**
 * Update an existing client
 */
export async function updateClient(id: string, data: Partial<ClientFormData>): Promise<void> {
  try {
    // Build metadata update if needed
    const metadata = buildMetadata(data);

    await sql`
      UPDATE clients
      SET 
        name = COALESCE(${data.name}, name),
        email = COALESCE(${data.email}, email),
        phone = COALESCE(${data.phone}, phone),
        address = COALESCE(${data.address}, address),
        city = COALESCE(${data.city}, city),
        state = COALESCE(${data.province}, state),
        postal_code = COALESCE(${data.postalCode}, postal_code),
        country = COALESCE(${data.country}, country),
        type = COALESCE(${data.industry}, type),
        status = COALESCE(${data.status}, status),
        contact_person = COALESCE(${data.contactPerson}, contact_person),
        contact_email = COALESCE(${data.email}, contact_email),
        contact_phone = COALESCE(${data.phone}, contact_phone),
        metadata = COALESCE(${Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null}, metadata),
        payment_terms = COALESCE(${data.paymentTerms ? extractPaymentTerms(data.paymentTerms) : null}, payment_terms),
        updated_at = NOW()
      WHERE id = ${id}
    `;
  } catch (error) {
    log.error('Error updating client:', { data: error }, 'mutations');
    throw error;
  }
}

/**
 * Delete a client
 */
export async function deleteClient(id: string): Promise<void> {
  try {
    await sql`
      DELETE FROM clients
      WHERE id = ${id}
    `;
  } catch (error) {
    log.error('Error deleting client:', { data: error }, 'mutations');
    throw error;
  }
}