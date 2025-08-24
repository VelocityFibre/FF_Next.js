/**
 * Client Neon Service - Modular Architecture
 * Delegates to specific modules for cleaner separation of concerns
 */

import { ClientFormData } from '@/types/client.types';
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