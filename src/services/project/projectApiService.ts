/**
 * Project API Service
 * Uses API routes instead of direct database access for security
 */

const API_BASE = '/api';

interface Project {
  id?: string;
  project_name: string;
  client_id?: string;
  project_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  description?: string;
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

export const projectApiService = {
  async getAll(): Promise<Project[]> {
    const response = await fetch(`${API_BASE}/projects`);
    return handleResponse<Project[]>(response);
  },

  async getById(id: string): Promise<Project | null> {
    const response = await fetch(`${API_BASE}/projects?id=${id}`);
    return handleResponse<Project | null>(response);
  },

  async create(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    return handleResponse<Project>(response);
  },

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const response = await fetch(`${API_BASE}/projects?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse<Project>(response);
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/projects?id=${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  // Compatibility methods to match existing service interface
  async getActiveProjects(): Promise<Project[]> {
    const projects = await this.getAll();
    return projects.filter(p => p.status === 'active' || p.status === 'in_progress');
  },

  async getProjectsByClient(clientId: string): Promise<Project[]> {
    const projects = await this.getAll();
    return projects.filter(p => p.client_id === clientId);
  },

  async getProjectSummary(): Promise<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalBudget: number;
  }> {
    const projects = await this.getAll();
    
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0)
    };
  }
};