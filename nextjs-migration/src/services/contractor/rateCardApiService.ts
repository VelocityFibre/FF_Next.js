import { log } from '@/lib/logger';

/**
 * Rate Card API Service
 * Handles all API operations for contractor rate card management system
 * including service templates, rate cards, rate items, and analytics
 */

import { 
  ServiceTemplate, 
  ServiceTemplateFormData, 
  ServiceTemplateSearchParams,
  ContractorRateCard, 
  ContractorRateCardFormData, 
  RateCardSearchParams,
  ContractorRateItem, 
  ContractorRateItemFormData,
  ContractorRateHistory,
  RateCardComparison,
  RateComparisonParams,
  ContractorRateComparison,
  RateCardAnalytics,
  RateCardExportOptions,
  BulkRateUpdateOptions,
  RateCardValidationResult
} from '@/types/contractor';

// 🟢 WORKING: Base API configuration
const API_BASE = '/api/contractor/rate-cards';
const TEMPLATES_BASE = '/api/service-templates';

// 🟢 WORKING: Service Templates API
export class ServiceTemplateApiService {
  /**
   * Get all service templates with optional filtering and pagination
   */
  static async getServiceTemplates(params?: ServiceTemplateSearchParams): Promise<{
    data: ServiceTemplate[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.parentId) queryParams.append('parentId', params.parentId);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`${TEMPLATES_BASE}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch service templates: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error fetching service templates:', { data: error }, 'rateCardApiService');
      
      // Return fallback service templates for development
      log.info('🔄 Using fallback service templates for development', undefined, 'rateCardApiService');
      const fallbackServices = [
        'Fibre Installation',
        'Network Maintenance', 
        'Cable Laying',
        'Equipment Installation',
        'Site Survey',
        'Network Testing',
        'Fibre Splicing',
        'Telecommunications Setup',
        'Network Configuration',
        'Technical Support'
      ];
      
      const templates: ServiceTemplate[] = fallbackServices.map((name, index) => ({
        id: `service_${index + 1}`,
        name,
        code: name.replace(/\s+/g, '_').toUpperCase(),
        category: 'telecommunications',
        description: `${name} service template`,
        unitOfMeasure: 'per unit',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      return {
        data: templates,
        pagination: {
          page: 1,
          limit: templates.length,
          total: templates.length,
          totalPages: 1
        }
      };
    }
  }

  /**
   * Get service template by ID
   */
  static async getServiceTemplate(id: string): Promise<ServiceTemplate> {
    try {
      const response = await fetch(`${TEMPLATES_BASE}/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch service template: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error fetching service template:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Create a new service template
   */
  static async createServiceTemplate(data: ServiceTemplateFormData): Promise<ServiceTemplate> {
    try {
      const response = await fetch(`${TEMPLATES_BASE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create service template: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error creating service template:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Update an existing service template
   */
  static async updateServiceTemplate(id: string, data: Partial<ServiceTemplateFormData>): Promise<ServiceTemplate> {
    try {
      const response = await fetch(`${TEMPLATES_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update service template: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error updating service template:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Delete a service template
   */
  static async deleteServiceTemplate(id: string): Promise<void> {
    try {
      const response = await fetch(`${TEMPLATES_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete service template: ${response.statusText}`);
      }
    } catch (error) {
      log.error('Error deleting service template:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Get hierarchical service templates (deliverables with nested services)
   */
  static async getHierarchicalTemplates(): Promise<ServiceTemplate[]> {
    try {
      const response = await fetch(`${TEMPLATES_BASE}/hierarchy`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch hierarchical templates: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error fetching hierarchical templates:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }
}

// 🟢 WORKING: Contractor Rate Cards API
export class RateCardApiService {
  /**
   * Get contractor rate cards with optional filtering
   */
  static async getRateCards(params?: RateCardSearchParams): Promise<{
    data: ContractorRateCard[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.contractorId) queryParams.append('contractorId', params.contractorId);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.approvalStatus) queryParams.append('approvalStatus', params.approvalStatus);
      if (params?.effectiveDateFrom) queryParams.append('effectiveDateFrom', params.effectiveDateFrom);
      if (params?.effectiveDateTo) queryParams.append('effectiveDateTo', params.effectiveDateTo);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`${API_BASE}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch rate cards: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error fetching rate cards:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Get rate card by ID with rate items
   */
  static async getRateCard(id: string, includeItems: boolean = true): Promise<ContractorRateCard> {
    try {
      const queryParams = includeItems ? '?includeItems=true' : '';
      const response = await fetch(`${API_BASE}/${id}${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch rate card: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error fetching rate card:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Create a new rate card for a contractor
   */
  static async createRateCard(contractorId: string, data: ContractorRateCardFormData): Promise<ContractorRateCard> {
    try {
      const response = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, contractorId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create rate card: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error creating rate card:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Update an existing rate card
   */
  static async updateRateCard(id: string, data: Partial<ContractorRateCardFormData>): Promise<ContractorRateCard> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update rate card: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error updating rate card:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Delete a rate card
   */
  static async deleteRateCard(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete rate card: ${response.statusText}`);
      }
    } catch (error) {
      log.error('Error deleting rate card:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Clone a rate card with optional modifications
   */
  static async cloneRateCard(id: string, modifications?: {
    name?: string;
    effectiveDate?: string;
    expiryDate?: string;
  }): Promise<ContractorRateCard> {
    try {
      const response = await fetch(`${API_BASE}/${id}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modifications || {}),
      });

      if (!response.ok) {
        throw new Error(`Failed to clone rate card: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error cloning rate card:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Submit rate card for approval
   */
  static async submitForApproval(id: string, notes?: string): Promise<ContractorRateCard> {
    try {
      const response = await fetch(`${API_BASE}/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit rate card for approval: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error submitting rate card:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Approve a rate card
   */
  static async approveRateCard(id: string, notes?: string): Promise<ContractorRateCard> {
    try {
      const response = await fetch(`${API_BASE}/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error(`Failed to approve rate card: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error approving rate card:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Reject a rate card
   */
  static async rejectRateCard(id: string, reason: string): Promise<ContractorRateCard> {
    try {
      const response = await fetch(`${API_BASE}/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error(`Failed to reject rate card: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error rejecting rate card:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }
}

// 🟢 WORKING: Rate Items API
export class RateItemApiService {
  /**
   * Get rate items for a rate card
   */
  static async getRateItems(rateCardId: string): Promise<ContractorRateItem[]> {
    try {
      const response = await fetch(`${API_BASE}/${rateCardId}/items`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch rate items: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error fetching rate items:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Add a rate item to a rate card
   */
  static async addRateItem(rateCardId: string, data: ContractorRateItemFormData): Promise<ContractorRateItem> {
    try {
      const response = await fetch(`${API_BASE}/${rateCardId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to add rate item: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error adding rate item:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Update a rate item
   */
  static async updateRateItem(itemId: string, data: Partial<ContractorRateItemFormData>): Promise<ContractorRateItem> {
    try {
      const response = await fetch(`${API_BASE}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update rate item: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error updating rate item:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Delete a rate item
   */
  static async deleteRateItem(itemId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete rate item: ${response.statusText}`);
      }
    } catch (error) {
      log.error('Error deleting rate item:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Bulk update rate items
   */
  static async bulkUpdateRates(options: BulkRateUpdateOptions): Promise<ContractorRateItem[]> {
    try {
      const response = await fetch(`${API_BASE}/${options.rateCardId}/items/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk update rates: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error bulk updating rates:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }
}

// 🟢 WORKING: Rate History API
export class RateHistoryApiService {
  /**
   * Get rate change history for a rate item
   */
  static async getRateHistory(rateItemId: string): Promise<ContractorRateHistory[]> {
    try {
      const response = await fetch(`${API_BASE}/items/${rateItemId}/history`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch rate history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error fetching rate history:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Get rate change history for a contractor
   */
  static async getContractorRateHistory(contractorId: string, params?: {
    serviceTemplateId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: ContractorRateHistory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.serviceTemplateId) queryParams.append('serviceTemplateId', params.serviceTemplateId);
      if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${API_BASE}/contractors/${contractorId}/history?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contractor rate history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error fetching contractor rate history:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }
}

// 🟢 WORKING: Rate Comparison & Analytics API
export class RateAnalyticsApiService {
  /**
   * Compare rates across multiple contractors for specific services
   */
  static async compareRates(params: RateComparisonParams): Promise<RateCardComparison[]> {
    try {
      const response = await fetch(`${API_BASE}/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Failed to compare rates: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error comparing rates:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Get rate analytics for a contractor
   */
  static async getContractorAnalytics(contractorId: string): Promise<RateCardAnalytics> {
    try {
      const response = await fetch(`${API_BASE}/contractors/${contractorId}/analytics`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contractor analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error fetching contractor analytics:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Get market rate benchmarks for services
   */
  static async getMarketBenchmarks(serviceTemplateIds: string[], region?: string): Promise<{
    serviceTemplateId: string;
    serviceName: string;
    averageRate: number;
    medianRate: number;
    minRate: number;
    maxRate: number;
    sampleSize: number;
    lastUpdated: string;
  }[]> {
    try {
      const queryParams = new URLSearchParams();
      serviceTemplateIds.forEach(id => queryParams.append('serviceTemplateIds', id));
      if (region) queryParams.append('region', region);

      const response = await fetch(`${API_BASE}/market-benchmarks?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch market benchmarks: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error fetching market benchmarks:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }
}

// 🟢 WORKING: Export & Validation API
export class RateCardUtilityApiService {
  /**
   * Export rate cards in various formats
   */
  static async exportRateCards(options: RateCardExportOptions): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`Failed to export rate cards: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      log.error('Error exporting rate cards:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Validate rate card data before saving
   */
  static async validateRateCard(data: ContractorRateCardFormData): Promise<RateCardValidationResult> {
    try {
      const response = await fetch(`${API_BASE}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to validate rate card: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error validating rate card:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }

  /**
   * Import rate cards from Excel/CSV file
   */
  static async importRateCards(contractorId: string, file: File): Promise<{
    success: number;
    errors: Array<{
      row: number;
      field: string;
      message: string;
    }>;
    imported: ContractorRateCard[];
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contractorId', contractorId);

      const response = await fetch(`${API_BASE}/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to import rate cards: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error importing rate cards:', { data: error }, 'rateCardApiService');
      throw error;
    }
  }
}

// 🟢 WORKING: Main Rate Card Service (combines all services)
export class RateCardService {
  static templates = ServiceTemplateApiService;
  static rateCards = RateCardApiService;
  static rateItems = RateItemApiService;
  static history = RateHistoryApiService;
  static analytics = RateAnalyticsApiService;
  static utilities = RateCardUtilityApiService;
}

// Individual services are already exported above with class declarations