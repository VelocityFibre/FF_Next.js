/**
 * Contractor CRUD Service - Core database operations
 * Integrates Firebase for main data and Neon for analytics
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
  onSnapshot,
  Timestamp,
  QueryConstraint,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { neonDb } from '@/lib/neon/connection';
import { contractors } from '@/lib/neon/schema';
import { eq, and, or, like, desc, asc, count } from 'drizzle-orm';
import { 
  Contractor, 
  ContractorFormData,
  ContractorFilter,
  ContractorAnalytics,
  NewContractor
} from '@/types/contractor.types';

/**
 * Core CRUD operations for contractor management
 */
export const contractorCrudService = {
  /**
   * Get all contractors with optional filtering
   */
  async getAll(filter?: ContractorFilter): Promise<Contractor[]> {
    try {
      const constraints: QueryConstraint[] = [orderBy('companyName', 'asc')];
      
      // Apply Firebase filters
      if (filter?.status?.length) {
        constraints.push(where('status', 'in', filter.status));
      }
      
      if (filter?.complianceStatus?.length) {
        constraints.push(where('complianceStatus', 'in', filter.complianceStatus));
      }
      
      if (filter?.ragOverall?.length) {
        constraints.push(where('ragOverall', 'in', filter.ragOverall));
      }
      
      if (filter?.businessType?.length) {
        constraints.push(where('businessType', 'in', filter.businessType));
      }
      
      if (filter?.province?.length) {
        constraints.push(where('province', 'in', filter.province));
      }
      
      if (filter?.hasActiveProjects !== undefined) {
        if (filter.hasActiveProjects) {
          constraints.push(where('activeProjects', '>', 0));
        } else {
          constraints.push(where('activeProjects', '==', 0));
        }
      }
      
      if (filter?.documentsExpiring !== undefined && filter.documentsExpiring) {
        constraints.push(where('documentsExpiring', '>', 0));
      }
      
      const q = query(collection(db, 'contractors'), ...constraints);
      const snapshot = await getDocs(q);
      
      let contractorsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastActivity: doc.data().lastActivity?.toDate(),
        nextReviewDate: doc.data().nextReviewDate?.toDate(),
        onboardingCompletedAt: doc.data().onboardingCompletedAt?.toDate(),
      } as Contractor));
      
      // Apply client-side search filter
      if (filter?.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        contractorsList = contractorsList.filter(contractor => 
          contractor.companyName.toLowerCase().includes(searchTerm) ||
          contractor.contactPerson.toLowerCase().includes(searchTerm) ||
          contractor.email.toLowerCase().includes(searchTerm) ||
          contractor.phone?.includes(searchTerm) ||
          contractor.registrationNumber.toLowerCase().includes(searchTerm) ||
          contractor.industryCategory?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply tag filter
      if (filter?.tags?.length) {
        contractorsList = contractorsList.filter(contractor =>
          contractor.tags?.some(tag => filter.tags!.includes(tag))
        );
      }
      
      return contractorsList;
    } catch (error) {
      console.error('Error getting contractors:', error);
      throw new Error('Failed to fetch contractors');
    }
  },

  /**
   * Get contractor by ID
   */
  async getById(id: string): Promise<Contractor | null> {
    try {
      const docRef = doc(db, 'contractors', id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      const data = snapshot.data();
      return { 
        id: snapshot.id, 
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastActivity: data.lastActivity?.toDate(),
        nextReviewDate: data.nextReviewDate?.toDate(),
        onboardingCompletedAt: data.onboardingCompletedAt?.toDate(),
      } as Contractor;
    } catch (error) {
      console.error('Error getting contractor:', error);
      throw new Error('Failed to fetch contractor');
    }
  },

  /**
   * Create new contractor
   */
  async create(data: ContractorFormData): Promise<string> {
    try {
      const now = Timestamp.now();
      
      // Prepare Firebase data
      const firebaseData: any = {
        ...data,
        
        // Set default performance metrics
        performanceScore: 0,
        safetyScore: 0,
        qualityScore: 0,
        timelinessScore: 0,
        
        // Initialize project statistics
        totalProjects: 0,
        completedProjects: 0,
        activeProjects: 0,
        cancelledProjects: 0,
        
        // Initialize onboarding
        onboardingProgress: 0,
        documentsExpiring: 0,
        
        // Set default RAG scores
        ragOverall: 'amber',
        ragFinancial: 'amber',
        ragCompliance: 'amber',
        ragPerformance: 'amber',
        ragSafety: 'amber',
        
        // Set default status
        isActive: true,
        status: data.status || 'pending',
        complianceStatus: data.complianceStatus || 'pending',
        
        // Initialize arrays
        tags: data.tags || [],
        
        // Set audit fields
        createdAt: now,
        updatedAt: now,
        createdBy: 'current-user', // TODO: Get from auth context
        lastModifiedBy: 'current-user',
      };
      
      // Remove undefined values
      Object.keys(firebaseData).forEach(key => {
        if (firebaseData[key] === undefined) {
          delete firebaseData[key];
        }
      });
      
      // Create in Firebase
      const docRef = await addDoc(collection(db, 'contractors'), firebaseData);
      
      // Sync to Neon for analytics
      try {
        const neonData: NewContractor = {
          id: docRef.id,
          companyName: data.companyName,
          registrationNumber: data.registrationNumber,
          contactPerson: data.contactPerson,
          email: data.email,
          phone: data.phone,
          alternatePhone: data.alternatePhone,
          physicalAddress: data.physicalAddress,
          postalAddress: data.postalAddress,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          businessType: data.businessType,
          industryCategory: data.industryCategory,
          yearsInBusiness: data.yearsInBusiness,
          employeeCount: data.employeeCount,
          annualTurnover: data.annualTurnover?.toString(),
          creditRating: data.creditRating,
          paymentTerms: data.paymentTerms,
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          branchCode: data.branchCode,
          status: data.status || 'pending',
          isActive: true,
          complianceStatus: data.complianceStatus || 'pending',
          ragOverall: 'amber',
          ragFinancial: 'amber',
          ragCompliance: 'amber',
          ragPerformance: 'amber',
          ragSafety: 'amber',
          totalProjects: 0,
          completedProjects: 0,
          activeProjects: 0,
          cancelledProjects: 0,
          onboardingProgress: 0,
          documentsExpiring: 0,
          notes: data.notes,
          tags: data.tags || [],
          createdBy: 'current-user',
          updatedBy: 'current-user',
        };
        
        await neonDb.insert(contractors).values(neonData);
      } catch (neonError) {
        console.warn('Failed to sync contractor to Neon:', neonError);
        // Don't fail the entire operation for analytics sync issues
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating contractor:', error);
      throw new Error('Failed to create contractor');
    }
  },

  /**
   * Update contractor
   */
  async update(id: string, data: Partial<ContractorFormData>): Promise<void> {
    try {
      const docRef = doc(db, 'contractors', id);
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now(),
        lastModifiedBy: 'current-user', // TODO: Get from auth context
      };
      
      // Update in Firebase
      await updateDoc(docRef, updateData);
      
      // Sync to Neon for analytics
      try {
        const neonUpdateData: any = {};
        
        // Map Firebase fields to Neon fields
        if (data.companyName) neonUpdateData.companyName = data.companyName;
        if (data.contactPerson) neonUpdateData.contactPerson = data.contactPerson;
        if (data.email) neonUpdateData.email = data.email;
        if (data.phone) neonUpdateData.phone = data.phone;
        if (data.status) neonUpdateData.status = data.status;
        if (data.notes) neonUpdateData.notes = data.notes;
        if (data.tags) neonUpdateData.tags = data.tags;
        
        neonUpdateData.updatedBy = 'current-user';
        neonUpdateData.updatedAt = new Date();
        
        if (Object.keys(neonUpdateData).length > 2) { // Only update if there are fields beyond audit fields
          await neonDb
            .update(contractors)
            .set(neonUpdateData)
            .where(eq(contractors.id, id));
        }
      } catch (neonError) {
        console.warn('Failed to sync contractor update to Neon:', neonError);
      }
    } catch (error) {
      console.error('Error updating contractor:', error);
      throw new Error('Failed to update contractor');
    }
  },

  /**
   * Delete contractor
   */
  async delete(id: string): Promise<void> {
    try {
      // Check if contractor has active projects
      const projectsQuery = query(
        collection(db, 'project_assignments'),
        where('contractorId', '==', id),
        where('status', 'in', ['assigned', 'active'])
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      
      if (!projectsSnapshot.empty) {
        throw new Error('Cannot delete contractor with active project assignments');
      }
      
      // Delete from Firebase
      await deleteDoc(doc(db, 'contractors', id));
      
      // Delete from Neon
      try {
        await neonDb
          .delete(contractors)
          .where(eq(contractors.id, id));
      } catch (neonError) {
        console.warn('Failed to delete contractor from Neon:', neonError);
      }
    } catch (error) {
      console.error('Error deleting contractor:', error);
      throw new Error('Failed to delete contractor');
    }
  },

  /**
   * Get contractor analytics from Neon
   */
  async getAnalytics(): Promise<ContractorAnalytics> {
    try {
      // Get total counts
      const totalResult = await neonDb
        .select({ count: count() })
        .from(contractors);
      
      const activeResult = await neonDb
        .select({ count: count() })
        .from(contractors)
        .where(eq(contractors.isActive, true));
      
      const approvedResult = await neonDb
        .select({ count: count() })
        .from(contractors)
        .where(eq(contractors.status, 'approved'));
      
      const pendingResult = await neonDb
        .select({ count: count() })
        .from(contractors)
        .where(eq(contractors.status, 'pending'));
      
      const suspendedResult = await neonDb
        .select({ count: count() })
        .from(contractors)
        .where(eq(contractors.status, 'suspended'));
      
      const blacklistedResult = await neonDb
        .select({ count: count() })
        .from(contractors)
        .where(eq(contractors.status, 'blacklisted'));
      
      // Get RAG distribution
      const greenRagResult = await neonDb
        .select({ count: count() })
        .from(contractors)
        .where(eq(contractors.ragOverall, 'green'));
      
      const amberRagResult = await neonDb
        .select({ count: count() })
        .from(contractors)
        .where(eq(contractors.ragOverall, 'amber'));
      
      const redRagResult = await neonDb
        .select({ count: count() })
        .from(contractors)
        .where(eq(contractors.ragOverall, 'red'));
      
      // Get documents expiring
      const expiringDocsResult = await neonDb
        .select({ count: count() })
        .from(contractors)
        .where(eq(contractors.documentsExpiring, 0));
      
      return {
        totalContractors: totalResult[0]?.count || 0,
        activeContractors: activeResult[0]?.count || 0,
        approvedContractors: approvedResult[0]?.count || 0,
        pendingApproval: pendingResult[0]?.count || 0,
        suspended: suspendedResult[0]?.count || 0,
        blacklisted: blacklistedResult[0]?.count || 0,
        
        ragDistribution: {
          green: greenRagResult[0]?.count || 0,
          amber: amberRagResult[0]?.count || 0,
          red: redRagResult[0]?.count || 0,
        },
        
        // Placeholder values - would calculate from actual data
        averagePerformanceScore: 0,
        averageSafetyScore: 0,
        averageQualityScore: 0,
        averageTimelinessScore: 0,
        
        totalActiveProjects: 0,
        totalCompletedProjects: 0,
        averageProjectsPerContractor: 0,
        
        documentsExpiringSoon: expiringDocsResult[0]?.count || 0,
        complianceIssues: 0,
        pendingDocuments: 0,
      };
    } catch (error) {
      console.error('Error getting contractor analytics:', error);
      throw new Error('Failed to fetch contractor analytics');
    }
  },

  /**
   * Subscribe to contractors changes
   */
  subscribeToContractors(
    callback: (contractors: Contractor[]) => void,
    filter?: ContractorFilter
  ): Unsubscribe {
    const constraints: QueryConstraint[] = [orderBy('companyName', 'asc')];
    
    if (filter?.status?.length) {
      constraints.push(where('status', 'in', filter.status));
    }
    
    const q = query(collection(db, 'contractors'), ...constraints);
    
    return onSnapshot(q, (snapshot) => {
      const contractorsList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastActivity: data.lastActivity?.toDate(),
          nextReviewDate: data.nextReviewDate?.toDate(),
          onboardingCompletedAt: data.onboardingCompletedAt?.toDate(),
        } as Contractor;
      });
      
      callback(contractorsList);
    });
  },

  /**
   * Subscribe to single contractor changes
   */
  subscribeToContractor(
    contractorId: string,
    callback: (contractor: Contractor | null) => void
  ): Unsubscribe {
    const docRef = doc(db, 'contractors', contractorId);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const contractor = {
          id: snapshot.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastActivity: data.lastActivity?.toDate(),
          nextReviewDate: data.nextReviewDate?.toDate(),
          onboardingCompletedAt: data.onboardingCompletedAt?.toDate(),
        } as Contractor;
        callback(contractor);
      } else {
        callback(null);
      }
    });
  }
};