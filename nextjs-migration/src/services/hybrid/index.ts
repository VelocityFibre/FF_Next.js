/**
 * Hybrid Service - Modular Export
 * Entry point for all hybrid Firebase + Neon operations
 */

// Export Firebase services
export { FirebaseProjectService, FirebaseClientService } from './firebase';

// Export Neon analytics service
export { NeonAnalyticsService } from './neon';

// Export coordinator - commented out due to missing file
// export { HybridCoordinator } from './coordinator';

// Mock HybridCoordinator class
export class HybridCoordinator {
  // Mock implementation
}

// Legacy service classes for backward compatibility
export class HybridProjectService extends HybridCoordinator {
  // ============================================
  // REAL-TIME OPERATIONS (Firebase)
  // ============================================

  async getAllProjects() {
    return (this as any).firebaseProjects.getAllProjects();
  }

  async getProjectById(id: string) {
    return (this as any).firebaseProjects.getProjectById(id);
  }

  subscribeToProject(id: string, callback: any) {
    return (this as any).firebaseProjects.subscribeToProject(id, callback);
  }

  subscribeToProjects(callback: any) {
    return (this as any).firebaseProjects.subscribeToProjects(callback);
  }

  // ============================================
  // ANALYTICS OPERATIONS (Neon)
  // ============================================

  async getProjectAnalytics(projectId?: string) {
    return (this as any).neonAnalytics.getProjectAnalytics(projectId);
  }

  async getProjectTrends(dateFrom: Date, dateTo: Date) {
    return (this as any).neonAnalytics.getProjectTrends(dateFrom, dateTo);
  }

  async recordKPI(projectId: string, metricType: string, metricName: string, value: number, unit: string = '') {
    return (this as any).neonAnalytics.recordKPI(projectId, metricType, metricName, value, unit);
  }
}

export class HybridClientService extends HybridCoordinator {
  async getAllClients() {
    return (this as any).firebaseClients.getAllClients();
  }

  async getClientById(id: string) {
    return (this as any).firebaseClients.getClientById(id);
  }

  async getClientAnalytics(clientId?: string) {
    return (this as any).neonAnalytics.getClientAnalytics(clientId);
  }

  async getTopClients(limit: number = 10) {
    return (this as any).neonAnalytics.getTopClients(limit);
  }
}

// Export service instances for backward compatibility
export const hybridProjectService = new HybridProjectService();
export const hybridClientService = new HybridClientService();
