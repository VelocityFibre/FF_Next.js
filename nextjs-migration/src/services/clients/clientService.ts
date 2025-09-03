import { BaseService } from '../base/BaseService';

export interface Client {
  id: string;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ClientFormData {
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  status?: 'active' | 'inactive' | 'suspended';
  notes?: string;
}

export interface ClientApiResponse<T = Client> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ClientListResponse {
  success: boolean;
  data?: Client[];
  total?: number;
  error?: string;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  totalProjects: number;
  totalRevenue: number;
}

/**
 * Client Service for Next.js
 * Handles all client-related API operations
 */
export class ClientService extends BaseService {
  constructor() {
    super('clients');
  }

  /**
   * Get all clients
   */
  async getAllClients(): Promise<ClientListResponse> {
    try {
      return await this.get<ClientListResponse>('');
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch clients',
      };
    }
  }

  /**
   * Get active clients
   */
  async getActiveClients(): Promise<ClientListResponse> {
    try {
      return await this.get<ClientListResponse>('?status=active');
    } catch (error) {
      console.error('Failed to fetch active clients:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch active clients',
      };
    }
  }

  /**
   * Get a single client by ID
   */
  async getClientById(id: string): Promise<ClientApiResponse> {
    try {
      return await this.get<ClientApiResponse>(id);
    } catch (error) {
      console.error('Failed to fetch client:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch client',
      };
    }
  }

  /**
   * Create a new client
   */
  async createClient(data: ClientFormData): Promise<ClientApiResponse> {
    try {
      return await this.post<ClientApiResponse>('', {
        ...data,
        status: data.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to create client:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create client',
      };
    }
  }

  /**
   * Update a client
   */
  async updateClient(id: string, data: Partial<ClientFormData>): Promise<ClientApiResponse> {
    try {
      return await this.put<ClientApiResponse>(id, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to update client:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update client',
      };
    }
  }

  /**
   * Delete a client
   */
  async deleteClient(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.delete<{ success: boolean; error?: string }>(id);
    } catch (error) {
      console.error('Failed to delete client:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete client',
      };
    }
  }

  /**
   * Get client statistics
   */
  async getClientStats(): Promise<{ success: boolean; data?: ClientStats; error?: string }> {
    try {
      return await this.get<{ success: boolean; data?: ClientStats; error?: string }>('stats');
    } catch (error) {
      console.error('Failed to fetch client stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch client stats',
      };
    }
  }

  /**
   * Get client's projects
   */
  async getClientProjects(clientId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      return await this.get<{ success: boolean; data?: any[]; error?: string }>(`${clientId}/projects`);
    } catch (error) {
      console.error('Failed to fetch client projects:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch client projects',
      };
    }
  }

  /**
   * Get client's invoices
   */
  async getClientInvoices(clientId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      return await this.get<{ success: boolean; data?: any[]; error?: string }>(`${clientId}/invoices`);
    } catch (error) {
      console.error('Failed to fetch client invoices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch client invoices',
      };
    }
  }

  /**
   * Search clients
   */
  async searchClients(query: string): Promise<ClientListResponse> {
    try {
      return await this.get<ClientListResponse>(`search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Failed to search clients:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search clients',
      };
    }
  }

  /**
   * Validate client email is unique
   */
  async validateEmail(email: string, excludeId?: string): Promise<{ success: boolean; isUnique: boolean; error?: string }> {
    try {
      const params = excludeId ? `?excludeId=${excludeId}` : '';
      return await this.get<{ success: boolean; isUnique: boolean; error?: string }>(`validate/email/${encodeURIComponent(email)}${params}`);
    } catch (error) {
      console.error('Failed to validate email:', error);
      return {
        success: false,
        isUnique: false,
        error: error instanceof Error ? error.message : 'Failed to validate email',
      };
    }
  }

  /**
   * Validate client code is unique
   */
  async validateCode(code: string, excludeId?: string): Promise<{ success: boolean; isUnique: boolean; error?: string }> {
    try {
      const params = excludeId ? `?excludeId=${excludeId}` : '';
      return await this.get<{ success: boolean; isUnique: boolean; error?: string }>(`validate/code/${encodeURIComponent(code)}${params}`);
    } catch (error) {
      console.error('Failed to validate code:', error);
      return {
        success: false,
        isUnique: false,
        error: error instanceof Error ? error.message : 'Failed to validate code',
      };
    }
  }
}

// Export singleton instance
export const clientService = new ClientService();