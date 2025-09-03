/**
 * Client Neon Service - Modular Export
 * Entry point for all client Neon database operations
 */

// Export query functions
export {
  getAllClients,
  getClientById,
  getActiveClients,
  getClientSummary
} from './queries';

// Export mutation functions
export {
  createClient,
  updateClient,
  deleteClient
} from './mutations';

// Export utility functions
export {
  mapDbToClient,
  buildMetadata,
  extractPaymentTerms
} from './mappers';

// Import the functions we need for the service object
import { getAllClients, getClientById, getActiveClients, getClientSummary } from './queries';
import { createClient, updateClient, deleteClient } from './mutations';

// Main service object for backward compatibility
export const clientNeonService = {
  getAll: getAllClients,
  getById: getClientById,
  create: createClient,
  update: updateClient,
  delete: deleteClient,
  getActiveClients,
  getClientSummary
};