/**
 * Contractor API Service
 * Uses API routes instead of direct database access for security
 */

const API_BASE = '/api';

interface Contractor {
  id?: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  hourly_rate?: number;
  status?: string;
  rating?: number;
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

export const contractorApiService = {
  async getAll(): Promise<Contractor[]> {
    const response = await fetch(`${API_BASE}/contractors`);
    return handleResponse<Contractor[]>(response);
  },

  async getById(id: string): Promise<Contractor | null> {
    const response = await fetch(`${API_BASE}/contractors?id=${id}`);
    return handleResponse<Contractor | null>(response);
  },

  async create(contractorData: Omit<Contractor, 'id' | 'created_at' | 'updated_at'>): Promise<Contractor> {
    const response = await fetch(`${API_BASE}/contractors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contractorData)
    });
    return handleResponse<Contractor>(response);
  },

  async update(id: string, updates: Partial<Contractor>): Promise<Contractor> {
    const response = await fetch(`${API_BASE}/contractors?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse<Contractor>(response);
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/contractors?id=${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  // Compatibility methods to match existing service interface
  async getActiveContractors(): Promise<Contractor[]> {
    const contractors = await this.getAll();
    return contractors.filter(c => c.status === 'active');
  },

  async getContractorsBySpecialization(specialization: string): Promise<Contractor[]> {
    const contractors = await this.getAll();
    return contractors.filter(c => c.specialization === specialization);
  },

  async getTopRatedContractors(limit: number = 10): Promise<Contractor[]> {
    const contractors = await this.getAll();
    return contractors
      .filter(c => c.rating !== undefined)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  },

  async getContractorSummary(): Promise<{
    totalContractors: number;
    activeContractors: number;
    averageRating: number;
    averageHourlyRate: number;
  }> {
    const contractors = await this.getAll();
    const withRating = contractors.filter(c => c.rating !== undefined);
    const withRate = contractors.filter(c => c.hourly_rate !== undefined);
    
    return {
      totalContractors: contractors.length,
      activeContractors: contractors.filter(c => c.status === 'active').length,
      averageRating: withRating.length > 0
        ? withRating.reduce((sum, c) => sum + (c.rating || 0), 0) / withRating.length
        : 0,
      averageHourlyRate: withRate.length > 0
        ? withRate.reduce((sum, c) => sum + (c.hourly_rate || 0), 0) / withRate.length
        : 0
    };
  }
};