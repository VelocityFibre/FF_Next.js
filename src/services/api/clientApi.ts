/**
 * Client API Service
 * Uses Vercel API routes instead of direct database access
 */

const API_BASE = import.meta.env.DEV ? 'http://localhost:5173/api' : '/api';

export const clientApi = {
  async getAll() {
    const response = await fetch(`${API_BASE}/clients`);
    const data = await response.json();
    return data.data || [];
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE}/clients?id=${id}`);
    const data = await response.json();
    return data.data;
  },

  async create(clientData: any) {
    const response = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData)
    });
    const data = await response.json();
    return data.data;
  },

  async update(id: string, updates: any) {
    const response = await fetch(`${API_BASE}/clients?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await response.json();
    return data.data;
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE}/clients?id=${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return data;
  }
};