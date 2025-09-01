import { api } from '@/lib/api';
import { NeonPoleData, NeonDropData, NeonFibreData } from '@/services/sow/types';

export const sowApi = {
  /**
   * Initialize SOW tables for a project
   */
  async initializeTables(projectId: string) {
    const response = await fetch('/api/sow/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId }),
    });
    return response.json();
  },

  /**
   * Upload poles data
   */
  async uploadPoles(projectId: string, poles: NeonPoleData[]) {
    const response = await fetch('/api/sow/poles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, poles }),
    });
    return response.json();
  },

  /**
   * Get poles data
   */
  async getPoles(projectId: string) {
    const response = await fetch(`/api/sow/poles?projectId=${projectId}`);
    return response.json();
  },

  /**
   * Upload drops data
   */
  async uploadDrops(projectId: string, drops: NeonDropData[]) {
    const response = await fetch('/api/sow/drops', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, drops }),
    });
    return response.json();
  },

  /**
   * Get drops data
   */
  async getDrops(projectId: string) {
    const response = await fetch(`/api/sow/drops?projectId=${projectId}`);
    return response.json();
  },

  /**
   * Upload fibre data
   */
  async uploadFibre(projectId: string, fibres: NeonFibreData[]) {
    const response = await fetch('/api/sow/fibre', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, fibres }),
    });
    return response.json();
  },

  /**
   * Get fibre data
   */
  async getFibre(projectId: string) {
    const response = await fetch(`/api/sow/fibre?projectId=${projectId}`);
    return response.json();
  },

  /**
   * Get all SOW data for a project
   */
  async getProjectSOWData(projectId: string) {
    const response = await fetch(`/api/sow/project?projectId=${projectId}`);
    return response.json();
  },

  /**
   * Get SOW summary for projects
   */
  async getSOWSummary(projectIds?: string[]) {
    const params = projectIds ? `?projectIds=${projectIds.join(',')}` : '';
    const response = await fetch(`/api/sow/summary${params}`);
    return response.json();
  },

  /**
   * Check SOW service health
   */
  async checkHealth() {
    const response = await fetch('/api/sow/health');
    return response.json();
  },
};