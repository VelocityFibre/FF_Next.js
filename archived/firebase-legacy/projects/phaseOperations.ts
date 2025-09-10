/**
 * Phase Operations - Migrated to Neon PostgreSQL
 * This file now acts as a wrapper around the Neon phase service
 */

import { Phase } from '@/types/project/hierarchy.types';
import { phaseOperations as neonPhaseOps } from './neonPhaseService';
import { progressCalculations } from './neonPhaseService';
import { auth } from '@/config/firebase'; // Keep for user authentication
import { log } from '@/lib/logger';

/**
 * Get all phases for a project
 */
export async function getProjectPhases(projectId: string): Promise<Phase[]> {
  try {
    return await neonPhaseOps.getProjectPhases(projectId);
  } catch (error) {
    log.error('Error getting project phases:', { data: error }, 'phaseOperations');
    throw error;
  }
}

/**
 * Get a specific phase by ID
 */
export async function getPhaseById(projectId: string, phaseId: string): Promise<Phase | null> {
  try {
    return await neonPhaseOps.getPhaseById(projectId, phaseId);
  } catch (error) {
    log.error('Error getting phase:', { data: error }, 'phaseOperations');
    throw error;
  }
}

/**
 * Update a phase
 */
export async function updatePhase(
  projectId: string, 
  phaseId: string, 
  data: Partial<Phase>
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    await neonPhaseOps.updatePhase(projectId, phaseId, data, user.uid);
    
    // Update project progress
    await progressCalculations.updateProjectProgress(projectId);
  } catch (error) {
    log.error('Error updating phase:', { data: error }, 'phaseOperations');
    throw error;
  }
}