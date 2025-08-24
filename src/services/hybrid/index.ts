/**
 * Hybrid Service - Modular Export
 * Entry point for all hybrid Firebase + Neon operations
 */

// Export Firebase services
export { FirebaseProjectService, FirebaseClientService } from './firebase';

// Export Neon analytics service
export { NeonAnalyticsService } from './neon';

// Export coordinator
export { HybridCoordinator } from './coordinator';

// Legacy service classes for backward compatibility
export class HybridProjectService extends HybridCoordinator {
  // ============================================
  // REAL-TIME OPERATIONS (Firebase)
  // ============================================

  async getAllProjects() {
    return this['firebaseProjects'].getAllProjects();
  }

  async getProjectById(id: string) {
    return this['firebaseProjects'].getProjectById(id);
  }

  subscribeToProject(id: string, callback: any) {
    return this['firebaseProjects'].subscribeToProject(id, callback);
  }

  subscribeToProjects(callback: any) {
    return this['firebaseProjects'].subscribeToProjects(callback);
  }

  // ============================================
  // ANALYTICS OPERATIONS (Neon)
  // ============================================

  async getProjectAnalytics(projectId?: string) {
    return this['neonAnalytics'].getProjectAnalytics(projectId);
  }

  async getProjectTrends(dateFrom: Date, dateTo: Date) {
    return this['neonAnalytics'].getProjectTrends(dateFrom, dateTo);
  }

  async recordKPI(projectId: string, metricType: string, metricName: string, value: number, unit: string = '') {
    return this['neonAnalytics'].recordKPI(projectId, metricType, metricName, value, unit);
  }
}

export class HybridClientService extends HybridCoordinator {
  async getAllClients() {
    return this['firebaseClients'].getAllClients();
  }

  async getClientById(id: string) {
    return this['firebaseClients'].getClientById(id);
  }

  async getClientAnalytics(clientId?: string) {
    return this['neonAnalytics'].getClientAnalytics(clientId);
  }

  async getTopClients(limit: number = 10) {
    return this['neonAnalytics'].getTopClients(limit);
  }
}

// Export service instances for backward compatibility
export const hybridProjectService = new HybridProjectService();
export const hybridClientService = new HybridClientService();