/**
 * Firebase to Neon ETL Pipeline
 * Syncs operational data from Firebase to analytical database
 */

import { collection, getDocs, onSnapshot, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { neonDb } from '@/lib/neon/connection';
import { 
  projectAnalytics, 
  clientAnalytics, 
  kpiMetrics, 
  auditLog,
  staffPerformance,
  materialUsage
} from '@/lib/neon/schema';
import type { 
  NewProjectAnalytics, 
  NewClientAnalytics, 
  NewKPIMetrics,
  NewAuditLog,
  NewStaffPerformance,
  NewMaterialUsage
} from '@/lib/neon/schema';
import { eq } from 'drizzle-orm';

export class FirebaseToNeonSync {
  private isRunning = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private unsubscribeFunctions: Array<() => void> = [];

  // ============================================
  // SYNC CONTROL
  // ============================================

  /**
   * Start continuous sync
   */
  async startSync(intervalMinutes: number = 15): Promise<void> {
    if (this.isRunning) {
      console.log('Sync is already running');
      return;
    }

    console.log('Starting Firebase to Neon sync...');
    this.isRunning = true;

    // Initial full sync
    await this.performFullSync();

    // Set up real-time listeners
    this.setupRealtimeSync();

    // Set up periodic full sync
    this.syncInterval = setInterval(async () => {
      try {
        console.log('Performing scheduled sync...');
        await this.performFullSync();
      } catch (error) {
        console.error('Scheduled sync failed:', error);
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`Sync started with ${intervalMinutes} minute intervals`);
  }

  /**
   * Stop sync
   */
  stopSync(): void {
    if (!this.isRunning) return;

    console.log('Stopping Firebase to Neon sync...');
    
    // Clear interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Unsubscribe from real-time listeners
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions = [];

    this.isRunning = false;
    console.log('Sync stopped');
  }

  /**
   * Perform one-time full sync
   */
  async performFullSync(): Promise<void> {
    try {
      console.log('Starting full sync...');
      const startTime = Date.now();

      // Run all syncs in parallel
      const results = await Promise.allSettled([
        this.syncProjects(),
        this.syncClients(),
        this.syncStaffPerformance(),
        // this.syncMaterials(), // Uncomment when materials collection exists
      ]);

      // Log results
      results.forEach((result, index) => {
        const syncType = ['Projects', 'Clients', 'Staff', 'Materials'][index];
        if (result.status === 'fulfilled') {
          console.log(`✅ ${syncType} sync completed`);
        } else {
          console.error(`❌ ${syncType} sync failed:`, result.reason);
        }
      });

      const duration = Date.now() - startTime;
      console.log(`Full sync completed in ${duration}ms`);

    } catch (error) {
      console.error('Full sync failed:', error);
    }
  }

  // ============================================
  // REAL-TIME SYNC SETUP
  // ============================================

  private setupRealtimeSync(): void {
    // Projects real-time sync
    const projectsUnsubscribe = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            this.syncSingleProject(change.doc.id, change.doc.data()).catch(console.error);
          }
        });
      },
      (error) => console.error('Projects real-time sync error:', error)
    );

    // Clients real-time sync
    const clientsUnsubscribe = onSnapshot(
      collection(db, 'clients'),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            this.syncSingleClient(change.doc.id, change.doc.data()).catch(console.error);
          }
        });
      },
      (error) => console.error('Clients real-time sync error:', error)
    );

    this.unsubscribeFunctions.push(projectsUnsubscribe, clientsUnsubscribe);
  }

  // ============================================
  // PROJECT SYNC
  // ============================================

  private async syncProjects(): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, 'projects'));
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log(`Syncing ${projects.length} projects...`);

      for (const project of projects) {
        await this.syncSingleProject(project.id, project);
      }
    } catch (error) {
      console.error('Failed to sync projects:', error);
      throw error;
    }
  }

  private async syncSingleProject(projectId: string, projectData: any): Promise<void> {
    try {
      const analyticsData: NewProjectAnalytics = {
        projectId,
        projectName: projectData.name || projectData.title || 'Untitled Project',
        clientId: projectData.clientId,
        clientName: projectData.clientName,
        
        // Metrics (calculate from project data)
        totalPoles: projectData.totalPoles || 0,
        completedPoles: projectData.completedPoles || 0,
        totalDrops: projectData.totalDrops || 0,
        completedDrops: projectData.completedDrops || 0,
        
        // Financial
        totalBudget: projectData.budget?.toString(),
        spentBudget: projectData.spentAmount?.toString() || '0',
        
        // Timeline
        startDate: this.parseFirebaseDate(projectData.startDate),
        endDate: this.parseFirebaseDate(projectData.endDate),
        actualEndDate: this.parseFirebaseDate(projectData.actualEndDate),
        
        // Performance
        completionPercentage: (projectData.progress || projectData.completion || 0).toString(),
        onTimeDelivery: this.calculateOnTimeDelivery(projectData),
        qualityScore: (projectData.qualityScore || 85).toString(), // Default quality score
        
        lastSyncedAt: new Date(),
      };

      // Check if record exists
      const existingRecord = await neonDb
        .select()
        .from(projectAnalytics)
        .where(eq(projectAnalytics.projectId, projectId))
        .limit(1);

      if (existingRecord.length > 0) {
        // Update existing record
        await neonDb
          .update(projectAnalytics)
          .set({ ...analyticsData, updatedAt: new Date() })
          .where(eq(projectAnalytics.projectId, projectId));
      } else {
        // Insert new record
        await neonDb.insert(projectAnalytics).values(analyticsData);
      }

    } catch (error) {
      console.error(`Failed to sync project ${projectId}:`, error);
    }
  }

  // ============================================
  // CLIENT SYNC
  // ============================================

  private async syncClients(): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, 'clients'));
      const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log(`Syncing ${clients.length} clients...`);

      for (const client of clients) {
        await this.syncSingleClient(client.id, client);
      }
    } catch (error) {
      console.error('Failed to sync clients:', error);
      throw error;
    }
  }

  private async syncSingleClient(clientId: string, clientData: any): Promise<void> {
    try {
      // Calculate client metrics from projects
      const clientProjects = await this.getClientProjects(clientId);
      const clientMetrics = this.calculateClientMetrics(clientProjects);

      const analyticsData: NewClientAnalytics = {
        clientId,
        clientName: clientData.name || 'Unknown Client',
        
        // Project metrics
        totalProjects: clientMetrics.totalProjects,
        activeProjects: clientMetrics.activeProjects,
        completedProjects: clientMetrics.completedProjects,
        
        // Financial metrics
        totalRevenue: clientMetrics.totalRevenue.toString(),
        outstandingBalance: (clientData.currentBalance || 0).toString(),
        averageProjectValue: clientMetrics.averageProjectValue.toString(),
        paymentScore: this.calculatePaymentScore(clientData),
        
        // Performance metrics
        averageProjectDuration: clientMetrics.averageProjectDuration,
        onTimeCompletionRate: clientMetrics.onTimeCompletionRate.toString(),
        satisfactionScore: (clientData.satisfactionScore || 85).toString(),
        
        // Engagement
        lastProjectDate: clientMetrics.lastProjectDate,
        nextFollowUpDate: this.parseFirebaseDate(clientData.nextFollowUpDate),
        totalInteractions: clientData.totalInteractions || 0,
        
        // Classification
        clientCategory: this.classifyClient(clientMetrics),
        lifetimeValue: clientMetrics.lifetimeValue.toString(),
        
        lastCalculatedAt: new Date(),
      };

      // Upsert client analytics
      const existingRecord = await neonDb
        .select()
        .from(clientAnalytics)
        .where(eq(clientAnalytics.clientId, clientId))
        .limit(1);

      if (existingRecord.length > 0) {
        await neonDb
          .update(clientAnalytics)
          .set({ ...analyticsData, updatedAt: new Date() })
          .where(eq(clientAnalytics.clientId, clientId));
      } else {
        await neonDb.insert(clientAnalytics).values(analyticsData);
      }

    } catch (error) {
      console.error(`Failed to sync client ${clientId}:`, error);
    }
  }

  // ============================================
  // STAFF PERFORMANCE SYNC
  // ============================================

  private async syncStaffPerformance(): Promise<void> {
    try {
      // This would sync from staff collection and calculate performance metrics
      console.log('Syncing staff performance...');
      
      // Get staff data from Firebase
      const snapshot = await getDocs(collection(db, 'staff'));
      const staff = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      for (const member of staff) {
        await this.syncSingleStaffMember(member.id, member);
      }
    } catch (error) {
      console.error('Failed to sync staff performance:', error);
      throw error;
    }
  }

  private async syncSingleStaffMember(staffId: string, staffData: any): Promise<void> {
    try {
      // Calculate monthly performance metrics
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const performanceData: NewStaffPerformance = {
        staffId,
        staffName: staffData.name || 'Unknown Staff',
        role: staffData.role || 'Worker',
        
        // Performance metrics (would be calculated from actual data)
        tasksCompleted: staffData.monthlyTasksCompleted || 0,
        hoursWorked: (staffData.monthlyHoursWorked || 0).toString(),
        productivityScore: (staffData.productivityScore || 75).toString(),
        qualityScore: (staffData.qualityScore || 80).toString(),
        attendanceRate: (staffData.attendanceRate || 95).toString(),
        
        // Period
        periodStart: monthStart,
        periodEnd: monthEnd,
        periodType: 'monthly',
        
        // Additional metrics
        overtimeHours: (staffData.monthlyOvertimeHours || 0).toString(),
        incidentCount: staffData.monthlyIncidents || 0,
      };

      // Check if record exists for this period
      const existingRecord = await neonDb
        .select()
        .from(staffPerformance)
        .where(eq(staffPerformance.staffId, staffId))
        .limit(1);

      if (existingRecord.length > 0) {
        await neonDb
          .update(staffPerformance)
          .set(performanceData)
          .where(eq(staffPerformance.staffId, staffId));
      } else {
        await neonDb.insert(staffPerformance).values(performanceData);
      }

    } catch (error) {
      console.error(`Failed to sync staff member ${staffId}:`, error);
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  private parseFirebaseDate(firebaseDate: any): Date | null {
    if (!firebaseDate) return null;
    
    if (firebaseDate.toDate) {
      return firebaseDate.toDate();
    }
    
    if (firebaseDate.seconds) {
      return new Date(firebaseDate.seconds * 1000);
    }
    
    if (typeof firebaseDate === 'string' || typeof firebaseDate === 'number') {
      return new Date(firebaseDate);
    }
    
    return null;
  }

  private calculateOnTimeDelivery(projectData: any): boolean {
    const endDate = this.parseFirebaseDate(projectData.endDate);
    const actualEndDate = this.parseFirebaseDate(projectData.actualEndDate);
    
    if (!endDate || !actualEndDate) return false;
    
    return actualEndDate <= endDate;
  }

  private async getClientProjects(clientId: string): Promise<any[]> {
    try {
      const q = query(collection(db, 'projects'), where('clientId', '==', clientId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Failed to get client projects:', error);
      return [];
    }
  }

  private calculateClientMetrics(projects: any[]) {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const averageProjectValue = totalProjects > 0 ? totalRevenue / totalProjects : 0;
    
    const completedWithDates = projects.filter(p => p.status === 'completed' && p.startDate && p.endDate);
    const averageProjectDuration = completedWithDates.length > 0 
      ? completedWithDates.reduce((sum, p) => {
          const start = this.parseFirebaseDate(p.startDate);
          const end = this.parseFirebaseDate(p.endDate);
          if (start && end) {
            return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          }
          return sum;
        }, 0) / completedWithDates.length
      : 0;

    const onTimeProjects = projects.filter(p => this.calculateOnTimeDelivery(p)).length;
    const onTimeCompletionRate = totalProjects > 0 ? (onTimeProjects / totalProjects) * 100 : 0;

    const lastProjectDate = projects
      .map(p => this.parseFirebaseDate(p.createdAt))
      .filter(d => d)
      .sort((a, b) => b!.getTime() - a!.getTime())[0] || null;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalRevenue,
      averageProjectValue,
      averageProjectDuration: Math.round(averageProjectDuration),
      onTimeCompletionRate: Math.round(onTimeCompletionRate * 100) / 100,
      lastProjectDate,
      lifetimeValue: totalRevenue * 1.2, // Estimate based on revenue + potential
    };
  }

  private calculatePaymentScore(clientData: any): string {
    // Simple payment score calculation
    const balance = clientData.currentBalance || 0;
    const creditLimit = clientData.creditLimit || 1000;
    
    if (balance <= 0) return '100'; // No outstanding balance
    if (balance < creditLimit * 0.3) return '90'; // Low utilization
    if (balance < creditLimit * 0.7) return '70'; // Medium utilization
    return '40'; // High utilization
  }

  private classifyClient(metrics: any): string {
    const { totalRevenue, totalProjects, onTimeCompletionRate } = metrics;
    
    if (totalRevenue > 1000000 && totalProjects > 10 && onTimeCompletionRate > 90) {
      return 'VIP';
    }
    if (totalRevenue > 500000 || totalProjects > 5) {
      return 'Premium';
    }
    if (onTimeCompletionRate < 70 || totalRevenue < 50000) {
      return 'At-Risk';
    }
    return 'Regular';
  }
}

// Export singleton instance
export const firebaseToNeonSync = new FirebaseToNeonSync();