import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { TrackerGridItem } from '../types/tracker.types';

export function useTrackerData(projectId: string | undefined) {
  return useQuery({
    queryKey: ['unified-trackers', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const items: TrackerGridItem[] = [];

      // Fetch poles
      const polesQuery = query(
        collection(db, 'poles'),
        where('projectId', '==', projectId),
        orderBy('poleNumber')
      );
      const polesSnapshot = await getDocs(polesQuery);
      polesSnapshot.forEach(doc => {
        const data = doc.data();
        const photosCount = Object.values(data.photos || {}).filter(Boolean).length;
        const checksCount = Object.values(data.qualityChecks || {}).filter(v => v !== null).length;
        
        const poleItem: TrackerGridItem = {
          id: doc.id,
          type: 'pole',
          identifier: data.poleNumber,
          vfId: data.vfPoleId || `P-${doc.id}`,
          projectName: data.projectName || '',
          location: data.location || 'Not specified',
          phase: data.phase || 'Phase 1',
          status: data.status || 'pending',
          progress: calculateProgress(data),
          hasPhotos: photosCount > 0,
          lastUpdated: data.metadata?.lastUpdated?.toDate() || new Date(),
          photos: photosCount,
          totalPhotos: 6,
          qualityChecks: checksCount,
          totalChecks: 8,
          metadata: data
        };
        items.push(poleItem);
      });

      // Fetch drops
      const dropsQuery = query(
        collection(db, 'drops'),
        where('projectId', '==', projectId),
        orderBy('dropNumber')
      );
      const dropsSnapshot = await getDocs(dropsQuery);
      dropsSnapshot.forEach(doc => {
        const data = doc.data();
        const photosCount = Object.values(data.photos || {}).filter(Boolean).length;
        const checksCount = Object.values(data.qualityChecks || {}).filter(v => v !== null).length;
        
        const dropItem: TrackerGridItem = {
          id: doc.id,
          type: 'drop',
          identifier: data.dropNumber,
          vfId: data.vfDropId || `D-${doc.id}`,
          projectName: data.projectName || '',
          location: data.address || 'Not specified',
          phase: data.phase || 'Phase 1',
          status: data.status || 'pending',
          progress: calculateProgress(data),
          hasPhotos: photosCount > 0,
          lastUpdated: data.metadata?.lastUpdated?.toDate() || new Date(),
          photos: photosCount,
          totalPhotos: 6,
          qualityChecks: checksCount,
          totalChecks: 6,
          metadata: data
        };
        items.push(dropItem);
      });

      // Fetch fiber sections
      const fiberQuery = query(
        collection(db, 'fiberSections'),
        where('projectId', '==', projectId),
        orderBy('sectionId')
      );
      const fiberSnapshot = await getDocs(fiberQuery);
      fiberSnapshot.forEach(doc => {
        const data = doc.data();
        const photosCount = Object.values(data.photos || {}).filter(Boolean).length;
        const checksCount = Object.values(data.qualityChecks || {}).filter(v => v !== null).length;
        
        const fiberItem: TrackerGridItem = {
          id: doc.id,
          type: 'fiber',
          identifier: data.sectionId,
          vfId: data.vfFiberId || `F-${doc.id}`,
          projectName: data.projectName || '',
          location: `${data.startPoint || 'Start'} → ${data.endPoint || 'End'}`,
          phase: data.phase || 'Phase 1',
          status: data.status || 'pending',
          progress: calculateProgress(data),
          hasPhotos: photosCount > 0,
          lastUpdated: data.metadata?.lastUpdated?.toDate() || new Date(),
          photos: photosCount,
          totalPhotos: 6,
          qualityChecks: checksCount,
          totalChecks: 6,
          metadata: data
        };
        items.push(fiberItem);
      });

      return items;
    },
    enabled: !!projectId
  });
}

function calculateProgress(data: any): number {
  let totalSteps = 0;
  let completedSteps = 0;

  // Check photos
  if (data.photos) {
    const photoValues = Object.values(data.photos);
    totalSteps += photoValues.length;
    completedSteps += photoValues.filter(Boolean).length;
  }

  // Check quality checks
  if (data.qualityChecks) {
    const checkValues = Object.values(data.qualityChecks);
    totalSteps += checkValues.length;
    completedSteps += checkValues.filter(v => v !== null).length;
  }

  // Check status
  totalSteps += 1;
  if (data.status === 'completed') completedSteps += 1;

  return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
}