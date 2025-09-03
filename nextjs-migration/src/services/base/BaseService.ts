import { apiClient } from '../api/config';

/**
 * Base Service Class
 * Provides common functionality for all service classes
 */
export abstract class BaseService {
  protected apiPath: string;

  constructor(apiPath: string) {
    this.apiPath = apiPath;
  }

  /**
   * Make a GET request
   */
  protected async get<T>(endpoint: string = '', options?: RequestInit): Promise<T> {
    const path = this.buildPath(endpoint);
    return apiClient.get<T>(path, options);
  }

  /**
   * Make a POST request
   */
  protected async post<T>(endpoint: string = '', data?: any, options?: RequestInit): Promise<T> {
    const path = this.buildPath(endpoint);
    return apiClient.post<T>(path, data, options);
  }

  /**
   * Make a PUT request
   */
  protected async put<T>(endpoint: string = '', data?: any, options?: RequestInit): Promise<T> {
    const path = this.buildPath(endpoint);
    return apiClient.put<T>(path, data, options);
  }

  /**
   * Make a PATCH request
   */
  protected async patch<T>(endpoint: string = '', data?: any, options?: RequestInit): Promise<T> {
    const path = this.buildPath(endpoint);
    return apiClient.patch<T>(path, data, options);
  }

  /**
   * Make a DELETE request
   */
  protected async delete<T>(endpoint: string = '', options?: RequestInit): Promise<T> {
    const path = this.buildPath(endpoint);
    return apiClient.delete<T>(path, options);
  }

  /**
   * Build the full API path
   */
  private buildPath(endpoint: string): string {
    if (!endpoint) return this.apiPath;
    
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // Ensure apiPath doesn't end with slash
    const cleanBase = this.apiPath.endsWith('/') 
      ? this.apiPath.slice(0, -1) 
      : this.apiPath;
    
    return `${cleanBase}/${cleanEndpoint}`;
  }

  /**
   * Handle errors in a consistent way
   */
  protected handleError(error: any, context: string): never {
    console.error(`[${context}] Error:`, error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error(`An error occurred in ${context}`);
  }
}