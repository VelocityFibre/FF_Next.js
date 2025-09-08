/**
 * Real-time Client Operations (Firebase)
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  Timestamp
} from 'firebase/firestore';
import { db } from '@/src/config/firebase';
import type { Client } from '@/types/client.types';

/**
 * Get all clients (real-time)
 */
export async function getAllClients(): Promise<Client[]> {
  const snapshot = await getDocs(collection(db, 'clients'));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Client));
}

/**
 * Get client by ID (real-time)
 */
export async function getClientById(id: string): Promise<Client | null> {
  const docRef = doc(db, 'clients', id);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) return null;
  
  return { id: snapshot.id, ...snapshot.data() } as Client;
}

/**
 * Create new client (Firebase)
 */
export async function createClient(clientData: Omit<Client, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'clients'), {
    ...clientData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return docRef.id;
}

/**
 * Update client (Firebase)
 */
export async function updateClient(id: string, updates: Partial<Client>): Promise<void> {
  const docRef = doc(db, 'clients', id);
  
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}