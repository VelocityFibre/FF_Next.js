/**
 * Hybrid Client Service - Combines Firebase + Neon operations
 */

import type { Client } from '@/types/client.types';
import * as realtimeOps from './client/realtime';
import * as analyticsOps from './client/analytics';

export class HybridClientService {
  // ============================================
  // REAL-TIME OPERATIONS (Firebase)
  // ============================================

  async getAllClients(): Promise<Client[]> {
    return realtimeOps.getAllClients();
  }

  async getClientById(id: string): Promise<Client | null> {
    return realtimeOps.getClientById(id);
  }

  async createClient(clientData: Omit<Client, 'id'>): Promise<string> {
    const clientId = await realtimeOps.createClient(clientData);

    // Sync to analytics (async)
    analyticsOps.syncClientToAnalytics(clientId, clientData).catch(() => {
      // Silent fail for analytics sync
    });

    return clientId;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<void> {
    await realtimeOps.updateClient(id, updates);

    // Sync updates to analytics
    const updatedClient = await this.getClientById(id);
    if (updatedClient) {
      analyticsOps.syncClientToAnalytics(id, updatedClient).catch(() => {
        // Silent fail for analytics sync
      });
    }
  }

  // ============================================
  // ANALYTICS OPERATIONS (Neon)
  // ============================================

  async getClientAnalytics(clientId?: string) {
    return analyticsOps.getClientAnalytics(clientId);
  }

  async getTopClients(limit: number = 10) {
    return analyticsOps.getTopClients(limit);
  }
}