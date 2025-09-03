/**
 * Client Neon Service - API-based Architecture
 * Routes all database operations through API endpoints
 */

import { clientApi } from '../api/clientApi';

export const clientNeonService = {
  // Query operations
  getAll: clientApi.getAll,
  getById: clientApi.getById,
  getActiveClients: clientApi.getActiveClients,
  getClientSummary: clientApi.getClientSummary,
  
  // Mutation operations
  create: clientApi.create,
  update: clientApi.update,
  delete: clientApi.delete
};