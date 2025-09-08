/**
 * Firebase Operations for Contractors
 * Handles Firebase Firestore operations for contractor data
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
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/src/config/firebase';
import { 
  Contractor, 
  ContractorFormData,
  ContractorFilter
} from '@/types/contractor.types';

/**
 * Get all contractors from Firebase with optional filtering
 */
export async function getAllContractorsFromFirebase(filter?: ContractorFilter): Promise<Contractor[]> {
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
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    lastActivity: doc.data().lastActivity?.toDate(),
    nextReviewDate: doc.data().nextReviewDate?.toDate(),
    onboardingCompletedAt: doc.data().onboardingCompletedAt?.toDate(),
  } as Contractor));
}

/**
 * Get contractor by ID from Firebase
 */
export async function getContractorByIdFromFirebase(id: string): Promise<Contractor | null> {
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
}

/**
 * Create contractor in Firebase
 */
export async function createContractorInFirebase(data: ContractorFormData): Promise<string> {
  const firebaseData = {
    ...data,
    status: data.status || 'pending',
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
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: 'current-user', // TODO: Get from auth context
    lastModifiedBy: 'current-user',
  };
  
  const docRef = await addDoc(collection(db, 'contractors'), firebaseData);
  return docRef.id;
}

/**
 * Update contractor in Firebase
 */
export async function updateContractorInFirebase(id: string, data: Partial<ContractorFormData>): Promise<void> {
  const docRef = doc(db, 'contractors', id);
  const updateData: any = {
    ...data,
    updatedAt: Timestamp.now(),
    lastModifiedBy: 'current-user', // TODO: Get from auth context
  };
  
  await updateDoc(docRef, updateData);
}

/**
 * Delete contractor from Firebase
 */
export async function deleteContractorFromFirebase(id: string): Promise<void> {
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
  
  await deleteDoc(doc(db, 'contractors', id));
}