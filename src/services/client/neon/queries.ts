import { sql } from '@/lib/neon';
import { Client, ClientFilter, ClientSummary } from '@/types/client.types';
import { mapDbToClient } from './mappers';

/**
 * Get all clients with optional filtering
 */
export async function getAllClients(filter?: ClientFilter): Promise<Client[]> {
  try {
    console.log('Fetching clients from Neon with filter:', filter);
    
    let result;
    
    // Base query - get all clients
    if (!filter || Object.keys(filter).length === 0) {
      result = await sql`
        SELECT * FROM clients
        ORDER BY name ASC
      `;
    }
    // Handle status filtering
    else if (filter.status?.length && filter.status.length > 0) {
      const statusValue = filter.status[0]; // Take first status for simplicity
      result = await sql`
        SELECT * FROM clients
        WHERE status = ${statusValue}
        ORDER BY name ASC
      `;
    }
    // Handle search term filtering
    else if (filter.searchTerm) {
      const searchPattern = `%${filter.searchTerm}%`;
      result = await sql`
        SELECT * FROM clients
        WHERE name ILIKE ${searchPattern}
          OR contact_person ILIKE ${searchPattern}
          OR email ILIKE ${searchPattern}
          OR contact_email ILIKE ${searchPattern}
        ORDER BY name ASC
      `;
    }
    // Default: return all clients
    else {
      result = await sql`
        SELECT * FROM clients
        ORDER BY name ASC
      `;
    }
    
    console.log(`Found ${result.length} clients in Neon`);
    return result.map(mapDbToClient);
    
  } catch (error) {
    console.error('Error fetching clients from Neon:', error);
    return [];
  }
}

/**
 * Get a single client by ID
 */
export async function getClientById(id: string): Promise<Client | null> {
  try {
    const result = await sql`
      SELECT * FROM clients
      WHERE id = ${id}
      LIMIT 1
    `;
    
    if (!result || result.length === 0) {
      return null;
    }
    
    return mapDbToClient(result[0]);
  } catch (error) {
    console.error('Error fetching client by ID:', error);
    return null;
  }
}

/**
 * Get active clients for dropdowns
 */
export async function getActiveClients(): Promise<Client[]> {
  try {
    const result = await sql`
      SELECT * FROM clients
      WHERE status = 'ACTIVE'
      ORDER BY name ASC
    `;
    
    return result.map(mapDbToClient);
  } catch (error) {
    console.error('Error fetching active clients:', error);
    return [];
  }
}

/**
 * Get client summary statistics
 */
export async function getClientSummary(): Promise<ClientSummary> {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total_clients,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_clients,
        COUNT(CASE WHEN status = 'INACTIVE' THEN 1 END) as inactive_clients,
        COUNT(CASE WHEN metadata->>'priority' = 'HIGH' THEN 1 END) as high_priority,
        COUNT(CASE WHEN metadata->>'category' = 'PREMIUM' THEN 1 END) as premium_clients
      FROM clients
    `;
    
    return {
      totalClients: parseInt(result[0].total_clients),
      activeClients: parseInt(result[0].active_clients),
      inactiveClients: parseInt(result[0].inactive_clients),
      prospectClients: 0,
      totalProjectValue: 0,
      averageProjectValue: 0,
      topClientsByValue: [],
      clientsByCategory: {},
      clientsByStatus: {},
      clientsByPriority: {},
      monthlyGrowth: 0,
      conversionRate: 0
    };
  } catch (error) {
    console.error('Error fetching client summary:', error);
    return {
      totalClients: 0,
      activeClients: 0,
      inactiveClients: 0,
      prospectClients: 0,
      totalProjectValue: 0,
      averageProjectValue: 0,
      topClientsByValue: [],
      clientsByCategory: {},
      clientsByStatus: {},
      clientsByPriority: {},
      monthlyGrowth: 0,
      conversionRate: 0
    };
  }
}