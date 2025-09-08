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
import { db } from '@/src/config/firebase';
import { 
  Client, 
  ClientFormData,
  ClientFilter
} from '@/types/client.types';

/**
 * Core CRUD operations for client management
 */
export const clientCrudService = {
  /**
   * Get all clients with optional filtering
   */
  async getAll(filter?: ClientFilter): Promise<Client[]> {
    try {
      const constraints: QueryConstraint[] = [orderBy('name', 'asc')];
      
      if (filter?.status?.length) {
        constraints.push(where('status', 'in', filter.status));
      }
      
      if (filter?.category?.length) {
        constraints.push(where('category', 'in', filter.category));
      }
      
      if (filter?.priority?.length) {
        constraints.push(where('priority', 'in', filter.priority));
      }
      
      if (filter?.accountManagerId) {
        constraints.push(where('accountManagerId', '==', filter.accountManagerId));
      }
      
      if (filter?.city) {
        constraints.push(where('city', '==', filter.city));
      }
      
      if (filter?.province) {
        constraints.push(where('province', '==', filter.province));
      }
      
      const q = query(collection(db, 'clients'), ...constraints);
      const snapshot = await getDocs(q);
      
      let clients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Client));
      
      // Apply search term filter (client-side for text fields)
      if (filter?.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        clients = clients.filter(client => 
          client.name.toLowerCase().includes(searchTerm) ||
          client.contactPerson.toLowerCase().includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm) ||
          client.phone.includes(searchTerm) ||
          client.industry.toLowerCase().includes(searchTerm)
        );
      }
      
      return clients;
    } catch (error) {
      // Error getting clients
      throw new Error('Failed to fetch clients');
    }
  },

  /**
   * Get client by ID
   */
  async getById(id: string): Promise<Client | null> {
    try {
      const docRef = doc(db, 'clients', id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return { 
        id: snapshot.id, 
        ...snapshot.data() 
      } as Client;
    } catch (error) {
      // Error getting client
      throw new Error('Failed to fetch client');
    }
  },

  /**
   * Create new client
   */
  async create(data: ClientFormData): Promise<string> {
    try {
      const now = Timestamp.now();
      
      const clientData: Record<string, unknown> = {
        ...data,
        
        // Set default values for optional fields
        alternativeEmail: data.alternativeEmail || '',
        alternativePhone: data.alternativePhone || '',
        faxNumber: '',
        website: data.website || '',
        registrationNumber: data.registrationNumber || '',
        vatNumber: data.vatNumber || '',
        
        // Initialize financial fields
        currentBalance: 0,
        
        // Initialize project metrics
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalProjectValue: 0,
        averageProjectValue: 0,
        
        // Initialize relationship fields
        accountManagerName: '',
        salesRepresentativeName: '',
        
        // Initialize arrays if not provided
        tags: data.tags || [],
        serviceTypes: data.serviceTypes || [],
        preferredContractors: [],
        
        // Set audit fields
        createdAt: now,
        updatedAt: now,
        createdBy: 'current-user', // TODO: Get from auth context
        lastModifiedBy: 'current-user',
      };
      
      // Remove any undefined values that Firebase doesn't accept
      Object.keys(clientData).forEach(key => {
        if (clientData[key] === undefined) {
          delete clientData[key];
        }
      });
      
      const docRef = await addDoc(collection(db, 'clients'), clientData);
      return docRef.id;
    } catch (error) {
      // Error creating client
      throw new Error('Failed to create client');
    }
  },

  /**
   * Update client
   */
  async update(id: string, data: Partial<ClientFormData>): Promise<void> {
    try {
      const docRef = doc(db, 'clients', id);
      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: Timestamp.now(),
        lastModifiedBy: 'current-user', // TODO: Get from auth context
      };
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      // Error updating client
      throw new Error('Failed to update client');
    }
  },

  /**
   * Delete client
   */
  async delete(id: string): Promise<void> {
    try {
      // Check if client has active projects
      const projectsQuery = query(
        collection(db, 'projects'),
        where('clientId', '==', id),
        where('status', 'in', ['active', 'planning'])
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      
      if (!projectsSnapshot.empty) {
        throw new Error('Cannot delete client with active projects');
      }
      
      await deleteDoc(doc(db, 'clients', id));
    } catch (error) {
      // Error deleting client
      throw new Error('Failed to delete client');
    }
  },

  /**
   * Subscribe to clients changes
   */
  subscribeToClients(
    callback: (clients: Client[]) => void,
    filter?: ClientFilter
  ): Unsubscribe {
    const constraints: QueryConstraint[] = [orderBy('name', 'asc')];
    
    if (filter?.status?.length) {
      constraints.push(where('status', 'in', filter.status));
    }
    
    const q = query(collection(db, 'clients'), ...constraints);
    
    return onSnapshot(q, (snapshot) => {
      const clients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Client));
      
      callback(clients);
    });
  },

  /**
   * Subscribe to single client changes
   */
  subscribeToClient(
    clientId: string,
    callback: (client: Client | null) => void
  ): Unsubscribe {
    const docRef = doc(db, 'clients', clientId);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const client = {
          id: snapshot.id,
          ...snapshot.data()
        } as Client;
        callback(client);
      } else {
        callback(null);
      }
    });
  }
};