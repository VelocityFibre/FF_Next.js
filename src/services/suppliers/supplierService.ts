// Supplier Management Service
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
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  Supplier, 
  SupplierFormData, 
  SupplierStatus,
  SupplierRating,
  SupplierPerformance,
  PerformancePeriod
} from '@/types/supplier.types';

const COLLECTION_NAME = 'suppliers';

export const supplierService = {
  // ============= CRUD Operations =============
  
  async getAll(filter?: { 
    status?: SupplierStatus; 
    category?: string; 
    isPreferred?: boolean 
  }) {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy('companyName', 'asc'));
      
      if (filter?.status) {
        q = query(q, where('status', '==', filter.status));
      }
      if (filter?.isPreferred !== undefined) {
        q = query(q, where('isPreferred', '==', filter.isPreferred));
      }
      if (filter?.category) {
        q = query(q, where('categories', 'array-contains', filter.category));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Supplier> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        throw new Error('Supplier not found');
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Supplier;
    } catch (error) {
      console.error('Error fetching supplier:', error);
      throw error;
    }
  },

  async create(data: SupplierFormData): Promise<string> {
    try {
      // Initialize rating
      const initialRating: SupplierRating = {
        overall: 0,
        quality: 0,
        delivery: 0,
        pricing: 0,
        communication: 0,
        flexibility: 0,
        totalReviews: 0
      };

      const supplier: Omit<Supplier, 'id'> = {
        ...data,
        rating: initialRating,
        performanceScore: 0,
        reliabilityScore: 0,
        status: SupplierStatus.PENDING,
        isPreferred: false,
        compliance: {
          taxCompliant: false,
          insuranceValid: false,
          licenseValid: false
        },
        documents: [],
        activeRFQs: 0,
        completedOrders: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'current-user-id', // TODO: Get from auth context
        lastModifiedBy: 'current-user-id'
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), supplier);
      return docRef.id;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<SupplierFormData>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
        lastModifiedBy: 'current-user-id' // TODO: Get from auth context
      };
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  },

  // ============= Status Management =============
  
  async updateStatus(id: string, status: SupplierStatus, reason?: string): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: Timestamp.now(),
        lastModifiedBy: 'current-user-id' // TODO: Get from auth context
      };
      
      if (status === SupplierStatus.BLACKLISTED && reason) {
        updateData.blacklistReason = reason;
      }
      
      await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    } catch (error) {
      console.error('Error updating supplier status:', error);
      throw error;
    }
  },

  async setPreferred(id: string, isPreferred: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        isPreferred,
        updatedAt: Timestamp.now(),
        lastModifiedBy: 'current-user-id' // TODO: Get from auth context
      });
    } catch (error) {
      console.error('Error updating supplier preference:', error);
      throw error;
    }
  },

  // ============= Performance & Rating =============
  
  async updateRating(id: string, rating: Partial<SupplierRating>): Promise<void> {
    try {
      const supplier = await this.getById(id);
      
      const updatedRating = {
        ...supplier.rating,
        ...rating,
        lastReviewDate: Timestamp.now()
      };
      
      // Calculate overall rating
      const ratingValues = [
        updatedRating.quality,
        updatedRating.delivery,
        updatedRating.pricing,
        updatedRating.communication,
        updatedRating.flexibility
      ].filter(r => r > 0);
      
      if (ratingValues.length > 0) {
        updatedRating.overall = ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length;
      }
      
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        rating: updatedRating,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating supplier rating:', error);
      throw error;
    }
  },

  async calculatePerformance(
    supplierId: string, 
    period: PerformancePeriod
  ): Promise<SupplierPerformance> {
    try {
      // This would typically calculate from orders, deliveries, etc.
      // For now, return mock data
      const now = Timestamp.now();
      const startDate = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      
      const performance: SupplierPerformance = {
        supplierId,
        period,
        onTimeDeliveryRate: 95,
        averageLeadTime: 5,
        deliveryIssues: 2,
        qualityAcceptanceRate: 98,
        defectRate: 2,
        returnRate: 1,
        totalSpend: 150000,
        averageOrderValue: 15000,
        paymentCompliance: 100,
        averageResponseTime: 4,
        quoteTurnaroundTime: 24,
        issueResolutionTime: 48,
        totalOrders: 10,
        totalItems: 250,
        performanceScore: 92,
        reliabilityScore: 95,
        startDate,
        endDate: now,
        calculatedAt: now
      };
      
      // Update supplier with latest scores
      await updateDoc(doc(db, COLLECTION_NAME, supplierId), {
        performanceScore: performance.performanceScore,
        reliabilityScore: performance.reliabilityScore,
        updatedAt: Timestamp.now()
      });
      
      return performance;
    } catch (error) {
      console.error('Error calculating supplier performance:', error);
      throw error;
    }
  },

  // ============= Search & Filter =============
  
  async searchByName(searchTerm: string): Promise<Supplier[]> {
    try {
      // Firestore doesn't support full-text search, so we use a workaround
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('companyName'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const suppliers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
      
      // Client-side filtering
      return suppliers.filter(supplier => 
        supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching suppliers:', error);
      throw error;
    }
  },

  async getPreferredSuppliers(): Promise<Supplier[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isPreferred', '==', true),
        where('status', '==', SupplierStatus.ACTIVE),
        orderBy('companyName')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
    } catch (error) {
      console.error('Error fetching preferred suppliers:', error);
      throw error;
    }
  },

  async getByCategory(category: string): Promise<Supplier[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('categories', 'array-contains', category),
        where('status', '==', SupplierStatus.ACTIVE),
        orderBy('rating.overall', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
    } catch (error) {
      console.error('Error fetching suppliers by category:', error);
      throw error;
    }
  },

  // ============= Compliance & Documents =============
  
  async updateCompliance(id: string, compliance: any): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        compliance,
        updatedAt: Timestamp.now(),
        lastModifiedBy: 'current-user-id' // TODO: Get from auth context
      });
    } catch (error) {
      console.error('Error updating supplier compliance:', error);
      throw error;
    }
  },

  async addDocument(id: string, document: any): Promise<void> {
    try {
      const supplier = await this.getById(id);
      const documents = [...(supplier.documents || []), document];
      
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        documents,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding supplier document:', error);
      throw error;
    }
  },

  // ============= Real-time Subscription =============
  
  subscribeToSupplier(supplierId: string, callback: (supplier: Supplier) => void) {
    const docRef = doc(db, COLLECTION_NAME, supplierId);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: snapshot.id,
          ...snapshot.data()
        } as Supplier);
      }
    });
  },

  subscribeToSuppliers(callback: (suppliers: Supplier[]) => void) {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('companyName')
    );
    
    return onSnapshot(q, (snapshot) => {
      const suppliers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
      callback(suppliers);
    });
  },

  // ============= Statistics =============
  
  async getStatistics() {
    try {
      const suppliers = await this.getAll();
      
      return {
        total: suppliers.length,
        active: suppliers.filter(s => s.status === SupplierStatus.ACTIVE).length,
        preferred: suppliers.filter(s => s.isPreferred).length,
        blacklisted: suppliers.filter(s => s.status === SupplierStatus.BLACKLISTED).length,
        averageRating: suppliers.reduce((sum, s) => sum + s.rating.overall, 0) / suppliers.length || 0,
        averagePerformance: suppliers.reduce((sum, s) => sum + s.performanceScore, 0) / suppliers.length || 0,
        categoryCounts: this.countByCategory(suppliers),
        topRated: suppliers
          .filter(s => s.rating.totalReviews > 0)
          .sort((a, b) => b.rating.overall - a.rating.overall)
          .slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting supplier statistics:', error);
      throw error;
    }
  },

  countByCategory(suppliers: Supplier[]) {
    const counts: Record<string, number> = {};
    
    suppliers.forEach(supplier => {
      supplier.categories?.forEach(category => {
        counts[category] = (counts[category] || 0) + 1;
      });
    });
    
    return counts;
  }
};