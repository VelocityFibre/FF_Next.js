/**
 * CRUD Operations for Contractor Neon Database
 * Create, Read, Update, Delete operations for contractors
 */

import { neonDb } from '@/lib/neon/connection';
import { contractors } from '@/lib/neon/schema/contractor.schema';
import { eq } from 'drizzle-orm';
import type { ContractorFormData, Contractor } from '@/types/contractor.types';
import type { NewContractor } from '@/lib/neon/schema/contractor.schema';
import { mapToNeonContractor, mapToContractor } from './dataMappers';

/**
 * Create new contractor in Neon database
 */
export async function createContractor(data: ContractorFormData): Promise<Contractor> {
  try {
    // Map form data to Neon format
    const neonData: NewContractor = {
      ...mapToNeonContractor(data),
      createdAt: new Date()
    };

    const result = await neonDb
      .insert(contractors)
      .values(neonData)
      .returning();

    return mapToContractor(result[0]);
  } catch (error) {
    console.error('Error creating contractor in Neon:', error);
    throw new Error('Failed to create contractor');
  }
}

/**
 * Update existing contractor in Neon database
 */
export async function updateContractor(id: string, data: Partial<ContractorFormData>): Promise<Contractor> {
  try {
    // Map form data to Neon format
    const neonData = mapToNeonContractor(data);

    const result = await neonDb
      .update(contractors)
      .set(neonData)
      .where(eq(contractors.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error('Contractor not found');
    }

    return mapToContractor(result[0]);
  } catch (error) {
    console.error('Error updating contractor in Neon:', error);
    throw new Error('Failed to update contractor');
  }
}

/**
 * Delete contractor from Neon database (soft delete)
 */
export async function deleteContractor(id: string): Promise<void> {
  try {
    const result = await neonDb
      .update(contractors)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(contractors.id, id))
      .returning({ id: contractors.id });

    if (result.length === 0) {
      throw new Error('Contractor not found');
    }
  } catch (error) {
    console.error('Error deleting contractor in Neon:', error);
    throw new Error('Failed to delete contractor');
  }
}

/**
 * Hard delete contractor from Neon database
 */
export async function hardDeleteContractor(id: string): Promise<void> {
  try {
    const result = await neonDb
      .delete(contractors)
      .where(eq(contractors.id, id))
      .returning({ id: contractors.id });

    if (result.length === 0) {
      throw new Error('Contractor not found');
    }
  } catch (error) {
    console.error('Error hard deleting contractor in Neon:', error);
    throw new Error('Failed to permanently delete contractor');
  }
}

/**
 * Update contractor status
 */
export async function updateContractorStatus(id: string, status: string): Promise<void> {
  try {
    const result = await neonDb
      .update(contractors)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(contractors.id, id))
      .returning({ id: contractors.id });

    if (result.length === 0) {
      throw new Error('Contractor not found');
    }
  } catch (error) {
    console.error('Error updating contractor status:', error);
    throw new Error('Failed to update contractor status');
  }
}

/**
 * Update contractor compliance status
 */
export async function updateContractorCompliance(id: string, complianceStatus: string): Promise<void> {
  try {
    const result = await neonDb
      .update(contractors)
      .set({ 
        complianceStatus,
        updatedAt: new Date()
      })
      .where(eq(contractors.id, id))
      .returning({ id: contractors.id });

    if (result.length === 0) {
      throw new Error('Contractor not found');
    }
  } catch (error) {
    console.error('Error updating contractor compliance:', error);
    throw new Error('Failed to update contractor compliance');
  }
}

/**
 * Update contractor RAG scores
 */
export async function updateContractorRAG(id: string, ragScores: {
  ragOverall?: string;
  ragFinancial?: string;
  ragCompliance?: string;
  ragPerformance?: string;
  ragSafety?: string;
}): Promise<void> {
  try {
    const result = await neonDb
      .update(contractors)
      .set({ 
        ...ragScores,
        updatedAt: new Date()
      })
      .where(eq(contractors.id, id))
      .returning({ id: contractors.id });

    if (result.length === 0) {
      throw new Error('Contractor not found');
    }
  } catch (error) {
    console.error('Error updating contractor RAG scores:', error);
    throw new Error('Failed to update contractor RAG scores');
  }
}

/**
 * Update contractor project statistics
 */
export async function updateContractorProjectStats(id: string, stats: {
  totalProjects?: number;
  completedProjects?: number;
  activeProjects?: number;
  cancelledProjects?: number;
}): Promise<void> {
  try {
    const result = await neonDb
      .update(contractors)
      .set({ 
        ...stats,
        updatedAt: new Date()
      })
      .where(eq(contractors.id, id))
      .returning({ id: contractors.id });

    if (result.length === 0) {
      throw new Error('Contractor not found');
    }
  } catch (error) {
    console.error('Error updating contractor project stats:', error);
    throw new Error('Failed to update contractor project statistics');
  }
}