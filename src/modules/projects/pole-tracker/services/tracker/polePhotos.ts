/**
 * Pole Photos Management Service
 * Handles photo uploads and management for poles
 */

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/config/firebase';
import { PolePhotos, POLE_COLLECTION } from './types';

export class PolePhotosService {
  /**
   * Update pole photos
   */
  static async updatePhotos(
    id: string,
    photos: Partial<PolePhotos>
  ): Promise<void> {
    const poleRef = doc(db, POLE_COLLECTION, id);
    const existingDoc = await getDoc(poleRef);
    
    if (!existingDoc.exists()) {
      throw new Error('Pole not found');
    }

    const existingPhotos = existingDoc.data()?.photos || {};

    await updateDoc(poleRef, {
      photos: {
        ...existingPhotos,
        ...photos
      },
      'metadata.updatedAt': serverTimestamp()
    });
  }

  /**
   * Add a single photo
   */
  static async addPhoto(
    id: string,
    photoType: keyof PolePhotos,
    photoUrl: string
  ): Promise<void> {
    await this.updatePhotos(id, { [photoType]: photoUrl });
  }

  /**
   * Remove a photo
   */
  static async removePhoto(
    id: string,
    photoType: keyof PolePhotos
  ): Promise<void> {
    await this.updatePhotos(id, { [photoType]: null });
  }

  /**
   * Get all photos for a pole
   */
  static async getPhotos(id: string): Promise<PolePhotos> {
    const docSnap = await getDoc(doc(db, POLE_COLLECTION, id));
    
    if (!docSnap.exists()) {
      throw new Error('Pole not found');
    }

    return docSnap.data().photos || this.getEmptyPhotos();
  }

  /**
   * Check if all required photos are uploaded
   */
  static async hasAllRequiredPhotos(id: string): Promise<boolean> {
    const photos = await this.getPhotos(id);
    const requiredPhotos: (keyof PolePhotos)[] = [
      'beforeInstallation',
      'afterInstallation',
      'poleLabel'
    ];

    return requiredPhotos.every(photoType => photos[photoType] !== null);
  }

  /**
   * Get photo upload progress
   */
  static async getPhotoProgress(id: string): Promise<{
    uploaded: number;
    total: number;
    percentage: number;
  }> {
    const photos = await this.getPhotos(id);
    const photoValues = Object.values(photos);
    const uploaded = photoValues.filter(photo => photo !== null).length;
    const total = photoValues.length;

    return {
      uploaded,
      total,
      percentage: Math.round((uploaded / total) * 100)
    };
  }

  /**
   * Get empty photos object
   */
  private static getEmptyPhotos(): PolePhotos {
    return {
      beforeInstallation: null,
      duringInstallation: null,
      afterInstallation: null,
      poleLabel: null,
      cableRouting: null,
      qualityCheck: null
    };
  }
}