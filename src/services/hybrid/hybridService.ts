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
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { analyticsService } from '@/services/analytics/analyticsService';
import type { Project } from '@/types/project.types';
import type { Client } from '@/types/client.types';
import type { NewProjectAnalytics, NewKPIMetrics, NewClientAnalytics } from '@/lib/neon/schema';

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
      console.error('Failed to get projects:', error);
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
      console.error('Failed to get project:', error);
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
      this.syncProjectToAnalytics(docRef.id, projectData).catch(error => {
        console.error('Failed to sync project to analytics:', error);
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to create project:', error);
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
        this.syncProjectToAnalytics(id, updatedProject).catch(console.error);
      }
    } catch (error) {
      console.error('Failed to update project:', error);
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
      console.error('Failed to delete project:', error);
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
      console.error('Failed to get project analytics:', error);
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
      console.error('Failed to get project trends:', error);
      throw error;
    }
  }

  /**
   * Record KPI metric
   */
  async recordKPI(
    projectId: string, 
    metricType: string, 
    metricName: string, 
    value: number, 
    unit: string = ''
  ): Promise<void> {
    try {
      const kpiData: NewKPIMetrics = {
        projectId,
        metricType,
        metricName,
        metricValue: value.toString(),
        unit,
        recordedDate: new Date(),
        weekNumber: this.getWeekNumber(new Date()),
        monthNumber: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      };

      // This would be handled by the analyticsService
      // await analyticsService.recordKPI(kpiData);
    } catch (error) {
      console.error('Failed to record KPI:', error);
      throw error;
    }
  }

  // ============================================
  // SYNC FUNCTIONS (Private)
  // ============================================

  /**
   * Sync project data to analytics database
   */
  private async syncProjectToAnalytics(projectId: string, projectData: any): Promise<void> {
    try {
      const analyticsData: NewProjectAnalytics = {
        projectId,
        projectName: projectData.name || 'Untitled Project',
        clientId: projectData.clientId,
        clientName: projectData.clientName,
        totalBudget: projectData.budget?.toString(),
        spentBudget: '0', // Would be calculated from transactions
        startDate: projectData.startDate?.toDate ? projectData.startDate.toDate() : new Date(),
        endDate: projectData.endDate?.toDate ? projectData.endDate.toDate() : null,
        completionPercentage: (projectData.progress || 0).toString(),
        onTimeDelivery: false, // Would be calculated based on dates
        qualityScore: (projectData.qualityScore || 0).toString(),
      };

      // This would insert/update the analytics record
      console.log('Would sync to analytics:', analyticsData);
      
    } catch (error) {
      console.error('Failed to sync project to analytics:', error);
      // Don't throw - sync failures shouldn't break main operations
    }
  }

  /**
   * Get week number of year
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
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
      console.error('Failed to get clients:', error);
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
      console.error('Failed to get client:', error);
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
      this.syncClientToAnalytics(docRef.id, clientData).catch(console.error);

      return docRef.id;
    } catch (error) {
      console.error('Failed to create client:', error);
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
        this.syncClientToAnalytics(id, updatedClient).catch(console.error);
      }
    } catch (error) {
      console.error('Failed to update client:', error);
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
      console.error('Failed to get client analytics:', error);
      throw error;
    }
  }

  async getTopClients(limit: number = 10) {
    try {
      return await analyticsService.getTopClients(limit);
    } catch (error) {
      console.error('Failed to get top clients:', error);
      throw error;
    }
  }

  // ============================================
  // SYNC FUNCTIONS (Private)
  // ============================================

  private async syncClientToAnalytics(clientId: string, clientData: any): Promise<void> {
    try {
      const analyticsData: NewClientAnalytics = {
        clientId,
        clientName: clientData.name || 'Unknown Client',
        totalProjects: 0, // Would be calculated from projects
        activeProjects: 0, // Would be calculated from projects
        completedProjects: 0, // Would be calculated from projects
        totalRevenue: '0', // Would be calculated from transactions
        outstandingBalance: clientData.currentBalance?.toString() || '0',
        averageProjectValue: '0', // Would be calculated
        paymentScore: '100', // Default score
        clientCategory: clientData.category || 'Regular',
        lifetimeValue: '0', // Would be calculated
      };

      console.log('Would sync client to analytics:', analyticsData);
      
    } catch (error) {
      console.error('Failed to sync client to analytics:', error);
    }
  }
}

// Export service instances
export const hybridProjectService = new HybridProjectService();
export const hybridClientService = new HybridClientService();