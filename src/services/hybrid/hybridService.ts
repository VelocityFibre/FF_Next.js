/**
 * Hybrid Service Layer - Firebase + Neon Integration
 * 
 * Firebase: Real-time operations, auth, file storage
 * Neon: Analytics, reporting, historical data
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { analyticsService } from '@/services/analytics/analyticsService';
import type { Project } from '@/types/project.types';
import type { Client } from '@/types/client.types';
// import type { NewProjectAnalytics, NewClientAnalytics } from '@/lib/neon/schema';

export class HybridProjectService {
  // ============================================
  // REAL-TIME OPERATIONS (Firebase)
  // ============================================

  /**
   * Get all projects (real-time)
   */
  async getAllProjects(): Promise<Project[]> {
    try {
      const snapshot = await getDocs(collection(db, 'projects'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get project by ID (real-time)
   */
  async getProjectById(id: string): Promise<Project | null> {
    try {
      const docRef = doc(db, 'projects', id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) return null;
      
      return { id: snapshot.id, ...snapshot.data() } as Project;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new project (Firebase + trigger analytics sync)
   */
  async createProject(projectData: Omit<Project, 'id'>): Promise<string> {
    try {
      // Save to Firebase (real-time operations)
      const docRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Trigger analytics sync to Neon (async)
      this.syncProjectToAnalytics(docRef.id, projectData).catch(() => {
        // Silent fail for analytics sync
      });

      return docRef.id;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update project (Firebase + sync to analytics)
   */
  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    try {
      const docRef = doc(db, 'projects', id);
      
      // Update in Firebase
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });

      // Get full project data and sync to analytics
      const updatedProject = await this.getProjectById(id);
      if (updatedProject) {
        this.syncProjectToAnalytics(id, updatedProject).catch(() => {
          // Silent fail for analytics sync
        });
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete project (Firebase + analytics)
   */
  async deleteProject(id: string): Promise<void> {
    try {
      // Delete from Firebase
      await deleteDoc(doc(db, 'projects', id));

      // Note: Keep analytics data for historical reporting
      // Could mark as deleted instead of actual deletion
    } catch (error) {
      throw error;
    }
  }

  /**
   * Subscribe to project changes (real-time)
   */
  subscribeToProject(id: string, callback: (project: Project | null) => void): () => void {
    const docRef = doc(db, 'projects', id);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as Project);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Subscribe to projects list (real-time)
   */
  subscribeToProjects(callback: (projects: Project[]) => void): () => void {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, orderBy('updatedAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
      callback(projects);
    });
  }

  // ============================================
  // ANALYTICS OPERATIONS (Neon)
  // ============================================

  /**
   * Get project analytics and trends
   */
  async getProjectAnalytics(projectId?: string) {
    try {
      return await analyticsService.getProjectOverview(projectId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get project trends over time
   */
  async getProjectTrends(dateFrom: Date, dateTo: Date) {
    try {
      return await analyticsService.getProjectTrends(dateFrom, dateTo);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Record KPI metric
   */
  async recordKPI(
    _projectId: string, 
    _metricType: string, 
    _metricName: string, 
    _value: number, 
    _unit: string = ''
  ): Promise<void> {
    try {
      // TODO: Implement KPI recording when analyticsService.recordKPI is ready
      // const kpiData = {
      //   projectId,
      //   metricType,
      //   metricName,
      //   metricValue: value.toString(),
      //   unit,
      //   recordedDate: new Date(),
      //   weekNumber: this.getWeekNumber(new Date()),
      //   monthNumber: new Date().getMonth() + 1,
      //   year: new Date().getFullYear(),
      // };
      // await analyticsService.recordKPI(kpiData);
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // SYNC FUNCTIONS (Private)
  // ============================================

  /**
   * Sync project data to analytics database
   */
  private async syncProjectToAnalytics(_projectId: string, _projectData: any): Promise<void> {
    try {
      // const _analyticsData: NewProjectAnalytics = {
      //   projectId,
      //   projectName: projectData.name || 'Untitled Project',
      //   clientId: projectData.clientId,
      //   clientName: projectData.clientName,
      //   totalBudget: projectData.budget?.toString(),
      //   spentBudget: '0', // Would be calculated from transactions
      //   startDate: projectData.startDate?.toDate ? projectData.startDate.toDate() : new Date(),
      //   endDate: projectData.endDate?.toDate ? projectData.endDate.toDate() : null,
      //   completionPercentage: (projectData.progress || 0).toString(),
      //   onTimeDelivery: false, // Would be calculated based on dates
      //   qualityScore: (projectData.qualityScore || 0).toString(),
      // };

      // This would insert/update the analytics record
      // TODO: Implement actual analytics sync
      
    } catch (error) {
      // Don't throw - sync failures shouldn't break main operations
    }
  }

  /**
   * Get week number of year
   */
  // private getWeekNumber(date: Date): number {
  //   const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  //   const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  //   return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  // }
}

export class HybridClientService {
  // ============================================
  // REAL-TIME OPERATIONS (Firebase)
  // ============================================

  async getAllClients(): Promise<Client[]> {
    try {
      const snapshot = await getDocs(collection(db, 'clients'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Client));
    } catch (error) {
      throw error;
    }
  }

  async getClientById(id: string): Promise<Client | null> {
    try {
      const docRef = doc(db, 'clients', id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) return null;
      
      return { id: snapshot.id, ...snapshot.data() } as Client;
    } catch (error) {
      throw error;
    }
  }

  async createClient(clientData: Omit<Client, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'clients'), {
        ...clientData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Sync to analytics
      this.syncClientToAnalytics(docRef.id, clientData).catch(() => {
        // Silent fail for analytics sync
      });

      return docRef.id;
    } catch (error) {
      throw error;
    }
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<void> {
    try {
      const docRef = doc(db, 'clients', id);
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });

      // Sync updates to analytics
      const updatedClient = await this.getClientById(id);
      if (updatedClient) {
        this.syncClientToAnalytics(id, updatedClient).catch(() => {
          // Silent fail for analytics sync
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // ANALYTICS OPERATIONS (Neon)
  // ============================================

  async getClientAnalytics(clientId?: string) {
    try {
      return await analyticsService.getClientAnalytics(clientId);
    } catch (error) {
      throw error;
    }
  }

  async getTopClients(limit: number = 10) {
    try {
      return await analyticsService.getTopClients(limit);
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // SYNC FUNCTIONS (Private)
  // ============================================

  private async syncClientToAnalytics(_clientId: string, _clientData: any): Promise<void> {
    try {
      // const _analyticsData: NewClientAnalytics = {
      //   clientId,
      //   clientName: clientData.name || 'Unknown Client',
      //   totalProjects: 0, // Would be calculated from projects
      //   activeProjects: 0, // Would be calculated from projects
      //   completedProjects: 0, // Would be calculated from projects
      //   totalRevenue: '0', // Would be calculated from transactions
      //   outstandingBalance: clientData.currentBalance?.toString() || '0',
      //   averageProjectValue: '0', // Would be calculated
      //   paymentScore: '100', // Default score
      //   clientCategory: clientData.category || 'Regular',
      //   lifetimeValue: '0', // Would be calculated
      // };

      // TODO: Implement actual client analytics sync
      
    } catch (error) {
      // Silent fail for analytics sync
    }
  }
}

// Export service instances
export const hybridProjectService = new HybridProjectService();
export const hybridClientService = new HybridClientService();