import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '@/src/config/firebase';

export function useSOWService() {
  const queryClient = useQueryClient();

  const saveSOWData = async (projectId: string, type: string, data: any[]) => {
    const batch = writeBatch(db);
    
    // Save to project-specific SOW collection
    const sowRef = doc(db, 'projects', projectId, 'sow', type);
    batch.set(sowRef, {
      type,
      data,
      uploadedAt: new Date(),
      itemCount: data.length,
    });

    // Also save individual items for easier querying
    if (type === 'poles') {
      data.forEach(pole => {
        const poleRef = doc(db, 'projects', projectId, 'poles', pole.pole_number);
        batch.set(poleRef, {
          ...pole,
          projectId,
          createdAt: new Date(),
        });
      });
    } else if (type === 'drops') {
      data.forEach(drop => {
        const dropRef = doc(db, 'projects', projectId, 'drops', drop.drop_number);
        batch.set(dropRef, {
          ...drop,
          projectId,
          createdAt: new Date(),
        });
      });
    } else if (type === 'fibre') {
      data.forEach(segment => {
        const segmentRef = doc(db, 'projects', projectId, 'fibre', segment.segment_id);
        batch.set(segmentRef, {
          ...segment,
          projectId,
          createdAt: new Date(),
        });
      });
    }

    await batch.commit();
    
    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['sow', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
  };

  const getSOWData = async (projectId: string, type?: string) => {
    if (type) {
      const sowRef = doc(db, 'projects', projectId, 'sow', type);
      const snapshot = await getDoc(sowRef);
      return snapshot.exists() ? snapshot.data() : null;
    } else {
      const sowCollection = collection(db, 'projects', projectId, 'sow');
      const snapshot = await getDocs(sowCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
  };

  const deleteSOWData = async (projectId: string, type: string) => {
    const batch = writeBatch(db);
    
    // Delete from SOW collection
    const sowRef = doc(db, 'projects', projectId, 'sow', type);
    batch.delete(sowRef);

    // Delete individual items
    let collectionName = '';
    if (type === 'poles') collectionName = 'poles';
    else if (type === 'drops') collectionName = 'drops';
    else if (type === 'fibre') collectionName = 'fibre';

    if (collectionName) {
      const itemsCollection = collection(db, 'projects', projectId, collectionName);
      const snapshot = await getDocs(itemsCollection);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
    }

    await batch.commit();
    
    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['sow', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
  };

  return {
    saveSOWData,
    getSOWData,
    deleteSOWData
  };
}

export function useProjectSOW(projectId: string) {
  return useQuery({
    queryKey: ['sow', projectId],
    queryFn: async () => {
      const sowCollection = collection(db, 'projects', projectId, 'sow');
      const snapshot = await getDocs(sowCollection);
      
      const sowData: Record<string, any> = {};
      snapshot.docs.forEach(doc => {
        sowData[doc.id] = doc.data();
      });
      
      return sowData;
    },
    enabled: !!projectId
  });
}

export function useProjectPoles(projectId: string) {
  return useQuery({
    queryKey: ['poles', projectId],
    queryFn: async () => {
      const polesCollection = collection(db, 'projects', projectId, 'poles');
      const snapshot = await getDocs(polesCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    enabled: !!projectId
  });
}

export function useProjectDrops(projectId: string) {
  return useQuery({
    queryKey: ['drops', projectId],
    queryFn: async () => {
      const dropsCollection = collection(db, 'projects', projectId, 'drops');
      const snapshot = await getDocs(dropsCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    enabled: !!projectId
  });
}

export function useProjectFibre(projectId: string) {
  return useQuery({
    queryKey: ['fibre', projectId],
    queryFn: async () => {
      const fibreCollection = collection(db, 'projects', projectId, 'fibre');
      const snapshot = await getDocs(fibreCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    enabled: !!projectId
  });
}