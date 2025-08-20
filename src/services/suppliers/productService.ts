// Product Catalog Service
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
  Product, 
  ProductFormData, 
  ProductAvailability,
  ProductCategory,
  PriceList,
  PriceListItem
} from '@/types/supplier.types';

const PRODUCTS_COLLECTION = 'products';
const PRICE_LISTS_COLLECTION = 'price_lists';

export const productService = {
  // ============= Product CRUD =============
  
  async getAllProducts(filter?: { 
    supplierId?: string; 
    category?: ProductCategory; 
    availability?: ProductAvailability 
  }) {
    try {
      let q = query(collection(db, PRODUCTS_COLLECTION), orderBy('name', 'asc'));
      
      if (filter?.supplierId) {
        q = query(q, where('supplierId', '==', filter.supplierId));
      }
      if (filter?.category) {
        q = query(q, where('category', '==', filter.category));
      }
      if (filter?.availability) {
        q = query(q, where('availability', '==', filter.availability));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        throw new Error('Product not found');
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  async createProduct(data: ProductFormData): Promise<string> {
    try {
      const product: Omit<Product, 'id'> = {
        ...data,
        isActive: true,
        isDiscontinued: false,
        tags: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), product);
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, data: Partial<ProductFormData>): Promise<void> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // ============= Product Status =============
  
  async updateAvailability(id: string, availability: ProductAvailability): Promise<void> {
    try {
      await updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
        availability,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating product availability:', error);
      throw error;
    }
  },

  async discontinueProduct(id: string, replacementId?: string): Promise<void> {
    try {
      const updateData: any = {
        isDiscontinued: true,
        isActive: false,
        availability: ProductAvailability.DISCONTINUED,
        updatedAt: Timestamp.now()
      };
      
      if (replacementId) {
        updateData.replacementProductId = replacementId;
      }
      
      await updateDoc(doc(db, PRODUCTS_COLLECTION, id), updateData);
    } catch (error) {
      console.error('Error discontinuing product:', error);
      throw error;
    }
  },

  // ============= Search & Filter =============
  
  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        orderBy('name'),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      
      // Client-side filtering for search
      const term = searchTerm.toLowerCase();
      return products.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.code.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  async getProductsBySupplier(supplierId: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('supplierId', '==', supplierId),
        where('isActive', '==', true),
        orderBy('name')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      console.error('Error fetching supplier products:', error);
      throw error;
    }
  },

  async getAvailableProducts(): Promise<Product[]> {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('availability', 'in', [
          ProductAvailability.IN_STOCK,
          ProductAvailability.LIMITED_STOCK
        ]),
        where('isActive', '==', true),
        orderBy('name')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      console.error('Error fetching available products:', error);
      throw error;
    }
  },

  // ============= Price Lists =============
  
  async createPriceList(supplierId: string, data: {
    name: string;
    description?: string;
    items: PriceListItem[];
    effectiveFrom: Date;
    effectiveTo?: Date;
  }): Promise<string> {
    try {
      const priceList: Omit<PriceList, 'id'> = {
        supplierId,
        name: data.name,
        description: data.description,
        items: data.items,
        effectiveFrom: Timestamp.fromDate(data.effectiveFrom),
        effectiveTo: data.effectiveTo ? Timestamp.fromDate(data.effectiveTo) : undefined,
        isActive: true,
        version: 1,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, PRICE_LISTS_COLLECTION), priceList);
      return docRef.id;
    } catch (error) {
      console.error('Error creating price list:', error);
      throw error;
    }
  },

  async getPriceLists(supplierId: string): Promise<PriceList[]> {
    try {
      const q = query(
        collection(db, PRICE_LISTS_COLLECTION),
        where('supplierId', '==', supplierId),
        orderBy('effectiveFrom', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PriceList));
    } catch (error) {
      console.error('Error fetching price lists:', error);
      throw error;
    }
  },

  async getActivePriceList(supplierId: string): Promise<PriceList | null> {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, PRICE_LISTS_COLLECTION),
        where('supplierId', '==', supplierId),
        where('isActive', '==', true),
        where('effectiveFrom', '<=', now),
        orderBy('effectiveFrom', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      const priceList = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as PriceList;
      
      // Check if within validity period
      if (priceList.effectiveTo && priceList.effectiveTo < now) {
        return null;
      }
      
      return priceList;
    } catch (error) {
      console.error('Error fetching active price list:', error);
      throw error;
    }
  },

  async updatePriceList(id: string, items: PriceListItem[]): Promise<void> {
    try {
      const docRef = doc(db, PRICE_LISTS_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        throw new Error('Price list not found');
      }
      
      const currentData = snapshot.data();
      
      await updateDoc(docRef, {
        items,
        version: (currentData.version || 1) + 1,
        updatedAt: Timestamp.now(),
        approvedBy: 'current-user-id', // TODO: Get from auth context
        approvedDate: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating price list:', error);
      throw error;
    }
  },

  // ============= Bulk Operations =============
  
  async bulkUpdatePrices(supplierId: string, priceAdjustment: {
    type: 'percentage' | 'fixed';
    value: number;
    category?: ProductCategory;
  }): Promise<void> {
    try {
      let q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('supplierId', '==', supplierId)
      );
      
      if (priceAdjustment.category) {
        q = query(q, where('category', '==', priceAdjustment.category));
      }
      
      const snapshot = await getDocs(q);
      
      const batch = snapshot.docs.map(async (docSnapshot) => {
        const product = docSnapshot.data() as Product;
        let newPrice = product.unitPrice;
        
        if (priceAdjustment.type === 'percentage') {
          newPrice = product.unitPrice * (1 + priceAdjustment.value / 100);
        } else {
          newPrice = product.unitPrice + priceAdjustment.value;
        }
        
        await updateDoc(doc(db, PRODUCTS_COLLECTION, docSnapshot.id), {
          unitPrice: newPrice,
          updatedAt: Timestamp.now()
        });
      });
      
      await Promise.all(batch);
    } catch (error) {
      console.error('Error bulk updating prices:', error);
      throw error;
    }
  },

  // ============= Real-time Subscription =============
  
  subscribeToProducts(supplierId: string, callback: (products: Product[]) => void) {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('supplierId', '==', supplierId),
      orderBy('name')
    );
    
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      callback(products);
    });
  }
};