import { neonService } from '@/services/neonService';
import { storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { PhotoType } from '../types/pole.types';
import { POLE_QUERIES } from '../queries/poleQueries';

export class PhotoManagementService {
  /**
   * Upload photo to Firebase Storage and update pole record
   */
  async uploadPolePhoto(
    poleId: number, 
    photoType: PhotoType,
    file: File
  ): Promise<string> {
    // Upload to Firebase Storage
    const fileName = `poles/${poleId}/${photoType}_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update pole record with photo URL
    const columnName = `photo_${photoType}`;
    const query = POLE_QUERIES.updatePolePhoto.replace('{columnName}', columnName);
    
    const result = await neonService.execute(query, [downloadURL, poleId]);
    
    if (!result.success) {
      // Clean up uploaded file if database update fails
      await deleteObject(storageRef);
      throw new Error(result.error || 'Failed to update photo URL');
    }
    
    return downloadURL;
  }

  /**
   * Delete photo from Firebase Storage and database
   */
  async deletePolePhoto(poleId: number, photoType: PhotoType, photoUrl: string): Promise<void> {
    try {
      // Delete from Firebase Storage
      const storageRef = ref(storage, photoUrl);
      await deleteObject(storageRef);
    } catch (error) {
      console.warn('Failed to delete photo from storage:', error);
    }

    // Remove URL from database
    const columnName = `photo_${photoType}`;
    const query = POLE_QUERIES.updatePolePhoto.replace('{columnName}', columnName);
    
    const result = await neonService.execute(query, [null, poleId]);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to remove photo URL from database');
    }
  }
}