/**
 * Real-time Sync Manager
 * Handles Firebase real-time listeners for instant synchronization
 */

import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ProjectSync } from '../projectSync';
import { ClientSync } from '../clientSync';
import { StaffSync } from '../staffSync';
import { SyncConfig, SyncError, RealtimeSyncEvent } from './types';

export class RealtimeSyncManager {
  private unsubscribeFunctions: Array<() => void> = [];
  private config: SyncConfig;
  private onError: (error: SyncError) => void;
  private onSyncEvent: (event: RealtimeSyncEvent) => void;

  constructor(
    config: SyncConfig, 
    onError: (error: SyncError) => void,
    onSyncEvent: (event: RealtimeSyncEvent) => void
  ) {
    this.config = config;
    this.onError = onError;
    this.onSyncEvent = onSyncEvent;
  }

  /**
   * Setup real-time synchronization listeners
   */
  setupRealtimeSync(): void {
    if (!this.config.enableRealtimeSync) {
      return;
    }

    // Projects real-time sync
    if (this.config.enabledSyncTypes.includes('projects')) {
      const unsubscribeProjects = onSnapshot(
        collection(db, 'projects'),
        (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            try {
              await this.handleProjectChange(change);
            } catch (error) {
              this.onError({
                timestamp: new Date(),
                type: 'realtime_sync_error',
                message: `Failed to sync project change: ${error}`,
                entityId: change.doc.id,
                entityType: 'project',
                error
              });
            }
          });
        },
        (error) => {
          this.onError({
            timestamp: new Date(),
            type: 'realtime_listener_error',
            message: `Projects listener error: ${error.message}`,
            error
          });
        }
      );
      this.unsubscribeFunctions.push(unsubscribeProjects);
    }

    // Clients real-time sync
    if (this.config.enabledSyncTypes.includes('clients')) {
      const unsubscribeClients = onSnapshot(
        collection(db, 'clients'),
        (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            try {
              await this.handleClientChange(change);
            } catch (error) {
              this.onError({
                timestamp: new Date(),
                type: 'realtime_sync_error',
                message: `Failed to sync client change: ${error}`,
                entityId: change.doc.id,
                entityType: 'client',
                error
              });
            }
          });
        },
        (error) => {
          this.onError({
            timestamp: new Date(),
            type: 'realtime_listener_error',
            message: `Clients listener error: ${error.message}`,
            error
          });
        }
      );
      this.unsubscribeFunctions.push(unsubscribeClients);
    }

    // Staff real-time sync
    if (this.config.enabledSyncTypes.includes('staff')) {
      const unsubscribeStaff = onSnapshot(
        collection(db, 'staff'),
        (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            try {
              await this.handleStaffChange(change);
            } catch (error) {
              this.onError({
                timestamp: new Date(),
                type: 'realtime_sync_error',
                message: `Failed to sync staff change: ${error}`,
                entityId: change.doc.id,
                entityType: 'staff',
                error
              });
            }
          });
        },
        (error) => {
          this.onError({
            timestamp: new Date(),
            type: 'realtime_listener_error',
            message: `Staff listener error: ${error.message}`,
            error
          });
        }
      );
      this.unsubscribeFunctions.push(unsubscribeStaff);
    }
  }

  /**
   * Stop all real-time listeners
   */
  stopRealtimeSync(): void {
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions = [];
  }

  /**
   * Handle project document changes
   */
  private async handleProjectChange(change: any): Promise<void> {
    const eventType = change.type as 'added' | 'modified' | 'removed';
    const projectData = change.doc.data();
    
    this.onSyncEvent({
      type: eventType,
      entityType: 'project',
      entityId: change.doc.id,
      data: projectData,
      timestamp: new Date()
    });

    switch (eventType) {
      case 'added':
      case 'modified':
        await ProjectSync.syncSingleProject(change.doc.id, projectData);
        break;
      case 'removed':
        // Note: Delete functionality would need to be implemented
        // For now, we can mark it as deleted in the analytics

        break;
    }
  }

  /**
   * Handle client document changes
   */
  private async handleClientChange(change: any): Promise<void> {
    const eventType = change.type as 'added' | 'modified' | 'removed';
    const clientData = change.doc.data();
    
    this.onSyncEvent({
      type: eventType,
      entityType: 'client',
      entityId: change.doc.id,
      data: clientData,
      timestamp: new Date()
    });

    switch (eventType) {
      case 'added':
      case 'modified':
        await ClientSync.syncSingleClient(change.doc.id, clientData);
        break;
      case 'removed':
        // Note: Delete functionality would need to be implemented
        // For now, we can mark it as deleted in the analytics

        break;
    }
  }

  /**
   * Handle staff document changes
   */
  private async handleStaffChange(change: any): Promise<void> {
    const eventType = change.type as 'added' | 'modified' | 'removed';
    const staffData = change.doc.data();
    
    this.onSyncEvent({
      type: eventType,
      entityType: 'staff',
      entityId: change.doc.id,
      data: staffData,
      timestamp: new Date()
    });

    switch (eventType) {
      case 'added':
      case 'modified':
        await StaffSync.syncSingleStaffMember(change.doc.id, staffData);
        break;
      case 'removed':
        // Note: Delete functionality would need to be implemented
        // For now, we can mark it as deleted in the analytics

        break;
    }
  }
}