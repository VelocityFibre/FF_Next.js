/**
 * Client API Service
 * Uses API routes instead of direct database access for security
 */

const API_BASE = '/api';

interface Client {
  id?: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  const data = await response.json();
  return data.data || data;
}

export const clientApiService = {
  async getAll(): Promise<Client[]> {
    const response = await fetch(`${API_BASE}/clients`);
    return handleResponse<Client[]>(response);
  },

  async getById(id: string): Promise<Client | null> {
    const response = await fetch(`${API_BASE}/clients?id=${id}`);
    return handleResponse<Client | null>(response);
  },

  async create(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const response = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData)
    });
    return handleResponse<Client>(response);
  },

  async update(id: string, updates: Partial<Client>): Promise<Client> {
    const response = await fetch(`${API_BASE}/clients?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse<Client>(response);
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/clients?id=${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  // Compatibility methods to match existing service interface
  async getActiveClients(): Promise<Client[]> {
    const clients = await this.getAll();
    return clients.filter(c => c.status === 'active');
  },

  async getClientSummary(): Promise<{
    totalClients: number;
    activeClients: number;
    newThisMonth: number;
  }> {
    const clients = await this.getAll();
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const newThisMonth = clients.filter(c => {
      if (!c.created_at) return false;
      const created = new Date(c.created_at);
      return created.getMonth() === thisMonth && created.getFullYear() === thisYear;
    }).length;

    return {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.status === 'active').length,
      newThisMonth
    };
  }
};