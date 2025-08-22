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
      const initialRating = {
        overall: 0,
        totalReviews: 0
      };

      const supplier = {
        ...data,
        code: `SUP-${Date.now()}`,
        companyName: data.name,
        businessType: data.businessType,
        isActive: true,
        primaryContact: {
          name: data.name,
          email: data.email,
          phone: data.phone
        },
        contact: {
          name: data.name,
          email: data.email,
          phone: data.phone
        },
        addresses: {
          physical: {
            street1: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'South Africa'
          }
        },
        rating: initialRating,
        status: data.status || SupplierStatus.PENDING,
        isPreferred: false,
        complianceStatus: {
          taxCompliant: false
        },
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user-id' // TODO: Get from auth context
      } as Omit<Supplier, 'id'>;
      
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
      
      const currentRating = typeof supplier.rating === 'object' ? supplier.rating : { overall: supplier.rating, totalReviews: 0 };
      const updatedRating = {
        ...currentRating,
        ...rating,
        lastReviewDate: Timestamp.now()
      };
      
      // Calculate overall rating
      const ratingValues = [
        (updatedRating as any).quality,
        (updatedRating as any).delivery,
        (updatedRating as any).pricing,
        (updatedRating as any).communication,
        (updatedRating as any).flexibility
      ].filter((r: any) => r && r > 0);
      
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
      // Timestamps removed - not used
      
      const performance: SupplierPerformance = {
        overallScore: 92,
        deliveryScore: 95,
        qualityScore: 98,
        priceScore: 90,
        serviceScore: 88,
        complianceScore: 100,
        metrics: {
          totalOrders: 10,
          completedOrders: 9,
          onTimeDeliveries: 8,
          lateDeliveries: 1,
          defectiveItems: 2,
          returnedItems: 1,
          averageLeadTime: 5,
          averageResponseTime: 4
        },
        issues: [],
        evaluationPeriod: period,
        lastEvaluationDate: new Date(),
        nextEvaluationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      
      // Update supplier with latest scores
      await updateDoc(doc(db, COLLECTION_NAME, supplierId), {
        performance: performance,
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
        orderBy('name'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const suppliers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
      
      // Client-side filtering
      return suppliers.filter(supplier => 
        (supplier.companyName || supplier.name || '').toLowerCase().includes(searchTerm.toLowerCase())
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
        averageRating: suppliers.reduce((sum, s) => sum + (typeof s.rating === 'number' ? s.rating : s.rating?.overall || 0), 0) / suppliers.length || 0,
        averagePerformance: suppliers.reduce((sum, s) => sum + ((s.performance as any)?.score || 0), 0) / suppliers.length || 0,
        categoryCounts: this.countByCategory(suppliers),
        topRated: suppliers
          .filter(s => typeof s.rating === 'object' && s.rating.totalReviews && s.rating.totalReviews > 0)
          .sort((a, b) => {
            const aRating = typeof a.rating === 'number' ? a.rating : a.rating?.overall || 0;
            const bRating = typeof b.rating === 'number' ? b.rating : b.rating?.overall || 0;
            return bRating - aRating;
          })
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