import { apiClient } from './apiClient';
import type { 
  Contractor, 
  ContractorFormData,
  ContractorFilters,
  ContractorSearchCriteria,
  OnboardingStatus,
  OnboardingChecklist,
  ContractorDocument,
  DocumentData,
  RAGScoreData,
  ContractorTeam,
  ContractorAnalytics
} from '@/types/contractor.types';

export const contractorsApi = {
  // Contractor CRUD operations
  async getContractors(filters?: ContractorFilters) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.complianceStatus) params.append('complianceStatus', filters.complianceStatus);
    if (filters?.ragOverall) params.append('ragOverall', filters.ragOverall);
    if (filters?.teamId) params.append('teamId', filters.teamId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    
    const response = await apiClient.get(`/contractors?${params.toString()}`);
    return response.data;
  },

  async getContractor(id: string) {
    const response = await apiClient.get(`/contractors/${id}`);
    return response.data;
  },

  async createContractor(data: ContractorFormData) {
    const response = await apiClient.post('/contractors', data);
    return response.data;
  },

  async updateContractor(id: string, data: Partial<ContractorFormData>) {
    const response = await apiClient.put(`/contractors/${id}`, data);
    return response.data;
  },

  async deleteContractor(id: string, hard: boolean = false) {
    const params = hard ? '?hard=true' : '';
    const response = await apiClient.delete(`/contractors/${id}${params}`);
    return response.data;
  },

  async searchContractors(criteria: ContractorSearchCriteria) {
    const response = await apiClient.post('/contractors/search', criteria);
    return response.data;
  },

  // Onboarding operations
  async getOnboardingStatus(contractorId: string) {
    const response = await apiClient.get(`/contractors/onboarding?contractorId=${contractorId}`);
    return response.data;
  },

  async startOnboarding(contractorId: string, startedBy?: string) {
    const response = await apiClient.post('/contractors/onboarding', {
      contractorId,
      startedBy
    });
    return response.data;
  },

  async updateOnboardingStatus(id: string, status: OnboardingStatus) {
    const response = await apiClient.put(`/contractors/onboarding/${id}`, status);
    return response.data;
  },

  async getOnboardingDocuments(contractorId: string) {
    const response = await apiClient.get(`/contractors/onboarding/documents?contractorId=${contractorId}`);
    return response.data;
  },

  async uploadDocument(contractorId: string, docData: DocumentData) {
    const response = await apiClient.post('/contractors/onboarding/documents', {
      contractorId,
      ...docData
    });
    return response.data;
  },

  async getOnboardingChecklist(contractorId: string): Promise<OnboardingChecklist> {
    const response = await apiClient.get(`/contractors/onboarding/checklist?contractorId=${contractorId}`);
    return response.data;
  },

  async updateChecklistItem(contractorId: string, itemId: string, completed: boolean) {
    const response = await apiClient.put('/contractors/onboarding/checklist', {
      contractorId,
      itemId,
      isCompleted: completed
    });
    return response.data;
  },

  // RAG operations
  async getRAGScores(contractorId: string, includeHistory: boolean = false) {
    const params = includeHistory ? '&includeHistory=true' : '';
    const response = await apiClient.get(`/contractors/rag/scores?contractorId=${contractorId}${params}`);
    return response.data;
  },

  async updateRAGScore(contractorId: string, scoreData: RAGScoreData) {
    const response = await apiClient.post('/contractors/rag/scores', {
      contractorId,
      ...scoreData
    });
    return response.data;
  },

  async calculateRAGScore(contractorId: string, scoreTypes: string[] = ['all']) {
    const response = await apiClient.post('/contractors/rag/calculate', {
      contractorId,
      scoreTypes
    });
    return response.data;
  },

  // Team operations
  async getContractorTeams(contractorId: string): Promise<ContractorTeam[]> {
    const response = await apiClient.get(`/contractors/teams?contractorId=${contractorId}`);
    return response.data;
  },

  async assignToTeam(contractorId: string, teamId: string, assignedBy?: string) {
    const response = await apiClient.post('/contractors/teams', {
      contractorId,
      teamId,
      assignedBy
    });
    return response.data;
  },

  async removeFromTeam(contractorId: string, teamId: string) {
    const response = await apiClient.delete(`/contractors/teams?contractorId=${contractorId}&teamId=${teamId}`);
    return response.data;
  },

  // Analytics
  async getContractorAnalytics(contractorId?: string): Promise<ContractorAnalytics> {
    const params = contractorId ? `?contractorId=${contractorId}` : '';
    const response = await apiClient.get(`/contractors/analytics${params}`);
    return response.data;
  },

  async getOverallAnalytics(filters?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);
    
    const response = await apiClient.get(`/contractors/analytics?${params.toString()}`);
    return response.data;
  }
};

// Export helper functions for common operations
export const contractorHelpers = {
  isContractorActive: (contractor: Contractor) => {
    return contractor.isActive && contractor.status === 'active';
  },

  isOnboardingComplete: (contractor: Contractor) => {
    return contractor.status === 'active' && contractor.complianceStatus === 'compliant';
  },

  getRAGColorClass: (score: string) => {
    switch (score) {
      case 'green': return 'text-green-600 bg-green-100';
      case 'amber': return 'text-amber-600 bg-amber-100';
      case 'red': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  },

  getStatusBadgeClass: (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'onboarding': return 'text-blue-600 bg-blue-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
};