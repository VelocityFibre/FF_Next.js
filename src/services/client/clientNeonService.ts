/**
 * Client Neon Service - Modular Architecture
 * Delegates to specific modules for cleaner separation of concerns
 */

// ClientFormData type available in client.types.ts if needed
import { 
  getAllClients, 
  getClientById, 
  getActiveClients, 
  getClientSummary 
} from './neon/queries';
import { 
  createClient, 
  updateClient, 
  deleteClient 
} from './neon/mutations';

export const clientNeonService = {
  // Query operations
  getAll: getAllClients,
  getById: getClientById,
  getActiveClients,
  getClientSummary,
  
  // Mutation operations
  create: createClient,
  update: updateClient,
  delete: deleteClient
};