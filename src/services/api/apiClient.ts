/**
 * Universal API Client
 * Handles all API calls to prevent direct database access from browser
 */

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  const data = await response.json();
  return data.data || data;
}

// Generic API client for all entities
export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}/${endpoint}`);
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'DELETE'
    });
    return handleResponse<T>(response);
  }
};

// Service-specific API clients
export const clientsApi = {
  getAll: () => apiClient.get<any[]>('clients'),
  getById: (id: string) => apiClient.get<any>(`clients?id=${id}`),
  create: (data: any) => apiClient.post<any>('clients', data),
  update: (id: string, data: any) => apiClient.put<any>(`clients?id=${id}`, data),
  delete: (id: string) => apiClient.delete<any>(`clients?id=${id}`)
};

export const projectsApi = {
  getAll: () => apiClient.get<any[]>('projects'),
  getById: (id: string) => apiClient.get<any>(`projects?id=${id}`),
  create: (data: any) => apiClient.post<any>('projects', data),
  update: (id: string, data: any) => apiClient.put<any>(`projects?id=${id}`, data),
  delete: (id: string) => apiClient.delete<any>(`projects?id=${id}`)
};

export const staffApi = {
  getAll: () => apiClient.get<any[]>('staff'),
  getById: (id: string) => apiClient.get<any>(`staff?id=${id}`),
  create: (data: any) => apiClient.post<any>('staff', data),
  update: (id: string, data: any) => apiClient.put<any>(`staff?id=${id}`, data),
  delete: (id: string) => apiClient.delete<any>(`staff?id=${id}`)
};

export const queryApi = {
  query: (table: string, filters?: any, limit?: number) => 
    apiClient.post<any[]>('query', { table, filters, limit })
};